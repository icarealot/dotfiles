---
name: unity-implement
description: Implement and verify one assigned Unity task.
disable-model-invocation: true
---
Implement and verify one Unity task assigned by the user. Optimize the total cost of completing that task while preserving the quality of the affected gameplay, visuals, and code.

Reduce unnecessary investigation, coordination, retries, and duplicated work. Do not achieve savings by skipping essential validation or delivering incomplete features.

## 1. Establish the task boundary

Identify the assigned task from its task file, the relevant part of the spec, or the current discussion. Confirm what behavior or deliverable is in scope, which prerequisites it depends on, and what observable evidence will satisfy each acceptance criterion. Use project context where it affects those decisions.

If multiple tasks are in view and the assignment is unclear, ask which one to implement. If a prerequisite is missing, identify the blocker and continue any useful work within the assigned task that can proceed independently.

Follow existing project instructions, architecture, naming, coding style, and approved visual references. Preserve deliberate unfinished tutorial objectives.

## 2. Choose models deliberately

Authorize task-specific subagents with these settings where supported:

- gpt-6.1-terra, medium: default implementation, ordinary debugging, UI, tools, asset integration, and defined gameplay tests.
- gpt-6.1-terra, high: complex interactions, difficult bounded bugs, and compatibility-sensitive implementation.
- gpt-6-luna, low: mechanical extraction, formatting, and concise summaries.
- gpt-6-luna, high: isolated tasks with explicit requirements and inexpensive objective verification.
- gpt-6-sol, low/medium: consequential design decisions, architecture, ambiguous problems, and focused reviews.
- gpt-6-sol, high: unusually difficult problems when the additional reasoning is justified.

Use deterministic tools instead of an agent when they can reliably perform the operation.

Select actual model and reasoning settings through available controls. Prefer fresh worker context with a compact brief. Report unavailable controls once and distinguish requested settings from verified settings. Do not simulate model switching or silently substitute a substantially more expensive worker.

Prefer Standard speed where supported. Avoid routinely using the highest reasoning settings.

## 3. Delegate complete outcomes

Give each worker:

- Intended behavior and observable acceptance criteria.
- Relevant files, interfaces, existing patterns, and references.
- Ownership boundaries and protected state.
- Important edge cases.
- Appropriate verification and style requirements.

Let the worker own implementation, its first validation pass, and straightforward repairs. Specify outcomes and constraints without micromanaging every line.

Default to one implementation owner. Parallelize only genuinely independent work. Give one agent ownership of each running editor instance and overlapping scenes, prefabs, or serialized assets.

Let workers finish their assigned work before reviewing. Avoid repeatedly inspecting unfinished work, polling unchanged progress, or sending speculative incremental corrections.

## 4. Implement the task end to end

Deliver the task through its normal entry point in the Unity project. For gameplay, wire the required scenes, assets, input, UI, audio, and configuration so the affected behavior can be exercised in play. For editor tooling, assets, or fixes, complete the deliverable through the workflow the task affects.

Use the engine's supported workflows and appropriate tools. Preserve asset identities, serialization, saves, public interfaces, and existing user edits.

Keep changes within the requested scope. Avoid unrelated refactoring, new frameworks, package upgrades, or speculative features.

For unfamiliar visual or technical approaches, validate a representative example before scaling. Reuse approved assets and established solutions.

## 5. Verify proportionately

Check each acceptance criterion using the evidence identified at the start of the task.

For code, confirm compilation in the actual project when available. Run relevant existing tests and add tests when they protect meaningful behavior.

For gameplay, exercise the affected runtime path. For UI and art, inspect the rendered result. For animation, audio, and timing, inspect the relevant experience rather than relying only on code or screenshots.

For persistence and shared systems, test relevant compatibility and regression paths using disposable data. Restore temporary settings and protect real saves.

Test affected behavior first. Expand testing when dependencies, failures, or consequences justify it. Do not rerun every check after each cosmetic adjustment.

Separate repeatable regression tests from exploratory playtesting. Record expected behavior, actual behavior, reproduction steps, and useful evidence.

Distinguish simulated input from physical-device testing, editor performance from shipped-build performance, and observed player behavior from assumptions about enjoyment.

Never report checks as passed unless performed.

## 6. Review without repeating implementation

Review the actual changes, relevant interfaces, and validation evidence. Use stronger reasoning where errors would be consequential.

Follow any mandatory project or skill review requirements, including fresh reviewers where required. Keep reviews within the authorized scope and verify any resulting edits.

Batch related corrections. If the same underlying failure survives a focused repair, reassess the diagnosis, gather missing evidence, or escalate appropriately.

Do not keep regenerating implementations or polishing settled details after acceptance criteria are met.

## 7. Keep context and reporting efficient

Use targeted searches, bounded logs, and existing documentation. Maintain a compact handoff when it supports continuity; avoid creating unnecessary documentation systems.

Give brief progress updates about meaningful findings, decisions, and blockers.

Finish with:

- What was delivered.
- What was verified.
- Remaining limitations or decisions.
- Models/settings used where observable.
- Significant rework and measured usage, if available.

Do not invent savings or infer this task's cost from account-wide usage during concurrent work.

Proceed autonomously within the authorized scope. Respect explicit approval boundaries, and do not publish, purchase, or expand project scope without authorization.

End the invocation when the assigned task is verified or a blocker prevents further progress. Report any acceptance criterion still open.
