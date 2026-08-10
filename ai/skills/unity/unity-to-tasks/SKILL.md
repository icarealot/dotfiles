---
name: unity-to-tasks
description: Break a Unity game spec or discussion into human-approved tracer-bullet tasks with Unity scope, protected assets, blocking edges, and EditMode, PlayMode, build, and playtest validation.
---

# To Tasks

Break a Unity game plan, spec, or conversation into **tasks** — tracer-bullet gameplay slices, each declaring the tasks that **block** it.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Confirm and explore the Unity project

Confirm the repository is a Unity project with `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it is not, stop and report that this skill is Unity-specific.

If you have not already explored the project, inspect its Unity version, packages, assembly boundaries, relevant scenes, prefabs, ScriptableObjects, tests, and build targets. Use the domain glossary vocabulary and respect relevant ADRs.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tasks.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through the applicable input, game rules, Unity integration, presentation/audio, persistence, and validation, rather than changing one technical layer in isolation
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each task its **blocking edges** — the other tasks that must complete before it can start. A task with no blockers can start immediately.

Sequence tasks that could touch the same scene, prefab, or other serialized asset instead of running them in parallel. State the shared protected asset as the reason for the blocking edge.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical Unity change — renaming a serialized field or retyping a shared C# symbol — whose blast radius crosses many scripts or assets so no vertical slice can stay valid alone. Sequence it as **expand–contract**: add the new form beside the old, migrate callers in assembly- or folder-sized tasks, then remove the old form after every migration completes. Account explicitly for serialized-data compatibility, such as `FormerlySerializedAs`, throughout the sequence.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each task, show:

- **Title**: short descriptive name
- **Blocked by**: which other tasks (if any) must complete first
- **What it delivers**: the end-to-end behaviour this task makes work
- **Unity scope**: systems and logical Unity content involved
- **Protected changes**: exact non-code files or narrow file groups requiring approval
- **Validation tier**: applicable EditMode, PlayMode, Player build, and Human playtest checks
- **Agent verification**: automated checks
- **Human verification**: exact Editor or player steps and expected behavior

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct — does each task only depend on tasks that genuinely gate it?
- Should any tasks be merged or split further?
- Are the protected changes and automated/human validation correct?

Iterate until the user approves the breakdown.

### 5. Create the tasks

- Write one file per task under `docs/<feature-name>/tasks/TASK_<N>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-task file template below — one task per file, never a single combined file.

Identify the **frontier**: tasks whose blockers are all done. Do not start them.

Do NOT close or modify any parent issue.

Create tasks only. Do not implement them or start frontier tasks.

Use this lifecycle when describing task state:

`ready-for-agent → implementing → ready-for-human-test → changes-requested | human-accepted → reviewing → done`

<local-task-template>

# <NN> — <task title>

**What to build:** the end-to-end behaviour this task makes work, from the user's perspective — not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tasks that gate this one, or "None — can start immediately".

**Status:** ready-for-agent

**Unity scope:** the systems and logical Unity content involved.

**Protected changes:** exact non-code files or narrowly defined file groups requiring approval before editing, or "None". Task approval does not grant edit approval.

**Validation tier:** applicable EditMode, PlayMode, Player build, and Human playtest checks.

**Agent verification:** automated checks the agent must perform.

**Human verification:** exact Editor or player steps and expected behavior, or "None".

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-task-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this task makes work, from the user's perspective — not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking task, or "None — can start immediately".

## Unity execution

- **Unity scope:** systems and logical Unity content involved
- **Protected changes:** exact non-code files or narrow file groups requiring approval, or "None"
- **Validation tier:** applicable EditMode, PlayMode, Player build, and Human playtest checks
- **Agent verification:** automated checks
- **Human verification:** exact Editor or player steps and expected behavior

</issue-template>

In either form, avoid implementation file paths or code snippets because they go stale. Include exact Unity paths only for protected files that require approval.
