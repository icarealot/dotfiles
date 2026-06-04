## Summary

[Starship](https://github.com/starship/starship) is a minimal, fast, customizable prompt for any shell. This config sets up Starship with JetBrainsMono Nerd Font on Mac and Windows.

## Prerequisites

- **Mac:** [Zsh](https://www.zsh.org/), [Homebrew](https://brew.sh/)
- **Windows:** [PowerShell 7](https://github.com/PowerShell/PowerShell), [winget](https://github.com/microsoft/winget-cli)

## Install

### 1. Install Starship

```
// Mac
brew install starship

// Windows
winget install --id Starship.Starship
```

### 2. Symlink Config

```bash
# Mac (cd to repo root first)
ln -sf "$(pwd)/starship/starship.toml" ~/.config/starship.toml
```

```powershell
# Windows (run as Admin, cd to repo root first)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.config\starship.toml" -Target "$PWD\starship\starship.toml" -Force
```

### 3. Shell Init

```bash
# Mac
printf '\neval "$(starship init zsh)"\n' >> ~/.zshrc
```

```powershell
# Windows
Add-Content -Path $PROFILE -Value 'Invoke-Expression (&starship init powershell)'
```