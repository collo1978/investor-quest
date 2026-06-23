export const HACKER_STYLE_CHAR_MS = 32;
export const HACKER_STYLE_LINE_GAP_MS = 320;
export const HACKER_STYLE_BEAT_PAUSE_MS = 980;
export const HACKER_STYLE_FINALE_FADE_MS = 700;
export const HACKER_STYLE_FINALE_GLITCH_MS = 520;

export type HackerStyleLineVariant =
  | "system"
  | "granted"
  | "heading"
  | "body"
  | "body-sm"
  | "threat-word";

export type HackerStyleRevealMode = "type" | "fade" | "glitch";

export type HackerStyleLine = {
  id: string;
  text: string;
  variant: HackerStyleLineVariant;
  revealMode?: HackerStyleRevealMode;
  pauseAfterMs?: number;
};

export type HackerStyleBeat = {
  id: string;
  lines: readonly HackerStyleLine[];
  pauseAfterMs?: number;
};

export const HACKER_STYLE_BEATS: readonly HackerStyleBeat[] = [
  {
    id: "accessing",
    lines: [
      {
        id: "accessing",
        text: "ACCESSING WALL STREET DATABASE...",
        variant: "system",
        pauseAfterMs: 850
      }
    ],
    pauseAfterMs: 700
  },
  {
    id: "granted",
    lines: [
      {
        id: "granted",
        text: "ACCESS GRANTED",
        variant: "granted",
        revealMode: "fade",
        pauseAfterMs: 750
      }
    ],
    pauseAfterMs: 650
  },
  {
    id: "loading",
    lines: [
      {
        id: "loading",
        text: "LOADING INVESTOR REPORT...",
        variant: "system",
        pauseAfterMs: 800
      }
    ],
    pauseAfterMs: 700
  },
  {
    id: "problem",
    lines: [
      { id: "problem-h", text: "PROBLEM DETECTED", variant: "heading" },
      {
        id: "problem-b",
        text: "Most investors don't understand the stocks they own.",
        variant: "body"
      }
    ],
    pauseAfterMs: HACKER_STYLE_BEAT_PAUSE_MS
  },
  {
    id: "cause",
    lines: [
      { id: "cause-h", text: "CAUSE FOUND", variant: "heading" },
      {
        id: "cause-b",
        text: "The answers are hidden inside reports that the best investors read, but most people never do.",
        variant: "body"
      }
    ],
    pauseAfterMs: HACKER_STYLE_BEAT_PAUSE_MS
  },
  {
    id: "threat",
    lines: [
      { id: "threat-h", text: "THREAT IDENTIFIED", variant: "heading" },
      {
        id: "threat-word",
        text: "HYPE",
        variant: "threat-word",
        revealMode: "glitch",
        pauseAfterMs: 480
      },
      {
        id: "threat-sm",
        text: "Headlines. Tips. Rumors. The crowd.",
        variant: "body-sm"
      }
    ],
    pauseAfterMs: 1050
  },
  {
    id: "mission",
    lines: [
      { id: "mission-h", text: "MISSION UNLOCKED", variant: "heading" },
      {
        id: "mission-b",
        text: "Learn how to research stocks properly.",
        variant: "body"
      }
    ],
    pauseAfterMs: HACKER_STYLE_BEAT_PAUSE_MS
  },
  {
    id: "reward",
    lines: [
      { id: "reward-h", text: "REWARD", variant: "heading" },
      {
        id: "reward-b",
        text: "Become a smarter investor for life.",
        variant: "body"
      }
    ],
    pauseAfterMs: 1100
  }
] as const;

export const HACKER_STYLE_FINALE = {
  title: "INVESTOR QUEST",
  tagline: "SLAY THE HYPE.",
  cta: "BEGIN QUEST"
} as const;

/** Deterministic terminal noise — no Math.random() during render. */
export const HACKER_CODE_FRAGMENTS: readonly string[] = [
  "sec://filings/10-K/stream [OK]",
  "0x4F2A decrypt payload...",
  "NVDA.revenue.parse()",
  "margin_trend.analyze(q/q)",
  "insider_holdings.scan()",
  "free_cash_flow.delta",
  "guidance_vs_consensus.diff",
  "risk_factors.extract()",
  "segment_revenue.map()",
  "dilution_watch.active",
  "competitive_moat.score",
  "balance_sheet.health",
  "earnings_transcript.nlp",
  "institutional_ownership.delta",
  "short_interest.flag",
  "capex_intensity.ratio",
  "return_on_equity.trend",
  "debt_maturity.ladder",
  "share_buyback.yield",
  "valuation_multiple.context"
] as const;

export type HackerStyleQueueItem = {
  line: HackerStyleLine;
  beatId: string;
  isLastInBeat: boolean;
  beatPauseAfterMs: number;
};

export function buildHackerStyleQueue(
  beats: readonly HackerStyleBeat[]
): HackerStyleQueueItem[] {
  const queue: HackerStyleQueueItem[] = [];

  for (const beat of beats) {
    beat.lines.forEach((line, index) => {
      queue.push({
        line,
        beatId: beat.id,
        isLastInBeat: index === beat.lines.length - 1,
        beatPauseAfterMs: beat.pauseAfterMs ?? HACKER_STYLE_BEAT_PAUSE_MS
      });
    });
  }

  return queue;
}
