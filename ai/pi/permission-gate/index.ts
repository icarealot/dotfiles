// Adapts Pi tool-call events to command and path policies; keep policy logic in feature modules.

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isDangerousCommand } from "./commands/index.js";
import { isProtectedPath } from "./paths/index.js";

export default function permissionGateExtension(pi: ExtensionAPI): void {
  let blockedRun = false;
  const blockedToolCallIds = new Set<string>();

  pi.on("tool_call", async (event, ctx) => {
    let reason: string | undefined;
    let notification: string | undefined;

    if (event.toolName === "bash") {
      const command = event.input.command as string;
      if (isDangerousCommand(command)) {
        reason = "Dangerous command blocked";
        notification = reason;
      }
    } else if (event.toolName === "write" || event.toolName === "edit") {
      const path = event.input.path as string;
      if (isProtectedPath(path, ctx.cwd)) {
        reason = `Path "${path}" is protected`;
        notification = `Blocked ${event.toolName} to protected path: ${path}`;
      }
    }

    if (!reason) {
      return undefined;
    }

    blockedRun = true;
    blockedToolCallIds.add(event.toolCallId);

    if (ctx.hasUI) {
      ctx.ui.notify(notification ?? reason, "warning");
    }

    return { block: true, reason, terminate: true };
  });

  pi.on("tool_execution_end", (event, ctx) => {
    if (!blockedToolCallIds.delete(event.toolCallId)) {
      return;
    }

    // Abort only after Pi has finalized the gate's exact denial reason.
    ctx.abort();
  });

  pi.on("before_provider_request", (_event, ctx) => {
    if (blockedRun) {
      // Drain queued messages as aborted without allowing another model request.
      ctx.abort();
    }
  });

  pi.on("agent_settled", () => {
    blockedRun = false;
    blockedToolCallIds.clear();
  });
}
