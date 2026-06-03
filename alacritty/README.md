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
# Mac
mkdir -p ~/.config/alacritty
ln -sf "$(pwd)/mac.toml" ~/.config/alacritty/alacritty.toml
```

```powershell
# Windows (run PowerShell as Admin, cd to the repo root first)
cd "$HOME\OneDrive\Desktop\areas\dotfiles"
New-Item -ItemType Directory -Force -Path "$env:APPDATA\alacritty"
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\alacritty\alacritty.toml" -Target "$PWD\alacritty\windows.toml" -Force
```
