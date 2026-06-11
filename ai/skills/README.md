## Summary

Reusable AI agent skills.

| Skill | Description |
|---|---|
| `commit` | Proposes and creates conventional commits by analyzing git diffs |
| `create-unity-build-note` | Generates a formatted build note entry for a Unity project's `docs/build-notes.md` from version info and recent commits |
| `discuss` | Relentlessly discusses a plan or design until reaching shared understanding, resolving each branch of the decision tree |
| `to-prd` | Turns the current conversation context into a PRD |
| `to-issues` | Breaks a plan, spec, or PRD into independently-grabbable tracer-bullet vertical slice issues |
| `implement` | Guides end-to-end development of vertical slice / tracer bullet issues |
| `review` | Reviews implementation against its issue and PRD; flags spec gaps and simplification opportunities |

## Install

cd to repo root.

<details>
<summary><b>Claude Code</b></summary>

```bash
#Mac
mkdir -p ~/.claude/skills
ln -sfn "$PWD/ai/skills/commit"           ~/.claude/skills/commit
ln -sfn "$PWD/ai/skills/create-unity-build-note" ~/.claude/skills/create-unity-build-note
ln -sfn "$PWD/ai/skills/discuss"                 ~/.claude/skills/discuss
ln -sfn "$PWD/ai/skills/implement"               ~/.claude/skills/implement
ln -sfn "$PWD/ai/skills/to-issues"               ~/.claude/skills/to-issues
ln -sfn "$PWD/ai/skills/to-prd"                  ~/.claude/skills/to-prd
ln -sfn "$PWD/ai/skills/review"                  ~/.claude/skills/review
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.claude\skills
cmd /c "mklink /D %USERPROFILE%\.claude\skills\commit            %CD%\ai\skills\commit"
cmd /c "mklink /D %USERPROFILE%\.claude\skills\create-unity-build-note  %CD%\ai\skills\create-unity-build-note"
cmd /c "mklink /D %USERPROFILE%\.claude\skills\discuss                  %CD%\ai\skills\discuss"
cmd /c "mklink /D %USERPROFILE%\.claude\skills\implement                %CD%\ai\skills\implement"
cmd /c "mklink /D %USERPROFILE%\.claude\skills\to-issues                %CD%\ai\skills\to-issues"
cmd /c "mklink /D %USERPROFILE%\.claude\skills\to-prd                   %CD%\ai\skills\to-prd"
cmd /c "mklink /D %USERPROFILE%\.claude\skills\review                   %CD%\ai\skills\review"
```

</details>

<details>
<summary><b>pi</b></summary>

```bash
# Mac
mkdir -p ~/.pi/agent/skills
ln -sfn "$PWD/ai/skills/commit"           ~/.pi/agent/skills/commit
ln -sfn "$PWD/ai/skills/create-unity-build-note" ~/.pi/agent/skills/create-unity-build-note
ln -sfn "$PWD/ai/skills/discuss"                 ~/.pi/agent/skills/discuss
ln -sfn "$PWD/ai/skills/implement"               ~/.pi/agent/skills/implement
ln -sfn "$PWD/ai/skills/to-issues"               ~/.pi/agent/skills/to-issues
ln -sfn "$PWD/ai/skills/to-prd"                  ~/.pi/agent/skills/to-prd
ln -sfn "$PWD/ai/skills/review"                  ~/.pi/agent/skills/review
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.pi\agent\skills
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\commit            %CD%\ai\skills\commit"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\create-unity-build-note  %CD%\ai\skills\create-unity-build-note"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\discuss                  %CD%\ai\skills\discuss"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\implement                %CD%\ai\skills\implement"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\to-issues                %CD%\ai\skills\to-issues"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\to-prd                   %CD%\ai\skills\to-prd"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\skills\review                   %CD%\ai\skills\review"
```

</details>
