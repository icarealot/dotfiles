---
name: to-tasks
description: Break a plan, spec, or PRD into independently-grabbable tasks using tracer-bullet vertical slices. Use when user wants to convert a plan into tasks, or break down work into tasks.
---

# To Tasks

Break a plan into independently-grabbable tasks using vertical slices (tracer bullets).

## Process

### 1. Gather context

Work from whatever is already in the conversation context.

### 2. Explore the codebase (optional)

If the plan targets an existing codebase, explore it to understand what's already there and what needs to change. If it's a greenfield project with no existing code, skip this.

### 3. Draft vertical slices

Break the plan into **tracer bullet** tasks. Each task is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI)
- A completed slice is demoable and manually verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **How to test**: the key manual verification steps for this slice

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Create the tasks

For each approved slice, write a task and save it to `docs/<feature-name>/tasks/TASK_<N>.md` — the same `docs/` directory that `to-spec` used for the spec. Use the task body template below.

**Task number format:** use sequential integers starting from 1 without zero-padding — `TASK_1`, `TASK_2`, `TASK_3`, etc. (not `TASK_001`, `TASK_01`).

Create tasks in dependency order (blockers first) so you can reference real task numbers in the "Blocked by" field.

<task-template>

## Parent Spec

Link to the spec

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- Criterion 1
- Criterion 2
- Criterion 3

## Manual Testing

Describe the manual testing steps to verify this slice works correctly:

- Test step 1: Expected behavior
- Test step 2: Expected behavior
- Edge cases to verify
- User workflows to test

## Blocked by

- Blocked by [TASK_<N>](./TASK_<N>.md) (if any)

Or "None - can start immediately" if no blockers.

</task-template>
