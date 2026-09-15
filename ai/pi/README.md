## Pi Coding Agent Extensions

Extensions for the [Pi coding agent](https://github.com/earendil-works/pi-coding-agent).

| Extension         | Description                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `custom-footer`   | Shows provider, model, thinking level, context windows, usage                                 |
| `notify`          | Sends a native macOS or Windows notification when the agent finishes and is waiting for input |
| `permission-gate` | Blocks dangerous shell commands and writes to protected paths                                 |
| `subagent`        | Runs explicitly requested tasks in isolated context; `/subagents` configures each subagent    |
| `web`             | `web_search` and `web_fetch` tools                                                            |

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
ln -sfn "$PWD/ai/pi/permission-gate" ~/.pi/agent/extensions/permission-gate
ln -sfn "$PWD/ai/pi/subagent"        ~/.pi/agent/extensions/subagent
ln -sfn "$PWD/ai/pi/web"             ~/.pi/agent/extensions/web
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.pi\agent\extensions
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\custom-footer %CD%\ai\pi\custom-footer"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\notify %CD%\ai\pi\notify"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\permission-gate %CD%\ai\pi\permission-gate"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\subagent %CD%\ai\pi\subagent"
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\web %CD%\ai\pi\web"
```
