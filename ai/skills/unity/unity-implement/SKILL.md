---
name: unity-implement
description: Implement a piece of work based on a spec or set of tasks.
disable-model-invocation: true
---

Implement the work described by the user in the spec or tasks.

## 1. Establish the boundary

- `unity-cli`.
- `ui-ugui` for Runtime/Canvas UI or `ui-imgui` for Editor IMGUI.
- no new external package, `Packages/manifest.json` change, or editor-resource import such as TMP Essentials.
- An open Editor.

On a failed gate, stop and report with the required user action.

## 2. Implement and validate

- Call the Skill tool with `unity-tdd` where possible, at pre-agreed seams.
- Follow [test-protocol.md](./test-protocol.md) for every test run.
- Run typechecking regularly, single test files regularly, and the full test suite once at the end.
- Use `unity-cli` for every non-code edit; never edit Unity YAML directly.
- Use `ui-ugui` for Runtime/Canvas UI and `ui-imgui` for Editor IMGUI.
- Use repository-root `.scratch/` for all temporary scripts, files, logs, exports, screenshots, and command output.
- Report human playtesting, Player Build, as deferred rather than running it.

## 3. Report

Once done, report the results or any issues encountered.