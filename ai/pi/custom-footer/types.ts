import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export interface UsageWindow {
    usedPercent: number;
    windowMinutes?: number;
    resetsAt?: number;
}

export interface AccountBalance {
    currency: string;
    total: number;
}

export interface ProviderUsage {
    primary?: UsageWindow;
    secondary?: UsageWindow;
    balances?: AccountBalance[];
}

export interface UsageProvider {
    provider: string;
    details: "usage-windows" | "account-balance";
    fetchUsage(ctx: ExtensionContext): Promise<ProviderUsage>;
}
