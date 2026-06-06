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

> Replace `<unity-project>` with the path to your Unity project repo.

```bash
# (cd to repo root first)
ln -sf "$(pwd)/husky.NET/.editorconfig" <unity-project>/.editorconfig
ln -sf "$(pwd)/husky.NET/pre-commit" <unity-project>/.husky/pre-commit
ln -sf "$(pwd)/husky.NET/task-runner.json" <unity-project>/.husky/task-runner.json
```

### 3. Install Git Hooks

> Run from the Unity project repo (not the dotfiles repo).

```
dotnet husky install
```

## Troubleshooting

### Symlink fails with "permission denied" (Windows)

**Root cause:** Windows requires elevated privileges to create symlinks by default.

**Fix:** Enable Developer Mode in **Settings → Privacy & security → For developers → Developer Mode**. This allows creating symlinks without running Git Bash as Administrator.

### Assembly-CSharp.csproj not found

**Root cause:** Unity hasn't been opened yet, so the project files haven't been generated.

**Fix:** Open the project in Unity to generate `Assembly-CSharp.csproj`, then re-commit.
