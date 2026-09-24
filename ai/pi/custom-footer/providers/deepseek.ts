import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { fetchJson, isRecord } from "../helpers.js";
import type { AccountBalance, ProviderUsage, UsageProvider } from "../types.js";

const DEEPSEEK_PROVIDER = "deepseek";
const DEEPSEEK_BALANCE_URL = "https://api.deepseek.com/user/balance";

function getBalanceAmount(value: unknown): number | undefined {
    if (typeof value !== "number" && typeof value !== "string") {
        return undefined;
    }
    if (typeof value === "string" && value.trim() === "") {
        return undefined;
    }

    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
}

function parseBalanceInfo(value: unknown): AccountBalance | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const currency = value.currency;
    const total = getBalanceAmount(value.total_balance);
    return typeof currency === "string" && currency.length > 0 && total !== undefined
        ? { currency: currency.toUpperCase(), total }
        : undefined;
}

function parseBalanceResponse(value: unknown): ProviderUsage {
    const balanceInfos =
        isRecord(value) && Array.isArray(value.balance_infos)
            ? value.balance_infos
            : [];
    const balances = balanceInfos
        .map(parseBalanceInfo)
        .filter((balance): balance is AccountBalance => balance !== undefined);

    return balances.length > 0 ? { balances } : {};
}

async function fetchUsage(ctx: ExtensionContext): Promise<ProviderUsage> {
    const apiKey = (
        await ctx.modelRegistry.getProviderAuth(DEEPSEEK_PROVIDER)
    )?.auth.apiKey;
    if (!apiKey) {
        throw new Error("DeepSeek API key is unavailable");
    }

    return parseBalanceResponse(
        await fetchJson(DEEPSEEK_BALANCE_URL, {
            Authorization: `Bearer ${apiKey}`,
        }),
    );
}

export const deepseekUsageProvider: UsageProvider = {
    provider: DEEPSEEK_PROVIDER,
    details: "account-balance",
    fetchUsage,
};
