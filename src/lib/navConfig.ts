import { PILLAR_META } from "@/data/pillars";

export const EXPLORE_SUB_LINKS = [
  { href: "/explore/my-interests", label: "My Interests" },
  { href: "/explore/ai-frontier", label: "AI Frontier" },
  { href: "/explore/market-giants", label: "Market Giants" }
] as const;

export const EXPLORE_SEARCH_LABEL = "Search company or ticker" as const;

/** Pillar island hubs — `/business`, `/financials`, etc. */
export const ISLAND_NAV = PILLAR_META.map((p) => ({
  href: p.route,
  label: p.title
}));

export const PRIMARY_NAV = [
  { href: "/onboarding", label: "Onboarding" },
  { href: "/mission-brief", label: "Mission brief" },
  { href: "/map", label: "Map" },
  { href: "/conviction/leaderboard", label: "Conviction" },
  { href: "/profile", label: "Profile" }
] as const;

/** Island hubs (e.g. `/business`) and quest detail (`/quest?…`) are reached from the map. */
export const MOBILE_TAB_NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/conviction/leaderboard", label: "Rank" },
  { href: "/profile", label: "Profile" }
] as const;

export function linkActive(pathname: string, href: string) {
  if (href === "/explore") return pathname.startsWith("/explore");
  if (href === "/home") return pathname === "/home";
  return pathname.startsWith(href);
}

export function islandLinkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function linkClass(active: boolean) {
  return [
    "relative z-10 block cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition",
    active
      ? "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] text-neon-300 shadow-glow"
      : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-1 hover:bg-[rgba(255,255,255,0.06)] hover:text-ink-0"
  ].join(" ");
}
