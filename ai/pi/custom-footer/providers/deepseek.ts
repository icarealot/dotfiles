import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { AccountBalance, ProviderUsage, UsageProvider } from "../types.js";

const DEEPSEEK_PROVIDER = "deepseek";
const DEEPSEEK_BALANCE_URL = "https://api.deepseek.com/user/balance";
const REQUEST_TIMEOUT_MS = 10_000;

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getBalanceAmount(value: unknown): number | undefined {
    if (typeof value !== "number" && typeof value !== "string") {
        return undefined;
    }

    if (typeof value === "string" && value.trim().length === 0) {
        return undefined;
    }

    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
}

function parseBalanceInfo(value: unknown): AccountBalance | undefined {
    if (!isObject(value)) {
        return undefined;
    }

    const currency = value.currency;
    const total = getBalanceAmount(value.total_balance);
    if (
        typeof currency !== "string" ||
        currency.length === 0 ||
        total === undefined
    ) {
        return undefined;
    }

    return {
        currency: currency.toUpperCase(),
        total,
    };
}

function parseBalanceResponse(value: unknown): ProviderUsage {
    if (!isObject(value) || !Array.isArray(value.balance_infos)) {
        return {};
    }

    const balances = value.balance_infos
        .map(parseBalanceInfo)
        .filter((balance): balance is AccountBalance => balance !== undefined);

    return balances.length > 0 ? { balances } : {};
}

async function fetchUsage(ctx: ExtensionContext): Promise<ProviderUsage> {
    const auth = await ctx.modelRegistry.getProviderAuth(DEEPSEEK_PROVIDER);
    const apiKey = auth?.auth.apiKey;
    if (!apiKey) throw new Error("DeepSeek API key is unavailable");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(DEEPSEEK_BALANCE_URL, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(
                `DeepSeek balance request failed with HTTP ${response.status}`,
            );
        }

        return parseBalanceResponse(await response.json());
    } finally {
        clearTimeout(timeout);
    }
}

export const deepseekUsageProvider: UsageProvider = {
    provider: DEEPSEEK_PROVIDER,
    details: "account-balance",
    fetchUsage,
};
