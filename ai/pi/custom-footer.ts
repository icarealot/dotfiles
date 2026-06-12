import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

// Track thinking level manually since ctx.getThinkingLevel() may not be available
let currentThinkingLevel = "off";

// Module-level render trigger for session updates
let requestRender: (() => void) | null = null;

function triggerRender() {
  requestRender?.();
}

export default function (pi: ExtensionAPI) {
  // Auto-enable on session start
  pi.on("session_start", async (_event, ctx) => {
    currentThinkingLevel = pi.getThinkingLevel?.() ?? "off";
    applyCustomFooter(ctx);
  });

  // Track thinking level changes
  pi.on("thinking_level_select", async (event) => {
    currentThinkingLevel = event.level;
  });

  // Trigger footer re-render on session changes
  pi.on("agent_end", async () => {
    triggerRender();
  });

  pi.on("message_end", async (event) => {
    // Only for assistant messages (new tokens added)
    if (event.message.role === "assistant") {
      triggerRender();
    }
  });
}

function applyCustomFooter(ctx: ExtensionContext) {
  ctx.ui.setFooter((tui, theme, footerData) => {
    // Register render trigger
    requestRender = () => tui.requestRender();

    return {
      invalidate() {
        // Trigger re-render on next frame
        tui.requestRender();
      },
      dispose() {
        requestRender = null;
      },
      render(width: number): string[] {
        // --- Compute total cost from ALL entries (handles compaction correctly) ---
        let totalCost = 0;
        for (const entry of ctx.sessionManager.getEntries()) {
          if (entry.type === "message" && entry.message.role === "assistant") {
            const m = entry.message as AssistantMessage;
            totalCost += m.usage.cost.total;
          }
        }

        // Build stats parts
        const statsParts: string[] = [];

        // Context usage
        const contextUsage = ctx.getContextUsage();
        const contextWindow = contextUsage?.contextWindow ?? ctx.model?.contextWindow ?? 0;
        const contextPercent = contextUsage?.percent;

        // Format token counts for compact display
        const fmtTokens = (n: number) =>
          n < 1000
            ? `${n}`
            : n < 10000
              ? `${(n / 1000).toFixed(1)}k`
              : n < 1000000
                ? `${Math.round(n / 1000)}k`
                : `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;

        // Show context usage (tokens/limit)
        const contextTokens = contextUsage?.tokens ?? null;
        const contextDisplay = contextTokens !== null
          ? `${fmtTokens(contextTokens)}/${fmtTokens(contextWindow)}`
          : `?/${fmtTokens(contextWindow)}`;
        statsParts.push(contextDisplay);

        // Show cost (always show, even $0.000 at start)
        statsParts.push(`$${totalCost.toFixed(2)}`);

        // Model name with thinking level: "big-pickle(medium)" or "big-pickle"
        const modelName = ctx.model?.id || "no-model";
        const displayModel = currentThinkingLevel && currentThinkingLevel !== "off"
          ? `${modelName} (${currentThinkingLevel})`
          : modelName;

        // --- Build line: model (left)  stats (right) ---
        const statsLine = statsParts.join(" | ");
        const statsWidth = visibleWidth(statsLine);
        const modelWidth = visibleWidth(displayModel);

        let line: string;
        if (statsWidth + modelWidth <= width) {
          line = theme.fg("accent", displayModel) + " | " + statsLine;
        } else {
          line = statsLine;
        }

        // --- Build output ---
        const lines: string[] = [];

        // Line 1: stats + model (right-aligned)
        lines.push(theme.fg("dim", line));

        // Line 2: extension statuses with | separator
        const extensionStatuses = footerData.getExtensionStatuses();
        if (extensionStatuses.size > 0) {
          const sorted = Array.from(extensionStatuses.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, text]) => text.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim());
          const statusLine = sorted.join(" | ");
          lines.push(truncateToWidth(theme.fg("dim", statusLine), width, "..."));
        }

        return lines;
      },
    };
  });
}