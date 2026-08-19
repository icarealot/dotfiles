---
name: discussing
description: Discuss with the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'discuss' trigger phrases.
---

Interview the user relentlessly about every aspect of this until we reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it. The **frontier** is every decision whose prerequisites are already settled — the questions askable now without guessing at answers not yet given.

Ask questions one at a time, waiting for the user's answer before continuing. Asking multiple questions at once is bewildering. Pick the next frontier question yourself each turn; the user's answer may settle a branch and unblock new questions, so recompute the frontier after each answer. A question whose answer depends on another still-open question isn't on the frontier yet — hold it.

Format each question like so, numbering sequentially across the whole session (not per-round — this makes it easy for the user to refer back to a specific question):

```
**Qn** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

Recommendation: <your recommended answer>
```

Finding *facts* is your job, never the user's. When a question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it and wait for it to report before asking that question — don't ask the user anything you could look up yourself. The *decisions*, though, are the user's — put each one to them and wait for their answer.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms a shared understanding has been reached.
