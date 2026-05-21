import type { PillarId } from "@/data/pillars";
import { getPillarQuestTheme } from "@/components/quest/pillarQuestTheme";

export type HubMapCardTheme = {
  pillarId: PillarId;
  pillarLabel: string;
  hi: string;
  lo: string;
  glow: string;
  glowSoft: string;
  border: string;
  borderSoft: string;
  lockedBorder: string;
  focusRing: string;
  mastery: string;
};

const PILLAR_LABELS: Record<PillarId, string> = {
  business: "Business",
  forces: "Forces",
  financials: "Financials",
  management: "Management"
};

export function hubMapCardThemeFromPillar(pillarId: PillarId): HubMapCardTheme {
  const t = getPillarQuestTheme(pillarId);
  return {
    pillarId,
    pillarLabel: PILLAR_LABELS[pillarId],
    hi: t.hi,
    lo: t.lo,
    glow: t.glow,
    glowSoft: t.glowSoft,
    border: t.border,
    borderSoft: t.borderSoft,
    lockedBorder:
      pillarId === "financials"
        ? "rgba(48,96,68,0.48)"
        : pillarId === "forces"
          ? "rgba(120,72,40,0.48)"
          : pillarId === "management"
            ? "rgba(88,62,120,0.48)"
            : "rgba(88,74,42,0.28)",
    focusRing:
      pillarId === "financials"
        ? "ring-emerald-400/70"
        : pillarId === "management"
          ? "ring-violet-400/70"
          : "ring-amber-400/90",
    mastery: "#22C58B"
  };
}
