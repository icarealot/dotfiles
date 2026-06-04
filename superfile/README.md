## Summary

[Superfile](https://superfile.dev/) is a modern terminal file manager TUI. This config sets up superfile with Dracula theme and Nerd Fonts support.

## Prerequisites

- **Mac:** [Zsh](https://www.zsh.org/), [Homebrew](https://brew.sh/)
- **Windows:** [PowerShell 7](https://github.com/PowerShell/PowerShell), [winget](https://github.com/microsoft/winget-cli)

## Install

### 1. Install Superfile

```
// Mac
brew install superfile

// Windows
winget install MHNightCat.superfile
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
mkdir -p ~/Library/Application\ Support/superfile
ln -sf "$(pwd)/superfile/config.toml" ~/Library/Application\ Support/superfile/config.toml
```

```powershell
# Windows (run as Admin, cd to the repo root first)
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\superfile"
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\superfile\config.toml" -Target "$PWD\superfile\config.toml" -Force
```

### 4. Enable cd on quit

```bash
# Mac
cat >> ~/.zshrc << 'EOF'

# Superfile
spf() {
    os=$(uname -s)
    if [[ "$os" == "Darwin" ]]; then
        export SPF_LAST_DIR="$HOME/Library/Application Support/superfile/lastdir"
    fi

    command spf "$@"

    [ ! -f "$SPF_LAST_DIR" ] || {
        . "$SPF_LAST_DIR"
        rm -f -- "$SPF_LAST_DIR" > /dev/null
    }
}
EOF
```

```powershell
# Windows
Add-Content -Path $PROFILE -Value @'

# Superfile
function spf() {
    param (
        [string[]]$Params
    )
    $spf_location = [Environment]::GetFolderPath("LocalApplicationData") + "\Programs\superfile\spf.exe"
    $SPF_LAST_DIR_PATH = [Environment]::GetFolderPath("LocalApplicationData") + "\superfile\lastdir"

    & $spf_location @Params

    if (Test-Path $SPF_LAST_DIR_PATH) {
        $SPF_LAST_DIR = Get-Content -Path $SPF_LAST_DIR_PATH
        Invoke-Expression $SPF_LAST_DIR
        Remove-Item -Force $SPF_LAST_DIR_PATH
    }
}
'@
```
