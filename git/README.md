## Summary

| File | Description |
|------|-------------|
| `.gitconfig` | Git config with a `dog` alias — compact, decorated log graph showing hash, branch/tag names, date, subject, and author across all branches. |
| `.gitignore-unity` | `.gitignore` template for Unity projects covering generated files, build artifacts, IDE configs, and OS artifacts. |

## Prerequisites

- [Git](https://git-scm.com/)

## Install

cd to repo root.

<details>
<summary>.gitconfig</summary>

```bash
# Mac
ln -sfn "$PWD/git/.gitconfig" ~/.gitconfig
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
cmd /c "mklink %USERPROFILE%\.gitconfig %CD%\git\.gitconfig"
```

</details>

<details>
<summary>.gitignore-unity</summary>

```bash
# Mac
cp "$PWD/git/.gitignore-unity" /path/to/unity-project/.gitignore
```

```bash
# Windows
copy git\.gitignore-unity \path\to\unity-project\.gitignore
```

</details>
