---
name: create-unity-build-note
description: Generates a formatted build note entry for docs/build-notes.md in a Unity project. Reads version, build number, and scripting defines from ProjectSettings/ProjectSettings.asset, condenses new git commits into clean bullet points using AI, previews the entry, and prepends it to docs/build-notes.md upon user approval. Use when the user wants to document a new build, create release notes, update build-notes.md, or generate a Unity build changelog.
---

# Create Unity Build Note

## Quick start

Run from the repo root. The skill asks for platform, reads project settings, summarizes new commits, previews the entry, and writes on approval.

## Workflow

**1. Ask platform** — prompt the user: `"Which platform? (Android / iOS)"`

**2. Check build-notes.md** at `docs/build-notes.md`:
- Doesn't exist → create empty file, set `range_start` = first commit (`git rev-list --max-parents=0 HEAD`)
- Exists and empty → set `range_start` = first commit
- Has entries → find the last footer line matching `(<hash1> - <hash2>)`, set `range_start = hash2`
- No valid footer found → warn the user and **exit** (do not continue)

**3. Get commit range**
- `range_end` = `git rev-parse HEAD`
- If `range_start == range_end` → print "No new commits since last build note." and exit
- Run: `git log <range_start>..<range_end> --oneline --no-merges`
- If result is empty → print "No new commits since last build note." and exit

**4. Read project settings**
Parse `ProjectSettings/ProjectSettings.asset` directly:
- `VERSION`: `grep -m1 'bundleVersion:' ProjectSettings/ProjectSettings.asset | awk '{print $2}'`
- `BUILD_NUMBER` (Android): `grep -m1 'AndroidBundleVersionCode:' ProjectSettings/ProjectSettings.asset | awk '{print $2}'`
- `BUILD_NUMBER` (iOS): `awk '/buildNumber:/{f=1} f && /^[[:space:]]*iPhone:/{print $2; exit}' ProjectSettings/ProjectSettings.asset`
- `DEFINES` (Android): `awk '/scriptingDefineSymbols:/{f=1} f && /^[[:space:]]*Android:/{sub(/^[[:space:]]*Android:[[:space:]]*/, ""); gsub(/;/, " "); print; exit}' ProjectSettings/ProjectSettings.asset`
- `DEFINES` (iOS): `awk '/scriptingDefineSymbols:/{f=1} f && /^[[:space:]]*iPhone:/{sub(/^[[:space:]]*iPhone:[[:space:]]*/, ""); gsub(/;/, " "); print; exit}' ProjectSettings/ProjectSettings.asset`

**5. Condense commits with AI**
Feed the raw commit messages to Claude with this instruction:
> "Condense these git commits into clean build note bullets. Rules: short imperative phrases, no technical jargon, strip conventional commit prefixes (feat/fix/chore/refactor/etc). Order the bullets: Add first, then Update, then Fix, then Remove. Merge similar commits into one bullet. Format each line as `+ <text>`."

**6. Compose entry**
```
<Platform> <VERSION> (<BUILD_NUMBER>)

<DEFINES>

<bullets>

(<range_start> - <range_end>)

```

**7. Preview and confirm**
Show the full composed entry to the user and ask for approval.
- Approved → prepend the entry to `docs/build-notes.md`, followed by a blank line before existing content
- Not approved → ask what to change, adjust, and re-preview

**Never write to build-notes.md without explicit user approval.**

## Entry format example

```
## Android 1.1.0 (19)

USE_ADJUST ENABLE_FIREBASE USE_MAX_MEDIATION FIREBASE_PROD CHEAT

+ Add hint booster
+ Update UI title no more moves
+ Update asset AP glass tube
+ Fix bug logic no more moves

(abc1234 - def5678)

```
