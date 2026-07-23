---
name: review
description: Review implementation against its issue and PRD. Use when the user says "review", "check my implementation", "does this match the spec", or wants to verify changes align with requirements.
disable-model-invocation: true
---

# Review

Verify that the current implementation matches what was specified in the issue and PRD, and flag simplification opportunities.

## Quick start

1. Ask the user for the full file path to the issue they implemented.
2. Read the issue, then follow the "Parent PRD" link to read the PRD.
3. Run `git diff HEAD` to see all currently changed files (staged + unstaged).
4. Check for a CLAUDE.md at the repo root — if present, read it for project-specific conventions to apply in the Simplification section.
5. Produce a report with three sections (see Output Format below).
6. Ask the user what they want to do next.

## What to check

### Spec Conformance

Compare the diff against:
- **Acceptance criteria** in the issue — go through each criterion and verify it's addressed in the code
- **Implementation Decisions** in the PRD — verify architectural choices align

Flag anything missing, partially implemented, or misaligned. When uncertain, flag it — the goal is broad coverage, not just obvious gaps.

### Code Findings

Review the changed code for:
- Correctness issues (logic errors, off-by-ones, wrong conditions, missing edge cases)
- Obvious bugs that would cause failures at runtime
- Anything that looks wrong or suspicious, even if you can't be certain

Include uncertain findings — flag with "(uncertain)" if you're not sure. Better to surface something that turns out to be fine than to miss a real issue.

### Simplification Opportunities

Review the changed code for clarity and maintainability improvements. If a CLAUDE.md was found, apply its conventions here. Otherwise apply general principles:

- Unnecessary complexity or nesting that could be flattened
- Redundant code, dead code, or abstractions that add no value
- Variable or function names that obscure intent
- Nested ternaries — prefer `if/else` or `switch` instead
- Overly compact one-liners where explicit code would be clearer
- Repeated logic that could be consolidated without sacrificing readability

Report only, do not apply fixes.

## Output Format

Always use this exact structure — including the closing question:

```
## Spec Conformance

**Covered:**
- [criterion or story] — [brief note on where/how it's addressed]

**Gaps / Misalignments:**
- [criterion or story] — [what's missing or wrong]

---

## Code Findings

- [file:line] [description of issue] (uncertain if applicable)

No issues found. (if nothing to report)

---

## Simplification Opportunities

- [file:line] [description of improvement]

No suggestions. (if nothing to report)

---

What would you like to do next?
```

Keep each item to one line. Include file references (filename:line) for all findings. If everything looks good in a section, say so explicitly. The closing "What would you like to do next?" is required — always include it verbatim.

## Mismatch handling

If the issue or PRD can't be found at the given path, or the diff is empty, stop and tell the user clearly before proceeding.
