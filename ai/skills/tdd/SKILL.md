---
name: tdd
description: Test-drive Unity gameplay features and fixes with NUnit and the Unity Test Framework. Use for red-green development with EditMode or PlayMode tests in a Unity project.
---

# Unity Test-Driven Development

Confirm the repository is a Unity project with `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it is not, stop and report that this skill is Unity-specific.

Use the red → green loop to produce Unity tests worth keeping.

Read `CONTEXT.md` when present so test names match the game's domain language. Respect relevant ADRs, existing `.asmdef` boundaries, Unity Test Framework conventions, and repository test commands.

## What a good test is

Tests verify gameplay or tool behavior through public interfaces, not implementation details. A good test reads like a specification — “player cannot spend more mana than is available” — and survives internal refactors.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "Which behavior belongs in EditMode, which requires PlayMode, and what still needs a human playtest?"

### Choose the Unity seam

- Use EditMode tests for deterministic rules and code that does not require a running scene.
- Use PlayMode tests only when behavior depends on Unity lifecycle, components, scenes, physics, or other engine integration.
- Do not use a slow PlayMode seam when an EditMode seam fully verifies the same behavior.
- Treat TDD as optional for visual polish, animation feel, audio, controls, camera feel, and level design. Require explicit human playtest criteria; do not present an automated test as evidence that the experience feels right.
- Do not create or modify scenes, prefabs, `.asmdef` files, or other non-code assets merely to make a test convenient. If one is necessary, preview the proposed change and require task-specific approval naming the exact file or narrow file group before editing.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or inspects serialized scene/prefab data instead of using the agreed gameplay or component interface. The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected gameplay value with the same formula as production code, so it passes by construction and can never disagree. Use an independent known literal, worked design example, or rule from the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.
