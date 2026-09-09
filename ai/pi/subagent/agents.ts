import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ThinkingLevel } from "@earendil-works/pi-agent-core";
import { parseFrontmatter } from "@earendil-works/pi-coding-agent";

const AGENTS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "agents",
);

const THINKING_LEVELS = new Set<ThinkingLevel>([
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
]);

const BUILTIN_TOOLS = new Set([
  "read",
  "bash",
  "powershell",
  "edit",
  "write",
  "grep",
  "find",
  "ls",
]);

type AgentFrontmatter = {
  description?: unknown;
  model?: unknown;
  thinking?: unknown;
  tools?: unknown;
};

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  thinking: ThinkingLevel;
  tools: string[];
  filePath: string;
}

export interface AgentConfigError {
  filePath: string;
  message: string;
}

export interface AgentDiscoveryResult {
  agentsDir: string;
  agents: AgentConfig[];
  errors: AgentConfigError[];
}

function parseTools(value: unknown): string[] | undefined {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const tools = values
    .filter((tool): tool is string => typeof tool === "string")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return tools.length > 0 ? [...new Set(tools)] : undefined;
}

function loadAgent(filePath: string): AgentConfig {
  const name = path.basename(filePath, path.extname(filePath));
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) {
    throw new Error("filename must contain only letters, numbers, dots, underscores, and hyphens");
  }

  const content = fs.readFileSync(filePath, "utf8");
  const { frontmatter } = parseFrontmatter<AgentFrontmatter>(content);

  if (typeof frontmatter.description !== "string" || frontmatter.description.trim() === "") {
    throw new Error("frontmatter.description must be a non-empty string");
  }

  if (typeof frontmatter.model !== "string" || frontmatter.model.trim() === "") {
    throw new Error("frontmatter.model must be a non-empty string");
  }

  if (
    typeof frontmatter.thinking !== "string"
    || !THINKING_LEVELS.has(frontmatter.thinking as ThinkingLevel)
  ) {
    throw new Error(
      `frontmatter.thinking must be one of: ${[...THINKING_LEVELS].join(", ")}`,
    );
  }

  const tools = parseTools(frontmatter.tools);
  if (tools === undefined) {
    throw new Error("frontmatter.tools must contain at least one built-in tool");
  }

  const unsupportedTools = tools.filter((tool) => !BUILTIN_TOOLS.has(tool));
  if (unsupportedTools.length > 0) {
    throw new Error(
      `frontmatter.tools contains unsupported tools: ${unsupportedTools.join(", ")}`,
    );
  }

  return {
    name,
    description: frontmatter.description.trim(),
    model: frontmatter.model.trim(),
    thinking: frontmatter.thinking as ThinkingLevel,
    tools,
    filePath,
  };
}

export function discoverAgents(): AgentDiscoveryResult {
  const agentsDir = AGENTS_DIR;
  const agents: AgentConfig[] = [];
  const errors: AgentConfigError[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      errors.push({
        filePath: agentsDir,
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return { agentsDir, agents, errors };
  }

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.name.endsWith(".md")) continue;
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;

    const filePath = path.join(agentsDir, entry.name);
    try {
      agents.push(loadAgent(filePath));
    } catch (error) {
      errors.push({
        filePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { agentsDir, agents, errors };
}
