const REQUEST_TIMEOUT_MS = 10_000;

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export async function fetchJson(
    url: string,
    headers: Record<string, string>,
): Promise<unknown> {
    const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(`Request failed with HTTP ${response.status}`);
    }

    return response.json();
}
