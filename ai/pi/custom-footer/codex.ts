import { Buffer } from "node:buffer";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ProviderUsage, UsageProvider, UsageWindow } from "./types.js";

const CODEX_PROVIDER = "openai-codex";
const CODEX_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const OPENAI_AUTH_CLAIM = "https://api.openai.com/auth";
const REQUEST_TIMEOUT_MS = 10_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value !== "number") {
    return undefined;
  }

  if (!Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

function parseUsageWindow(value: unknown): UsageWindow | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  const usedPercent = getNumber(value.used_percent);
  if (usedPercent === undefined) {
    return undefined;
  }

  const windowSeconds = getNumber(value.limit_window_seconds);
  const resetsAt = getNumber(value.reset_at);
  const usageWindow: UsageWindow = {
    usedPercent,
  };

  if (windowSeconds !== undefined) {
    usageWindow.windowMinutes = windowSeconds / 60;
  }

  if (resetsAt !== undefined) {
    usageWindow.resetsAt = resetsAt;
  }

  return usageWindow;
}

function parseUsageResponse(value: unknown): ProviderUsage {
  if (!isObject(value)) {
    return {};
  }

  const rateLimit = value.rate_limit;
  if (!isObject(rateLimit)) {
    return {};
  }

  const usage: ProviderUsage = {};
  const primary = parseUsageWindow(rateLimit.primary_window);
  const secondary = parseUsageWindow(rateLimit.secondary_window);

  if (primary !== undefined) {
    usage.primary = primary;
  }

  if (secondary !== undefined) {
    usage.secondary = secondary;
  }

  return usage;
}

function getAccountId(accessToken: string): string | undefined {
  try {
    const tokenParts = accessToken.split(".");
    const payloadPart = tokenParts[1];
    if (payloadPart === undefined) {
      return undefined;
    }

    const payloadText = Buffer.from(payloadPart, "base64url").toString("utf8");
    const payload: unknown = JSON.parse(payloadText);
    if (!isObject(payload)) {
      return undefined;
    }

    const auth = payload[OPENAI_AUTH_CLAIM];
    if (!isObject(auth)) {
      return undefined;
    }

    const accountId = auth.chatgpt_account_id;
    if (typeof accountId !== "string" || accountId.length === 0) {
      return undefined;
    }

    return accountId;
  } catch {
    return undefined;
  }
}

async function fetchUsage(ctx: ExtensionContext): Promise<ProviderUsage> {
  const auth = await ctx.modelRegistry.getProviderAuth(CODEX_PROVIDER);
  const accessToken = auth?.auth.apiKey;
  if (!accessToken) throw new Error("OpenAI Codex OAuth is unavailable");

  const accountId = getAccountId(accessToken);
  if (!accountId) throw new Error("OpenAI Codex account ID is unavailable");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(CODEX_USAGE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "chatgpt-account-id": accountId,
        originator: "pi",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Codex usage request failed with HTTP ${response.status}`);
    }

    return parseUsageResponse(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

export const codexUsageProvider: UsageProvider = {
  provider: CODEX_PROVIDER,
  fetchUsage,
};
