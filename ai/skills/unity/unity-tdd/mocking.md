# When to Mock

Mock or fake at **system boundaries** only. Use small C# interfaces around nondeterministic Unity APIs and external services:

- Network services, cloud saves, analytics, and platform SDKs
- Player input when testing gameplay independently of devices; use the Input System's test fixtures for input integration
- Time/randomness (`Time`, `UnityEngine.Random`) when testing deterministic gameplay rules
- Persistence (`PlayerPrefs`, files); prefer an in-memory fake for gameplay tests and isolated real storage for adapter tests
- Asset-loading services when testing gameplay independently of Addressables or remote content

Don't mock:

- Your own gameplay rules, systems, or internal collaborators
- `GameObject`, `Transform`, `MonoBehaviour`, or `ScriptableObject`; create real test instances
- Unity lifecycle or physics when that engine behavior is what the test verifies; run a PlayMode test

A project-owned interface around an external dependency is still a system boundary. Keep its real Unity/SDK adapter covered by separate integration tests.

## Designing for Mockability

At system boundaries, design interfaces that are easy to mock:

**1. Use dependency injection**

Pass boundary dependencies into plain C# gameplay services; wire the real Unity adapters in a composition root:

```csharp
public interface IGameClock
{
    float Now { get; }
}

// Easy to test with a controllable clock in EditMode
public sealed class Cooldown
{
    private readonly IGameClock clock;
    private float readyAt;

    public Cooldown(IGameClock clock) => this.clock = clock;

    public void Start(float seconds) => readyAt = clock.Now + seconds;
    public bool IsReady => clock.Now >= readyAt;
}

// Production adapter: Unity time stays at the boundary
public sealed class UnityGameClock : IGameClock
{
    public float Now => Time.time;
}

// Hard to isolate: reading global Unity time inside the gameplay rule
public sealed class CoupledCooldown
{
    private float readyAt;

    public void Start(float seconds) => readyAt = Time.time + seconds;
    public bool IsReady => Time.time >= readyAt;
}
```

A test clock can advance instantly; the rule needs no frame waits or changes to `Time.timeScale`. Use constructor injection for plain C# objects. Create components with `AddComponent`, not `new`; if `Awake` needs injected dependencies, configure the component on an inactive GameObject before activating it. Serialized references can wire scene dependencies without introducing a DI framework.

**2. Prefer SDK-style interfaces over generic fetchers**

Expose typed operations at the gameplay boundary. Keep URL construction, serialization, and `UnityWebRequest` inside the real adapter:

```csharp
// GOOD: Each operation has a specific input and result
public interface ICloudSaveClient
{
    Task<Progress> LoadProgressAsync(string playerId);
    Task SaveProgressAsync(string playerId, Progress progress);
}

// BAD as a gameplay boundary: tests must route requests and parse payloads
public interface IGenericNetworkClient
{
    Task<string> SendAsync(string url, string method, string json);
}
```

Examples assume project-specific `Progress` and imports from `UnityEngine` and `System.Threading.Tasks`.

The SDK approach means:
- Each stub returns one typed result or a deliberate failure
- Test setup describes gameplay scenarios instead of HTTP routing
- Easier to see which boundary operations a test exercises
- Type safety per operation

Prefer a small fake or stub over a mocking framework when only data or controllable time is needed. Assert gameplay outcomes; verify calls only when the boundary interaction itself is the agreed behavior (for example, submitting an analytics event).