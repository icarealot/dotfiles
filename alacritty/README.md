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

### 3. Apply Config

```
// Mac
mkdir -p ~/.config/alacritty
cp alacritty.toml ~/.config/alacritty/alacritty.toml

// Windows
New-Item -ItemType Directory -Force -Path "$env:APPDATA\alacritty"
Copy-Item ".\alacritty.toml" "$env:APPDATA\alacritty\alacritty.toml"
```
