# Unity Conventions

## Declarations
- Use `[SerializeField] private` instead of `public` for fields that need to be expose in the Inspector
- Never use null propagation (`?.`, `??`, `??=`) on Unity objects (`MonoBehaviour`, `ScriptableObject`, `Component`, etc.)

## Class Layout
- Place properties at the top of the class, fields below

## Naming
- Use `UPPER_SNAKE_CASE` for constants

## Comments
- No comments unless the code is genuinely non-obvious