## Summary

Extensions for the [Pi coding agent](https://github.com/earendil-works/pi-coding-agent).

| Extension | Description |
|---|---|
| `custom-footer` | Shows provider, model, thinking level, remaining context, max context, and subscription usage |
| `notify` | Sends a native macOS or Windows notification when the agent finishes and is waiting for input |

## Prerequisites

- [Git Bash](https://git-scm.com/)
- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent)
- [terminal-notifier](https://github.com/julienXX/terminal-notifier) (macOS only; Windows uses built-in PowerShell)

## Install

### Extensions

cd to repo root.

```bash
# Mac
mkdir -p ~/.pi/agent/extensions
ln -sfn "$PWD/ai/pi/custom-footer" ~/.pi/agent/extensions/custom-footer
ln -sfn "$PWD/ai/pi/notify"          ~/.pi/agent/extensions/notify
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.pi\agent\extensions
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\custom-footer %CD%\ai\pi\custom-footer"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\notify %CD%\ai\pi\notify"
```
