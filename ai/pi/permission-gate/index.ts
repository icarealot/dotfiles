import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isDangerousCommand } from "./block-command.js";
import { isProtectedPath } from "./block-path.js";

export default function permissionGateExtension(pi: ExtensionAPI): void {
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
      if (isProtectedPath(path)) {
        reason = `Path "${path}" is protected`;
        notification = `Blocked ${event.toolName} to protected path: ${path}`;
      }
    }

    if (!reason) {
      return undefined;
    }

    if (ctx.hasUI) {
      ctx.ui.notify(notification ?? reason, "warning");
    }

    return { block: true, reason };
  });
}
