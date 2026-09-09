import * as path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import { discoverAgents } from "./agents.js";
import { runAgent, truncateText } from "./runner.js";

export default function subagentExtension(pi: ExtensionAPI): void {
  const discovery = discoverAgents();
  const availableAgents = discovery.agents.length > 0
    ? discovery.agents
      .map((agent) => `- ${agent.name}: ${agent.description}`)
      .join("\n")
    : "- none";

  pi.on("session_start", (_event, ctx) => {
    if (!ctx.hasUI || discovery.errors.length === 0) return;

    const errors = discovery.errors
      .map((error) => `${path.basename(error.filePath)}: ${error.message}`)
      .join("\n");
    ctx.ui.notify(`Skipped invalid subagents:\n${errors}`, "warning");
  });

  pi.registerTool({
    name: "subagent",
    label: "Subagent",
    description: [
      "Run one explicitly requested task in an isolated child Pi process.",
      "Do not call this tool unless the user asks for a subagent or names a specialist.",
      "The task is forwarded unchanged.",
      `Available specialists from ${discovery.agentsDir}:\n${availableAgents}`,
      "The final response is capped at 50 KB.",
    ].join("\n\n"),
    promptSnippet: "Run an explicitly requested task in a named Pi specialist",
    promptGuidelines: [
      "Call subagent only when the user explicitly requests delegation or names an available specialist; never delegate proactively.",
    ],
    parameters: Type.Object({
      agent: Type.String({ description: "Specialist name", minLength: 1 }),
      task: Type.String({
        description: "Exact task for the child Pi process",
        minLength: 1,
      }),
    }),
    executionMode: "sequential",

    renderCall(args, theme, context) {
      const status = context.isPartial
        ? "working"
        : context.isError
          ? "arbort"
          : "done";
      const agentName = args.agent || "subagent";

      return new Text(
        theme.fg("toolTitle", theme.bold(`subagent: ${agentName} (${status})`)),
        0,
        0,
      );
    },

    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const agent = discovery.agents.find(
        (candidate) => candidate.name === params.agent,
      );
      if (!agent) {
        const names = discovery.agents.map((item) => item.name).join(", ");
        throw new Error(
          `Unknown subagent ${JSON.stringify(params.agent)}. Available: ${names || "none"}.`,
        );
      }

      const finalOutput = await runAgent(
        agent,
        params.task,
        ctx.cwd,
        ctx.isProjectTrusted(),
        signal,
      );
      const output = truncateText(
        finalOutput || "(no output)",
        "\n\n[Output truncated at 50 KB.]",
      );

      return {
        content: [{ type: "text", text: output }],
      };
    },
  });
}
