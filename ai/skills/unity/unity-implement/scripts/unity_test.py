"""Run tests in a Unity project through the Unity CLI."""

import argparse
from contextlib import contextmanager
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET


RECONNECT_GRACE = 20
RECONNECT_ERRORS = {"EDITOR_NOT_RUNNING", "PIPELINE_UNREACHABLE", "EDITOR_NOT_READY"}
SUMMARY_KEYS = ("total", "passed", "failed", "skipped", "inconclusive")


class Interrupted(Exception):
    """The runner did not produce a reliable test verdict."""


def run_cli(*args, timeout=20):
    return subprocess.run(
        ["unity", *args], capture_output=True, encoding="utf-8-sig",
        errors="replace", timeout=timeout,
    )


def diagnostic(result, status=None):
    status = status or {}
    detail = (status.get("message") or first_error(status).get("message")
              or result.stderr.strip() or status.get("status") or result.stdout)
    return detail.strip().split("\n", 1)[0] or f"Unity CLI exited {result.returncode}."


def first_error(status):
    errors = status.get("errors") or []
    return errors[0] if isinstance(errors, list) and errors and isinstance(errors[0], dict) else {}


def response(result):
    if not result.stdout.strip():
        raise Interrupted(diagnostic(result))
    value = json.loads(result.stdout)
    if not isinstance(value, dict):
        raise Interrupted("Expected a JSON object from the Unity CLI.")
    return value


def find_project(project_path):
    start = (project_path or Path.cwd()).resolve()
    candidates = (start,) if project_path else (start, *start.parents)
    for path in candidates:
        if (path / "ProjectSettings" / "ProjectVersion.txt").is_file():
            return path
    if project_path:
        raise Interrupted(f"Not a Unity project root: {start}")
    raise Interrupted("No Unity project found above this directory. Pass --project-path <project root>.")


@contextmanager
def editor_lock(pid):
    # The lock belongs to the open file, so it also releases on an interrupted script.
    path = Path(tempfile.gettempdir()) / f"unity-pipeline-test-{pid}.lock"
    with path.open("a+b") as lock:
        lock.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as error:
            raise Interrupted(f"Could not lock Editor PID {pid}; another runner may be active.") from error
        yield


@contextmanager
def monitor_editor(pid):
    if os.name != "nt":
        def is_alive():
            try:
                os.kill(pid, 0)  # A liveness probe on POSIX only.
            except ProcessLookupError:
                return False
            except PermissionError:
                pass
            return True

        yield is_alive
        return

    import ctypes
    from ctypes import wintypes

    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.OpenProcess.argtypes = (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD)
    kernel.OpenProcess.restype = wintypes.HANDLE
    kernel.WaitForSingleObject.argtypes = (wintypes.HANDLE, wintypes.DWORD)
    kernel.WaitForSingleObject.restype = wintypes.DWORD
    kernel.CloseHandle.argtypes = (wintypes.HANDLE,)
    kernel.CloseHandle.restype = wintypes.BOOL
    synchronize = 0x00100000
    wait_timeout = 258
    handle = kernel.OpenProcess(synchronize, False, pid)
    if not handle:
        raise ctypes.WinError(ctypes.get_last_error())

    def is_alive():
        state = kernel.WaitForSingleObject(handle, 0)
        if state not in (0, wait_timeout):
            raise ctypes.WinError(ctypes.get_last_error())
        return state == wait_timeout

    try:
        yield is_alive
    finally:
        kernel.CloseHandle(handle)


def find_editor(project):
    result = run_cli("status", "--project-path", str(project), "--format", "json")
    info = response(result)
    if result.returncode:
        message = diagnostic(result, info)
        if first_error(info).get("code") == "STATUS_NO_INSTANCES":
            message += " For a closed project, use --batch."
        raise Interrupted(message)
    data = info["data"]
    editors = [
        editor for editor in data.get("items", data.get("instances", []))
        if editor.get("role") == "main" and Path(editor["projectPath"]).resolve() == project
    ]
    if len(editors) != 1 or editors[0].get("state") != "ready":
        raise Interrupted("Expected one ready main Editor for this project.")
    pid = editors[0].get("pid")
    if type(pid) is not int or pid <= 0:
        raise Interrupted("Unity returned an invalid Editor PID.")
    return pid


