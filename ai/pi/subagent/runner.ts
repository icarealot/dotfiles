/** Child Pi process execution, event parsing, cancellation, and diagnostics. */

import { spawn, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import { createInterface } from "node:readline";
import { Transform, type Readable } from "node:stream";
import type { AgentConfig } from "./agents.js";

const MAX_OUTPUT_BYTES = 50 * 1024;
const MAX_ACTIVITY_ENTRIES = 100;
const MAX_ACTIVITY_ARGUMENT_LENGTH = 500;
const MAX_PROGRESS_TEXT_LENGTH = 160;

/**
 * Child Pi protocol:
 * - The task is sent through stdin.
 * - Pi writes newline-delimited JSON events to stdout.
 * - The final response is the last textual assistant message_end event.
 * - The response or failure diagnostic is limited to 50 KiB.
 */

interface MessagePart {
  type: string;
  text?: string;
  name?: string;
  arguments?: unknown;
}

export type AgentActivity =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; args: Record<string, unknown> };

export interface AgentProgress {
  activities: AgentActivity[];
  omittedActivityCount: number;
}

export interface AgentRunResult extends AgentProgress {
  finalOutput: string;
}

interface ChildMessage {
  role: string;
  content?: MessagePart[];
  stopReason?: string;
  errorMessage?: string;
}

interface ChildEvent {
  type: string;
  message?: ChildMessage;
}

interface PiCommand {
  command: string;
  args: string[];
}

interface ChildResult extends AgentRunResult {
  exitCode: number;
  stderr: string;
  stopReason?: string;
  errorMessage?: string;
  spawnError?: Error;
  aborted: boolean;
}

type ProgressCallback = (progress: AgentProgress) => void;

function extractMessageText(message: ChildMessage): string {
  return (message.content ?? [])
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function truncateProgressText(text: string): string {
  const characters = Array.from(text);
  if (characters.length <= MAX_PROGRESS_TEXT_LENGTH) return text;
  return `${characters.slice(0, MAX_PROGRESS_TEXT_LENGTH - 1).join("")}…`;
}

function getProgressText(text: string): string | undefined {
  const firstLine = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return firstLine ? truncateProgressText(firstLine) : undefined;
}

function truncateActivityArgument(value: string): string {
  const characters = Array.from(value);
  if (characters.length <= MAX_ACTIVITY_ARGUMENT_LENGTH) return value;
  return `${characters.slice(0, MAX_ACTIVITY_ARGUMENT_LENGTH - 1).join("")}…`;
}

function getActivityStringArg(
  args: Record<string, unknown>,
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const value = args[name];
    if (typeof value === "string" && value.length > 0) {
      return truncateActivityArgument(value);
    }
  }
  return undefined;
}

function sanitizeToolArguments(
  toolName: string,
  value: unknown,
): Record<string, unknown> {
  const args = value !== null && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
  const path = getActivityStringArg(args, "path", "file_path");

  switch (toolName) {
    case "bash":
    case "powershell":
      return { command: getActivityStringArg(args, "command") };
    case "read":
    case "write":
    case "edit":
    case "ls":
      return { path };
    case "grep":
    case "find":
      return {
        path,
        pattern: getActivityStringArg(args, "pattern"),
      };
    default:
      return {
        preview: truncateActivityArgument(JSON.stringify(args) ?? ""),
      };
  }
}

function getMessageActivities(message: ChildMessage): AgentActivity[] {
  const parts = message.content ?? [];
  const hasToolCall = parts.some((part) => part.type === "toolCall");
  const activities: AgentActivity[] = [];

  for (const part of parts) {
    if (part.type === "text" && part.text && hasToolCall) {
      const text = getProgressText(part.text);
      if (text) activities.push({ type: "text", text });
      continue;
    }

    if (part.type === "toolCall" && part.name) {
      activities.push({
        type: "tool",
        name: part.name,
        args: sanitizeToolArguments(part.name, part.arguments),
      });
    }
  }

  return activities;
}

function appendActivities(
  result: ChildResult,
  activities: AgentActivity[],
): void {
  result.activities.push(...activities);
  const excess = result.activities.length - MAX_ACTIVITY_ENTRIES;
  if (excess > 0) {
    result.activities.splice(0, excess);
    result.omittedActivityCount += excess;
  }
}

function emitProgress(
  result: ChildResult,
  onProgress: ProgressCallback | undefined,
): void {
  onProgress?.({
    activities: [...result.activities],
    omittedActivityCount: result.omittedActivityCount,
  });
}

export function truncateText(text: string, suffix: string): string {
  const bytes = Buffer.from(text, "utf8");
  if (bytes.length <= MAX_OUTPUT_BYTES) return text;

  let end = MAX_OUTPUT_BYTES - Buffer.byteLength(suffix, "utf8");
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) end--;

  return `${bytes.subarray(0, end).toString("utf8")}${suffix}`;
}

