---
name: unity-to-spec
description: Turn the current conversation into a spec. No feature interview, just synthesis of what has already been discussed.
disable-model-invocation: true
---

Turn the current conversation and codebase evidence into a spec. Do not interview the user; synthesize what is already known.

## Process

1. Explore the repository, project standards in `docs/`.

2. Use the project's domain glossary vocabulary, apply project standards throughout the spec and respect applicable ADRs.

3. Place unagreed optional behavior and future flexibility in Out of Scope.

4. Derive the feature's validation decisions from the discovered standards and the agreed conversation. Record unresolved validation assumptions in the spec rather than opening a feature interview.

5. Write the spec to `docs/<feature-name>/spec.md` using this template:

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A long numbered list in this format:

1. As an <actor>, I want a <feature>, so that <benefit>

Cover every agreed aspect of the feature.

## Implementation Decisions

List agreed implementation decisions, including relevant modules, interfaces, technical clarifications, architecture, schemas, contracts, and interactions.

Do not include file paths or code snippets; they become stale quickly.

## Testing Decisions

Record the feature-specific validation decisions derived from the project standards, including the rationale for each selected check or deliberate omission and relevant codebase prior art.

## Out of Scope

Describe what this spec excludes.

## Further Notes

Record other relevant feature notes.

</spec-template>

6. Spawn a subagent to review the spec. Pass the exact spec path and a concise summary of the agreed requirements and unresolved assumptions from the current conversation. Instruct the reviewer to:

   - Read the complete spec.
   - Discover and read applicable context files, applicable decisions under `docs/adr/`, and project standards under `docs/`.
   - Compare every spec section and validation decision with the agreed conversation, discovered context, applicable ADRs, project standards, and relevant codebase evidence.
   - Report source coverage, including missing or unavailable sources; never treat a missing source as evidence of alignment.
   - Report each conflict, unsupported assumption, omission, or standards deviation with its severity, evidence/source reference, risk, and actionable recommendation.
   - Keep the review read-only: do not modify the spec or any other file, and do not interview the user. Report `No findings.` when the available evidence reveals no issues.

   Present the subagent's result under a distinct `## Spec Review` heading in the final response, preserving its source coverage and findings. If the subagent fails or cannot run, report `Review incomplete: <reason>` in that section and do not claim that the spec is aligned. Do not create a separate review artifact or revise the spec automatically.
