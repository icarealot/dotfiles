---
name: create-unity-build-note
description: Generates a formatted build note entry and prepends it to a platform-specific file in a Unity project. Use when documenting a new build, creating release notes, updating build notes, or generating a Unity build changelog.
---

# Create Unity Build Note

## Workflow

**1. Ask platform** — prompt: `"Which platform? (Android / iOS)"`

Derive the target file from the answer: `docs/build-notes-android.md` or `docs/build-notes-ios.md`.

**2. Determine commit range**

Check the platform file:
- Missing → create empty file, set `range_start` = `git rev-list --max-parents=0 HEAD`
- Empty → set `range_start` = `git rev-list --max-parents=0 HEAD`
- Has entries → find last footer `(<hash1> - <hash2>)`, set `range_start = hash2`
- Has entries but no valid footer → warn and exit

Set `range_end` = `git rev-parse HEAD`. If equal, or `git log <range_start>..<range_end> --oneline --no-merges` is empty → print "No new commits since last build note." and exit.

**3. Read project settings** from `ProjectSettings/ProjectSettings.asset`

- `VERSION`: `grep -m1 'bundleVersion:' ProjectSettings/ProjectSettings.asset | awk '{print $2}'`
- `BUILD_NUMBER` (Android): `grep -m1 'AndroidBundleVersionCode:' ProjectSettings/ProjectSettings.asset | awk '{print $2}'`
- `BUILD_NUMBER` (iOS): `awk '/buildNumber:/{f=1} f && /^[[:space:]]*iPhone:/{print $2; exit}' ProjectSettings/ProjectSettings.asset`
- `DEFINES` (Android): `awk '/scriptingDefineSymbols:/{f=1} f && /^[[:space:]]*Android:/{sub(/^[[:space:]]*Android:[[:space:]]*/,""); gsub(/;/," "); print; exit}' ProjectSettings/ProjectSettings.asset`
- `DEFINES` (iOS): same command with `iPhone:` replacing `Android:`

**4. Condense commits with AI**

Feed raw commits with this instruction:
> "Condense these git commits into clean build note bullets. Short imperative phrases, no jargon, strip conventional commit prefixes (feat/fix/chore/refactor/etc). Order: Add → Update → Fix → Remove. Merge similar commits. Format: `+ <text>`."

**5. Compose entry**

```
## <VERSION> (<BUILD_NUMBER>)

<DEFINES>

<bullets>

(<range_start> - <range_end>)

```

**6. Preview and confirm**

Show the full entry. On approval, prepend to the platform file with a blank line before existing content. If not approved, ask what to change, adjust, and re-preview.

**Never write to the build notes file without explicit user approval.**

## Entry format example

```
## 1.1.0 (19)

USE_ADJUST ENABLE_FIREBASE USE_MAX_MEDIATION FIREBASE_PROD CHEAT

+ Add hint booster
+ Update UI title no more moves
+ Update asset AP glass tube
+ Fix bug logic no more moves

(abc1234 - def5678)

```
