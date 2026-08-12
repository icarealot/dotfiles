## Summary

[Husky.Net](https://alirezanet.github.io/Husky.Net/) is a .NET tool for running tasks on git hooks. This config sets up a pre-commit hook for Unity C# projects that automatically runs `dotnet format` on staged `Assets/**/*.cs` files before each commit.

## Prerequisites

- [Unity](https://unity.com/)
- [Git Bash](https://git-scm.com/)
- [.NET SDK](https://dotnet.microsoft.com/)

## Install

### 1. Install Husky.Net

```
dotnet tool install husky
```

### 2. Copy Config Files

- cd to repo root.
- Replace `<unity-project>` with the path to your Unity project repo.

```bash
mkdir -p <unity-project>/.husky
cp husky.NET/.editorconfig <unity-project>/.editorconfig
cp husky.NET/pre-commit <unity-project>/.husky/pre-commit
cp husky.NET/task-runner.json <unity-project>/.husky/task-runner.json
```

### 3. Set the Solution File

In `task-runner.json`, replace `your-project.slnx` with the path to your Unity project's `.sln`/`.slnx` file.

### 4. Install Git Hooks

> Run from the Unity project repo (not the dotfiles repo).

```
dotnet husky install
```

## Troubleshooting

### No .sln/.slnx found

**Root cause:** Unity hasn't been opened yet, so the project files haven't been generated.

**Fix:** Open the project in Unity to generate the `.sln`/`.slnx` file, then re-commit.
