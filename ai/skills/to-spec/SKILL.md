---
name: to-spec
description: Turn the current conversation into a spec. Use when the user wants to formalize a feature discussion — even if they say "PRD", "document this", or "capture requirements" instead of "spec".
---

This skill synthesizes the current conversation into a spec. Do NOT interview the user — extract everything you need from what's already been discussed. A spec captures *what* the product should do and *why*; implementation detail belongs in the Implementation Decisions section, not scattered throughout.

## Process

### Step 1: Gather context

If the feature involves an existing codebase, explore it to understand what's already there and what needs to change. If it's a greenfield project with no existing code, skip this.

### Step 2: Confirm scope

Synthesize what you know into a brief outline:
- The core problem being solved (1-2 sentences)
- The proposed solution (1-2 sentences)
- Initial thoughts on what's out of scope

Present this to the user and ask: "Does this capture what you're after? Anything missing or off?" Then wait for confirmation before writing the full spec.

### Step 3: Write the spec

Write the spec using the template below and save it to `docs/<feature-name>/SPEC.md`.

<spec-template>

## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## Implementation Decisions

Decisions that constrain how this will be built. Include:

- The modules or components that will be built or modified
- Interface changes
- Architectural decisions and tradeoffs
- Schema changes
- API contracts
- Specific interaction patterns

NEVER include specific file paths or code snippets — they go stale quickly.

## Testing Decisions

- What makes a good manual test for this feature (focus on user workflows, edge cases, and real-world scenarios)
- Which modules or features warrant dedicated manual tests
- Critical test scenarios and edge cases to cover
- Any existing test procedures in the project that apply

## Out of Scope

What this spec explicitly does not cover.

## Further Notes

Any additional context, open questions, or future considerations.

</spec-template>
