import type { HealthStatusLabel } from "@/lib/gameHealth/types";
import {
  legacyStatusLabelToTier,
  opsTierPresentation,
  scoreToOpsTier
} from "@/lib/operations/healthTier";

export function scoreToStatusLabel(score: number): HealthStatusLabel {
  if (score >= 90) return "Demo Ready";
  if (score >= 70) return "Good, but check warnings";
  if (score >= 50) return "Needs fixes before demo";
  return "Not demo ready";
}

export function statusLabelColor(label: HealthStatusLabel): string {
  return opsTierPresentation(0, legacyStatusLabelToTier(label)).color;
}

/** Mobile / Mission Control tier color from score alone. */
export function scoreToDisplayColor(score: number): string {
  return opsTierPresentation(score).color;
}

export { scoreToOpsTier, opsTierPresentation };
