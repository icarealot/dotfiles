## Summary

Extensions for the [Pi coding agent](https://github.com/earendil-works/pi-coding-agent).

| Extension | Description |
|---|---|
| `custom-footer.ts` | Replaces the built-in footer with pipe-separated stats: context % / window size, session cost, model name, and thinking level |
| `notify.ts` | Sends a native Windows toast notification when the agent finishes and is waiting for input |
| `usage.ts` | Adds a `/usage` command that shows an interactive dashboard of token/cost stats grouped by provider, filterable by Today / This Week / Last Week / All Time |

## Prerequisites

- [Git Bash](https://git-scm.com/)
- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent)

## Install

- On Windows - run as Admin (or enable Developer Mode).
- cd to repo root.

```bash
mkdir -p ~/.pi/agent/extensions
ln -sfn "$PWD/ai/pi/custom-footer.ts" ~/.pi/agent/extensions/custom-footer.ts
ln -sfn "$PWD/ai/pi/notify.ts"        ~/.pi/agent/extensions/notify.ts
ln -sfn "$PWD/ai/pi/usage.ts"         ~/.pi/agent/extensions/usage.ts
```
