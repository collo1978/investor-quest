import { buildPlaceholderAnalyticsSnapshot } from "@/platform/gamification/behavioralDesign/analytics/placeholderAnalytics";
import type {
  BehavioralAnalyticsSnapshot,
  BehavioralIntelligenceScope
} from "@/platform/gamification/behavioralDesign/analytics/types";

/**
 * Provider contract for Behavioral Intelligence System.
 * Swap `PlaceholderAnalyticsProvider` → `WarehouseAnalyticsProvider` when ready.
 */
export type BehavioralAnalyticsProvider = {
  id: string;
  fetchSnapshot(input: {
    scope: BehavioralIntelligenceScope;
    scopeId?: string | null;
    windowDays?: number;
  }): Promise<BehavioralAnalyticsSnapshot>;
};

export const placeholderAnalyticsProvider: BehavioralAnalyticsProvider = {
  id: "placeholder",
  async fetchSnapshot({ windowDays = 28 }) {
    return buildPlaceholderAnalyticsSnapshot(windowDays);
  }
};

/** Future: Supabase / BigQuery / PostHog adapter implements same interface */
export const warehouseAnalyticsProviderStub: BehavioralAnalyticsProvider = {
  id: "warehouse_stub",
  async fetchSnapshot() {
    const snap = buildPlaceholderAnalyticsSnapshot(28);
    return {
      ...snap,
      source: "warehouse",
      dataDisclaimer:
        "Warehouse provider not wired yet — showing placeholder until analytics pipeline ships."
    };
  }
};

let activeProvider: BehavioralAnalyticsProvider = placeholderAnalyticsProvider;

export function getAnalyticsProvider(): BehavioralAnalyticsProvider {
  return activeProvider;
}

export function setAnalyticsProvider(provider: BehavioralAnalyticsProvider): void {
  activeProvider = provider;
}
