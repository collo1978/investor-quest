/**
 * Forces island — storm red, magenta rim, orange accent (matches artwork).
 * Single source for island hotspots + quest cards.
 */
export const FORCES_ISLAND = {
  hi: "#F87171",
  light: "#FCA5A5",
  mid: "#DC2626",
  orange: "#FB923C",
  blue: "#60A5FA",
  glow: "rgba(248, 113, 113, 0.48)",
  glowSoft: "rgba(248, 113, 113, 0.12)",
  border: "rgba(248, 113, 113, 0.52)",
  borderSoft: "rgba(248, 113, 113, 0.26)",
  wash: "rgba(248, 113, 113, 0.08)",
  badgeText: "rgba(18, 8, 10, 0.94)",
  markReadPulse: "rgba(248, 113, 113, 0.16)",
  whyHi: "#FB923C",
  whyGlow: "rgba(251, 146, 60, 0.42)",
  whyWash: "rgba(251, 146, 60, 0.12)"
} as const;

/** Tailwind arbitrary shadow fragments — keep in sync with FORCES_ISLAND RGB. */
export const FORCES_ISLAND_TW = {
  readGlow:
    "shadow-[0_0_28px_rgba(248,113,113,0.42),inset_0_0_0_1.5px_rgba(248,113,113,0.52)]",
  linkHover:
    "hover:shadow-[0_0_40px_rgba(248,113,113,0.45),0_0_24px_rgba(96,165,250,0.35),inset_0_0_0_1px_rgba(255,255,255,0.25)]",
  backBorder: "border-[rgba(248,113,113,0.38)]",
  backBorderHover: "hover:border-[rgba(248,113,113,0.55)]",
  backShadowHover: "hover:shadow-[0_0_22px_rgba(248,113,113,0.30)]",
  completedInset: "shadow-[inset_0_0_0_1px_rgba(96,165,250,0.45)]",
  progressGradient:
    "linear-gradient(90deg, rgba(248,113,113,0.55), rgba(96,165,250,0.85))"
} as const;
