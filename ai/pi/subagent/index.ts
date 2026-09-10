/** Extension entry point that wires lifecycle, command, and tool registration. */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { configureSubagents } from "./configure.js";
import {
  discoverAgents,
  formatAgentConfigErrors,
} from "./agents.js";
import { registerSubagentTool } from "./tool.js";

export default function subagentExtension(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (!ctx.hasUI) return;

    const errors = formatAgentConfigErrors(discoverAgents().errors);
    if (errors) {
      ctx.ui.notify(`Skipped invalid subagents:\n${errors}`, "warning");
    }
  });

  pi.registerCommand("subagents", {
    description: "Assign models and thinking levels to subagents",
    handler: async (_args, ctx) => {
      await configureSubagents(ctx);
    },
  });

  registerSubagentTool(pi);
}
