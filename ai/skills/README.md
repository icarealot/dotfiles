## Summary

Reusable AI agent skills.

| Skill | Description |
|---|---|
| `code-review` | Reviews Unity changes against repository standards, Unity safety rules, and the originating game spec without modifying them |
| `commit` | Proposes and creates conventional commits, then optionally pushes them |
| `context7` | Fetches up-to-date library documentation through the `ctx7` CLI |
| `create-unity-build-note` | Prepends a formatted entry to a Unity project's platform-specific build notes |
| `discuss` | Starts a relentless interview to sharpen a plan or design |
| `discuss-with-docs` | Sharpens a plan or design while maintaining its domain glossary and architectural decisions |
| `discussing` | Runs the shared, one-question-at-a-time discussion workflow used by the discussion skills |
| `domain-modeling` | Builds a project's domain language and records architectural decisions |
| `implement` | Implements and validates exactly one approved Unity game task |
| `tdd` | Test-drives Unity gameplay features and fixes with NUnit and the Unity Test Framework |
| `to-spec` | Turns a Unity game feature discussion into a human-approved implementation and validation spec |
| `to-tasks` | Breaks a Unity game spec or discussion into human-approved tracer-bullet tasks |

## Install

Run the commands from the repository root.
Choose the skill you want; do not run every command unless you want every skill.

<details>
<summary><b>Claude Code</b></summary>

```bash
# macOS
mkdir -p ~/.claude/skills

# Independent skills
ln -sfn "$PWD/ai/skills/code-review" "$HOME/.claude/skills/code-review"
ln -sfn "$PWD/ai/skills/commit" "$HOME/.claude/skills/commit"
ln -sfn "$PWD/ai/skills/create-unity-build-note" "$HOME/.claude/skills/create-unity-build-note"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.claude/skills/discussing"
ln -sfn "$PWD/ai/skills/domain-modeling" "$HOME/.claude/skills/domain-modeling"
ln -sfn "$PWD/ai/skills/tdd" "$HOME/.claude/skills/tdd"
ln -sfn "$PWD/ai/skills/to-spec" "$HOME/.claude/skills/to-spec"
ln -sfn "$PWD/ai/skills/to-tasks" "$HOME/.claude/skills/to-tasks"

# discuss + required discussing skill
ln -sfn "$PWD/ai/skills/discuss" "$HOME/.claude/skills/discuss"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.claude/skills/discussing"

# discuss-with-docs + required discussing and domain-modeling skills
ln -sfn "$PWD/ai/skills/discuss-with-docs" "$HOME/.claude/skills/discuss-with-docs"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.claude/skills/discussing"
ln -sfn "$PWD/ai/skills/domain-modeling" "$HOME/.claude/skills/domain-modeling"

# implement + required tdd and code-review skills
ln -sfn "$PWD/ai/skills/implement" "$HOME/.claude/skills/implement"
ln -sfn "$PWD/ai/skills/tdd" "$HOME/.claude/skills/tdd"
ln -sfn "$PWD/ai/skills/code-review" "$HOME/.claude/skills/code-review"
```

```powershell
# Windows - requires Developer Mode or an elevated shell
$skillDirectory = Join-Path $env:USERPROFILE ".claude\skills"
New-Item -ItemType Directory -Path $skillDirectory -Force | Out-Null

# Independent skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "code-review") -Target (Join-Path $PWD "ai\skills\code-review") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "commit") -Target (Join-Path $PWD "ai\skills\commit") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "create-unity-build-note") -Target (Join-Path $PWD "ai\skills\create-unity-build-note") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "domain-modeling") -Target (Join-Path $PWD "ai\skills\domain-modeling") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "tdd") -Target (Join-Path $PWD "ai\skills\tdd") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "to-spec") -Target (Join-Path $PWD "ai\skills\to-spec") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "to-tasks") -Target (Join-Path $PWD "ai\skills\to-tasks") -Force

# discuss + required discussing skill
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discuss") -Target (Join-Path $PWD "ai\skills\discuss") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force

# discuss-with-docs + required discussing and domain-modeling skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discuss-with-docs") -Target (Join-Path $PWD "ai\skills\discuss-with-docs") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "domain-modeling") -Target (Join-Path $PWD "ai\skills\domain-modeling") -Force

# implement + required tdd and code-review skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "implement") -Target (Join-Path $PWD "ai\skills\implement") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "tdd") -Target (Join-Path $PWD "ai\skills\tdd") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "code-review") -Target (Join-Path $PWD "ai\skills\code-review") -Force
```

</details>

<details>
<summary><b>Codex</b></summary>

```bash
# macOS
mkdir -p ~/.codex/skills

# Independent skills
ln -sfn "$PWD/ai/skills/code-review" "$HOME/.codex/skills/code-review"
ln -sfn "$PWD/ai/skills/commit" "$HOME/.codex/skills/commit"
ln -sfn "$PWD/ai/skills/create-unity-build-note" "$HOME/.codex/skills/create-unity-build-note"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.codex/skills/discussing"
ln -sfn "$PWD/ai/skills/domain-modeling" "$HOME/.codex/skills/domain-modeling"
ln -sfn "$PWD/ai/skills/tdd" "$HOME/.codex/skills/tdd"
ln -sfn "$PWD/ai/skills/to-spec" "$HOME/.codex/skills/to-spec"
ln -sfn "$PWD/ai/skills/to-tasks" "$HOME/.codex/skills/to-tasks"

# discuss + required discussing skill
ln -sfn "$PWD/ai/skills/discuss" "$HOME/.codex/skills/discuss"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.codex/skills/discussing"

# discuss-with-docs + required discussing and domain-modeling skills
ln -sfn "$PWD/ai/skills/discuss-with-docs" "$HOME/.codex/skills/discuss-with-docs"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.codex/skills/discussing"
ln -sfn "$PWD/ai/skills/domain-modeling" "$HOME/.codex/skills/domain-modeling"

# implement + required tdd and code-review skills
ln -sfn "$PWD/ai/skills/implement" "$HOME/.codex/skills/implement"
ln -sfn "$PWD/ai/skills/tdd" "$HOME/.codex/skills/tdd"
ln -sfn "$PWD/ai/skills/code-review" "$HOME/.codex/skills/code-review"
```

