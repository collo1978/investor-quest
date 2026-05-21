/**
 * Operations / Mission Control — shared types for internal ops and future
 * partner/broker white-label dashboards.
 */

/** Simple demo-readiness tier shown on mobile and alerts. */
export type OpsHealthTier = "demo_ready" | "good" | "warning" | "critical";

/** Future: scope health + fixes to a partner tenant. */
export type OpsTenantScope = {
  partnerId: string;
  partnerName: string;
};

export type OpsSurface = "internal" | "partner" | "school" | "broker";
