/** Interactive /subagents workflow for choosing and saving model assignments. */

import {
  clampThinkingLevel,
  getSupportedThinkingLevels,
  type ModelThinkingLevel,
} from "@earendil-works/pi-ai";
import type {
  ExtensionCommandContext,
  ScopedModel,
} from "@earendil-works/pi-coding-agent";
import {
  discoverAgents,
  formatAgentConfigErrors,
  saveAgentAssignment,
  type AgentConfig,
  type AgentDiscoveryResult,
} from "./agents.js";

function getModelReference(scopedModel: ScopedModel): string {
  const model = scopedModel.model;
  return `${model.provider}/${model.id}`;
}

function getAvailableModels(ctx: ExtensionCommandContext): ScopedModel[] {
  if (ctx.scopedModels.length > 0) {
    return [...ctx.scopedModels];
  }

  return ctx.modelRegistry.getAvailable().map((model) => ({ model }));
}

function putCurrentModelFirst(
  models: ScopedModel[],
  currentModel: string,
): ScopedModel[] {
  return [...models].sort((left, right) => {
    const leftReference = getModelReference(left);
    const rightReference = getModelReference(right);

    if (leftReference === currentModel) return -1;
    if (rightReference === currentModel) return 1;
    return leftReference.localeCompare(rightReference);
  });
}

function getAgentLabel(agent: AgentConfig): string {
  return `${agent.name} — ${agent.model} (${agent.thinking})`;
}

function getModelLabel(
  scopedModel: ScopedModel,
  currentModel: string,
): string {
  const reference = getModelReference(scopedModel);
  let label = reference;

  if (scopedModel.thinkingLevel) {
    label += ` (${scopedModel.thinkingLevel}) (scoped)`;
  }
  if (reference === currentModel) {
    label += " (current)";
  }

  return label;
}

function getThinkingLevels(scopedModel: ScopedModel): ModelThinkingLevel[] {
  const pinnedLevel = scopedModel.thinkingLevel;
  if (pinnedLevel) {
    return [clampThinkingLevel(scopedModel.model, pinnedLevel)];
  }

  return getSupportedThinkingLevels(scopedModel.model);
}

function getThinkingLabel(
  level: ModelThinkingLevel,
  agent: AgentConfig,
  scopedModel: ScopedModel,
): string {
  let label: string = level;
  const pinnedLevel = scopedModel.thinkingLevel;

  if (pinnedLevel && level === pinnedLevel) {
    label += " (scoped)";
  } else if (pinnedLevel) {
    label += ` (scoped ${pinnedLevel} → ${level})`;
  }
  if (level === agent.thinking) {
    label += " (current)";
  }

  return label;
}

async function chooseAgent(
  ctx: ExtensionCommandContext,
  discovery: AgentDiscoveryResult,
): Promise<AgentConfig | undefined> {
  if (discovery.agents.length === 0) {
    ctx.ui.notify(`No valid subagents found in ${discovery.agentsDir}.`, "warning");
    return undefined;
  }

  const labels = discovery.agents.map(getAgentLabel);
  const selectedLabel = await ctx.ui.select("Configure subagent", labels);
  return discovery.agents.find(
    (agent) => getAgentLabel(agent) === selectedLabel,
  );
}

async function chooseModel(
  ctx: ExtensionCommandContext,
  agent: AgentConfig,
  models: ScopedModel[],
): Promise<ScopedModel | undefined> {
  const orderedModels = putCurrentModelFirst(models, agent.model);
  const labels = orderedModels.map((model) =>
    getModelLabel(model, agent.model),
  );
  const selectedLabel = await ctx.ui.select(
    `Model for ${agent.name}`,
    labels,
  );

  return orderedModels.find(
    (model) => getModelLabel(model, agent.model) === selectedLabel,
  );
}

async function chooseThinkingLevel(
  ctx: ExtensionCommandContext,
  agent: AgentConfig,
  scopedModel: ScopedModel,
): Promise<ModelThinkingLevel | undefined> {
  const levels = getThinkingLevels(scopedModel);
  const labels = levels.map((level) =>
    getThinkingLabel(level, agent, scopedModel),
  );
  const selectedLabel = await ctx.ui.select(
    `Thinking for ${agent.name}`,
    labels,
  );

  return levels.find(
    (level) => getThinkingLabel(level, agent, scopedModel) === selectedLabel,
  );
}

async function configureAgent(
  ctx: ExtensionCommandContext,
  agent: AgentConfig,
  models: ScopedModel[],
): Promise<void> {
  while (true) {
    const scopedModel = await chooseModel(ctx, agent, models);
    if (!scopedModel) return;

    const thinking = await chooseThinkingLevel(ctx, agent, scopedModel);
    if (!thinking) {
      // Return to the model picker when the thinking picker is cancelled.
      continue;
    }

    const model = getModelReference(scopedModel);
    try {
      await saveAgentAssignment(agent.filePath, { model, thinking });
      ctx.ui.notify(`${agent.name}: ${model} (${thinking})`, "info");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.ui.notify(`Could not update ${agent.name}: ${message}`, "error");
    }
    return;
  }
}

export async function configureSubagents(
  ctx: ExtensionCommandContext,
): Promise<void> {
  await ctx.waitForIdle();
  if (!ctx.hasUI) return;

  let discovery = discoverAgents();
  const errors = formatAgentConfigErrors(discovery.errors);
  if (errors) {
    ctx.ui.notify(`Skipped invalid subagents:\n${errors}`, "warning");
  }

  const models = getAvailableModels(ctx);
  if (models.length === 0) {
    ctx.ui.notify("No authenticated models are available.", "warning");
    return;
  }

  while (true) {
    const agent = await chooseAgent(ctx, discovery);
    if (!agent) return;

    await configureAgent(ctx, agent, models);

    // Reload assignments before showing the agent picker again.
    discovery = discoverAgents();
  }
}
