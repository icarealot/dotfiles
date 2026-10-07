# Unity Tests and Validation

## Choose the cheapest sufficient level

### Unit tests

Use Plain EditMode for deterministic behavior that does not require a `GameObject`, scene, asset, frame, coroutine, or Unity lifecycle.

- Test one unit's caller-visible behavior, preferring outcome assertions.
- Keep tests fast and isolated; normally avoid setup and teardown.
- Construct owned code directly and use real internal collaborators. See [mocking.md](./mocking.md) for boundary substitution.
- Make unit tests the majority of the suite.

### Integration tests

Integration-style testing exercises real collaborators through public interfaces; it does not necessarily require PlayMode. Use Plain EditMode for deterministic collaboration between plain C# modules. Use PlayMode for component, lifecycle, physics, input, or other Unity-engine behavior.

- Use isolated fixtures with only the required objects.
- Use production prefabs for distinct wiring risks. Prove wiring through observable behavior, not exact hierarchy or serialized values.
- Test shared dependencies, external services, or code owned by another team.
- Setup and teardown are acceptable; integration tests form the middle layer.

### End-to-end tests

Use PlayMode with production scenes for critical player journeys from the user's point of view, including most external dependencies.

Keep E2E tests sparse and the minority of the suite. Cover detailed rules and branches at cheaper levels.

### Human playtesting

Use human playtesting for presentation, feel, audio, controls, camera behavior, usability, and level design. Use a Player Build for platform-specific behavior and the shipped player experience.

Presentation details, exact hierarchy, animation appearance, cadence, and feel belong here rather than in automated assertions.

## NUnit test structure

Use Arrange, Act, Assert (AAA):

- **Arrange:** Put the SUT and its dependencies in the required state.
- **Act:** Make one call to the SUT and capture its result, if any.
- **Assert:** Verify an observable outcome; assert boundary interactions only under the contract rules in [mocking.md](./mocking.md).

Separate AAA sections with blank lines; add comments when that is not possible.

- Use `Assert.That` and public behavior rather than private methods or implementation details.
- Keep scenarios explicit instead of branching inside tests.
- Extract large Arrange sections into factories, helpers, or base classes.
- Use setup and teardown only for shared lifecycle ownership and reliable cleanup.
- Keep assertions focused on one logical outcome; split oversized tests or extract named assertion helpers.
- Name a primary local SUT `sut` and a fixture-held SUT `_sut`. Tests without an honest subject are exempt.
- Name tests after the scenario and expected behavior, using underscores and no method-under-test (MUT) name.
- Parameterize only when it removes meaningful duplication without hiding behavior; otherwise use separate positive and negative tests.

## Assertion examples

These illustrative C# examples assume a plain `Health` type with a public `Remaining` property.

### Observable outcome

```csharp
[Test]
public void Damage_below_remaining_health_reduces_health()
{
    var sut = new Health(20);

    sut.TakeDamage(5);

    Assert.That(sut.Remaining, Is.EqualTo(15));
}
```

This test uses the public API, describes what happens rather than how, and survives changes to internal storage or collaborators.

### Independent expected values

Derive expected values independently from production calculations: a known-good literal, a worked example, or the specification.

```csharp
// BAD: Expected value repeats the production calculation.
[Test]
public void Damage_below_remaining_health_reduces_health()
{
    const int initialHealth = 20;
    const int damage = 5;
    var sut = new Health(initialHealth);
    var expected = initialHealth - damage;

    sut.TakeDamage(damage);

    Assert.That(sut.Remaining, Is.EqualTo(expected));
}
```

Use the known result `15` from the first example instead of copying the calculation.

### Observe through the interface

Verify that a created entity is retrievable through the public interface, rather than querying storage directly. Testing private methods or internal call sequences couples the test to implementation rather than behavior.

## PlayMode synchronization and expected failures

Synchronize PlayMode tests on observable outcomes with bounded timeouts. Arbitrary frame counts and real-time delays do not prove completion or visual timing.

Keep passing runs free of deliberately generated warnings, errors, and exceptions. Assert expected failures through a caller-visible synchronous seam with `Throws`, for example `Assert.That(() => sut.Apply(invalidInput), Throws.ArgumentException)`.

Do not deliberately trigger Unity lifecycle exceptions: `LogAssert.Expect` asserts them but does not suppress their Console output.
