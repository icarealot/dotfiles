## Summary

[Zellij](https://github.com/zellij-org/zellij) is a terminal workspace/multiplexer. Configs disabled mouse mode, and no pane frames for a clean look.

## Prerequisites

- **Mac:** [Zsh](https://www.zsh.org/), [Homebrew](https://brew.sh/)
- **Windows:** [PowerShell 7](https://github.com/PowerShell/PowerShell), [winget](https://github.com/microsoft/winget-cli)

## Install

### 1. Install Zellij

```bash
# Mac
brew install zellij

# Windows
winget install Zellij.Zellij
```

### 2. Symlink Config

```bash
# Mac (cd to repo root first)
mkdir -p ~/.config/zellij
ln -sf "$(pwd)/zellij/mac.kdl" ~/.config/zellij/config.kdl

# Windows (run in PowerShell 7 as admin, cd to repo root first)
New-Item -Type Directory -Force $env:APPDATA\zellij
New-Item -Type SymbolicLink -Force $env:APPDATA\zellij\config.kdl "$(Get-Location)\zellij\windows.kdl"
```
