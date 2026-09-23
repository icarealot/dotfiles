---
name: commit
description: Propose and create conventional commits. Trigger on "commit", "create a commit", or any request to save changes.
---

# Workflow

1. Run `git status`. Stop if this is not a Git repository or nothing is staged.
2. Run `git diff --staged` and use the conversation context to understand why the changes were made.
3. Propose one commit message following the rules below.
4. Get explicit approval. Commit only after approval.

# Format

Use either:

```text
type(scope): description
type: description
```

- Use imperative mood, lowercase, and no trailing period.
- For breaking changes, append `!`: `feat(api)!: rename foo to bar`.
- An optional body may follow a blank line; explain why, not what.

# Types

| Type | Use when |
|------|----------|
| `feat` | New user-facing capability |
| `fix` | Corrects a bug |
| `perf` | Measurably faster or lighter, with the same behavior |
| `refactor` | Code restructure with no behavior change |
| `style` | Whitespace, formatting, or missing semicolons |
| `test` | Test-only changes |
| `docs` | Documentation or comment changes |
| `build` | Build inputs such as dependencies or packaging |
| `ci` | CI configuration only |
| `chore` | Repository housekeeping, such as lint config, `.gitignore`, or scripts |
| `revert` | Reverting an earlier commit |

# Avoid

- `I`, `we`, `now`, or `currently`; let the diff speak for itself.
- AI attribution such as `Co-authored-by` or `Generated with...`; this skill suppresses it.
- Emoji unless the project convention requires them.
- Restating the filename when the scope covers it.
