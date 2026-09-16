import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { callExaTool, type McpTool } from "./exa.js";
import { createCallRenderer, renderCollapsedResult } from "./renderers.js";

export type WebToolName = "web_search" | "web_fetch";

interface WebToolDefinition {
    name: WebToolName;
    exaName: string;
    promptSnippet: string;
    promptGuidelines: string[];
}

export const WEB_TOOLS: WebToolDefinition[] = [
    {
        name: "web_search",
        exaName: "web_search_exa",
        promptSnippet:
            "Search the web for current information and return clean result content",
        promptGuidelines: [
            "Use web_search for simple web searches, current information, news, facts, people, companies, or answering questions about any topic.",
        ],
    },
    {
        name: "web_fetch",
        exaName: "web_fetch_exa",
        promptSnippet: "Fetch full clean markdown content from known webpage URLs",
        promptGuidelines: [
            "Use web_fetch to read full clean markdown content from known webpage URLs.",
        ],
    },
];

export const EXA_TOOL_NAMES = WEB_TOOLS.map((tool) => tool.exaName);

function makeProviderNeutralDescription(description: string): string {
    let neutralDescription = description;

    for (const definition of WEB_TOOLS) {
        neutralDescription = neutralDescription.replaceAll(
            definition.exaName,
            definition.name,
        );
    }

    return neutralDescription;
}

function findDiscoveredTool(
    definition: WebToolDefinition,
    discoveredTools: McpTool[],
): McpTool | undefined {
    return discoveredTools.find((tool) => tool.name === definition.exaName);
}

export function getMissingWebToolNames(
    discoveredTools: McpTool[],
): WebToolName[] {
    const missingNames: WebToolName[] = [];

    for (const definition of WEB_TOOLS) {
        if (!findDiscoveredTool(definition, discoveredTools)) {
            missingNames.push(definition.name);
        }
    }

    return missingNames;
}

export function registerWebTools(
    pi: ExtensionAPI,
    discoveredTools: McpTool[],
): void {
    for (const definition of WEB_TOOLS) {
        const discoveredTool = findDiscoveredTool(definition, discoveredTools);
        if (!discoveredTool) {
            continue;
        }

        pi.registerTool({
            name: definition.name,
            label: definition.name,
            description: makeProviderNeutralDescription(
                discoveredTool.description ?? "",
            ),
            promptSnippet: definition.promptSnippet,
            promptGuidelines: definition.promptGuidelines,
            // Exa supplies this JSON schema at runtime, so TypeBox cannot infer it.
            parameters: Type.Unsafe<Record<string, unknown>>(
                discoveredTool.inputSchema,
            ),
            renderCall: createCallRenderer(definition.name),
            renderResult: renderCollapsedResult,

            async execute(_toolCallId, params, signal) {
                try {
                    const text = await callExaTool(
                        definition.exaName,
                        params,
                        signal,
                        EXA_TOOL_NAMES,
                    );

                    return {
                        content: [
                            {
                                type: "text",
                                text: text || "No results",
                            },
                        ],
                        details: {},
                    };
                } catch (error) {
                    if (signal?.aborted) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: "Request was cancelled",
                                },
                            ],
                            details: {},
                        };
                    }

                    throw error;
                }
            },
        });
    }
}
