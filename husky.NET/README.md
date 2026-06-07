## Summary

[Husky.Net](https://alirezanet.github.io/Husky.Net/) is a .NET tool for running tasks on git hooks. This config sets up a pre-commit hook for Unity C# projects that automatically runs `dotnet format` on staged `.cs` files before each commit.

## Prerequisites

- [Unity](https://unity.com/)
- [Git Bash](https://git-scm.com/)
- [.NET SDK](https://dotnet.microsoft.com/)

## Install

### 1. Install Husky.Net

```
dotnet tool install husky
```

### 2. Symlink Config Files

- cd to repo root.
- Replace `<unity-project>` with the path to your Unity project repo.

```bash
# Mac
ln -sf "$(pwd)/husky.NET/.editorconfig" <unity-project>/.editorconfig
ln -sf "$(pwd)/husky.NET/pre-commit" <unity-project>/.husky/pre-commit
ln -sf "$(pwd)/husky.NET/task-runner.json" <unity-project>/.husky/task-runner.json
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
cmd /c "mklink <unity-project>\.editorconfig    %CD%\husky.NET\.editorconfig"
cmd /c "mklink <unity-project>\.husky\pre-commit %CD%\husky.NET\pre-commit"
cmd /c "mklink <unity-project>\.husky\task-runner.json %CD%\husky.NET\task-runner.json"
```

### 3. Install Git Hooks

> Run from the Unity project repo (not the dotfiles repo).

```
dotnet husky install
```

## Troubleshooting

### Assembly-CSharp.csproj not found

**Root cause:** Unity hasn't been opened yet, so the project files haven't been generated.

**Fix:** Open the project in Unity to generate `Assembly-CSharp.csproj`, then re-commit.
