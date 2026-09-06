import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export interface UsageWindow {
  usedPercent: number;
  windowMinutes?: number;
  resetsAt?: number;
}

export interface ProviderUsage {
  primary?: UsageWindow;
  secondary?: UsageWindow;
}

export interface UsageProvider {
  provider: string;
  fetchUsage(ctx: ExtensionContext): Promise<ProviderUsage>;
}
