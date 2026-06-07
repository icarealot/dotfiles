---
name: create-commit
description: Propose and create conventional commits by analyzing git diffs. Trigger whenever the user mentions "commit", "git commit", "create a commit message", or wants to save changes to the repository.
---

# Workflow

1. **Check Git**: Run `git status` — stop if not in a repo or nothing is staged.
2. **Review changes**: Run `git diff --staged`. Check conversation history for the *why*.
3. **Propose message**: Write one following the rules below.
4. **Get approval**: Show the message and wait. Only commit after user says yes.

# Format

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

# Examples

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
