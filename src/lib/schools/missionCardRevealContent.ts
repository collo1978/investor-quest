export const MISSION_CARD_REVEAL_CHAR_MS = 36;
export const MISSION_CARD_REVEAL_HEADING_DELAY_MS = 320;
export const MISSION_CARD_REVEAL_CARD_HOLD_MS = 1050;
export const MISSION_CARD_REVEAL_FINALE_FADE_MS = 680;

export type MissionCardAccent = "amber" | "cyan" | "rose" | "violet" | "emerald";

export type MissionRevealCard = {
  id: string;
  heading: string;
  body: string;
  accent: MissionCardAccent;
};

export const MISSION_CARD_REVEAL_CARDS: readonly MissionRevealCard[] = [
  {
    id: "problem",
    heading: "PROBLEM",
    body: "Most investors don't understand the stocks they own.",
    accent: "amber"
  },
  {
    id: "reason",
    heading: "REASON",
    body: "The answers are hidden inside reports that the best investors read, but most people never do.",
    accent: "cyan"
  },
  {
    id: "result",
    heading: "RESULT",
    body: "Many investors follow hype instead of facts.",
    accent: "rose"
  },
  {
    id: "mission",
    heading: "MISSION",
    body: "Learn how to research stocks properly.",
    accent: "violet"
  },
  {
    id: "reward",
    heading: "REWARD",
    body: "Become a smarter investor for life.",
    accent: "emerald"
  }
] as const;

export const MISSION_CARD_REVEAL_FINALE = {
  title: "INVESTOR QUEST",
  tagline: "SLAY THE HYPE.",
  cta: "BEGIN QUEST"
} as const;

export const MISSION_CARD_ACCENT_STYLES: Record<
  MissionCardAccent,
  { border: string; glow: string; glowHover: string; heading: string }
> = {
  amber: {
    border: "rgba(251,191,36,0.55)",
    glow: "rgba(251,191,36,0.22)",
    glowHover: "rgba(251,191,36,0.45)",
    heading: "rgba(253,230,138,0.98)"
  },
  cyan: {
    border: "rgba(34,211,238,0.55)",
    glow: "rgba(34,211,238,0.22)",
    glowHover: "rgba(34,211,238,0.45)",
    heading: "rgba(165,243,252,0.98)"
  },
  rose: {
    border: "rgba(251,113,133,0.55)",
    glow: "rgba(251,113,133,0.22)",
    glowHover: "rgba(251,113,133,0.45)",
    heading: "rgba(255,228,230,0.98)"
  },
  violet: {
    border: "rgba(167,139,250,0.55)",
    glow: "rgba(167,139,250,0.22)",
    glowHover: "rgba(167,139,250,0.45)",
    heading: "rgba(237,233,254,0.98)"
  },
  emerald: {
    border: "rgba(52,211,153,0.55)",
    glow: "rgba(52,211,153,0.22)",
    glowHover: "rgba(52,211,153,0.45)",
    heading: "rgba(209,250,229,0.98)"
  }
};
