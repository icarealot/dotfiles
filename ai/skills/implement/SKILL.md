---
name: implement
description: Implement vertical slice tasks, guiding end-to-end development of tracer bullet slices. Use when user mentions implementing a task, working on a task, or wants to start development on a specific task.
---

# Implement

## Quick start
1. Ask the user for the full file path to the task they want to implement.
2. Review the task's `Blocked by` section: implement all dependency tasks first.
3. Read any linked specification or documentation for full context on requirements and implementation decisions.
4. Follow the workflow below to implement and verify the task.

## Workflow
1. **Pre-implementation check**
   - Confirm all blocking tasks are implemented and merged
   - Read the task's `What to build`, `Acceptance criteria`, and `Manual Testing` sections
2. **Codebase exploration**
   - Explore relevant modules/schema/API/UI layers mentioned in the task
   - Check for existing code that can be reused
3. **Implement the vertical slice**
   - Build end-to-end functionality across all layers (schema → API → UI) per the tracer bullet approach
   - Follow acceptance criteria exactly; avoid scope creep
4. **Verification**
   - Inform the user to manually test the task using the steps provided in the task's `Manual Testing` section

## Mismatch handling
If the codebase doesn't match what the task describes (missing dependency, changed API, conflicting existing code):
- STOP and think deeply about why the task can't be followed as written
- Present the task clearly:
  ```
  Mismatch in [acceptance criterion / section]:
  Expected: [what the task says]
  Found: [actual situation]
  Why this matters: [explanation]

  How should I proceed?
  ```
- Do not work around mismatches silently — always surface them before continuing

## Notes
- Tasks are typically stored in project-specific planning directories; refer to your project's structure for exact locations.
