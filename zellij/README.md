## Summary

[Zellij](https://github.com/zellij-org/zellij) is a terminal workspace/multiplexer. This config sets up Zellij with vim-style keybindings, the Dracula theme, disabled mouse mode, and no pane frames for a clean look.

## Prerequisites

- **Mac:** [Zsh](https://www.zsh.org/), [Homebrew](https://brew.sh/)
- **Windows:** [PowerShell 7](https://github.com/PowerShell/PowerShell), [winget](https://github.com/microsoft/winget-cli)

## Install

### 1. Install Zellij

```
// Mac
brew install zellij
```

### 2. Symlink Config

```bash
# Mac (cd to repo root first)
mkdir -p ~/.config/zellij
ln -sf "$(pwd)/zellij/mac.kdl" ~/.config/zellij/config.kdl
```
