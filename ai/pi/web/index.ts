import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { discoverExaTools, type McpTool } from "./exa.js";
import {
    EXA_TOOL_NAMES,
    getMissingWebToolNames,
    registerWebTools,
    type WebToolName,
} from "./tools.js";

function registerDiscoveryWarning(
    pi: ExtensionAPI,
    discoveryError: unknown,
    missingToolNames: WebToolName[],
): void {
    pi.on("session_start", (_event, context) => {
        let detail = "";

        if (discoveryError instanceof Error) {
            detail = `: ${discoveryError.message}`;
        } else if (missingToolNames.length > 0) {
            detail = `: missing ${missingToolNames.join(", ")}`;
        }

        context.ui.notify(
            `Exa MCP tools were not fully registered${detail}. /reload to try again.`,
            "warning",
        );
    });
}

export default async function webExtension(pi: ExtensionAPI): Promise<void> {
    let discoveredTools: McpTool[] = [];
    let discoveryError: unknown;

    try {
        discoveredTools = await discoverExaTools(EXA_TOOL_NAMES);
    } catch (error) {
        discoveryError = error;
    }

    const missingToolNames = getMissingWebToolNames(discoveredTools);
    if (discoveryError || missingToolNames.length > 0) {
        registerDiscoveryWarning(pi, discoveryError, missingToolNames);
    }

    registerWebTools(pi, discoveredTools);
}