def report(status, exit_code):
    summary = status["summary"]
    counts = [summary[key] for key in SUMMARY_KEYS]
    if any(type(count) is not int or count < 0 for count in counts) or counts[0] != sum(counts[1:]):
        raise Interrupted("Unity returned inconsistent test counts.")
    total, passed, failed, skipped, inconclusive = counts
    if not (passed or failed):
        raise Interrupted("No tests passed or failed. Check the filter and test discovery.")
    if exit_code and not failed:
        raise Interrupted(f"Unity returned exit {exit_code} without test failures.")

    label = "FAILED" if failed else "PASSED"
    print(f"{label}: {passed} passed, {failed} failed, {skipped} skipped, {inconclusive} inconclusive ({total} total).")
    failures = status.get("results", [])[:8]
    for failure in failures:
        message = (failure.get("message") or "").strip().split("\n", 1)[0]
        print(f"  {failure.get('fullName')}: {message}")
    if failed > len(failures):
        print(f"  {failed - len(failures)} additional failures without details shown.")
    return 1 if failed else 0


def run_live_tests(project, args):
    pid = find_editor(project)

    def command(group, name, *options, cli_timeout=15):
        return run_cli(
            "command", group, name, "--project-path", str(project), "--pid", str(pid),
            "--timeout", str(cli_timeout), "--format", "json", "--", *options,
            timeout=cli_timeout + 5,
        )

    with editor_lock(pid), monitor_editor(pid) as is_alive:
        before = command("editor", "status")
        editor = response(before)
        if before.returncode:
            raise Interrupted(diagnostic(before, editor))
        if (editor.get("status") != "ready" or editor.get("playMode") != "stopped"
                or editor.get("compiling") or editor.get("domainReloadInProgress")):
            raise Interrupted("The Editor must be ready in Edit Mode, with compilation and reload complete.")

        baseline = command("test", "status", "--detail", "summary")
        previous = response(baseline)
        if previous.get("status") == "running":
            raise Interrupted("Another Unity test run is already in progress.")
        if previous.get("status") not in ("completed", "no_tests", "cancelled", "error"):
            raise Interrupted(f"Could not establish the previous test status: {diagnostic(baseline, previous)}")

        options = ["--mode", args.mode, "--async-tests", "true", "--timeout", str(args.timeout)]
        if args.filter is not None:
            options.extend(("--filter", args.filter))
        deadline = time.monotonic() + args.timeout
        start = command("test", "run", *options)
        if start.returncode:
            raise Interrupted(f"Could not start tests: {diagnostic(start, response(start) if start.stdout.strip() else None)}")

        saw_running = False
        disconnected_until = None
        while time.monotonic() < deadline:
            poll = command("test", "status", "--detail", "failures", cli_timeout=5)
            if not is_alive():
                raise Interrupted(f"Editor PID {pid} exited before a verdict.")
            current = response(poll)
            state = current.get("status")
            if first_error(current).get("code") in RECONNECT_ERRORS:
                # Play Mode transitions can briefly drop Pipeline without ending the run.
                if disconnected_until is None:
                    print(f"Editor PID {pid} temporarily unreachable; waiting for its test status.", file=sys.stderr)
                    disconnected_until = time.monotonic() + RECONNECT_GRACE
                if time.monotonic() >= disconnected_until:
                    raise Interrupted(f"Editor PID {pid} remained unreachable: {diagnostic(poll, current)}")
            else:
                disconnected_until = None
                if state == "completed":
                    same_result = all(previous.get(key) == current.get(key)
                                      for key in ("status", "duration", "summary"))
                    if not saw_running and same_result:
                        raise Interrupted("The Editor returned the previous result without evidence of a fresh run.")
                    return report(current, poll.returncode)
                if state != "running" or poll.returncode:
                    raise Interrupted(f"Editor PID {pid} did not return a completed test run: {diagnostic(poll, current)}")
                saw_running = True
            time.sleep(max(0, min(2, deadline - time.monotonic())))
        raise Interrupted(f"No verdict within {args.timeout}s. Unity may still be running the tests.")


