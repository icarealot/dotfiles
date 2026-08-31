## Summary

| File | Description |
|------|-------------|
| `.gitconfig` | Git aliases for everyday operations. |
| `.gitignore-unity` | `.gitignore` template for Unity projects. |
| `.gitattributes-unity` | `.gitattributes` template for Unity projects. |

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

<details>
<summary>.gitattributes-unity</summary>

```bash
# Mac
cp "$PWD/git/.gitattributes-unity" /path/to/unity-project/.gitattributes
```

```bash
# Windows
copy git\.gitattributes-unity \path\to\unity-project\.gitattributes
```

</details>
