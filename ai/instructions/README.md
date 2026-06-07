## Summary

Reusable AI agent instructions.

| File | Description |
|---|---|
| `global.md` | Global instructions applied to every agent session (tone, concision, reasoning style) |
| `unity.md` | Project-level instructions for a Unity mobile puzzle game (C#, conventions) |

## Install

cd to repo root.

<details>
<summary>Claude Code</summary>

```bash
# Mac
ln -sfn "$PWD/ai/instructions/global.md" ~/.claude/CLAUDE.md
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.claude
cmd /c "mklink %USERPROFILE%\.claude\CLAUDE.md %CD%\ai\instructions\global.md"
```

</details>

<details>
<summary>pi</summary>

```bash
# Mac
mkdir -p ~/.pi/agent
ln -sfn "$PWD/ai/instructions/global.md" ~/.pi/agent/AGENTS.md
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.pi\agent
cmd /c "mklink %USERPROFILE%\.pi\agent\AGENTS.md %CD%\ai\instructions\global.md"
```

</details>
