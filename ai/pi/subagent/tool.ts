/** Model-facing subagent tool definition and registration. */

import {
  keyHint,
  type ExtensionAPI,
  type Theme,
} from "@earendil-works/pi-coding-agent";
import { Container, Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import {
  discoverAgents,
  type AgentDiscoveryResult,
} from "./agents.js";
import {
  AgentRunError,
  runAgent,
  truncateText,
  type AgentActivity,
  type AgentProgress,
} from "./runner.js";

const subagentParameters = Type.Object({
  agent: Type.String({ description: "Specialist name", minLength: 1 }),
  task: Type.String({
    description: "Exact task for the child Pi process",
    minLength: 1,
  }),
});

const SUBAGENT_PREVIEW_LINES = 10;
const SUBAGENT_ACTIVITY_PREVIEW_ITEMS = 10;

interface SubagentRenderState {
  startedAt?: number;
  finishedAt?: number;
}

function formatAvailableAgents(discovery: AgentDiscoveryResult): string {
  if (discovery.agents.length === 0) return "- none";
  return discovery.agents
    .map((agent) => `- ${agent.name}: ${agent.description}`)
    .join("\n");
}

function truncateActivityText(text: string, maxLength: number = 160): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  const characters = Array.from(singleLine);
  if (characters.length <= maxLength) return singleLine;
  return `${characters.slice(0, maxLength - 1).join("")}…`;
}

