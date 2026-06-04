## Summary

[Zellij](https://github.com/zellij-org/zellij) is a terminal workspace/multiplexer. This config sets up Zellij with vim-style keybindings, the Dracula theme, disabled mouse mode, and no pane frames for a clean look.

## Prerequisites

- **Mac:** [Homebrew](https://brew.sh/)

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
