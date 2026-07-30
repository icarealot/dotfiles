# Unity test examples

## EditMode

Use EditMode tests for deterministic game rules that do not need a running scene.

```csharp
using NUnit.Framework;

public sealed class ManaPoolTests
{
    [Test]
    public void TrySpend_WhenCostExceedsAvailableMana_LeavesManaUnchanged()
    {
        var mana = new ManaPool(available: 3);

        var spent = mana.TrySpend(cost: 5);

        Assert.That(spent, Is.False);
        Assert.That(mana.Available, Is.EqualTo(3));
    }
}
```

Prefer known literals from the game rules. Do not reproduce the production calculation in the assertion.

## PlayMode

Use PlayMode tests only when behavior depends on Unity lifecycle or engine integration.

```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public sealed class LifecycleTests
{
    [UnityTest]
    public IEnumerator DestroyOnStart_RemovesGameObjectAfterLifecycleRuns()
    {
        var gameObject = new GameObject("Temporary object");
        gameObject.AddComponent<DestroyOnStart>();

        yield return null;

        var wasDestroyed = gameObject == null;
        if (gameObject != null)
            Object.Destroy(gameObject);

        Assert.That(wasDestroyed, Is.True);
    }
}
```

Prefer the narrowest public Unity boundary that proves the behavior. Clean up created objects when the behavior under test does not destroy them.

## Avoid implementation-coupled tests

Do not test private methods, internal call counts, or arbitrary frame-by-frame implementation sequences. Test externally observable gameplay behavior.

```csharp
// Avoid: verifies an internal collaborator.
audioService.Received(1).Play("hit");

// Prefer: verify the public result at the agreed seam.
Assert.That(target.Health, Is.EqualTo(7));
```

Do not treat screenshots, snapshots of serialized YAML, or exact hierarchy layouts as default assertions. Use them only when the serialized or visual structure is itself the agreed public contract.
