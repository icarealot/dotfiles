---
name: unity-code-review
description: Review committed and uncommitted Unity project changes against repository standards, Unity safety rules, and the originating game spec. Use for Unity branch, PR, task, or work-in-progress reviews. Review only; never modify or commit.
---

Review Unity project changes along two axes:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

## Process

### 1. Pin the fixed point

Confirm the repository contains `Assets/` and `ProjectSettings/ProjectVersion.txt`. If it does not, stop and report that this skill is Unity-specific.

Use the implementation skill's recorded starting revision when available. Otherwise, use the fixed point the user supplied — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If neither exists, ask for it.

Capture:

- committed changes: `git diff <fixed-point>...HEAD`
- commit list: `git log <fixed-point>..HEAD --oneline`
- staged changes: `git diff --cached`
- unstaged changes: `git diff`
- untracked paths: `git status --short`, followed by reading relevant untracked files

If implementation recorded pre-existing working-tree changes, use that snapshot to exclude or label them. Never attribute pre-existing user work to the task. If hunk ownership is ambiguous, report the ambiguity rather than guessing.

Before going further, confirm the fixed point resolves and that at least one relevant committed, staged, unstaged, or untracked task change exists. A bad ref or empty task diff should fail here — not inside sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. A path the user passed as an argument.
2. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
3. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Read anything in the project that documents how Unity code and assets should be changed, such as `AGENTS.md`, `CODING_STANDARDS.md`, or `CONTRIBUTING.md`.

Add these Unity checks when relevant to the diff:

- unsafe scene, prefab, serialized asset, `.meta`, or GUID changes
- serialized-field compatibility regressions
- incorrect `MonoBehaviour` lifecycle or event cleanup
- avoidable per-frame allocations or expensive repeated engine work
- domain-reload, disabled-object, or destroyed-object hazards
- missing assembly or platform guards
- Unity API calls from inappropriate threads
- task-required validation that was skipped or misreported
- `.asmdef` or non-code changes made without exact task-specific approval

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The committed, staged, unstaged, and untracked change sources plus the commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3 and the Unity baseline** pasted in full — the sub-agent has no other access to them.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The committed, staged, unstaged, and untracked change sources plus the commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

Keep the review read-only. Never fix findings, edit task status, commit, amend, push, or merge during this skill.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
