# Tooling
- Use the `unity` CLI (`unity.exe` on PATH) when interacting with the Editor.

# Commands
- Tests: `unity command run_tests {"mode":"EditMode|PlayMode"}`, then poll `test_status`.
- Recompile: `unity command recompile` and poll `recompile_status` after creating/editing/deleting scripts outside the Editor.

# Conventions
- Constants are in SNAKE_UPPER_CASE.
- Place properties at above fields.
- Private fields are in camelCase with prefix `_`, if they're meant to be editable in the editor make it a [SerializeField].
- Never use null propagation (`?.`, `??`, `??=`) on Unity objects (`MonoBehaviour`, `ScriptableObject`, `Component`, etc.).
- IEnumerator methods should be named with a `IE_` prefix.
