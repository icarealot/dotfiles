# Coding Standards

## Member order

Order class members as follows:

1. Constants
2. Events
3. Properties
4. Fields
5. Methods

## Do

- Declare every concrete class `sealed` unless it is intentionally designed for inheritance.
- Use `SNAKE_UPPER_CASE` for constants.
- Use `_camelCase` for private fields.
- Prefix production methods returning `IEnumerator` with `IE_`.
- Use `string.Empty` instead of `""`.

## Don’t

- Never use null propagation or coalescing (`?.`, `??`, or `??=`) on Unity objects such as `MonoBehaviour`, `ScriptableObject`, and `Component`.
- Serialize button fields. Add `onClick` listeners in `Awake()`, remove them in `OnDestroy()`, and keep prefab `On Click ()` lists empty.
- Use TextMesh Pro's `SetText(...)` instead of assigning through `text`.