```powershell
# Windows - requires Developer Mode or an elevated shell
$skillDirectory = Join-Path $env:USERPROFILE ".codex\skills"
New-Item -ItemType Directory -Path $skillDirectory -Force | Out-Null

# Independent skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "code-review") -Target (Join-Path $PWD "ai\skills\code-review") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "commit") -Target (Join-Path $PWD "ai\skills\commit") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "create-unity-build-note") -Target (Join-Path $PWD "ai\skills\create-unity-build-note") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "domain-modeling") -Target (Join-Path $PWD "ai\skills\domain-modeling") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "tdd") -Target (Join-Path $PWD "ai\skills\tdd") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "to-spec") -Target (Join-Path $PWD "ai\skills\to-spec") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "to-tasks") -Target (Join-Path $PWD "ai\skills\to-tasks") -Force

# discuss + required discussing skill
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discuss") -Target (Join-Path $PWD "ai\skills\discuss") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force

# discuss-with-docs + required discussing and domain-modeling skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discuss-with-docs") -Target (Join-Path $PWD "ai\skills\discuss-with-docs") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "domain-modeling") -Target (Join-Path $PWD "ai\skills\domain-modeling") -Force

# implement + required tdd and code-review skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "implement") -Target (Join-Path $PWD "ai\skills\implement") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "tdd") -Target (Join-Path $PWD "ai\skills\tdd") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "code-review") -Target (Join-Path $PWD "ai\skills\code-review") -Force
```

</details>

<details>
<summary><b>pi</b></summary>

```bash
# macOS
mkdir -p ~/.pi/agent/skills

# Independent skills
ln -sfn "$PWD/ai/skills/code-review" "$HOME/.pi/agent/skills/code-review"
ln -sfn "$PWD/ai/skills/commit" "$HOME/.pi/agent/skills/commit"
ln -sfn "$PWD/ai/skills/create-unity-build-note" "$HOME/.pi/agent/skills/create-unity-build-note"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.pi/agent/skills/discussing"
ln -sfn "$PWD/ai/skills/domain-modeling" "$HOME/.pi/agent/skills/domain-modeling"
ln -sfn "$PWD/ai/skills/tdd" "$HOME/.pi/agent/skills/tdd"
ln -sfn "$PWD/ai/skills/to-spec" "$HOME/.pi/agent/skills/to-spec"
ln -sfn "$PWD/ai/skills/to-tasks" "$HOME/.pi/agent/skills/to-tasks"

# discuss + required discussing skill
ln -sfn "$PWD/ai/skills/discuss" "$HOME/.pi/agent/skills/discuss"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.pi/agent/skills/discussing"

# discuss-with-docs + required discussing and domain-modeling skills
ln -sfn "$PWD/ai/skills/discuss-with-docs" "$HOME/.pi/agent/skills/discuss-with-docs"
ln -sfn "$PWD/ai/skills/discussing" "$HOME/.pi/agent/skills/discussing"
ln -sfn "$PWD/ai/skills/domain-modeling" "$HOME/.pi/agent/skills/domain-modeling"

# implement + required tdd and code-review skills
ln -sfn "$PWD/ai/skills/implement" "$HOME/.pi/agent/skills/implement"
ln -sfn "$PWD/ai/skills/tdd" "$HOME/.pi/agent/skills/tdd"
ln -sfn "$PWD/ai/skills/code-review" "$HOME/.pi/agent/skills/code-review"
```

```powershell
# Windows - requires Developer Mode or an elevated shell
$skillDirectory = Join-Path $env:USERPROFILE ".pi\agent\skills"
New-Item -ItemType Directory -Path $skillDirectory -Force | Out-Null

# Independent skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "code-review") -Target (Join-Path $PWD "ai\skills\code-review") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "commit") -Target (Join-Path $PWD "ai\skills\commit") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "create-unity-build-note") -Target (Join-Path $PWD "ai\skills\create-unity-build-note") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "domain-modeling") -Target (Join-Path $PWD "ai\skills\domain-modeling") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "tdd") -Target (Join-Path $PWD "ai\skills\tdd") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "to-spec") -Target (Join-Path $PWD "ai\skills\to-spec") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "to-tasks") -Target (Join-Path $PWD "ai\skills\to-tasks") -Force

# discuss + required discussing skill
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discuss") -Target (Join-Path $PWD "ai\skills\discuss") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force

# discuss-with-docs + required discussing and domain-modeling skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discuss-with-docs") -Target (Join-Path $PWD "ai\skills\discuss-with-docs") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "discussing") -Target (Join-Path $PWD "ai\skills\discussing") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "domain-modeling") -Target (Join-Path $PWD "ai\skills\domain-modeling") -Force

# implement + required tdd and code-review skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "implement") -Target (Join-Path $PWD "ai\skills\implement") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "tdd") -Target (Join-Path $PWD "ai\skills\tdd") -Force
New-Item -ItemType SymbolicLink -Path (Join-Path $skillDirectory "code-review") -Target (Join-Path $PWD "ai\skills\code-review") -Force
```

</details>

### Third-party skills

Install the `context7` documentation skill through its CLI:

```bash
npm install -g ctx7
ctx7 setup
```
