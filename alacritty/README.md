## Summary

[Alacritty](https://github.com/alacritty/alacritty) is a fast, GPU-accelerated terminal emulator. This config sets up Alacritty with JetBrainsMono Nerd Font and platform-specific TOML configs for Mac and Windows.

## Prerequisites

- **Mac:** [Homebrew](https://brew.sh/)
- **Windows:** [PowerShell 7](https://github.com/PowerShell/PowerShell), [winget](https://github.com/microsoft/winget-cli)

## Install

### 1. Install Alacritty

```
// Mac
brew install --cask alacritty

// Windows
winget install Alacritty.Alacritty
```

### 2. Install JetBrainsMono Nerd Font

```
// Mac
brew install --cask font-jetbrains-mono-nerd-font

// Windows
winget install DEVCOM.JetBrainsMonoNerdFont
```

### 3. Symlink Config

```bash
# Mac (cd to repo root first)
mkdir -p ~/.config/alacritty
ln -sf "$(pwd)/alacritty/mac.toml" ~/.config/alacritty/alacritty.toml
```

```powershell
# Windows (run as Admin, cd to the repo root first)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\alacritty"
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\alacritty\alacritty.toml" -Target "$PWD\alacritty\windows.toml" -Force
```

## Troubleshooting

### Screen corruption on Windows (tmux + neovim)

**Root cause:** Alacritty falls back to the old `Windows API for pseudoconsole` instead of the newer `conpty.dll`. The version of `conpty.dll` shipped with Windows is outdated.

**Fix:** Grab `conpty.dll` + `OpenConsole.exe` from WezTerm and drop them next to `alacritty.exe`.

1. Install [WezTerm](https://wezterm.org/)
3. Copy `conpty.dll` and `OpenConsole.exe` from WezTerm's install dir to Alacritty's install dir
4. Restart Alacritty
5. Delete WeztTerm if you don't need it anymore