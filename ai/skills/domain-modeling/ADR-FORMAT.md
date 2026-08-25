# ADR Format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc.

Create the `docs/adr/` directory lazily — only when the first ADR is needed.

ADRs should not be modified or edited directly. If a decision needs to be changed, create a new ADR that supersedes the old one. This preserves the history of decisions and their rationale.

## Template

```md
# {Title}

## Status

What is the status, such as proposed, accepted, rejected, deprecated, superseded, etc.? Only one active status at any point in its lifecycle.

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?
```

## Numbering

Scan `docs/adr/` for the highest existing number and increment by one.

## When to offer an ADR

All three of these must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** ECS vs. MonoBehaviours, scene layout strategy.
- **Integration patterns.** "Systems communicate via ScriptableObject event channels, not direct references."
- **Technology choices that carry lock-in.** Netcode solution, Addressables vs. Resources, render pipeline, key third-party SDKs.
- **Boundary and scope decisions.** Which system owns a piece of state and how others may access it.
- **Deliberate deviations from the obvious path.** E.g. hand-rolled object pooling instead of `Instantiate`/`Destroy` for GC reasons. Stops the next engineer from "fixing" something deliberate.
- **Constraints not visible in the code.** Frame budget, console cert requirements, platform packet size limits.
- **Rejected alternatives when non-obvious.** E.g. why classic MonoBehaviours over DOTS/ECS — otherwise someone proposes the rewrite again.
