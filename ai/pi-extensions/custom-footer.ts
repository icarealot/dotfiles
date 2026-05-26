/**
 * Footer Pipes Extension
 *
 * Replaces the built-in footer with "|" separators between elements for better readability.
 * Auto-enabled on every session start.
 *
 * Install: already placed in ~/.pi/agent/extensions/footer-pipes/index.ts
 * Run `/reload` in pi to activate.
 */

import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

// Track thinking level manually since ctx.getThinkingLevel() may not be available
let currentThinkingLevel = "off";

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
}

function applyCustomFooter(ctx: ExtensionContext) {
  ctx.ui.setFooter((_tui, theme, footerData) => {
    return {
      invalidate() { },
      dispose() { },
      render(width: number): string[] {
        // --- Compute total cost ---
        let totalCost = 0;
        for (const entry of ctx.sessionManager.getBranch()) {
          if (entry.type === "message" && entry.message.role === "assistant") {
            const m = entry.message as AssistantMessage;
            totalCost += m.usage.cost.total;
          }
        }

        // Build stats parts
        const statsParts: string[] = [];

        // Context usage + total cost
        const contextUsage = ctx.getContextUsage();
        const percent = contextUsage?.percent ?? null;

        // Format context window size (e.g., 200k, 1M)
        const fmtContext = (n: number) =>
            n >= 1000000
                ? `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`
                : n >= 1000
                    ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
                    : `${n}`;

        const contextWindow = ctx.model?.contextWindow ?? contextUsage?.total ?? 0;
        const percentDisplay = percent !== null ? `${percent.toFixed(1)}%` : '0%';
        statsParts.push(`${percentDisplay}/${fmtContext(contextWindow)}`);
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