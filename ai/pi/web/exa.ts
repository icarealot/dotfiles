const EXA_MCP_SERVER = "https://mcp.exa.ai/mcp";

export interface McpTool {
    name: string;
    description?: string;
    inputSchema: Record<string, unknown>;
}

interface JsonRpcError {
    code: number;
    message: string;
}

interface JsonRpcResponse<TResult> {
    jsonrpc: "2.0";
    id: number;
    result?: TResult;
    error?: JsonRpcError;
}

interface CallToolResult {
    content: unknown[];
    isError?: boolean;
}

let nextRequestId = 1;

function parseSseMessages(body: string): unknown[] {
    const messages: unknown[] = [];

    for (const event of body.split(/\r?\n\r?\n/)) {
        const data = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");

        if (data && data !== "[DONE]") {
            messages.push(JSON.parse(data));
        }
    }

    return messages;
}

async function requestExa<TResult>(
    method: string,
    params: Record<string, unknown>,
    availableToolNames: readonly string[],
    signal?: AbortSignal,
): Promise<TResult> {
    const id = nextRequestId++;
    const url = new URL(EXA_MCP_SERVER);
    url.searchParams.set("tools", availableToolNames.join(","));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json, text/event-stream",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
        signal,
    });
    const body = await response.text();

    if (!response.ok) {
        throw new Error(
            `Exa MCP request failed (${response.status}): ${body || response.statusText}`,
        );
    }

    const contentType = response.headers.get("content-type") ?? "";
    const messages = contentType.includes("text/event-stream")
        ? parseSseMessages(body)
        : [JSON.parse(body)];
    const message = messages.find(
        (candidate): candidate is JsonRpcResponse<TResult> =>
            typeof candidate === "object" &&
            candidate !== null &&
            "id" in candidate &&
            candidate.id === id,
    );

    if (!message) {
        throw new Error("Exa MCP returned no response for the request");
    }
    if (message.error) {
        throw new Error(
            `Exa MCP error ${message.error.code}: ${message.error.message}`,
        );
    }
    if (message.result === undefined) {
        throw new Error("Exa MCP returned an invalid response");
    }

    return message.result;
}

export async function discoverExaTools(
    exaToolNames: readonly string[],
): Promise<McpTool[]> {
    const result = await requestExa<{ tools: McpTool[] }>(
        "tools/list",
        {},
        exaToolNames,
    );
    return result.tools.filter((tool) => exaToolNames.includes(tool.name));
}

export async function callExaTool(
    toolName: string,
    toolArguments: Record<string, unknown>,
    signal: AbortSignal | undefined,
    availableToolNames: readonly string[],
): Promise<string> {
    const result = await requestExa<CallToolResult>(
        "tools/call",
        { name: toolName, arguments: toolArguments },
        availableToolNames,
        signal,
    );

    if (!Array.isArray(result.content)) {
        throw new Error("Exa MCP tool returned an unsupported result");
    }

    const textParts: string[] = [];
    for (const item of result.content) {
        if (
            typeof item === "object" &&
            item !== null &&
            "type" in item &&
            item.type === "text" &&
            "text" in item &&
            typeof item.text === "string"
        ) {
            textParts.push(item.text);
        }
    }

    const text = textParts.join("\n");
    if (result.isError) {
        throw new Error(text || "Exa MCP tool call failed");
    }

    return text;
}
