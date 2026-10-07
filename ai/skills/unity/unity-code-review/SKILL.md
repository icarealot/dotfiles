---
name: unity-code-review
description: "Review currently staged changes against repo standards, the originating spec, and testing guidance. Runs three independent reviews in parallel sub-agents and reports them side by side."
disable-model-invocation: true
---

Three-axis review of the current Git index (staged changes):

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the originating task / spec?
- **Testing**: do the tests follow `unity-tdd` guidance and sufficiently validate staged behavior at the agreed seams?

The axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

## Process

### 1. Establish the staged review set

Inspect `git status --short` and capture the review diff with `git diff --cached`, including staged additions, modifications, deletions, and renames. Record the staged file list with `git diff --cached --name-status`.

If there are no staged changes, report exactly `No staged changes to review.` and stop before spawning sub-agents.

The staged diff is the review boundary. Read staged file contents with `git show :<path>` so partially staged files are reviewed as they exist in the index, not the working tree. Read related files only as context; unstaged and untracked changes are outside the review scope.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. A path the user passed as an argument.
2. A spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
3. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Identify the testing sources

Read [unity-tdd/SKILL.md](../unity-tdd/SKILL.md), [tests.md](../unity-tdd/tests.md), and [mocking.md](../unity-tdd/mocking.md) completely. Use them as review references, not instructions to start an implementation loop.

Find any recorded seam agreement, glossary, and ADRs. Coverage findings must stay within the agreed seams and automated-testing boundary. If the seam agreement is unavailable, report that limitation instead of assuming every public interface needs tests. Human-playtesting gaps are outside this axis.

Evaluate test-first order and vertical slicing only when supplied evidence establishes the development sequence; the staged diff alone cannot establish it.

### 5. Spawn the applicable sub-agents in parallel

**Standards sub-agent prompt** should include:

- The staged diff command and file list from step 1, plus its review-boundary and index-reading instructions.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full (the sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The staged diff command and file list from step 1, plus its review-boundary and index-reading instructions.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

**Testing sub-agent prompt** should include:

- The staged diff command and file list from step 1, plus its review-boundary and index-reading instructions.
- The resolved paths or full contents of all testing sources from step 4, including its scope and evidence limits.
- The spec when available and any recorded seam agreement; identify missing sources explicitly.
- The brief: "Apply every relevant rule from unity-tdd and its references to staged production and test changes. Read related existing tests as coverage evidence. Report (a) tests that violate the guidance and (b) staged behavior at agreed seams that lacks sufficient automated validation. For each finding, cite the source file and rule, quote the relevant test/hunk or name the uncovered behavior, explain the risk, and give a concrete fix using the cheapest sufficient test level and smallest fixture. Judge validation evidence independently of spec correctness. Under 400 words."

### 6. Aggregate

Present the reports under `## Standards`, `## Spec`, and `## Testing` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the axes are deliberately separate (see _Why separate axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

## Why separate axes

A change can pass one axis and fail another:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the task asked but breaks the project's conventions → **Spec pass, Standards fail.**
- Correct, conforming code with tautological or implementation-coupled tests → **Standards pass, Spec pass, Testing fail.**

Reporting them separately stops one axis from masking another.