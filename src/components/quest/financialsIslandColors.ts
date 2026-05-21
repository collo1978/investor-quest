/**
 * Financials island — vault green (emerald, not yellow-lime).
 * Single source for island hotspots + quest cards.
 */
export const FINANCIALS_ISLAND = {
  /** Primary border & titles — greener than lime, not mint-teal. */
  hi: "#4ADE80",
  light: "#86EFAC",
  mid: "#22C55E",
  glow: "rgba(74, 222, 128, 0.48)",
  glowSoft: "rgba(74, 222, 128, 0.12)",
  border: "rgba(74, 222, 128, 0.52)",
  borderSoft: "rgba(74, 222, 128, 0.26)",
  wash: "rgba(74, 222, 128, 0.08)",
  badgeText: "rgba(8, 28, 18, 0.94)",
  markReadPulse: "rgba(74, 222, 128, 0.16)"
} as const;

/** Tailwind arbitrary shadow fragments — keep in sync with FINANCIALS_ISLAND RGB. */
export const FINANCIALS_ISLAND_TW = {
  readGlow:
    "shadow-[0_0_28px_rgba(74,222,128,0.42),inset_0_0_0_1.5px_rgba(74,222,128,0.52)]",
  linkHover:
    "hover:shadow-[0_0_36px_rgba(74,222,128,0.45),0_0_20px_rgba(74,222,128,0.18)]",
  backBorder: "border-[rgba(74,222,128,0.38)]",
  backBorderHover: "hover:border-[rgba(74,222,128,0.55)]",
  backShadowHover: "hover:shadow-[0_0_22px_rgba(74,222,128,0.30)]",
  completedInset: "shadow-[inset_0_0_0_1px_rgba(74,222,128,0.42)]"
} as const;
