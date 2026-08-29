## Summary

Reusable AI agent skills.

| Skill | Description |
|---|---|
| `commit` | Proposes and creates conventional commits, then optionally pushes them |
| `context7` | Fetches up-to-date library documentation through the `ctx7` CLI |
| `discuss` | Starts a relentless interview to sharpen a plan or design |
| `discuss-with-docs` | Sharpens a plan or design while maintaining its domain glossary and architectural decisions |
| `discussing` | Runs the shared, one-question-at-a-time discussion workflow used by the discussion skills |
| `domain-modeling` | Builds a project's domain language and records architectural decisions |
| `unity-code-review` | Reviews Unity changes against repository standards, Unity safety rules, and the originating game spec without modifying them |
| `unity-create-build-note` | Prepends a formatted entry to a Unity project's platform-specific build notes |
| `unity-implement` | Implements and validates exactly one approved Unity game task |
| `unity-pair-programming` | Navigates a Unity task red-green while the human drives, typing every line of code and test |
| `unity-tdd` | Test-drives Unity gameplay features and fixes with NUnit and the Unity Test Framework |
| `unity-to-spec` | Turns a Unity game feature discussion into a human-approved implementation and validation spec |
| `unity-to-tasks` | Breaks a Unity game spec or discussion into human-approved tracer-bullet tasks |

## Install

Install skills with [`skills`](https://www.npmjs.com/package/skills):
```bash
npx skills@latest add icarealot/dotfiles
```

### Third-party skills

Install the `context7` documentation skill through its CLI:

```bash
npm install -g ctx7
ctx7 setup
```
