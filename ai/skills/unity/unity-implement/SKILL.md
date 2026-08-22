---
name: unity-implement
description: Implement exactly one approved Unity game task, editing only C# scripts and tests and never any other project file; verify it with the applicable EditMode, PlayMode, build, and human-playtest tiers; then stop for human acceptance. Never commit automatically.
---

# Implement

Implement exactly one user-selected, approved Unity task. If the request names a spec or several tasks without selecting one task, ask the user which task to implement. Never begin another ready or unblocked task automatically.

## 1. Establish the boundary

- Confirm the `/unity-cli` skill is available in this session's skill listing. If it is not, stop immediately and ask the user to install it; do not proceed with the task by any other means.
- Read the task, its blockers, linked spec, repository instructions, glossary, and relevant ADRs.
- Confirm the repository contains `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it does not, stop and report that this skill is Unity-specific.
- Confirm blockers are complete.
- Record the starting `HEAD`, staged paths, unstaged paths, untracked paths, and existing diffs. Preserve and distinguish all pre-existing user changes.
- Treat the task as `implementing`; do not edit a task status file unless the user separately authorized that non-code change.

If the task conflicts with the repository, stop and report the expected state, actual state, impact, and decision needed. Do not silently work around it.

### Unity editing boundary

- Edit only C# script and test files (`.cs`) within existing assembly boundaries. Always use `/unity-cli` to recompile after edited.
- Never edit any non-code file (e.g. `.unity` scenes, `.prefab`, `.asset` ScriptableObjects, `.meta` files, `ProjectSettings/*`) or any `.asmdef` file.
- If a task cannot be completed without a non-code change, stop immediately. Report exactly what change is needed and why, and wait for the human to make it themselves (in the Editor or via their own `/unity-cli` session) before resuming the task.

## 2. Implement one task

Always ask the user whether to use `/unity-tdd` for this task before writing code; do not decide silently. Implement only the selected task's acceptance criteria and avoid scope creep.

Run focused checks regularly and the relevant broader suite at the end.

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

After human acceptance, use `/unity-code-review` against the recorded baseline, including committed, staged, unstaged, and untracked task changes. Keep review read-only. Address findings only when the user requests another implementation pass.