function getStringArg(
  args: Record<string, unknown>,
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const value = args[name];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function formatToolActivity(
  activity: Extract<AgentActivity, { type: "tool" }>,
  theme: Theme,
): string {
  const args = activity.args;
  const path = getStringArg(args, "path", "file_path") ?? "...";
  let description: string;

  switch (activity.name) {
    case "bash":
      description = `$ ${getStringArg(args, "command") ?? "..."}`;
      break;
    case "powershell":
      description = `PS> ${getStringArg(args, "command") ?? "..."}`;
      break;
    case "read":
      description = `read ${path}`;
      break;
    case "write":
      description = `write ${path}`;
      break;
    case "edit":
      description = `edit ${path}`;
      break;
    case "grep": {
      const pattern = getStringArg(args, "pattern") ?? "";
      description = `grep /${pattern}/ in ${path}`;
      break;
    }
    case "find": {
      const pattern = getStringArg(args, "pattern") ?? "*";
      description = `find ${pattern} in ${path}`;
      break;
    }
    case "ls":
      description = `ls ${path}`;
      break;
    default: {
      const preview = getStringArg(args, "preview");
      description = `${activity.name}${preview ? ` ${preview}` : ""}`;
      break;
    }
  }

  return `${theme.fg("muted", "→ ")}${theme.fg(
    "toolOutput",
    truncateActivityText(description),
  )}`;
}

function formatActivity(
  activity: AgentActivity,
  theme: Theme,
): string {
  if (activity.type === "tool") return formatToolActivity(activity, theme);
  return `${theme.fg("muted", "• ")}${theme.fg("toolOutput", activity.text)}`;
}

function formatActivities(
  progress: AgentProgress,
  expanded: boolean,
  theme: Theme,
): string {
  const activities = expanded
    ? progress.activities
    : progress.activities.slice(-SUBAGENT_ACTIVITY_PREVIEW_ITEMS);
  const hiddenRetainedCount = progress.activities.length - activities.length;
  const hiddenCount = progress.omittedActivityCount + hiddenRetainedCount;
  const lines: string[] = [];

  if (hiddenCount > 0) {
    const label = expanded
      ? `... ${hiddenCount} earlier activities omitted`
      : `... ${hiddenCount} earlier activities`;
    let line = theme.fg("muted", label);
    if (!expanded) {
      line += ` ${keyHint("app.tools.expand", "to expand")}`;
    }
    lines.push(line);
  }

  lines.push(...activities.map((activity) => formatActivity(activity, theme)));
  return lines.join("\n");
}

function formatElapsed(startedAt: number, endedAt: number): string {
  const elapsedTenths = Math.max(0, Math.floor((endedAt - startedAt) / 100));
  return `${(elapsedTenths / 10).toFixed(1)}s`;
}

export function registerSubagentTool(pi: ExtensionAPI): void {
  const initialDiscovery = discoverAgents();
  const availableAgents = formatAvailableAgents(initialDiscovery);
  const failedProgressByToolCallId = new Map<string, AgentProgress>();

  // Pi converts thrown tool errors into a new result, so reattach the progress
  // after execution while preserving the tool's error status.
  pi.on("tool_result", (event) => {
    if (event.toolName !== "subagent") return;

    const progress = failedProgressByToolCallId.get(event.toolCallId);
    if (!progress) return;

    failedProgressByToolCallId.delete(event.toolCallId);
    return { details: progress };
  });

  pi.registerTool({
    name: "subagent",
    label: "Subagent",
    description: [
      "Run one explicitly requested task in an isolated child Pi process.",
      "Do not call this tool unless the user asks for a subagent or names a specialist.",
      "The task is forwarded unchanged.",
      "Multiple subagent calls in the same turn run concurrently.",
      `Available specialists from ${initialDiscovery.agentsDir}:\n${availableAgents}`,
      "The final response is capped at 50 KB.",
    ].join("\n\n"),
    promptSnippet: "Run an explicitly requested task in a named Pi specialist",
    promptGuidelines: [
      "Call subagent only when the user explicitly requests delegation or names an available specialist; never delegate proactively.",
      "When the user explicitly requests independent subagents in parallel, issue all subagent calls in the same response.",
    ],
    parameters: subagentParameters,
    executionMode: "parallel",

    renderCall(args, theme, context) {
      const state = context.state as SubagentRenderState;
      if (context.executionStarted && state.startedAt === undefined) {
        state.startedAt = Date.now();
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
      if (!options.isPartial) {
        state.finishedAt ??= Date.now();
      }

      const output = result.content
        .filter((content) => content.type === "text")
        .map((content) => content.text?.replace(/\r/g, "") ?? "")
        .join("\n");
      const details = result.details as AgentProgress | undefined;
      const component =
        context.lastComponent instanceof Container
          ? context.lastComponent
          : new Container();

      component.clear();
      if (options.isPartial) {
        const activityOutput = details
          ? formatActivities(details, context.expanded, theme)
          : "";
        component.addChild(
          new Text(
            activityOutput || theme.fg("muted", "Starting…"),
            0,
            0,
          ),
        );
      } else {
        if (context.expanded && details && details.activities.length > 0) {
          component.addChild(
            new Text(theme.fg("muted", "Activity"), 0, 0),
          );
          component.addChild(
            new Text(formatActivities(details, true, theme), 0, 0),
          );
          if (output) {
            const outputLabel = context.isError
              ? "Failure reason"
              : "Final response";
            component.addChild(
              new Text(`\n${theme.fg("muted", outputLabel)}`, 0, 0),
            );
          }
        }

        if (output) {
          const lines = output.split("\n");
          const displayLines = context.expanded
            ? lines
            : lines.slice(0, SUBAGENT_PREVIEW_LINES);
          let display = displayLines
            .map((line) => theme.fg("toolOutput", line))
            .join("\n");
          const remaining = lines.length - displayLines.length;
          if (remaining > 0) {
            display += `${theme.fg("muted", `\n... (${remaining} more lines,`)} ${keyHint("app.tools.expand", "to expand")}${theme.fg("muted", ")")}`;
          } else if (
            context.isError
            && !context.expanded
            && details
            && (details.activities.length > 0 || details.omittedActivityCount > 0)
          ) {
            display += `\n${keyHint("app.tools.expand", "to expand")}`;
          }
          component.addChild(new Text(display, 0, 0));
        }
      }

      if (
        !options.isPartial
        && state.startedAt !== undefined
        && state.finishedAt !== undefined
      ) {
        component.addChild(
          new Text(
            `\n${theme.fg("muted", `Took ${formatElapsed(state.startedAt, state.finishedAt)}`)}`,
            0,
            0,
          ),
        );
      }

      component.invalidate();
      return component;
    },

    async execute(toolCallId, params, signal, onUpdate, ctx) {
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

      const initialProgress: AgentProgress = {
        activities: [],
        omittedActivityCount: 0,
      };
      onUpdate?.({
        content: [{ type: "text", text: `${agent.name} is starting…` }],
        details: initialProgress,
      });

      try {
        const runResult = await runAgent(
          agent,
          params.task,
          ctx.cwd,
          ctx.isProjectTrusted(),
          signal,
          (progress) => {
            onUpdate?.({
              content: [{ type: "text", text: `${agent.name} is running…` }],
              details: progress,
            });
          },
        );
        const output = truncateText(
          runResult.finalOutput || "(no output)",
          "\n\n[Output truncated at 50 KB.]",
        );

        return {
          content: [{ type: "text", text: output }],
          details: {
            activities: runResult.activities,
            omittedActivityCount: runResult.omittedActivityCount,
          } satisfies AgentProgress,
        };
      } catch (error) {
        if (error instanceof AgentRunError) {
          failedProgressByToolCallId.set(toolCallId, error.progress);
        }
        throw error;
      }
    },
  });
}
