---
name: commit
description: Propose and create conventional commits, then optionally push with full error handling. Trigger on "commit", "push", "create a commit", or any request to save or publish changes.
disable-model-invocation: true
---

# Workflow

1. **Check Git**: Run `git status` — stop if not in a repo or nothing is staged.
2. **Review changes**: Run `git diff --staged`. Check conversation history for the *why*.
3. **Propose message**: Write one following the rules below.
4. **Get approval**: Show the message and wait. Only commit after user says yes.
5. **After committing**: Ask "Do you want to push?" — do not push without confirmation.
6. **If yes**: Determine the push command and show it before executing (see Push section).

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

# Push

## Determining the target

1. Check for a tracking remote: `git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null`
2. If a tracking remote is set, use it (e.g. `origin/main` → push to `origin`)
3. If no tracking remote, default to `origin`
4. If `origin` does not exist and there are multiple remotes, list them and ask the user to pick one

Never push tags — branch commits only.

## Happy path

On success, confirm with one line: `Pushed to origin/<branch>`

## Failure cases

Handle each rejection distinctly:

### Non-fast-forward (remote has commits you don't)
Before pulling, check for uncommitted local changes (`git status --porcelain`). If any exist, ask the user what to do:
- **Stash**: run `git stash`, pull, then `git stash pop`
- **Discard**: run `git checkout -- .` to wipe local changes, then pull
- **Stop**: leave everything as-is for the user to resolve manually

Once local changes are handled, offer three pull options:
- **Rebase**: run `git pull --rebase`, then re-push
- **Merge**: run `git pull`, then re-push
- **Stop**: leave it for the user to resolve manually

If the chosen pull results in a merge conflict:
- Abort cleanly: `git rebase --abort` or `git merge --abort`
- If changes were stashed before pulling, pop the stash back: `git stash pop`
- Tell the user: "Pull aborted due to merge conflicts. Resolve them manually and re-run the skill."

### Diverged history (amended or rebased commits)
Git will reject a normal push. Offer `git push --force-with-lease` as the resolution — it refuses if someone else has pushed to the branch since your last fetch, preventing accidental overwrites. Explain this briefly before asking.

### Protected branch
Stop and inform: "Push rejected — this branch is protected. Consider opening a pull request instead."

### Authentication failure
Stop with: "Push failed: authentication error — check your SSH key or personal access token."

### Network error
Stop with: "Push failed: could not reach remote — check your network connection."

### Pre-push hook blocked
Surface the raw hook output and prefix it with: "Push blocked by pre-push hook:" — the user needs to see the full output to know what to fix.

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
