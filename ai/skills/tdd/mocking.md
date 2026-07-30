# Mocking in Unity tests

Mock only boundaries that are nondeterministic, platform-specific, slow, or external:

- network services and platform SDKs
- time and randomness
- file, cloud-save, and device APIs
- purchases, ads, analytics, authentication, and similar third-party integrations

Do not mock:

- the game's own domain objects
- internal gameplay collaborators
- `MonoBehaviour` methods merely to avoid choosing the correct EditMode or PlayMode seam
- Unity APIs when a small real EditMode or PlayMode fixture is clearer

## Inject boundaries

Wrap external behavior in a narrow game-specific interface and inject it.

```csharp
public interface IGameClock
{
    float Now { get; }
}

public sealed class Cooldown
{
    private readonly IGameClock clock;
    private float readyAt;

    public Cooldown(IGameClock clock)
    {
        this.clock = clock;
    }

    public void Start(float durationSeconds)
    {
        readyAt = clock.Now + durationSeconds;
    }

    public bool IsReady => clock.Now >= readyAt;
}
```

Use a small fake with explicit values in the test. Avoid a generic service locator or a mock that branches on many unrelated calls.

## Keep Unity integration real

When behavior depends on lifecycle callbacks, physics, scenes, coroutines, or component enable/disable state, use a focused PlayMode fixture instead of mocking the engine.

Follow the protected-file approval contract in [SKILL.md](./SKILL.md) for any non-code test setup.
