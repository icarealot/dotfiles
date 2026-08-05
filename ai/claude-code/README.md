## Summary

Config for [Claude Code](https://github.com/anthropics/claude-code).

| File | Description |
|---|---|
| `settings.json` | Global settings: custom status line, theme, dangerous-mode prompt skip, and a Stop hook that sends a native notification when waiting for input |
| `statusline-command.sh` | Status line script that outputs pipe-separated stats: model name, effort level, remaining context window %, 5h rate limit %, 7d rate limit % (with reset countdowns) |

## Prerequisites

- [Claude Code](https://github.com/anthropics/claude-code)
- [Node.js](https://nodejs.org/) (used by `statusline-command.sh` to parse JSON)
- [terminal-notifier](https://github.com/julienXX/terminal-notifier) (for Stop hook notifications — macOS only)

## Install

cd to repo root.

```bash
# Mac
ln -sfn "$PWD/ai/claude-code/settings.json"          ~/.claude/settings.json
ln -sfn "$PWD/ai/claude-code/statusline-command.sh"   ~/.claude/statusline-command.sh
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.claude
cmd /c "mklink %USERPROFILE%\.claude\settings.json %CD%\ai\claude-code\settings.json"
cmd /c "mklink %USERPROFILE%\.claude\statusline-command.sh %CD%\ai\claude-code\statusline-command.sh"
```

Then update the path in `settings.json` to match your home folder:

```json
"command": "sh /Users/[your-folder]/.claude/statusline-command.sh"
```
