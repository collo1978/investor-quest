import type { InvestorQualityChecklistItemId } from "@/lib/business/investorQualityChecklist";

export type InvestorQualityItemTheme = {
  accent: string;
  glow: string;
  glowSoft: string;
  emptyBorder: string;
  emptyFill: string;
};

/** Per-quality identity — accent colours for rows, icons, and active glow. */
export const INVESTOR_QUALITY_ITEM_THEMES: Record<
  InvestorQualityChecklistItemId,
  InvestorQualityItemTheme
> = {
  "business-understanding": {
    accent: "#c4b5fd",
    glow: "rgba(167, 139, 250, 0.55)",
    glowSoft: "rgba(139, 92, 246, 0.18)",
    emptyBorder: "rgba(167, 139, 250, 0.28)",
    emptyFill: "rgba(76, 29, 149, 0.22)"
  },
  "value-proposition": {
    accent: "#f9a8d4",
    glow: "rgba(244, 114, 182, 0.55)",
    glowSoft: "rgba(236, 72, 153, 0.18)",
    emptyBorder: "rgba(244, 114, 182, 0.28)",
    emptyFill: "rgba(131, 24, 67, 0.22)"
  },
  "competitive-advantage": {
    accent: "#fcd34d",
    glow: "rgba(245, 197, 71, 0.55)",
    glowSoft: "rgba(245, 158, 11, 0.18)",
    emptyBorder: "rgba(245, 197, 71, 0.28)",
    emptyFill: "rgba(120, 53, 15, 0.22)"
  },
  "growth-runway": {
    accent: "#7dd3fc",
    glow: "rgba(56, 189, 248, 0.55)",
    glowSoft: "rgba(14, 165, 233, 0.18)",
    emptyBorder: "rgba(56, 189, 248, 0.28)",
    emptyFill: "rgba(12, 74, 110, 0.22)"
  },
  "industry-attractiveness": {
    accent: "#6ee7b7",
    glow: "rgba(52, 211, 153, 0.55)",
    glowSoft: "rgba(16, 185, 129, 0.18)",
    emptyBorder: "rgba(52, 211, 153, 0.28)",
    emptyFill: "rgba(6, 78, 59, 0.22)"
  },
  "business-model": {
    accent: "#fdba74",
    glow: "rgba(251, 146, 60, 0.55)",
    glowSoft: "rgba(249, 115, 22, 0.18)",
    emptyBorder: "rgba(251, 146, 60, 0.28)",
    emptyFill: "rgba(124, 45, 18, 0.22)"
  },
  "operational-resilience": {
    accent: "#93c5fd",
    glow: "rgba(96, 165, 250, 0.55)",
    glowSoft: "rgba(59, 130, 246, 0.18)",
    emptyBorder: "rgba(96, 165, 250, 0.28)",
    emptyFill: "rgba(30, 58, 138, 0.22)"
  }
};

export function resolveInvestorQualityItemTheme(
  itemId: InvestorQualityChecklistItemId
): InvestorQualityItemTheme {
  return INVESTOR_QUALITY_ITEM_THEMES[itemId];
}
