---
name: unity-auto-implement-batch
description: Implement an approved Unity task set end to end, delegating each task to a subagent and reporting once at the end.
disable-model-invocation: true
---

Implement every task in an approved task set, unattended, and report once at the end.

## 1. Establish the boundary

- Confirm the `/unity-cli` skill is available in this session's skill listing. If it is not, stop immediately and ask the user to install it; do not proceed with the run by any other means.
- Confirm the repository contains `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it does not, stop and report that this skill is Unity-specific.
- Confirm there is an opened editor by running `unity pipeline list`. If there is no opened editor, use `unity open --args "-automated"` to open one.
- The user names a task directory, `docs/<feature-slug>/tasks/`, holding one `<NN>-<slug>.md` per task. Without one, stop and offer `/unity-to-tasks` to produce it.
- The task set is the approval. Begin on invocation and run unattended until the final report.

## 2. Work the frontier

Read every task file and its **Blocked by** edges.

Skip any task whose acceptance criteria are all ticked — that task landed in an earlier run.

Then loop, one task in flight at a time:

1. Take the **frontier**: the unfinished tasks whose blockers are all done. Pick the lowest-numbered one.
2. Spawn a subagent to implement that task alone (§3).
3. On its report:
   - **Green** — tick that task file's acceptance criteria, record its changed files and the tiers it left **outstanding**, then print one line: `NN — <title>: green — <changed files>`.
   - **Red** — print `NN — <title>: red — <failure message>` and **halt**: go straight to the report (§5), covering what landed.

Player build and human playtest tiers stay **outstanding** for the human. They never halt the loop.

## 3. Dispatch one task

Give the subagent the task file path and these rules, so they hold whether or not it loads any skill:

- Implement that one task file. Use `/unity-tdd` at the seams the task declares.
- Edit `.cs` script and test files directly. Route every other file through `/unity-cli` — `.unity` scenes, `.prefab`, `.asset` ScriptableObjects, `.meta` files, `.asmdef` files, `ProjectSettings/*` — and leave their YAML untouched by hand.
- Recompile and run tests through `/unity-cli`, single test files regularly and the task's EditMode and PlayMode tiers before reporting. Treat compile errors and warnings the task introduced as failures. Preserve GUID relationships, and tell pre-existing Console output apart from new failures.
- Leave the Player build to the human: report the exact steps rather than triggering one.
- When the Editor, a platform module, SDK, license, scene, or device is unavailable, report that tier as unavailable rather than passed.
- Report back: green or red, the failure message when red, the changed files, which test covers which acceptance criterion, every tier left outstanding with its exact Editor or player steps, and anything you noticed and deliberately left undone.

Take the report at its word.

## 4. Close the set

When the frontier empties:

1. Run the full test suite through `/unity-cli`.
2. Review the whole batch with `/unity-code-review`.
3. Hand the findings to one subagent to fix, under the same rules as §3.
4. Re-run the full suite. If it comes back red, **halt** and report.

A finding that needs fresh implementation rather than cleanup stays outstanding in the report.

## 5. Report

Stop at `ready-for-human-test` with:

- A table, one row per task: number, title, green or red, changed files, and which test covers which acceptance criterion.
- The full suite result, and every validation that was unavailable — named as unavailable, never as passed.
- Every outstanding tier across the set, each with the exact Unity Editor or player steps and the behaviour to expect.
- `/unity-code-review` findings, split into fixed and outstanding.
- Refactors and flags the subagents deferred.
