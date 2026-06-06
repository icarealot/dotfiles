## Summary

[Pi](https://github.com/earendil-works/pi-coding-agent) is an AI coding agent with read, bash, edit, write tools. This config sets up custom extensions, global agent instructions, and skills for pi by creating symlinks from the dotfiles repo to `~/.pi/agent/`.

## Prerequisites

- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent)

## Install

### 1. Create Extensions Symlinks

```powershell
# Windows (run as Admin, cd to repo root first)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\extensions\custom-footer.ts" -Target "$PWD\ai\pi\custom-footer.ts" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\extensions\notify.ts" -Target "$PWD\ai\pi\notify.ts" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\extensions\usage.ts" -Target "$PWD\ai\pi\usage.ts" -Force
```

```bash
# Mac/Linux (cd to repo root first)
ln -sf "$(pwd)/ai/pi/custom-footer.ts" ~/.pi/agent/extensions/
ln -sf "$(pwd)/ai/pi/notify.ts" ~/.pi/agent/extensions/
ln -sf "$(pwd)/ai/pi/usage.ts" ~/.pi/agent/extensions/
```

### 2. Create Global Instructions Symlink

```powershell
# Windows (run as Admin, cd to repo root first)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\AGENTS.md" -Target "$PWD\ai\instructions\global.md" -Force
```

```bash
# Mac/Linux (cd to repo root first)
ln -sf "$(pwd)/ai/instructions/global.md" ~/.pi/agent/AGENTS.md
```

### 3. Create Skills Symlinks

Skills in `skills/` are symlinked to the skills folder:

```powershell
# Windows (run as Admin, cd to repo root first)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\skills\create-commit" -Target "$PWD\ai\skills\create-commit" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\skills\discuss" -Target "$PWD\ai\skills\discuss" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\skills\to-prd" -Target "$PWD\ai\skills\to-prd" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\skills\to-issues" -Target "$PWD\ai\skills\to-issues" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.pi\agent\skills\implement" -Target "$PWD\ai\skills\implement" -Force
```

```bash
# Mac/Linux (cd to repo root first)
ln -sf "$(pwd)/ai/skills/create-commit" ~/.pi/agent/skills/
ln -sf "$(pwd)/ai/skills/discuss" ~/.pi/agent/skills/
ln -sf "$(pwd)/ai/skills/to-prd" ~/.pi/agent/skills/
ln -sf "$(pwd)/ai/skills/to-issues" ~/.pi/agent/skills/
ln -sf "$(pwd)/ai/skills/implement" ~/.pi/agent/skills/
```

## Troubleshooting

### Administrator privileges required

**Root cause:** Windows requires admin privileges to create symlinks by default.

**Fix:** Enable Developer Mode in Windows Settings → Update & Security → For developers. This allows creating symlinks without elevation.
