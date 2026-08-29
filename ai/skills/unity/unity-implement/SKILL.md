---
name: unity-implement
description: Implement a piece of work based on a spec or set of tasks.
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## 1. Establish the boundary

- Confirm the `/unity-cli` skill is available in this session's skill listing. If it is not, stop immediately and ask the user to install it; do not proceed with the task by any other means.
- Confirm the repository contains `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it does not, stop and report that this skill is Unity-specific.
- Confirm there is an opened editor by running `unity pipeline list`. If there is no opened editor, use `unity open --args "-automated"` to open one.
- Always use `/unity-cli` to recompile after editing C# script and test files (`.cs`).
- Always use `/unity-cli` to edit any non-code file (e.g. `.unity` scenes, `.prefab`, `.asset` ScriptableObjects, `.meta` files, `ProjectSettings/*`) or any `.asmdef` file. DO NOT edit YAML file directly.

## 2. Implement one task

- Use `/unity-tdd` where possible, at pre-agreed seams.
- Run typechecking regularly, single test files regularly, and the full test suite once at the end by using `/unity-cli`.

### Unity validation

Use the task's declared tiers:

- **EditMode:** deterministic rules and code outside a running scene.
- **PlayMode:** Unity lifecycle, component, scene, physics, or engine integration.
- **Player build:** platform- or build-sensitive behavior.
- **Human playtest:** player-facing behavior, feel, visuals, audio, and usability.

Run EditMode and PlayMode tiers through `/unity-cli`. Treat compile errors and warnings introduced by the task as failures. Preserve GUID relationships and distinguish pre-existing Console output from new failures.

Never trigger a Player build yourself. When the task declares the Player build tier, stop and ask the user to run the build manually, then wait for them to report the pass/fail result before continuing.

If the Unity Editor, required platform module, SDK, license, scene, or device is unavailable, report the missing validation explicitly. Do not mark that tier as passed.

## 3. Human checkpoint

After automated verification:

1. Report changed files, checks run, results, and any validation that remains unavailable.
2. Give exact Unity Editor or player steps with expected behavior.
3. Stop at `ready-for-human-test`.

If the user requests changes, continue only the same task and return to this checkpoint. Do not mark the task done until the user accepts the human verification.

After human acceptance, use `/unity-code-review` to review the work.