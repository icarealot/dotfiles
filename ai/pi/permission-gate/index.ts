// Adapts Pi tool-call events to command and path policies; keep policy logic in feature modules.

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isDangerousCommand } from "./commands/index.js";
import { isProtectedPath } from "./paths/index.js";

export default function permissionGateExtension(pi: ExtensionAPI): void {
    let blockedRun = false;
    const blockedToolCallIds = new Set<string>();

    pi.on("tool_call", async (event, ctx) => {
        let operation: string | undefined;
        let reason: string | undefined;

        if (event.toolName === "bash") {
            const command = event.input.command as string;
            if (isDangerousCommand(command)) {
                operation = `bash: ${command}`;
                reason = `Dangerous command blocked!\n(${command})`;
            }
        } else if (event.toolName === "write" || event.toolName === "edit") {
            const path = event.input.path as string;
            if (isProtectedPath(path, ctx.cwd)) {
                operation = `${event.toolName}: ${path}`;
                reason = `Path is protected!\n${path}`;
            }
        }

        if (!operation || !reason) {
            return undefined;
        }

        if (!ctx.hasUI) {
            blockedRun = true;
            blockedToolCallIds.add(event.toolCallId);
            return { block: true, reason, terminate: true };
        }

        let choice: string | undefined;
        try {
            choice = await ctx.ui.select(`Permission required\n${operation}`, [
                "Approve",
                "Deny",
            ]);
        } catch {
            ctx.ui.notify(reason, "warning");
            blockedRun = true;
            blockedToolCallIds.add(event.toolCallId);
            return { block: true, reason, terminate: true };
        }

        if (choice === "Approve") {
            return undefined;
        }

        ctx.ui.notify(reason, "warning");
        blockedRun = true;
        blockedToolCallIds.add(event.toolCallId);
        return { block: true, reason, terminate: true };
    });

    pi.on("tool_execution_end", (event, ctx) => {
        if (!blockedToolCallIds.delete(event.toolCallId)) {
            return;
        }

        ctx.abort();
    });

    pi.on("before_provider_request", (_event, ctx) => {
        if (blockedRun) {
            ctx.abort();
        }
    });

    pi.on("agent_settled", () => {
        blockedRun = false;
        blockedToolCallIds.clear();
    });
}
