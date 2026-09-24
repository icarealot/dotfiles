import type {
    ExtensionAPI,
    ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { codexUsageProvider } from "./providers/codex.js";
import { deepseekUsageProvider } from "./providers/deepseek.js";
import type {
    AccountBalance,
    ProviderUsage,
    UsageProvider,
    UsageWindow,
} from "./types.js";

const usageProviders: UsageProvider[] = [
    codexUsageProvider,
    deepseekUsageProvider,
];

function getUsageProvider(provider?: string): UsageProvider | undefined {
    return usageProviders.find((candidate) => candidate.provider === provider);
}

function formatReset(window: UsageWindow): string {
    if (window.resetsAt === undefined) {
        return "";
    }

    const secondsUntilReset = window.resetsAt - Math.floor(Date.now() / 1000);
    if (secondsUntilReset <= 0) {
        return "";
    }

    const days = Math.floor(secondsUntilReset / 86_400);
    const hours = Math.floor((secondsUntilReset % 86_400) / 3_600);
    const minutes = Math.floor((secondsUntilReset % 3_600) / 60);

    if ((window.windowMinutes ?? 0) >= 24 * 60) {
        return days > 0 ? ` (~${days}d${hours}h)` : ` (~${hours}h)`;
    }

    return ` (~${Math.floor(secondsUntilReset / 3_600)}h${minutes}m)`;
}

function formatUsageWindow(window: UsageWindow | undefined): string {
    if (window === undefined) {
        return "N/A";
    }

    return `${Math.round(window.usedPercent)}%${formatReset(window)}`;
}

function formatTokenCount(tokens: number): string {
    if (tokens < 1_000) {
        return `${tokens}`;
    }

    if (tokens < 1_000_000) {
        const thousands = tokens / 1_000;
        return thousands < 10
            ? `${Number(thousands.toFixed(1))}k`
            : `${Math.round(thousands)}k`;
    }

    const millions = tokens / 1_000_000;
    return millions < 10
        ? `${Number(millions.toFixed(1))}M`
        : `${Math.round(millions)}M`;
}

function formatContextUsed(ctx: ExtensionContext): string {
    const usage = ctx.getContextUsage();
    const contextWindow = usage?.contextWindow ?? ctx.model?.contextWindow;

    if (contextWindow === undefined || contextWindow <= 0 || usage?.tokens == null) {
        return "N/A";
    }

    const usedPercent = (usage.tokens / contextWindow) * 100;
    const percentage = Math.round(Math.max(0, Math.min(100, usedPercent)));
    return `${percentage}%/${formatTokenCount(contextWindow)}`;
}

function formatSessionSpend(ctx: ExtensionContext, provider: string): string {
    let cost = 0;

    for (const entry of ctx.sessionManager.getEntries()) {
        if (
            entry.type === "message" &&
            entry.message.role === "assistant" &&
            entry.message.provider === provider &&
            Number.isFinite(entry.message.usage.cost.total)
        ) {
            cost += entry.message.usage.cost.total;
        }
    }

    return `$${cost.toFixed(2)}`;
}

function formatAccountBalance(balances: AccountBalance[] | undefined): string {
    const balance = balances?.find(({ currency }) => currency === "USD");
    return balance === undefined ? "N/A" : `$${balance.total.toFixed(2)}`;
}

function formatProviderDetails(
    ctx: ExtensionContext,
    provider: UsageProvider | undefined,
    usage: ProviderUsage | undefined,
): string[] {
    if (provider?.details === "account-balance") {
        return [
            formatSessionSpend(ctx, provider.provider),
            formatAccountBalance(usage?.balances),
        ];
    }

    return [
        formatUsageWindow(usage?.primary),
        formatUsageWindow(usage?.secondary),
    ];
}

export default function customFooter(pi: ExtensionAPI): void {
    let providerUsage: ProviderUsage | undefined;
    let requestRender: (() => void) | undefined;
    let refreshVersion = 0;

    async function refreshUsage(
        ctx: ExtensionContext,
        clearCurrent = false,
    ): Promise<void> {
        const version = ++refreshVersion;

        if (clearCurrent) {
            providerUsage = undefined;
        }
        requestRender?.();

        const usageProvider = getUsageProvider(ctx.model?.provider);
        if (usageProvider === undefined) {
            providerUsage = undefined;
            return;
        }

        let usage: ProviderUsage | undefined;
        try {
            usage = await usageProvider.fetchUsage(ctx);
        } catch {
            usage = undefined;
        }

        if (version !== refreshVersion) {
            return;
        }

        providerUsage = usage;
        requestRender?.();
    }

    pi.on("session_start", (_event, ctx) => {
        ctx.ui.setFooter((tui) => {
            requestRender = () => tui.requestRender();

            return {
                dispose() {
                    requestRender = undefined;
                },
                invalidate() {},
                render(_width: number): string[] {
                    const model = ctx.model;
                    const modelName = model?.id ?? "no-model";
                    const providerName = model?.provider ?? "no-provider";
                    const thinkingLevel = ctx.thinkingLevel ?? "N/A";
                    const modelIdentity = `${providerName}/${modelName} (${thinkingLevel})`;
                    const providerDetails = formatProviderDetails(
                        ctx,
                        getUsageProvider(providerName),
                        providerUsage,
                    );

                    return [
                        [
                            modelIdentity,
                            formatContextUsed(ctx),
                            ...providerDetails,
                        ].join(" | "),
                    ];
                },
            };
        });

        void refreshUsage(ctx, true);
    });

    pi.on("message_end", (event, ctx) => {
        if (event.message.role === "assistant") {
            void refreshUsage(ctx);
        }
    });

    pi.on("model_select", (_event, ctx) => {
        void refreshUsage(ctx, true);
    });

    pi.on("thinking_level_select", () => requestRender?.());

    pi.on("session_shutdown", () => {
        refreshVersion++;
        requestRender = undefined;
    });
}
