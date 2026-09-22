---
name: unity-orchestrate
description: Implement and review a prepared Unity feature through isolated workers.
disable-model-invocation: true
---

Orchestrate one `docs/<feature>/` directory. Accept an optional contiguous resume point: `from <NN>`. Delegate all code changes and reviews to fresh subagents.

## 1. Preflight

Before delegation:

1. Confirm the input identifies one feature directory containing `spec.md` and a non-empty `tasks/` directory.
2. Read the complete spec and every task.
3. Require task names to match `tasks/<NN>-<slug>.md`, unique numbers, and blockers that name existing lower-numbered tasks. Numeric order must satisfy every blocking edge.
4. When `from <NN>` is supplied, require that task number to exist. Treat lower-numbered tasks as user-confirmed complete and skip them. Without it, run every task, including previously implemented tasks.
5. Capture the full output of `git rev-parse HEAD` as the fixed point. A dirty worktree is valid; reviews include all changes since that commit.

On any failure, stop and report the failed check.

## 2. Implement tasks

Process non-skipped tasks sequentially by numeric prefix. For each, call one fresh subagent with exactly:

```text
/skill:unity-implement <task-path>
```

Wait for its result. Continue only when its first line is `Status: complete`. Otherwise stop without spawning another subagent and report the completed, skipped, and blocked tasks plus all deferred or unavailable validation received so far.

## 3. Review

After implementation, call one fresh subagent with:

```text
/skill:unity-code-review <fixed-point> <feature-directory>
```

`No findings.` is a clean review. A failed or incomplete review is a blocker. On a clean first review, skip remediation and finish.

## 4. Remediate and review again

When findings exist, pass them unchanged to one fresh subagent:

```text
/skill:unity-implement Review remediation for <feature-directory>.

Review findings:
<verbatim findings>
```

Continue only when its first line is `Status: complete`; otherwise report the blocker, findings, and validation status.

After successful remediation, run a fresh full review with the original fixed point and feature directory. Report this final result without another remediation cycle.

## 5. Report

Return a compact report containing:

- each task: `complete`, `skipped (user-confirmed)`, or `blocked`, with changed-file paths from its worker;
- deferred or unavailable validation;
- first-review result and findings;
- remediation file changes and finding dispositions, when applicable;
- final-review result and remaining findings.

Create no orchestration or review report file. Leave the index and worktree state intact: do not run `git add`, `git commit`, or `git stash`.
