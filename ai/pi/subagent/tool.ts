/** Model-facing subagent tool definition and registration. */

import { keyHint, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Container, Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import {
  discoverAgents,
  type AgentDiscoveryResult,
} from "./agents.js";
import { runAgent, truncateText } from "./runner.js";

const subagentParameters = Type.Object({
  agent: Type.String({ description: "Specialist name", minLength: 1 }),
  task: Type.String({
    description: "Exact task for the child Pi process",
    minLength: 1,
  }),
});

const SUBAGENT_PREVIEW_LINES = 10;

function formatAvailableAgents(discovery: AgentDiscoveryResult): string {
  if (discovery.agents.length === 0) return "- none";
  return discovery.agents
    .map((agent) => `- ${agent.name}: ${agent.description}`)
    .join("\n");
}

interface SubagentRenderState {
  startedAt?: number;
  finishedAt?: number;
}

function formatElapsed(startedAt: number | undefined, endedAt: number): string {
  if (startedAt === undefined) return "0.0s";

  const elapsedTenths = Math.max(0, Math.floor((endedAt - startedAt) / 100));
  return `${(elapsedTenths / 10).toFixed(1)}s`;
}

export function registerSubagentTool(pi: ExtensionAPI): void {
  const initialDiscovery = discoverAgents();
  const availableAgents = formatAvailableAgents(initialDiscovery);

  pi.registerTool({
    name: "subagent",
    label: "Subagent",
    description: [
      "Run one explicitly requested task in an isolated child Pi process.",
      "Do not call this tool unless the user asks for a subagent or names a specialist.",
      "The task is forwarded unchanged.",
      `Available specialists from ${initialDiscovery.agentsDir}:\n${availableAgents}`,
      "The final response is capped at 50 KB.",
    ].join("\n\n"),
    promptSnippet: "Run an explicitly requested task in a named Pi specialist",
    promptGuidelines: [
      "Call subagent only when the user explicitly requests delegation or names an available specialist; never delegate proactively.",
    ],
    parameters: subagentParameters,
    executionMode: "sequential",

    renderCall(args, theme, context) {
      const state = context.state as SubagentRenderState;

      if (context.executionStarted && state.startedAt === undefined) {
        state.startedAt = Date.now();
      }

      if (!context.isPartial) {
        state.finishedAt ??= Date.now();
      }

      const agentName = args.agent || "N/A";
      const agent = discoverAgents().agents.find(
        (candidate) => candidate.name === agentName,
      );
      const modelIdentity = agent?.model ?? "N/A";
      const thinkingLevel = agent?.thinking ?? "N/A";
      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);

      text.setText(
        `${theme.fg("toolTitle", theme.bold(`subagent ${agentName}`))} ${theme.fg(
          "muted",
          `| ${modelIdentity} (${thinkingLevel})`,
        )}`,
      );
      return text;
    },

    renderResult(result, options, theme, context) {
      const state = context.state as SubagentRenderState;

      if (!options.isPartial || context.isError) {
        state.finishedAt ??= Date.now();
      }

      const output = result.content
        .filter((content) => content.type === "text")
        .map((content) => content.text?.replace(/\r/g, "") ?? "")
        .join("\n");
      const lines = output.split("\n");
      const displayLines = context.expanded
        ? lines
        : lines.slice(0, SUBAGENT_PREVIEW_LINES);
      const component =
        context.lastComponent instanceof Container
          ? context.lastComponent
          : new Container();

      component.clear();
      if (output) {
        let display = displayLines
          .map((line) => theme.fg("toolOutput", line))
          .join("\n");
        const remaining = lines.length - displayLines.length;
        if (remaining > 0) {
          display += `${theme.fg("muted", `\n... (${remaining} more lines,`)} ${keyHint("app.tools.expand", "to expand")}${theme.fg("muted", ")")}`;
        }
        component.addChild(new Text(display, 0, 0));
      }

      if (state.startedAt !== undefined) {
        const label = options.isPartial ? "Elapsed" : "Took";
        const elapsed = formatElapsed(
          state.startedAt,
          state.finishedAt ?? Date.now(),
        );
        component.addChild(
          new Text(`\n${theme.fg("muted", `${label} ${elapsed}`)}`, 0, 0),
        );
      }

      component.invalidate();
      return component;
    },

    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const discovery = discoverAgents();
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
        details: undefined,
      };
    },
  });
}
