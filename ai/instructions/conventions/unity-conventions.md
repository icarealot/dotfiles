# Unity Conventions

## Declarations
- Make every field private, if it's meant to be editable in the editor make it a [SerializeField]
- Never use null propagation (`?.`, `??`, `??=`) on Unity objects (`MonoBehaviour`, `ScriptableObject`, `Component`, etc.)

## Class Layout
- Place properties at the top of the class, fields below

## Naming
- Fields are in camelCase with prefix `_`, 
- Functions in PascalCase
- Class names in PascalCase
- Constants in SNAKE_UPPER_CASE
- Use proper names for all the functions and variables, prefer longer more descriptive names over something very short

## Comments
- No comments unless the code is genuinely non-obvious 