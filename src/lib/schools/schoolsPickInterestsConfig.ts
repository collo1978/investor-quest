/** Schools pick-company — one choice unlocks the first quest match. */
export const SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT = 1;

/** Schools desktop pick-interests — 4×2 grid order and card presentation. */
export type SchoolsPickInterestCard = {
  id: string;
  label: string;
  icon: string;
  /** Card gradient accent for game-style tiles. */
  accent: string;
  glow: string;
};

export const SCHOOLS_PICK_INTERESTS_GRID: readonly SchoolsPickInterestCard[] = [
  {
    id: "ai",
    label: "AI & Robotics",
    icon: "⌬",
    accent: "from-violet-500/35 via-fuchsia-500/20 to-indigo-600/30",
    glow: "rgba(167,139,250,0.55)"
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: "⌁",
    accent: "from-purple-500/35 via-violet-600/22 to-blue-600/28",
    glow: "rgba(139,92,246,0.5)"
  },
  {
    id: "sports",
    label: "Sports",
    icon: "◎",
    accent: "from-violet-600/32 via-purple-500/18 to-cyan-500/22",
    glow: "rgba(124,58,237,0.48)"
  },
  {
    id: "music",
    label: "Music",
    icon: "♫",
    accent: "from-fuchsia-500/30 via-violet-500/20 to-purple-700/28",
    glow: "rgba(192,132,252,0.5)"
  },
  {
    id: "electric_cars",
    label: "Electric Cars",
    icon: "⚡",
    accent: "from-violet-500/32 via-blue-500/18 to-indigo-500/26",
    glow: "rgba(99,102,241,0.48)"
  },
  {
    id: "tech",
    label: "Technology",
    icon: "✦",
    accent: "from-indigo-500/32 via-violet-500/22 to-purple-600/26",
    glow: "rgba(129,140,248,0.5)"
  },
  {
    id: "travel",
    label: "Travel",
    icon: "✈",
    accent: "from-purple-500/30 via-violet-400/18 to-sky-500/24",
    glow: "rgba(139,92,246,0.45)"
  },
  {
    id: "health",
    label: "Healthcare",
    icon: "♡",
    accent: "from-violet-500/30 via-pink-500/16 to-purple-600/26",
    glow: "rgba(168,85,247,0.48)"
  }
] as const;
