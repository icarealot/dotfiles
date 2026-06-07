## Summary

Git config with a `dog` alias — a compact, decorated log graph showing hash, branch/tag names, date, subject, and author across all branches.

## Prerequisites

- [Git](https://git-scm.com/)

## Install

cd to repo root.

```bash
# Mac
ln -sfn "$PWD/git/.gitconfig" ~/.gitconfig
```

```bash
# Windows - requires running as Admin or enabling Developer Mode
cmd /c "mklink %USERPROFILE%\.gitconfig %CD%\git\.gitconfig"
```
