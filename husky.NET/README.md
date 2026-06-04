## Summary

[Husky.Net](https://alirezanet.github.io/Husky.Net/) is a .NET tool for running tasks on git hooks. This config sets up a pre-commit hook for Unity C# projects that automatically runs `dotnet format` on staged `.cs` files before each commit.

## Prerequisites

- [Unity](https://unity.com/)
- [Git](https://git-scm.com/)
- [.NET SDK](https://dotnet.microsoft.com/)
- **Mac:** [Zsh](https://www.zsh.org/), [Homebrew](https://brew.sh/)
- **Windows:** [PowerShell 7](https://github.com/PowerShell/PowerShell), [winget](https://github.com/microsoft/winget-cli)

## Install

### 1. Install Husky.Net

```
dotnet tool install husky
```

### 2. Symlink Config Files

> Replace `<unity-project>` with the path to your Unity project repo.

```bash
# Mac (cd to repo root first)
ln -sf "$(pwd)/husky.NET/.editorconfig" <unity-project>/.editorconfig
ln -sf "$(pwd)/husky.NET/pre-commit" <unity-project>/.husky/pre-commit
ln -sf "$(pwd)/husky.NET/task-runner.json" <unity-project>/.husky/task-runner.json
```

```powershell
# Windows (run PowerShell as Admin, cd to repo root first)
New-Item -ItemType SymbolicLink -Path "<unity-project>\.editorconfig" -Target "$PWD\husky.NET\.editorconfig" -Force
New-Item -ItemType SymbolicLink -Path "<unity-project>\.husky\pre-commit" -Target "$PWD\husky.NET\pre-commit" -Force
New-Item -ItemType SymbolicLink -Path "<unity-project>\.husky\task-runner.json" -Target "$PWD\husky.NET\task-runner.json" -Force
```

### 3. Install Git Hooks

```
dotnet husky install
```

## Troubleshooting

### Assembly-CSharp.csproj not found

**Root cause:** Unity hasn't been opened yet, so the project files haven't been generated.

**Fix:** Open the project in Unity to generate `Assembly-CSharp.csproj`, then re-commit.