---
name: commit
description: Propose and create conventional commits. Trigger on "commit", "create a commit", or any request to save changes. Also handles splitting a staged change into multiple intent-scoped commits on request ("split this into commits", "separate commits", "break this up").
---

# Workflow

1. **Check Git**: Run `git status` — stop if not in a repo or nothing is staged.
2. **Review changes**: Run `git diff --staged`. Check conversation history for the *why*.
3. If the user explicitly asked to split the staged change into multiple commits, follow **Split Workflow** below instead of steps 4-5.
4. **Propose message**: Write one following the rules below.
5. **Get approval**: Show the message and wait. Only commit after user says yes.

# Split Workflow

Only enter this flow when the user explicitly asks for multiple commits. Never infer it from the diff alone.

Scope is limited to what's already staged — never stage or unstage anything from the working tree beyond what `git diff --staged` already covers.

1. **Group by intent**: Read `git diff --staged` hunk by hunk. Propose a first-pass grouping — each group is one future commit, one intent. Splitting within a single file across groups (different hunks to different commits) is fine. If two hunks are interdependent (e.g. a function's definition and its only call site, or a rename that spans both), force them into the same group rather than guessing a split.
2. **Confirm grouping**: Show the groups (files/hunks per group, one-line intent each). Let the user correct or reshuffle before locking it in.
3. **Order groups**: Sequence commits so dependencies come first (e.g. the commit introducing a function before the commit that calls it). Best-effort — no build or test verification between commits.
4. **Propose all messages**: Write one commit message per group (same format/type rules as below). Show all N messages together as a single batch.
5. **Get approval**: Wait for one yes covering the whole batch. Then, for each group in order:
   - Run `git reset` to unstage everything.
   - Re-stage only that group's hunks (via `git add -p`/`git apply --cached` on the relevant hunks, or `git add <file>` when a group is whole-file).
   - Commit with that group's message.
   - After the last group, confirm the working tree/index is clean and matches what was originally staged.

# Commit Format

```
type(scope): description
```

- Imperative mood, lowercase, no trailing period
- Breaking change: append `!` → `feat(api)!: rename foo to bar`
- Optional body after blank line — explain *why*, not what

# Types (pick first match)

| Type | Use when |
|------|----------|
| `feat` | New user-facing capability |
| `fix` | Corrects a bug |
| `perf` | Measurably faster/lighter (same behavior) |
| `refactor` | Code restructure, no behavior change |
| `style` | Whitespace, formatting, missing semicolons |
| `test` | Test-only changes |
| `docs` | Docs, comments, MD files |
| `build` | Build inputs (deps, packaging, version catalogs) |
| `ci` | CI config only (GitHub Actions, pipelines) |
| `chore` | Repo housekeeping (lint config, .gitignore, scripts) |
| `revert` | Reverting an earlier commit |

# Commit Examples

```
feat(player): add dash ability with cooldown

fix(enemy): handle null reference on death

refactor(inventory): extract ItemFactory from InventoryManager

perf(rendering): batch static meshes to reduce draw calls

style: apply code formatting standards

test(combat): add damage calculation unit tests

docs: document PlayerController public API

build: upgrade Unity to 2023.2

ci: configure Unity test runner in GitHub Actions

chore: update .gitignore for URP generated files

revert: revert "feat(spawn): add enemy wave system"
This reverts commit abc1234.
```

# Avoid

- "I", "we", "now", "currently" — the diff speaks for itself
- AI attribution (`Co-authored-by`, "Generated with...") — this skill suppresses it
- Emoji (unless project convention requires)
- Restating the filename when scope covers it
