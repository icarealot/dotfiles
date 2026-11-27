# Coding Standards

## Member order

Order class members as follows:

1. Constants
2. Events
3. Properties
4. Fields
5. Methods

Order constructors and operators with methods. Apply the order separately within each nested class.

## Do

- Declare every concrete class `sealed` unless it is intentionally designed for inheritance.
- Use `SNAKE_UPPER_CASE` for constants.
- Use `_camelCase` for private fields.
- Prefix methods returning `IEnumerator` with `IE_`, except `[UnityTest]` methods, which keep their sentence-style test names.
- Use `string.Empty` instead of `""`.
- When renaming a serialized Unity field, update its serialized name and reassign its references in affected prefabs and scenes.
- Name test methods as readable sentences with words separated by underscores, such as `Available_inventory_space_item_is_accepted()`.

## Don’t

- Never use `FormerlySerializedAs` to migrate renamed serialized fields.
- Never use null propagation or coalescing (`?.`, `??`, or `??=`) on Unity objects such as `MonoBehaviour`, `ScriptableObject`, and `Component`.
- Serialize button fields. Add `onClick` listeners in `Awake()`, remove them in `OnDestroy()`, and keep prefab `On Click ()` lists empty.
- Use TextMesh Pro's `SetText(...)` instead of assigning through `text`.
