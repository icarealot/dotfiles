# CONTEXT.md Format

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Encounter**:
{A one or two sentence description of the term}
_Avoid_: Battle, fight, combat session

**Ability**:
A player-usable action with a cooldown, resolved against one or more targets.
_Avoid_: Skill, spell, move

**Aggro**:
The value the AI director uses to pick which combatant an enemy targets next.
_Avoid_: Threat, hate
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) don't belong even if the project uses them extensively. Before adding a term, ask: is this a concept unique to this context, or a general programming concept? Only the former belongs.
- **Group terms under subheadings** when natural clusters emerge. If all terms belong to a single cohesive area, a flat list is fine.

## Single vs multi-context repos

**Single context (most repos):** One `CONTEXT.md` at the repo root.

**Multiple contexts:** A `CONTEXT-MAP.md` at the repo root lists the contexts, where they live, and how they relate to each other:

```md
# Context Map

## Contexts

- [Combat](./Assets/Scripts/Combat/CONTEXT.md) — resolves encounters, abilities, and damage
- [Inventory](./Assets/Scripts/Inventory/CONTEXT.md) — tracks items, stacks, and equipment loadouts
- [Progression](./Assets/Scripts/Progression/CONTEXT.md) — manages XP, levels, and unlocks

## Relationships

- **Combat → Progression**: Combat emits `EncounterResolved` events; Progression consumes them to award XP
- **Progression → Inventory**: Progression emits `LevelUp` events; Inventory consumes them to unlock equipment slots
- **Combat ↔ Inventory**: Shared types for `ItemId` and `StatBlock`
```

The skill infers which structure applies:

- If `CONTEXT-MAP.md` exists, read it to find contexts
- If only a root `CONTEXT.md` exists, single context
- If neither exists, create a root `CONTEXT.md` lazily when the first term is resolved

When multiple contexts exist, infer which one the current topic relates to. If unclear, ask.
