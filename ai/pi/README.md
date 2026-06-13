## Summary

Extensions for the [Pi coding agent](https://github.com/earendil-works/pi-coding-agent).

| Extension | Description |
|---|---|
| `custom-footer.ts` | Replaces the built-in footer with pipe-separated stats: context % / window size, session cost, model name, and thinking level |
| `notify.ts` | Sends a native Windows toast notification when the agent finishes and is waiting for input |
| `permissions/` | Two-mode permission system (`yolo` / `read-only`) to restrict tool calls |
| [pi-web-access](https://pi.dev/packages/pi-web-access) | Web search, content extraction, and video understanding via Exa, Perplexity, Gemini, and YouTube |

## Prerequisites

- [Git Bash](https://git-scm.com/)
- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent)

## Install

### Extensions

cd to repo root.

```bash
# Mac
mkdir -p ~/.pi/agent/extensions
ln -sfn "$PWD/ai/pi/custom-footer.ts" ~/.pi/agent/extensions/custom-footer.ts
ln -sfn "$PWD/ai/pi/notify.ts"        ~/.pi/agent/extensions/notify.ts
ln -sfn "$PWD/ai/pi/permissions"      ~/.pi/agent/extensions/permissions
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
mkdir -p %USERPROFILE%\.pi\agent\extensions
cmd /c "mklink /D %USERPROFILE%\.pi\agent\extensions\permissions %CD%\ai\pi\permissions"
cmd /c "mklink %USERPROFILE%\.pi\agent\extensions\custom-footer.ts %CD%\ai\pi\custom-footer.ts"
cmd /c "mklink %USERPROFILE%\.pi\agent\extensions\notify.ts %CD%\ai\pi\notify.ts"
```

### Third-party Extensions

```bash
pi install npm:pi-web-access
```
