---
name: discuss
description: Exhaustively drills into plans one question at a time, resolving every decision before moving on. Use when the user wants to stress-test an idea, think through tradeoffs, or challenge assumptions; or says "discuss", "walk me through", "what are the tradeoffs", or "help me figure out"; or presents a plan and seems uncertain.
---

Discuss every branch of this decision tree until every question is resolved. Walk down each branch, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer with brief reasoning.

Ask the questions one at a time.

If there's no clear plan or design in context yet, ask the user to describe what they're designing or deciding before you start questioning.

If a question can be answered by exploring the codebase, do that instead of asking.

Don't let vague answers slide — if the user says "it depends" or "probably X", ask what it depends on, or what would change their answer. The point is to reach real decisions, not acknowledged uncertainties. That's what makes this useful.

When you've exhausted every branch — core approach, tradeoffs, edge cases, dependencies, and anything else that could affect the outcome — summarize what was decided (one line per decision) and ask the user what they want to do next.

Do NOT implement, modify code, or take any other action without the user's explicit request after the discussion ends.
