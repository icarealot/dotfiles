## Summary

Reusable AI agent skills.

| Skill | Description |
|---|---|
| `commit` | Proposes and creates conventional commits |
| `discuss` | Starts a relentless interview to sharpen a plan or design |
| `discuss-with-docs` | Starts a relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) |
| `discussing` | Runs the shared, one-question-at-a-time discussion workflow |
| `domain-modeling` | Build and sharpen a project's domain model |
| `unity-to-spec` | Turns the current conversation into a spec |
| `unity-to-tasks` | Break a plan, spec, or the current conversation into a set of tracer-bullet tasks |
| `unity-implement` |Implement an approved Unity task end to end |
| `unity-implement-batch` | Implement an approved Unity task set end to end, delegating each task to a subagent. |
| `unity-pair-programming` | Navigates a Unity task red-green while the human drives, typing every line of code and test |
| `unity-tdd` | Test-drives Unity tasks with NUnit and the Unity Test Framework |
| `unity-code-review` |  Review the changes along two axes (Standards and Spec) |
| `unity-create-build-note` | Prepends a formatted entry to a Unity project's platform-specific build notes |

## Install

Install skills with [`skills`](https://www.npmjs.com/package/skills):
```bash
npx skills@latest add icarealot/dotfiles
```
