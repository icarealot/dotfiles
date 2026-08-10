---
name: unity-implement
description: Implement exactly one approved Unity game task, respecting protected assets and existing assemblies; verify it with the applicable EditMode, PlayMode, build, and human-playtest tiers; then stop for human acceptance. Never commit automatically.
---

# Implement

Implement exactly one user-selected, approved Unity task. If the request names a spec or several tasks without selecting one task, ask the user which task to implement. Never begin another ready or unblocked task automatically.

## 1. Establish the boundary

- Read the task, its blockers, linked spec, repository instructions, glossary, and relevant ADRs.
- Confirm the repository contains `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it does not, stop and report that this skill is Unity-specific.
- Confirm blockers are complete.
- Record the starting `HEAD`, staged paths, unstaged paths, untracked paths, and existing diffs. Preserve and distinguish all pre-existing user changes.
- Identify the project's documented Unity compile command and the commands for each validation tier the task requires. Do not invent a successful validation result when required tooling is unavailable.
- Treat the task as `implementing`; do not edit a task status file unless the user separately authorized that non-code change.

If the task conflicts with the repository, stop and report the expected state, actual state, impact, and decision needed. Do not silently work around it.

### Unity editing boundary

- By default, edit only C# scripts and tests within existing assembly boundaries.
- Require explicit, task-specific approval before editing any non-code file or `.asmdef` file.
- Require the approval to name the exact file or a narrow file group, and apply it only to the current task.
- Preview the proposed non-code or `.asmdef` changes and explain why they are necessary before requesting approval.
- Protect scenes, prefabs, packages, project settings, animation controllers, `.meta` files, ScriptableObjects, and other serialized assets with this rule.
- Prefer an approved Unity Editor tool or Editor script over direct YAML editing. Do not treat approval to use the tool as permission to change files outside the approved set.

## 2. Implement one task

Use `/unity-tdd` where appropriate, at the pre-agreed seams. Implement only the selected task's acceptance criteria and avoid scope creep.

Run focused checks regularly and the relevant broader suite at the end.

### Unity validation

Use the task's declared tiers:

- **EditMode:** deterministic rules and code outside a running scene.
- **PlayMode:** Unity lifecycle, component, scene, physics, or engine integration.
- **Player build:** platform- or build-sensitive behavior.
- **Human playtest:** player-facing behavior, feel, visuals, audio, and usability.

Use project commands from `AGENTS.md` or documented repository scripts when available. Treat compile errors and warnings introduced by the task as failures. Preserve GUID relationships and distinguish pre-existing Console output from new failures.

If the Unity Editor, required platform module, SDK, license, scene, or device is unavailable, report the missing validation explicitly. Do not mark that tier as passed.

## 3. Human checkpoint

After automated verification:

1. Report changed files, checks run, results, and any validation that remains unavailable.
2. Give exact Unity Editor or player steps with expected behavior.
3. Stop at `ready-for-human-test`.

If the user requests changes, continue only the same task and return to this checkpoint. Do not mark the task done until the user accepts the human verification.

After human acceptance, use `/unity-code-review` against the recorded baseline, including committed, staged, unstaged, and untracked task changes. Keep review read-only. Address findings only when the user requests another implementation pass.
