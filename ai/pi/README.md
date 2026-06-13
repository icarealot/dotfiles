## Summary

Extensions for the [Pi coding agent](https://github.com/earendil-works/pi-coding-agent).

| Extension | Description |
|---|---|
| `custom-footer.ts` | Replaces the built-in footer with pipe-separated stats: context % / window size, session cost, model name, and thinking level |
| `notify.ts` | Sends a native Windows toast notification when the agent finishes and is waiting for input |

## Prerequisites

- [Git Bash](https://git-scm.com/)
- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent)

## Install

cd to repo root.

```bash
# Mac
mkdir -p ~/.pi/agent/extensions
ln -sfn "$PWD/ai/pi/custom-footer.ts" ~/.pi/agent/extensions/custom-footer.ts
ln -sfn "$PWD/ai/pi/notify.ts"        ~/.pi/agent/extensions/notify.ts
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.pi\agent\extensions
cmd /c "mklink %USERPROFILE%\.pi\agent\extensions\custom-footer.ts %CD%\ai\pi\custom-footer.ts"
cmd /c "mklink %USERPROFILE%\.pi\agent\extensions\notify.ts %CD%\ai\pi\notify.ts"
```
