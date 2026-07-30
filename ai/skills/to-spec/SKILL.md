---
name: to-spec
description: Turn a Unity game feature discussion into a human-approved spec covering player behavior, Unity architecture, protected assets, and EditMode, PlayMode, build, and playtest validation.
---

Synthesize the current Unity game feature discussion and codebase understanding into a spec (also known as a PRD). Do not restart discovery or conduct an open-ended interview; use what is already known and ask only for approval or correction at the checkpoint below.


## Process

1. Confirm the repository is a Unity project with `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it is not, stop and report that this skill is Unity-specific.

Explore the project to understand its Unity version, packages, assembly boundaries, scenes, prefabs, ScriptableObjects, tests, build targets, domain glossary, and relevant ADRs.

2. Sketch the EditMode, PlayMode, player-build, and human-playtest seams that apply. Prefer existing seams and avoid duplicate coverage.

Use EditMode for deterministic code that does not require a running scene, PlayMode for Unity lifecycle or engine integration, player-build smoke tests for platform-sensitive behavior, and human playtests for feel, visuals, audio, and usability.

Present the synthesized behavior, scope, test seams, and any protected Unity changes to the user. Wait for approval or correction before writing the spec.

3. Write the spec using the template below and save it to `docs/<feature-name>/SPEC.md`.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A numbered list containing the smallest complete set of user stories. Each user story should be in the format:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a player, I want an aiming indicator before releasing an ability, so that I can judge its direction and range
</user-story-example>

Cover meaningful behavior and edge cases without creating repetitive stories for their own sake.

## Unity Context

- Unity Editor version and relevant packages with their versions
- Target platforms and input methods
- Player-visible behavior
- Logical scenes, prefabs, ScriptableObjects, and systems affected
- Exact non-code files or narrowly defined file groups that would require implementation approval
- Performance and memory constraints
- Save-data and backward-compatibility impact

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- Gameplay systems and Unity components that will change
- Public C# interfaces and existing assembly boundaries involved
- Scene, prefab, ScriptableObject, and serialization interactions
- Input, lifecycle, save-data, platform-service, and build-target decisions
- Performance or memory constraints
- Technical clarifications and architectural decisions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which gameplay systems and Unity boundaries will be tested
- Which checks belong in EditMode, PlayMode, a player build, or a human playtest
- Prior Unity Test Framework patterns already used by the project
- Exact behavior the human must verify

## Out of Scope

A description of the things that are out of scope for this spec, including content and polish that are intentionally excluded.

## Further Notes

Any further notes about the feature.

</spec-template>
