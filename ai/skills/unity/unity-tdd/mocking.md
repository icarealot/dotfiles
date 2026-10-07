# Unity Boundary Substitution

## What to substitute

Construct owned code directly, including internal collaborators and project-owned boundary adapters. Use test doubles only for the Unity or external systems they wrap:

- Unity-engine services.
- External APIs.
- Databases (when a real test database is not appropriate).
- Time and randomness.
- File systems (when real isolated storage is not appropriate).

An owned adapter remains real; substitute its underlying system, not the adapter itself.

## Designing boundary seams

Prefer passing values before introducing interfaces. When boundary substitution requires an interface, use a narrow project-owned one.

Inject boundary dependencies rather than constructing them inside the behavior under test. Keep concrete wiring outside that behavior.

Give boundary interfaces operation-specific methods with explicit inputs and outputs. Avoid generic dispatchers whose mocks must branch on operation names or payloads.

Illustrative C# boundary:

```csharp
public interface IScoreStore
{
    void SaveBestScore(string playerId, int score);
    int LoadBestScore(string playerId);
}

public sealed class ScoreSubmission
{
    private readonly IScoreStore _store;

    public ScoreSubmission(IScoreStore store)
    {
        _store = store;
    }

    public void Submit(string playerId, int score)
    {
        if (score > _store.LoadBestScore(playerId))
        {
            _store.SaveBestScore(playerId, score);
        }
    }
}
```

Each boundary operation has one explicit input/output shape. Test the real best-score decision with a substitute for external storage, and test a project-owned storage adapter with its real implementation and a substitute only for the system it wraps.

## Interaction assertions

Prefer observable outcomes over call verification. Assert boundary calls only when the interaction itself is part of the caller-visible contract.

Verify the required operation and data, not incidental call counts or order. Counts or order are valid only at system boundaries when explicitly required by the public contract. Internal call sequences are implementation details.
