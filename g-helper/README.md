## Summary

[G-Helper](https://github.com/seerge/g-helper) is a fast, native tool for tuning performance, fans, GPU, battery, and RGB on ASUS laptops. This config sets up power limits, custom fan curves, and a battery charge limit of 80% for a ROG Zephyrus G14 GA402RJ.

## Prerequisites

- [Windows PowerShell 7](https://github.com/PowerShell/PowerShell)
- [winget](https://github.com/microsoft/winget-cli)
- [Microsoft .NET 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) (auto-prompted if missing)
- [ASUS System Control Interface](https://dlcdnets.asus.com/pub/ASUS/nb/Image/CustomComponent/ASUSSystemControlInterfaceV3/ASUSSystemControlInterfaceV3.exe) (usually already installed on ASUS laptops)

## Install

### 1. Uninstall Conflicting Software

Remove these if present:

- **Armoury Crate** — Use the [Armoury Crate Uninstall Tool](https://dlcdnets.asus.com/pub/ASUS/mb/14Utilities/Armoury_Crate_Uninstall_Tool.zip).
- **ASUS Smart Display Control**
- **MyASUS**

### 2. Install G-Helper

```powershell
winget install --id=seerge.g-helper -e
```
### 3. Symlink Config

Make sure G-Helper is **not running**:

```powershell
# Run as Admin, cd to the repo root first
New-Item -ItemType Directory -Force -Path "$env:APPDATA\GHelper"
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\GHelper\config.json" -Target "$PWD\g-helper\config.json" -Force
```

### 4. Stop Unnecessary ASUS Services

In G-Helper, go to **Extra** → **Stop** under "Asus Services".