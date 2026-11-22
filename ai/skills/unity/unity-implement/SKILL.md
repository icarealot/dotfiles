---
name: unity-implement
description: Implement a piece of work based on a spec or set of tasks.
disable-model-invocation: true
---

Implement the work described by the user in the spec or tasks.

## 1. Establish the boundary

- `unity-cli` and `unity-pipeline`.
- `create-ui` for UI.
- No new external package, `Packages/manifest.json` change, or editor-resource import such as TMP Essentials.
- An opened Editor.

On a failed gate, stop and report with the required user action.

## 2. Implement and validate

- Call the Skill tool with `unity-tdd` where possible, at pre-agreed seams.
- Run typechecking regularly with `unity-pipeline`. Run [focused tests and one final full suite](#live-unity-tests).
- Use `unity-cli` for every non-code edit; never edit Unity YAML directly.
- Use `create-ui` for UI.
- Use repository-root `.scratch/` for all temporary scripts, files, logs, exports, screenshots, and command output. Remove every artifact created for this work item before reporting.
- Report human playtesting, Player Build, as deferred rather than running it.

### Live Unity tests

Use Python 3 and the Unity CLI with a Pipeline-connected main Editor in Edit Mode:

```sh
python .agents/skills/unity-implement/scripts/unity_test.py editor --filter MyFixture
python .agents/skills/unity-implement/scripts/unity_test.py all
```

The script finds the Unity project above the working directory. To run it from elsewhere, pass `--project-path "<Unity project root>"` and use the script's absolute path.

Use `editor` or `playmode` for one suite. `--timeout` overrides the 600-second deadline. Exit `0` means passed, `1` means failed, and `2` means no reliable verdict. The runner waits for the same Editor through brief disconnects. Keep it the only test run in that Editor; a timeout stops waiting, not the live tests.

For standalone use with a closed project, `--batch` uses `unity test` without Pipeline. It never closes an open Editor. The `unity-implement` workflow above uses live mode.

**Pipeline troubleshooting:** read the `test run` and `test status` sections of the installed `Library/PackageCache/com.unity.pipeline@*/Documentation~/commands/build-and-compilation.md`.

## 3. Report

Once done, report the results or any issues encountered.
