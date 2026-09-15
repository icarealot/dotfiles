import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const EXA_MCP_SERVER = "https://mcp.exa.ai/mcp";

let exaClientPromise: Promise<Client> | undefined;

async function createExaClient(exaToolNames: readonly string[]): Promise<Client> {
    const url = new URL(EXA_MCP_SERVER);
    url.searchParams.set("tools", exaToolNames.join(","));

    const client = new Client(
        { name: "pi-exa", version: "0.1.0" },
        { capabilities: {} },
    );
    const transport = new StreamableHTTPClientTransport(url);

    try {
        await client.connect(transport);
        return client;
    } catch (error) {
        await client.close().catch(() => undefined);
        throw error;
    }
}

function getExaClient(exaToolNames: readonly string[]): Promise<Client> {
    if (exaClientPromise) {
        return exaClientPromise;
    }

    const connection = createExaClient(exaToolNames);
    exaClientPromise = connection;

    // Allow the next request to reconnect if this connection attempt fails.
    connection.catch(() => {
        if (exaClientPromise === connection) {
            exaClientPromise = undefined;
        }
    });

    return connection;
}

export async function discoverExaTools(
    exaToolNames: readonly string[],
): Promise<Tool[]> {
    const client = await createExaClient(exaToolNames);

    try {
        const result = await client.listTools();
        return result.tools.filter((tool) => exaToolNames.includes(tool.name));
    } finally {
        await client.close();
    }
}

export async function callExaTool(
    toolName: string,
    toolArguments: Record<string, unknown>,
    signal: AbortSignal | undefined,
    availableToolNames: readonly string[],
): Promise<string> {
    const client = await getExaClient(availableToolNames);
    const result = await client.callTool(
        {
            name: toolName,
            arguments: toolArguments,
        },
        undefined,
        { signal },
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

export async function closeExaClient(): Promise<void> {
    if (!exaClientPromise) {
        return;
    }

    const connection = exaClientPromise;
    exaClientPromise = undefined;

    let client: Client;
    try {
        client = await connection;
    } catch {
        // A failed connection has no open client to close.
        return;
    }

    await client.close();
}
