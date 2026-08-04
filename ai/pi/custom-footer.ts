import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

// Track thinking level manually since ctx.getThinkingLevel() may not be available
let currentThinkingLevel = "off";

// Track permission mode from permissions extension
let currentPermissionMode: string | null = null;

// Module-level render trigger for session updates
let requestRender: (() => void) | null = null;

function triggerRender() {
  requestRender?.();
}

export default function (pi: ExtensionAPI) {
  // Auto-enable on session start
  pi.on("session_start", async (_event, ctx) => {
    currentThinkingLevel = pi.getThinkingLevel?.() ?? "off";
    currentPermissionMode = null; // Reset, only show if permission extension sets it
    applyCustomFooter(ctx);
  });

  // Track thinking level changes
  pi.on("thinking_level_select", async (event) => {
    currentThinkingLevel = event.level;
  });

  // Track permission mode changes
  pi.events.on("mode:change", (mode) => {
    currentPermissionMode = mode as string;
    triggerRender();
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
  ctx.ui.setFooter((tui, _theme, footerData) => {
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

        // Show available context percentage (remaining % free)
        const contextTokens = contextUsage?.tokens ?? null;
        const availPct = contextTokens !== null && contextWindow > 0
          ? Math.round((1 - contextTokens / contextWindow) * 100)
          : null;
        statsParts.push(availPct !== null ? `${availPct}%` : `?`);

        // Show cost (always show, even $0.000 at start)
        statsParts.push(`$${totalCost.toFixed(2)}`);

        // Model name with thinking level: "big-pickle | high" or "big-pickle"
        const modelName = ctx.model?.id || "no-model";
        let displayModel = modelName;
        if (currentThinkingLevel && currentThinkingLevel !== "off") {
          displayModel += ` | ${currentThinkingLevel}`;
        }
        // Mode suffix (default terminal color, right after model)
        const modeSuffix = currentPermissionMode ? ` | ${currentPermissionMode}` : "";

        // --- Build line: model (left)  stats (right) ---
        const statsLine = statsParts.join(" | ");
        const statsWidth = visibleWidth(statsLine);
        const modelWidth = visibleWidth(displayModel) + visibleWidth(modeSuffix);

        let line: string;
        if (statsWidth + modelWidth <= width) {
          line = displayModel + modeSuffix + " | " + statsLine;
        } else {
          line = statsLine;
        }

        // --- Build output ---
        const lines: string[] = [];

        // Line 1: stats + model (right-aligned)
        lines.push(line);

        // Line 2: extension statuses with | separator
        const extensionStatuses = footerData.getExtensionStatuses();
        if (extensionStatuses.size > 0) {
          const sorted = Array.from(extensionStatuses.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, text]) => text.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim());
          const statusLine = sorted.join(" | ");
          lines.push(truncateToWidth(statusLine, width, "..."));
        }

        return lines;
      },
    };
  });
}