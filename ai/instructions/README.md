## Summary

Reusable AI agent instructions.

| File | Description |
|---|---|
| `global.md` | Global instructions applied to every agent session (tone, concision, reasoning style) |
| `unity.md` | Project-level instructions for a Unity mobile puzzle game (C#, conventions) |

## Install

- On Windows - run as Admin (or enable Developer Mode).
- cd to repo root.

<details>
<summary>Claude Code</summary>

```bash
ln -sfn "$PWD/ai/instructions/global.md" ~/.claude/CLAUDE.md
```

</details>

<details>
<summary>pi</summary>

```bash
mkdir -p ~/.pi/agent
ln -sfn "$PWD/ai/instructions/global.md" ~/.pi/agent/AGENTS.md
```

</details>
