# Coding Standards
- Constants are in SNAKE_UPPER_CASE.
- Place properties at above fields.
- Private fields are in camelCase with prefix `_`, if they're meant to be editable in the editor make it a [SerializeField].
- Never use null propagation (`?.`, `??`, `??=`) on Unity objects (`MonoBehaviour`, `ScriptableObject`, `Component`, etc.).
- IEnumerator methods should be named with a `IE_` prefix.
- Use `Assert.That` for all test assertions.
