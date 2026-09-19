/** Agent definition discovery, validation, and persisted assignment updates. */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ThinkingLevel } from "@earendil-works/pi-agent-core";
import {
  parseFrontmatter,
  withFileMutationQueue,
} from "@earendil-works/pi-coding-agent";

const AGENTS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "agents",
);

const THINKING_LEVELS: ThinkingLevel[] = [
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

const AGENT_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

const BUILTIN_TOOLS = new Set<string>([
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

export interface AgentAssignment {
  model: string;
  thinking: ThinkingLevel;
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

function isThinkingLevel(value: unknown): value is ThinkingLevel {
  if (typeof value !== "string") return false;
  return THINKING_LEVELS.some((level) => level === value);
}

function parseTools(value: unknown): string[] | undefined {
  let values: unknown[] = [];
  if (Array.isArray(value)) {
    values = value;
  } else if (typeof value === "string") {
    values = value.split(",");
  }

  const tools = values
    .filter((tool): tool is string => typeof tool === "string")
    .map((tool) => tool.trim())
    .filter((tool) => tool.length > 0);

  if (tools.length === 0) return undefined;
  return [...new Set(tools)];
}

function getRequiredText(value: unknown, field: "description" | "model"): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`frontmatter.${field} must be a non-empty string`);
  }

  return value.trim();
}

function loadAgent(filePath: string): AgentConfig {
  const name = path.basename(filePath, path.extname(filePath));
  if (!AGENT_NAME_PATTERN.test(name)) {
    throw new Error("filename must contain only letters, numbers, dots, underscores, and hyphens");
  }

  const content = fs.readFileSync(filePath, "utf8");
  const { frontmatter } = parseFrontmatter<AgentFrontmatter>(content);
  const description = getRequiredText(frontmatter.description, "description");
  const model = getRequiredText(frontmatter.model, "model");

  if (!isThinkingLevel(frontmatter.thinking)) {
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
    description,
    model,
    thinking: frontmatter.thinking,
    tools,
    filePath,
  };
}

function findFrontmatterEnd(lines: string[]): number {
  if (lines[0] !== "---") {
    throw new Error("agent file must begin with YAML frontmatter");
  }

  const end = lines.indexOf("---", 1);
  if (end === -1) {
    throw new Error("agent file has unterminated YAML frontmatter");
  }
  return end;
}

function replaceFrontmatterField(
  lines: string[],
  frontmatterEnd: number,
  field: string,
  value: string,
): void {
  const pattern = new RegExp(`^${field}\\s*:`);
  const matches: number[] = [];
  for (let index = 1; index < frontmatterEnd; index++) {
    if (pattern.test(lines[index])) matches.push(index);
  }

  if (matches.length !== 1) {
    throw new Error(`agent frontmatter must contain exactly one ${field} field`);
  }

  lines[matches[0]] = `${field}: ${value}`;
}

export async function saveAgentAssignment(
  filePath: string,
  assignment: AgentAssignment,
): Promise<void> {
  await withFileMutationQueue(filePath, async () => {
    const content = await fs.promises.readFile(filePath, "utf8");
    const newline = content.includes("\r\n") ? "\r\n" : "\n";
    const lines = content.split(/\r?\n/);
    const frontmatterEnd = findFrontmatterEnd(lines);

    replaceFrontmatterField(
      lines,
      frontmatterEnd,
      "model",
      assignment.model,
    );
    replaceFrontmatterField(
      lines,
      frontmatterEnd,
      "thinking",
      assignment.thinking,
    );
    await fs.promises.writeFile(filePath, lines.join(newline), "utf8");
  });
}

export function formatAgentConfigErrors(
  errors: readonly AgentConfigError[],
): string | undefined {
  if (errors.length === 0) return undefined;
  return errors
    .map((error) => `${path.basename(error.filePath)}: ${error.message}`)
    .join("\n");
}

function isAgentFile(entry: fs.Dirent): boolean {
  return entry.name.endsWith(".md")
    && (entry.isFile() || entry.isSymbolicLink());
}

export function discoverAgents(
  agentsDir: string = AGENTS_DIR,
): AgentDiscoveryResult {
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
    if (!isAgentFile(entry)) continue;

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
