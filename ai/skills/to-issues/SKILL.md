---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

## Process

### 1. Gather context

Work from whatever is already in the conversation context.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

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
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Create the issues

For each approved slice, write an issue and save it to `./agents/prd/<folder-contain-prd>/issues/ISSUE_<N>.md`. Use the issue body template below.

**Issue number format:** use sequential integers starting from 1 without zero-padding — `ISSUE_1`, `ISSUE_2`, `ISSUE_3`, etc. (not `ISSUE_001`, `ISSUE_01`).

Create issues in dependency order (blockers first) so you can reference real issue numbers in the "Blocked by" field.

<issue-template>

## Parent PRD

Link to the prd

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [] Criterion 1
- [] Criterion 2
- [] Criterion 3

## Manual Testing

Describe the manual testing steps to verify this slice works correctly:

- Test step 1: Expected behavior
- Test step 2: Expected behavior
- Edge cases to verify
- User workflows to test

## Blocked by

- Blocked by [ISSUE_<N>](./ISSUE_<N>.md) (if any)

Or "None - can start immediately" if no blockers.

</issue-template>