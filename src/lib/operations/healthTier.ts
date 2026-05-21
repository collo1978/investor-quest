import type { HealthStatusLabel } from "@/lib/gameHealth/types";

import type { OpsHealthTier } from "./types";

export type OpsTierPresentation = {
  tier: OpsHealthTier;
  label: string;
  shortLabel: string;
  color: string;
  explanation: string;
};

export function scoreToOpsTier(score: number): OpsHealthTier {
  if (score >= 90) return "demo_ready";
  if (score >= 70) return "good";
  if (score >= 50) return "warning";
  return "critical";
}

export function opsTierPresentation(
  score: number,
  tier?: OpsHealthTier
): OpsTierPresentation {
  const t = tier ?? scoreToOpsTier(score);
  switch (t) {
    case "demo_ready":
      return {
        tier: t,
        label: "Demo Ready",
        shortLabel: "Demo Ready",
        color: "#22c58b",
        explanation:
          "Investor Quest looks healthy. Safe to run a live demo for students or partners."
      };
    case "good":
      return {
        tier: t,
        label: "Good",
        shortLabel: "Good",
        color: "#f5c547",
        explanation:
          "Most things work. Check any warnings below before a high-stakes demo."
      };
    case "warning":
      return {
        tier: t,
        label: "Warning",
        shortLabel: "Warning",
        color: "#f97316",
        explanation:
          "Some player-facing features may be slow or incomplete. Fix open issues before demoing."
      };
    default:
      return {
        tier: "critical",
        label: "Critical",
        shortLabel: "Critical",
        color: "#ef4444",
        explanation:
          "Players may hit blank screens or missing answers. Fix critical issues before any demo."
      };
  }
}

/** Map stored DB labels (legacy) to simple mobile tier. */
export function legacyStatusLabelToTier(label: HealthStatusLabel): OpsHealthTier {
  switch (label) {
    case "Demo Ready":
      return "demo_ready";
    case "Good, but check warnings":
      return "good";
    case "Needs fixes before demo":
      return "warning";
    default:
      return "critical";
  }
}

export function tierFromScoreOrLabel(
  score: number,
  statusLabel?: HealthStatusLabel | null
): OpsTierPresentation {
  if (statusLabel) {
    return opsTierPresentation(score, legacyStatusLabelToTier(statusLabel));
  }
  return opsTierPresentation(score);
}
