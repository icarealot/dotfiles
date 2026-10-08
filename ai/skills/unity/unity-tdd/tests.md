# Good and Bad Tests

## Good Tests

**Integration-style**: Use Unity Test Framework (NUnit) to test observable behavior through real public interfaces. Use EditMode for plain C# gameplay rules; use PlayMode when behavior depends on Unity lifecycle, physics, or coroutines.

```csharp
// GOOD: EditMode test of a gameplay rule through its public API
[Test]
public void Available_inventory_space_item_is_accepted()
{
    var sut = new Inventory(capacity: 1);
    sut.TryAdd("health-potion");

    Assert.That(sut.Contains("health-potion"), Is.True);
}

// GOOD: PlayMode test of an observable Unity lifecycle outcome
public class HealthPlayModeTests
{
    private GameObject _player;
    private Health _sut;

    [UnityTest]
    public IEnumerator Health_reaches_zero_player_is_destroyed()
    {
        _player = new GameObject("Player");
        _sut = _player.AddComponent<Health>();
        _sut.Initialize(maxHealth: 10);

        _sut.TakeDamage(10);
        yield return null; // Allow deferred Destroy to complete.

        Assert.That(_player == null, Is.True); // Unity's destroyed-object check.
    }

    [UnityTearDown]
    public IEnumerator TearDown()
    {
        if (_player != null)
            UnityEngine.Object.Destroy(_player);
        yield return null;
    }
}
```

Characteristics:

- Tests behavior players/callers care about
- Uses public gameplay APIs and observable scene state
- Survives internal refactors
- Names tests after the scenario and expected behavior in sentence case, with underscores between words (for example, `Twenty_damage_against_twenty_five_percent_armor_deals_fifteen_damage`) and no method-under-test (MUT) name
- Names a primary local system under test (SUT) `sut` and a fixture-held SUT `_sut`; tests without an honest subject are exempt
- Uses `Assert.That` with NUnit constraints
- One logical assertion per test
- Uses `[Test]` for synchronous behavior and `[UnityTest]` when frames must advance
- Creates `MonoBehaviour` instances with `AddComponent`, and test `ScriptableObject` instances with `CreateInstance`
- Controls input, time, and randomness; waits for specific lifecycle/physics steps rather than arbitrary delays
- Cleans up created objects and restores static state, `Time.timeScale`, and any other globals changed by the test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```csharp
// BAD: Reaches into a component's private representation
[Test]
public void Non_lethal_damage_current_health_field_is_reduced()
{
    var player = new GameObject("Player");
    try
    {
        var sut = player.AddComponent<Health>();
        sut.Initialize(maxHealth: 10);
        sut.TakeDamage(3);

        var field = typeof(Health).GetField("currentHealth",
            System.Reflection.BindingFlags.Instance |
            System.Reflection.BindingFlags.NonPublic);
        Assert.That((int)field.GetValue(sut), Is.EqualTo(7));
    }
    finally
    {
        UnityEngine.Object.DestroyImmediate(player); // EditMode cleanup.
    }
}
```

Red flags:

- Mocking your own gameplay components instead of exercising them
- Invoking private methods or inspecting serialized fields through reflection
- Asserting internal call counts/order instead of gameplay outcomes
- Calling `Awake`, `Start`, or `Update` manually instead of letting Unity drive lifecycle tests
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through storage or scene internals instead of the public contract

```csharp
// BAD: Couples a save-service test to its storage keys and format
[Test]
public void Persisted_progress_level_is_written_to_player_prefs()
{
    var sut = CreateSaveServiceWithIsolatedPlayerPrefs();
    sut.Save(new Progress(level: 3));

    Assert.That(PlayerPrefs.GetInt("save.level"), Is.EqualTo(3));
}

// GOOD: Verifies persistence through the save/load interface
[Test]
public void Saved_progress_new_session_restores_same_level()
{
    var storage = new InMemorySaveStorage();
    new SaveService(storage).Save(new Progress(level: 3));
    var sut = new SaveService(storage);

    var loaded = sut.Load();

    Assert.That(loaded.Level, Is.EqualTo(3));
}
```

Test the real `PlayerPrefs` or file adapter separately with isolated keys/paths and teardown. Inspecting its stored representation is appropriate only when that representation is the adapter's agreed contract.

**Tautological tests**: Expected value restates the implementation, so the test passes by construction.

```csharp
// BAD: Repeats the production damage formula in the assertion
[Test]
public void Twenty_damage_against_twenty_five_percent_armor_deals_reduced_damage()
{
    var sut = new Armor(reductionPercent: 25);
    var expected = 20 * (1f - 25 / 100f);

    Assert.That(sut.ReduceDamage(20), Is.EqualTo(expected));
}

// GOOD: Expected value is a known example from the gameplay specification
[Test]
public void Twenty_damage_against_twenty_five_percent_armor_deals_fifteen_damage()
{
    var sut = new Armor(reductionPercent: 25);

    Assert.That(sut.ReduceDamage(20), Is.EqualTo(15f).Within(0.001f));
}
```