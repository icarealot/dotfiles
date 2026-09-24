import { Buffer } from "node:buffer";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { fetchJson, isRecord } from "../helpers.js";
import type { ProviderUsage, UsageProvider, UsageWindow } from "../types.js";

const CODEX_PROVIDER = "openai-codex";
const CODEX_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const OPENAI_AUTH_CLAIM = "https://api.openai.com/auth";

function getNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value)
        ? value
        : undefined;
}

function parseUsageWindow(value: unknown): UsageWindow | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const usedPercent = getNumber(value.used_percent);
    if (usedPercent === undefined) {
        return undefined;
    }

    const usageWindow: UsageWindow = { usedPercent };
    const windowSeconds = getNumber(value.limit_window_seconds);
    const resetsAt = getNumber(value.reset_at);

    if (windowSeconds !== undefined) {
        usageWindow.windowMinutes = windowSeconds / 60;
    }
    if (resetsAt !== undefined) {
        usageWindow.resetsAt = resetsAt;
    }

    return usageWindow;
}

function parseUsageResponse(value: unknown): ProviderUsage {
    const rateLimit =
        isRecord(value) && isRecord(value.rate_limit)
            ? value.rate_limit
            : undefined;

    if (rateLimit === undefined) {
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
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) {
        return undefined;
    }

    try {
        const payload: unknown = JSON.parse(
            Buffer.from(payloadPart, "base64url").toString("utf8"),
        );
        const auth = isRecord(payload) ? payload[OPENAI_AUTH_CLAIM] : undefined;
        const accountId = isRecord(auth) ? auth.chatgpt_account_id : undefined;

        return typeof accountId === "string" && accountId.length > 0
            ? accountId
            : undefined;
    } catch {
        return undefined;
    }
}

async function fetchUsage(ctx: ExtensionContext): Promise<ProviderUsage> {
    const accessToken = (
        await ctx.modelRegistry.getProviderAuth(CODEX_PROVIDER)
    )?.auth.apiKey;
    if (!accessToken) {
        throw new Error("OpenAI Codex OAuth is unavailable");
    }

    const accountId = getAccountId(accessToken);
    if (!accountId) {
        throw new Error("OpenAI Codex account ID is unavailable");
    }

    return parseUsageResponse(
        await fetchJson(CODEX_USAGE_URL, {
            Authorization: `Bearer ${accessToken}`,
            "chatgpt-account-id": accountId,
            originator: "pi",
        }),
    );
}

export const codexUsageProvider: UsageProvider = {
    provider: CODEX_PROVIDER,
    details: "usage-windows",
    fetchUsage,
};
