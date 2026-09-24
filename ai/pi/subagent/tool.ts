/** Model-facing subagent tool definition and registration. */

import {
  getMarkdownTheme,
  keyHint,
  type ExtensionAPI,
  type Theme,
} from "@earendil-works/pi-coding-agent";
import { Container, Markdown, Spacer, Text } from "@earendil-works/pi-tui";
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
  type ToolActivity,
} from "./runner.js";

const subagentParameters = Type.Object({
  agent: Type.String({ description: "Specialist name", minLength: 1 }),
  task: Type.String({
    description: "Exact task for the child Pi process",
    minLength: 1,
  }),
});

const SUBAGENT_ACTIVITY_PREVIEW_ITEMS = 5;

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
  activity: ToolActivity,
  theme: Theme,
): string {
  const args = activity.args;
  const path = getStringArg(args, "path", "file_path") ?? "...";
  let summary: string;

  switch (activity.name) {
    case "bash":
    case "powershell":
      summary = getStringArg(args, "command") ?? "...";
      break;
    case "read":
    case "write":
    case "edit":
    case "ls":
      summary = path;
      break;
    case "grep": {
      const pattern = getStringArg(args, "pattern") ?? "";
      summary = `/${pattern}/ in ${path}`;
      break;
    }
    case "find": {
      const pattern = getStringArg(args, "pattern") ?? "*";
      summary = `${pattern} in ${path}`;
      break;
    }
    default:
      summary = getStringArg(args, "preview") ?? "...";
      break;
  }

  return theme.fg(
    "muted",
    truncateActivityText(`${activity.name}: ${summary}`),
  );
}

interface PromptActivity {
  type: "prompt";
  text: string;
}

interface FinalActivity {
  type: "final";
  text: string;
  isError: boolean;
}

type RenderActivity = AgentActivity | PromptActivity | FinalActivity;

function addActivity(
  component: Container,
  activity: RenderActivity,
  theme: Theme,
): void {
  if (activity.type === "tool") {
    component.addChild(
      new Text(formatToolActivity(activity, theme), 0, 0),
    );
    return;
  }

  if (activity.type === "final" && activity.isError) {
    const errorText = activity.text
      .split("\n")
      .map((line) => theme.fg("error", line))
      .join("\n");
    component.addChild(new Text(errorText, 0, 0));
    return;
  }

  component.addChild(new Markdown(activity.text, 0, 0, getMarkdownTheme()));
}

function getContainer(lastComponent: unknown): Container {
  return lastComponent instanceof Container ? lastComponent : new Container();
}

function getResultText(
  result: { content: Array<{ type: string; text?: string }> },
): string {
  return result.content
    .filter((content) => content.type === "text")
    .map((content) => content.text?.replace(/\r/g, "") ?? "")
    .join("\n");
}

function appendActivityTimeline(
  component: Container,
  activities: RenderActivity[],
  omittedActivityCount: number,
  expanded: boolean,
  theme: Theme,
): void {
  const visibleActivities = expanded
    ? activities
    : activities.slice(-SUBAGENT_ACTIVITY_PREVIEW_ITEMS);
  const hiddenCount =
    omittedActivityCount + activities.length - visibleActivities.length;
  if (visibleActivities.length === 0 && hiddenCount === 0) return;

  component.addChild(new Spacer(1));
  if (hiddenCount > 0) {
    const message = expanded
      ? `... ${hiddenCount} earlier activities omitted`
      : `... ${hiddenCount} earlier activities`;
    let label = theme.fg("muted", message);
    if (!expanded) {
      label += ` ${keyHint("app.tools.expand", "to expand")}`;
    }
    component.addChild(new Text(label, 0, 0));
  }

  let previousType: RenderActivity["type"] | undefined;
  for (const activity of visibleActivities) {
    const isTool = activity.type === "tool";
    if (previousType !== undefined && (!isTool || previousType !== "tool")) {
      component.addChild(new Spacer(1));
    } else if (previousType === undefined && hiddenCount > 0) {
      component.addChild(new Spacer(1));
    }

    addActivity(component, activity, theme);
    previousType = activity.type;
  }
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
      const component = getContainer(context.lastComponent);
      const header =
        `${theme.fg("toolTitle", theme.bold(`subagent ${agentName}`))} ${theme.fg(
          "muted",
          `${modelIdentity} (${thinkingLevel})`,
        )}`;

      component.clear();
      component.addChild(new Text(header, 0, 0));
      component.invalidate();
      return component;
    },

    renderResult(result, options, theme, context) {
      const state = context.state as SubagentRenderState;
      if (!options.isPartial) {
        state.finishedAt ??= Date.now();
      }

      const output = getResultText(result);
      const details = result.details as AgentProgress | undefined;
      const component = getContainer(context.lastComponent);

      component.clear();

      const activities: RenderActivity[] = [
        {
          type: "prompt",
          text: String(context.args.task || "...").replace(/\r/g, ""),
        },
        ...(details?.activities ?? []),
      ];
      if (!options.isPartial && output) {
        activities.push({
          type: "final",
          text: output,
          isError: context.isError,
        });
      }
      appendActivityTimeline(
        component,
        activities,
        details?.omittedActivityCount ?? 0,
        options.expanded,
        theme,
      );

      if (details?.compaction) {
        component.addChild(new Spacer(1));
        component.addChild(
          new Text(theme.fg("muted", "Auto-compacting..."), 0, 0),
        );
      }

      if (
        !options.isPartial
        && state.startedAt !== undefined
        && state.finishedAt !== undefined
      ) {
        component.addChild(new Spacer(1));
        component.addChild(
          new Text(
            theme.fg(
              "muted",
              `Took ${formatElapsed(state.startedAt, state.finishedAt)}`,
            ),
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
          },
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
