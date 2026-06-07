## Summary

Reusable AI agent skills.

| Skill | Description |
|---|---|
| `create-commit` | Proposes and creates conventional commits by analyzing git diffs |
| `create-unity-build-note` | Generates a formatted build note entry for a Unity project's `docs/build-notes.md` from version info and recent commits |
| `discuss` | Relentlessly discusses a plan or design until reaching shared understanding, resolving each branch of the decision tree |
| `implement` | Guides end-to-end development of vertical slice / tracer bullet issues |
| `to-issues` | Breaks a plan, spec, or PRD into independently-grabbable tracer-bullet vertical slice issues |
| `to-prd` | Turns the current conversation context into a PRD |

## Install

- On Windows - run as Admin (or enable Developer Mode).
- cd to repo root.

<details>
<summary><b>Claude Code</b></summary>

```bash
mkdir -p ~/.claude/skills
ln -sfn "$PWD/ai/skills/create-commit"           ~/.claude/skills/create-commit
ln -sfn "$PWD/ai/skills/create-unity-build-note" ~/.claude/skills/create-unity-build-note
ln -sfn "$PWD/ai/skills/discuss"                 ~/.claude/skills/discuss
ln -sfn "$PWD/ai/skills/implement"               ~/.claude/skills/implement
ln -sfn "$PWD/ai/skills/to-issues"               ~/.claude/skills/to-issues
ln -sfn "$PWD/ai/skills/to-prd"                  ~/.claude/skills/to-prd
```

</details>

<details>
<summary><b>pi</b></summary>

```bash
mkdir -p ~/.pi/agent/skills
ln -sfn "$PWD/ai/skills/create-commit"           ~/.pi/agent/skills/create-commit
ln -sfn "$PWD/ai/skills/create-unity-build-note" ~/.pi/agent/skills/create-unity-build-note
ln -sfn "$PWD/ai/skills/discuss"                 ~/.pi/agent/skills/discuss
ln -sfn "$PWD/ai/skills/implement"               ~/.pi/agent/skills/implement
ln -sfn "$PWD/ai/skills/to-issues"               ~/.pi/agent/skills/to-issues
ln -sfn "$PWD/ai/skills/to-prd"                  ~/.pi/agent/skills/to-prd
```

</details>
