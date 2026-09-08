import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { codexUsageProvider } from "./codex.js";
import { deepseekUsageProvider } from "./deepseek.js";
import type { AccountBalance, ProviderUsage, UsageProvider, UsageWindow } from "./types.js";

const usageProviders: UsageProvider[] = [codexUsageProvider, deepseekUsageProvider];

function formatReset(window: UsageWindow): string {
  if (window.resetsAt === undefined) {
    return "";
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilReset = window.resetsAt - now;
  if (secondsUntilReset <= 0) {
    return "";
  }

  const days = Math.floor(secondsUntilReset / 86_400);
  const hours = Math.floor((secondsUntilReset % 86_400) / 3_600);
  const minutes = Math.floor((secondsUntilReset % 3_600) / 60);
  const windowMinutes = window.windowMinutes ?? 0;

  if (windowMinutes >= 24 * 60) {
    if (days > 0) {
      return ` (~${days}d${hours}h)`;
    }
    return ` (~${hours}h)`;
  }

  const totalHours = Math.floor(secondsUntilReset / 3_600);
  return ` (~${totalHours}h${minutes}m)`;
}

function formatUsageWindow(window: UsageWindow | undefined): string {
  if (window === undefined) {
    return "N/A";
  }

  const percentage = Math.round(window.usedPercent);
  return `${percentage}%${formatReset(window)}`;
}

function formatTokenCount(tokens: number): string {
  if (tokens < 1_000) {
    return `${tokens}`;
  }

  if (tokens < 1_000_000) {
    const thousands = tokens / 1_000;
    if (thousands < 10) {
      return `${Number(thousands.toFixed(1))}k`;
    }
    return `${Math.round(thousands)}k`;
  }

  const millions = tokens / 1_000_000;
  if (millions < 10) {
    return `${Number(millions.toFixed(1))}M`;
  }
  return `${Math.round(millions)}M`;
}

function formatContextUsed(ctx: ExtensionContext): string {
  const usage = ctx.getContextUsage();
  const contextWindow = usage?.contextWindow ?? ctx.model?.contextWindow;

  if (contextWindow === undefined || contextWindow <= 0) {
    return "N/A";
  }

  const maximum = formatTokenCount(contextWindow);
  if (usage === undefined || usage.tokens === undefined || usage.tokens === null) {
    return `N/A/${maximum}`;
  }

  const usedPercent = (usage.tokens / contextWindow) * 100;
  const percentage = Math.round(Math.max(0, Math.min(100, usedPercent)));
  return `${percentage}%/${maximum}`;
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

function getPreferredBalance(
  balances: AccountBalance[] | undefined,
): AccountBalance | undefined {
  return balances?.find((balance) => balance.currency === "USD")
    ?? balances?.find((balance) => balance.currency === "CNY");
}

function formatAccountBalance(balances: AccountBalance[] | undefined): string {
  const balance = getPreferredBalance(balances);
  if (balance === undefined) {
    return "N/A";
  }

  const symbol = balance.currency === "USD" ? "$" : "¥";
  return `${symbol}${balance.total.toFixed(2)}`;
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
  let active = true;

  async function refreshUsage(
    ctx: ExtensionContext,
    clearCurrent = false,
  ): Promise<void> {
    const version = ++refreshVersion;

    if (clearCurrent) {
      providerUsage = undefined;
    }

    if (requestRender !== undefined) {
      requestRender();
    }

    const usageProvider = usageProviders.find(
      (provider) => provider.provider === ctx.model?.provider,
    );
    if (usageProvider === undefined) {
      providerUsage = undefined;
      return;
    }

    try {
      const usage = await usageProvider.fetchUsage(ctx);
      if (!active || version !== refreshVersion) return;
      providerUsage = usage;
    } catch {
      if (!active || version !== refreshVersion) return;
      providerUsage = undefined;
    }

    if (requestRender !== undefined) {
      requestRender();
    }
  }

  pi.on("session_start", (_event, ctx) => {
    ctx.ui.setFooter((tui) => {
      requestRender = () => tui.requestRender();

      return {
        dispose() {
          requestRender = undefined;
        },
        invalidate() { },
        render(_width: number): string[] {
          const model = ctx.model;
          const modelName = model?.id || "no-model";
          const providerName = model?.provider ?? "no-provider";
          const thinkingLevel = ctx.thinkingLevel ?? "N/A";
          const modeNameWithThinkingLevel = `${modelName} (${thinkingLevel})`;
          const contextUsed = formatContextUsed(ctx);
          const usageProvider = usageProviders.find(
            (provider) => provider.provider === providerName,
          );
          const providerDetails = formatProviderDetails(
            ctx,
            usageProvider,
            providerUsage,
          );

          const footerText = [
            providerName,
            modeNameWithThinkingLevel,
            contextUsed,
            ...providerDetails,
          ].join(" | ");

          return [footerText];
        },
      };
    });

    void refreshUsage(ctx, true);
  });

  pi.on("message_end", (event, ctx) => {
    if (event.message.role === "assistant") void refreshUsage(ctx);
  });

  pi.on("model_select", (_event, ctx) => {
    void refreshUsage(ctx, true);
  });

  pi.on("thinking_level_select", () => {
    if (requestRender !== undefined) {
      requestRender();
    }
  });

  pi.on("session_shutdown", () => {
    active = false;
    refreshVersion++;
    requestRender = undefined;
  });
}
