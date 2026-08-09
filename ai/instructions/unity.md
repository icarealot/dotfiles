# Conventions
- Place properties at the top of the class, fields below
- Never use null propagation (`?.`, `??`, `??=`) on Unity objects (`MonoBehaviour`, `ScriptableObject`, `Component`, etc.)
- Constants are in SNAKE_UPPER_CASE
- Private fields are in camelCase with prefix `_`, if they're meant to be editable in the editor make it a [SerializeField]
