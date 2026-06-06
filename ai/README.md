## Summary

[Pi](https://github.com/earendil-works/pi-coding-agent) is an AI coding agent with read, bash, edit, write tools. This config sets up custom extensions, global agent instructions, and skills for pi by creating symlinks from the dotfiles repo to `~/.pi/agent/`.

## Prerequisites

- [Git Bash](https://git-scm.com/)
- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent)

## Install

All commands are run from the dotfiles repo root.

### 1. Create Extensions Symlinks

```bash
mkdir -p ~/.pi/agent/extensions
ln -sfn "$PWD/ai/pi/custom-footer.ts" ~/.pi/agent/extensions/custom-footer.ts
ln -sfn "$PWD/ai/pi/notify.ts"        ~/.pi/agent/extensions/notify.ts
ln -sfn "$PWD/ai/pi/usage.ts"         ~/.pi/agent/extensions/usage.ts
```

### 2. Create Global Instructions Symlink

```bash
mkdir -p ~/.pi/agent
ln -sfn "$PWD/ai/instructions/global.md" ~/.pi/agent/AGENTS.md
```

### 3. Create Skills Symlinks

```bash
mkdir -p ~/.pi/agent/skills
ln -sfn "$PWD/ai/skills/create-commit"          ~/.pi/agent/skills/create-commit
ln -sfn "$PWD/ai/skills/create-unity-build-note" ~/.pi/agent/skills/create-unity-build-note
ln -sfn "$PWD/ai/skills/discuss"                ~/.pi/agent/skills/discuss
ln -sfn "$PWD/ai/skills/implement"              ~/.pi/agent/skills/implement
ln -sfn "$PWD/ai/skills/to-issues"              ~/.pi/agent/skills/to-issues
ln -sfn "$PWD/ai/skills/to-prd"                 ~/.pi/agent/skills/to-prd
```

## Troubleshooting

### Symlink fails with "permission denied" (Windows)

**Root cause:** Windows requires elevated privileges to create symlinks by default.

**Fix:** Enable Developer Mode in **Settings → Privacy & security → For developers → Developer Mode**. This allows creating symlinks without running Git Bash as Administrator.
