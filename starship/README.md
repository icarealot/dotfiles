## Install

### 1. Install Package Managers

```
// Mac
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

// Windows
winget upgrade --accept-source-agreements --accept-package-agreements
```

### 2. Install JetBrainsMono Nerd Font

```
// Mac
brew install --cask font-jetbrains-mono-nerd-font

// Windows
winget install DEVCOM.JetBrainsMonoNerdFont
```

### 3. Install Starship

```
// Mac
brew install starship

// Windows
winget install --id Starship.Starship
```

### 4. Symlink Config

```bash
# Mac (cd to repo root first)
mkdir -p ~/.config/starship
ln -sf "$(pwd)/starship/starship.toml" ~/.config/starship/config.toml
```

```powershell
# Windows (run PowerShell 7 as Admin, cd to repo root first)
cd "$HOME\OneDrive\Desktop\areas\dotfiles"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\starship"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.config\starship\config.toml" -Target "$PWD\starship\starship.toml" -Force
```

### 5. Shell Init

```bash
# Mac
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

```powershell
# Windows PowerShell 7
Add-Content -Path $PROFILE -Value 'Invoke-Expression (&starship init powershell)'
```