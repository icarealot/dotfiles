## Summary

Config for [Claude Code](https://github.com/anthropics/claude-code).

| File | Description |
|---|---|
| `statusline-command.sh` | Status line script that outputs pipe-separated stats: model name, effort level, remaining context window %, 5h rate limit %, 7d rate limit % (with reset countdowns) |
| `notify-command.sh` | Stop hook script that sends a notification — `terminal-notifier` on Mac, a PowerShell toast on Windows |

## Prerequisites

- [Claude Code](https://github.com/anthropics/claude-code)
- [Node.js](https://nodejs.org/) (used by `statusline-command.sh` to parse JSON)
- [terminal-notifier](https://github.com/julienXX/terminal-notifier) (for Stop hook notifications — macOS only; Windows uses built-in PowerShell, no extra install needed)

## Status line

```bash
# Mac
ln -sfn "$PWD/ai/claude-code/statusline-command.sh"   ~/.claude/statusline-command.sh
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.claude
cmd /c "mklink %USERPROFILE%\.claude\statusline-command.sh %CD%\ai\claude-code\statusline-command.sh"
```

Then in your `~/.claude/settings.json`, add the `statusLine` block, updating the path to match your home folder:

```json
{
  "statusLine": {
    "type": "command",
    "command": "sh /Users/[your-folder]/.claude/statusline-command.sh"
  }
}
```

## Notifier

```bash
# Mac
ln -sfn "$PWD/ai/claude-code/notify-command.sh"       ~/.claude/notify-command.sh
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.claude
cmd /c "mklink %USERPROFILE%\.claude\notify-command.sh %CD%\ai\claude-code\notify-command.sh"
```

Then in your `~/.claude/settings.json`, add the `hooks` block:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "sh \"$HOME/.claude/notify-command.sh\"" }
        ]
      }
    ]
  }
}
```
