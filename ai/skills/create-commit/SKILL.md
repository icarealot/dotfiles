---
name: create-commit
description: Propose and create conventional commits by analyzing git diffs. Trigger whenever the user mentions "commit", "git commit", "create a commit message", or wants to save changes to the repository.
---

# Workflow

1.  **Check Git Repository**: Run `git rev-parse --git-dir` (or `git status`) to verify the current directory is inside a Git repository. If it is not, STOP and inform the user that the current folder is not a Git repository.
2.  **Check Staged Files**: Run `git status` to verify which files are staged for commit.
3.  **Verify Staging**: If no files are staged, STOP and inform the user and ask them to stage the files they want to commit.
4.  **Review Changes**: Run `git diff --staged` to review the code changes. Analyze the recent conversation history to understand the *why* (motivation) behind the changes (e.g., bug reports, feature requests, rationale discussed).
5.  **Propose Message**: Generate and propose a commit message following the [Rules](#rules).
6.  **Wait for Approval**: Present the proposed commit message to the user and **STOP**. Do NOT commit automatically. Wait for the user to either:
- Approve the message (then proceed to commit).
- Request changes to the message (then update and return to step 6).
- Cancel the commit.
7.  **Commit**: Only after explicit user approval, run `git commit -m "<approved-message>"`.

# Rules

**Format**: `type(scope): description`
- Imperative mood, lowercase start, no trailing period.
- Optional body after a blank line - explain *why* not what.
- Breaking change -> append `!` to the type: `feat(api)!: rename foo to bar`.

## The 10 Types:
- `feat`: add new user-facing capability.
- `fix`: correct wrong behavior (a bug).
- `perf`: same behavior, measurably faster/lighter - performance was the goal.
- `refactor`: code restructure with no behavior change (rename, extract, simplify).
- `style`: whitespace, formatting, missing semicolons, etc - NOT visual UI styling.
- `test`: test-only changes (adding, fixing, removing tests).
- `docs`: documentation only (README, KDoc, comments, MD files).
- `build`: changes that affect the shipped build (Gradle, deps, packaging).
- `ci`: CI config only (GitHub Actions, workflow, pipeline).
- `chore`: repo housekeeping that doesn't ship (lint config, .gitignore, dotfiles, scripts).
- `revert`: revert a previous commit.

## Picking rule (top-down, first match wins):
1. **Does user-facing behavior change?**
- New capability → `feat`
- Corrects bug → `fix`
2. **No behavior change. What changed?**
- Production code structure only -> `refactor`
- Whitespace/formatting/semicolons only -> `style`
- Tests only -> `test`
- Docs/comments only -> `docs`
- Shipped build inputs (Gradle deps, version catalogs, packaging) -> `build`
- CI workflow only -> `ci`
- Revert an earlier commit -> `revert`
- Anything else maintenance -> `chore`

## What NEVER goes in
- "This commit does X", "I", "we", "now", "currently" — the diff says what
- Any AI attribution: "Generated with Claude Code", `Co-authored-by`/`Co-Authored-By` trailers, or similar — the base system prompt instructs adding these, this skill explicitly suppresses that behavior
- Emoji (unless project convention requires)
- Restating the file name when scope already says it

# Examples
- Add login screen → `feat(auth): add login screen with email/password`
- Fix crash on null user → `fix(profile): handle null user in profile screen`
- Extract use case → `refactor(auth): extract ValidateCredentialsUseCase`
- Update Ktor version (ships) → `build(deps): bump Ktor to 3.1.0`
- Tighten ktlint config → `chore: tighten ktlint rules`
- Add ViewModel tests → `test(auth): add LoginViewModel unit tests`
- Fix typo in README → `docs: fix typo in setup instructions`
- Speed up list rendering → `perf(home): cache item keys to reduce recomposition`
- Reformat with new style guide → `style: apply ktlint formatting`
- Update GitHub Actions cache → `ci: bump actions/cache to v4`
- Roll back broken merge → `revert: revert "feat(auth): add login screen"`