def read_nunit(path):
    try:
        root = ET.parse(path).getroot()
        if root.tag != "test-run":
            raise ValueError("expected an NUnit test-run element")
        summary = {key: int(root.attrib[key]) for key in SUMMARY_KEYS}
    except (OSError, ET.ParseError, KeyError, ValueError) as error:
        raise Interrupted(f"Unity did not write a readable NUnit result ({path.name}): {error}") from error
    if any(value < 0 for value in summary.values()) or summary["total"] != sum(
            summary[key] for key in SUMMARY_KEYS[1:]):
        raise Interrupted(f"Unity returned inconsistent test counts in {path.name}.")
    failures = [
        {"fullName": case.get("fullname") or case.get("name"), "message": case.findtext("failure/message")}
        for case in root.iter("test-case") if case.get("result") == "Failed"
    ]
    return summary, failures


def run_batch_tests(project, args):
    modes = {"editor": ("EditMode",), "playmode": ("PlayMode",), "all": ("EditMode", "PlayMode")}
    summary = dict.fromkeys(SUMMARY_KEYS, 0)
    failures = []
    deadline = time.monotonic() + args.timeout

    with tempfile.TemporaryDirectory(prefix="unity-test-") as directory:
        for mode in modes[args.mode]:
            remaining = math.ceil(deadline - time.monotonic())
            if remaining <= 0:
                raise Interrupted(f"No complete batch verdict within {args.timeout}s.")
            path = Path(directory) / f"{mode}.xml"
            options = [
                "--mode", mode, "--timeout", str(remaining), "--format", "json",
                "--report-format", "nunit", "--output", str(path),
            ]
            if args.filter is not None:
                options.extend(("--filter", args.filter))
            result = run_cli("test", str(project), *options, timeout=remaining + 20)
            # Unity CLI exit 8 means tests completed but failed.
            if result.returncode not in (0, 8):
                status = response(result) if result.stdout.strip() else None
                raise Interrupted(f"{mode}: {diagnostic(result, status)}")
            counts, details = read_nunit(path)
            if result.returncode == 8 and not counts["failed"]:
                raise Interrupted(f"{mode}: Unity reported failure without any failed tests in its report.")
            for key in SUMMARY_KEYS:
                summary[key] += counts[key]
            failures.extend(details)

    return report({"summary": summary, "results": failures}, 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__, allow_abbrev=False)
    parser.add_argument("mode", nargs="?", default="all", choices=("editor", "playmode", "all"))
    parser.add_argument("--project-path", type=Path, help="Unity project root (default: find it above this directory).")
    parser.add_argument("--batch", action="store_true", help="Use unity test for a closed project; Pipeline is not required.")
    parser.add_argument("--filter", help="Run tests whose name contains this text.")
    parser.add_argument("--timeout", type=int, default=600, help="Test deadline in seconds (default: 600).")
    args = parser.parse_args()
    if not 1 <= args.timeout <= 3600:
        parser.error("--timeout must be between 1 and 3600 seconds")
    if args.filter is not None and not args.filter.strip():
        parser.error("--filter must not be blank")

    try:
        project = find_project(args.project_path)
        return (run_batch_tests if args.batch else run_live_tests)(project, args)
    except (Interrupted, OSError, subprocess.TimeoutExpired, ValueError, KeyError, TypeError) as error:
        print(f"INTERRUPTED: {error}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("INTERRUPTED: Test runner interrupted.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
