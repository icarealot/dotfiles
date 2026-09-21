---
name: unity-code-review
description: Review changes since a fixed point along independent coding, specification, and testing axes using sequential passes, severity scores, and axis tags, then save actionable findings to Markdown.
disable-model-invocation: true
---

Review changes since a fixed point—a commit, branch, tag, or merge-base—through three sequential passes:

- **Standards** — conformance to the discovered coding standard.
- **Spec** — fidelity to the originating task or spec.
- **Testing** — conformance to the discovered testing standard.

Run each applicable pass against its own source. Score every finding 0–5, merge duplicates, and save the final sorted report.

## 1. Pin the fixed point

- Use the fixed point supplied by the user; ask for it if none was supplied.
- Capture once: `git diff <fixed-point>...HEAD` and `git log <fixed-point>..HEAD --oneline`.
- Confirm the ref with `git rev-parse <fixed-point>` and confirm the diff is non-empty. Stop on a bad ref or empty diff.

## 2. Identify the scope, sources, and report path

Classify the review from the source supplied by the user:

- **Task scope** — read the supplied `docs/<feature>/tasks/<task-name>.md` and its referenced spec completely. Write findings to `docs/<feature>/review-<task-name>.md`, where `<task-name>` is the task filename without its extension.
- **Spec scope** — read the supplied spec completely. Write findings to `docs/<feature>/review-<feature-name>.md`, where `<feature-name>` is the feature directory containing the spec.
- **Project scope** — when no task or spec is supplied, review the whole diff, write findings to `docs/review.md`, and skip the Spec pass.

Look in `docs/` for project coding and testing standards. Skip an axis when its source is absent.

## 3. Review sequentially

Run the applicable passes in order and re-read the diff against each pass's source.

### Standards pass

- Apply every documented coding rule to every changed code hunk.
- Inspect each full changed file and any relevant prefabs, assets, call sites, or configuration when the hunk is insufficient.
- For each violation, record the exact rule, quote the evidence, explain what the issue could hide, and suggest a concrete fix.

### Spec pass

- Report missing or partial requirements, unrequested behavior, and apparently incorrect implementations.
- Quote the relevant task or spec line for every finding and suggest a concrete fix.

### Testing pass

- Apply every testing rule to changed production and test code.
- For each changed caller-visible behavior, use the diff and spec-defined contract to name its risk, decide whether automation or human judgment can establish it, select the cheapest sufficient validation level and smallest fixture, and verify that the selected checks are recorded.
- Judge validation evidence, not whether the behavior satisfies the spec. Report a spec defect only when insufficient validation reveals a new issue; accept a deliberate omission only when its reason is recorded.
- Report each retained test that violates a rule and each changed behavior without sufficient validation. Quote relevant evidence and suggest a concrete fix; for missing automation, name the behavior and sufficient fixture, and for human judgment, name the concrete manual checklist.

**Extend, don't repeat.** If a later pass finds an existing issue, extend that finding with the new axis tag and detail instead of creating a duplicate.

### Score and tag findings

Score every finding:

- **5** — wrong or missing behavior, violates a spec requirement, or breaks an invariant
- **4** — defect risk the tests do not cover; hard standards violation that can hide bugs
- **3** — clear standards or testing-standard violation, quality risk
- **2** — minor convention drift
- **1** — style nit
- **0** — not reportable; omit it

Tag every finding with the axis that caught it: `[Standards]`, `[Spec]`, `[Testing]`, or a combination such as `[Spec + Testing]`.

## 4. Write the report

Sort findings by score descending and replace the scope's report file with this flat list:

```markdown
1. **[5] [Spec + Testing] <finding name>**

- `<quoted spec line>` / `<path/to/file>`
- <What the deviation could hide>.
- Action: <suggested fix>.
```

When findings exist, respond in chat with only the report path.

When no findings exist, delete any existing report at the target path so stale findings cannot be mistaken for current results, then report that no findings were found.