function resolvePiCommand(args: string[]): PiCommand {
  // Reuse the script that started the parent Pi when possible.
  const piScript = process.argv[1];
  if (piScript && fs.existsSync(piScript)) {
    return { command: process.execPath, args: [piScript, ...args] };
  }
  return { command: "pi", args };
}

function buildChildCommand(agent: AgentConfig, projectTrusted: boolean): PiCommand {
  const args = [
    "--mode", "json",
    "-p",
    "--no-session",
    "--no-extensions",
    projectTrusted ? "--approve" : "--no-approve",
    "--model", agent.model,
    "--thinking", agent.thinking,
    "--tools", agent.tools.join(","),
    "--",
  ];

  return resolvePiCommand(args);
}

function terminateChildProcess(child: ChildProcess): void {
  if (!child.pid) return;

  if (process.platform === "win32") {
    const killer = spawn(
      "taskkill",
      ["/pid", String(child.pid), "/T", "/F"],
      { stdio: "ignore", windowsHide: true },
    );
    killer.on("error", () => {});
  } else {
    child.kill("SIGTERM");
  }
}

function createOutputLineReader(stdout: Readable) {
  // readline does not emit a final line without a newline; add one at EOF.
  let lastByte: number | undefined;
  const lineInput = new Transform({
    transform(chunk, _encoding, callback) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (bytes.length > 0) lastByte = bytes[bytes.length - 1];
      callback(null, bytes);
    },
    flush(callback) {
      if (lastByte !== undefined && lastByte !== 10 && lastByte !== 13) {
        this.push("\n");
      }
      callback();
    },
  });

  stdout.pipe(lineInput);
  return createInterface({ input: lineInput, crlfDelay: Infinity });
}

function handleChildLine(
  line: string,
  result: ChildResult,
  onProgress: ProgressCallback | undefined,
): void {
  if (!line.trim()) return;

  let event: ChildEvent;
  try {
    event = JSON.parse(line) as ChildEvent;
  } catch {
    // Ignore non-JSON lines; the child may have written incidental output.
    return;
  }

  if (event.type !== "message_end" || event.message?.role !== "assistant") {
    return;
  }

  const text = extractMessageText(event.message);
  if (text) result.finalOutput = text;
  result.stopReason = event.message.stopReason;
  result.errorMessage = event.message.errorMessage;

  const activities = getMessageActivities(event.message);
  if (activities.length > 0) {
    appendActivities(result, activities);
    emitProgress(result, onProgress);
  }
}

async function executeChildProcess(
  command: PiCommand,
  task: string,
  cwd: string,
  signal: AbortSignal | undefined,
  onProgress: ProgressCallback | undefined,
): Promise<ChildResult> {
  return new Promise<ChildResult>((resolve) => {
    const result: ChildResult = {
      exitCode: 0,
      finalOutput: "",
      activities: [],
      omittedActivityCount: 0,
      stderr: "",
      aborted: false,
    };

    const child = spawn(command.command, command.args, {
      cwd,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const outputLines = child.stdout
      ? createOutputLineReader(child.stdout)
      : undefined;
    outputLines?.on("line", (line) => {
      handleChildLine(line, result, onProgress);
    });

    child.stderr?.on("data", (data: Buffer) => {
      result.stderr += data.toString("utf8");
    });

    child.on("error", (error) => {
      result.spawnError = error;
    });

    const abort = (): void => {
      result.aborted = true;
      terminateChildProcess(child);
    };

    child.on("close", (code) => {
      outputLines?.close();
      signal?.removeEventListener("abort", abort);
      result.exitCode = code ?? (result.spawnError ? 1 : 0);
      resolve(result);
    });

    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });

    child.stdin?.on("error", () => {});
    child.stdin?.end(task);
  });
}

function getFailureReason(result: ChildResult): string {
  return result.errorMessage
    || result.stderr.trim()
    || result.finalOutput
    || result.spawnError?.message
    || `child process exited with code ${result.exitCode}`;
}

function throwIfChildFailed(agent: AgentConfig, result: ChildResult): void {
  if (result.aborted) {
    throw new Error(`Subagent ${agent.name} was aborted.`);
  }

  if (
    result.exitCode === 0
    && !result.spawnError
    && result.stopReason !== "error"
    && result.stopReason !== "aborted"
  ) {
    return;
  }

  const diagnostic = truncateText(
    getFailureReason(result),
    "\n\n[Failure diagnostic truncated.]",
  );
  throw new Error(`Subagent ${agent.name} failed: ${diagnostic}`);
}

/** Start one child Pi process and return its final response and activity history. */
export async function runAgent(
  agent: AgentConfig,
  task: string,
  cwd: string,
  projectTrusted: boolean,
  signal: AbortSignal | undefined,
  onProgress?: ProgressCallback,
): Promise<AgentRunResult> {
  const command = buildChildCommand(agent, projectTrusted);
  const result = await executeChildProcess(
    command,
    task,
    cwd,
    signal,
    onProgress,
  );

  throwIfChildFailed(agent, result);
  return {
    finalOutput: result.finalOutput,
    activities: [...result.activities],
    omittedActivityCount: result.omittedActivityCount,
  };
}
