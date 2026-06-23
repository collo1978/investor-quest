export const RED_ALERT_CHAR_MS = 34;
export const RED_ALERT_LINE_GAP_MS = 340;
export const RED_ALERT_BEAT_PAUSE_MS = 1000;
export const RED_ALERT_FINALE_FADE_MS = 720;
export const RED_ALERT_WARNING_FLASH_MS = 1400;

export type RedAlertLineVariant =
  | "warning-flash"
  | "threat-label"
  | "threat-word"
  | "heading"
  | "body";

export type RedAlertRevealMode = "flash" | "type" | "glitch";

export type RedAlertLine = {
  id: string;
  text: string;
  variant: RedAlertLineVariant;
  revealMode?: RedAlertRevealMode;
  pauseAfterMs?: number;
};

export type RedAlertBeat = {
  id: string;
  lines: readonly RedAlertLine[];
  pauseAfterMs?: number;
};

export const RED_ALERT_BEATS: readonly RedAlertBeat[] = [
  {
    id: "warning",
    lines: [
      {
        id: "warning-flash",
        text: "WARNING",
        variant: "warning-flash",
        revealMode: "flash",
        pauseAfterMs: 500
      }
    ],
    pauseAfterMs: 600
  },
  {
    id: "threat",
    lines: [
      {
        id: "threat-label",
        text: "THREAT DETECTED:",
        variant: "threat-label",
        revealMode: "type",
        pauseAfterMs: 420
      },
      {
        id: "threat-word",
        text: "HYPE",
        variant: "threat-word",
        revealMode: "glitch",
        pauseAfterMs: 900
      }
    ],
    pauseAfterMs: 850
  },
  {
    id: "problem",
    lines: [
      { id: "problem-h", text: "PROBLEM", variant: "heading" },
      {
        id: "problem-b",
        text: "Most investors don't understand the stocks they own.",
        variant: "body"
      }
    ],
    pauseAfterMs: RED_ALERT_BEAT_PAUSE_MS
  },
  {
    id: "cause",
    lines: [
      { id: "cause-h", text: "CAUSE", variant: "heading" },
      {
        id: "cause-b",
        text: "The answers are hidden inside reports that the best investors read, but most people never do.",
        variant: "body"
      }
    ],
    pauseAfterMs: RED_ALERT_BEAT_PAUSE_MS
  },
  {
    id: "result",
    lines: [
      { id: "result-h", text: "RESULT", variant: "heading" },
      {
        id: "result-b",
        text: "Many investors follow hype instead of facts.",
        variant: "body"
      }
    ],
    pauseAfterMs: RED_ALERT_BEAT_PAUSE_MS
  },
  {
    id: "countermeasure",
    lines: [
      { id: "counter-h", text: "COUNTERMEASURE", variant: "heading" },
      {
        id: "counter-b",
        text: "Learn how to research stocks properly.",
        variant: "body"
      }
    ],
    pauseAfterMs: RED_ALERT_BEAT_PAUSE_MS
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

export const RED_ALERT_FINALE = {
  title: "INVESTOR QUEST",
  tagline: "SLAY THE HYPE.",
  cta: "BEGIN QUEST"
} as const;

export type RedAlertQueueItem = {
  line: RedAlertLine;
  beatId: string;
  isLastInBeat: boolean;
  beatPauseAfterMs: number;
};

export function buildRedAlertQueue(beats: readonly RedAlertBeat[]): RedAlertQueueItem[] {
  const queue: RedAlertQueueItem[] = [];

  for (const beat of beats) {
    beat.lines.forEach((line, index) => {
      queue.push({
        line,
        beatId: beat.id,
        isLastInBeat: index === beat.lines.length - 1,
        beatPauseAfterMs: beat.pauseAfterMs ?? RED_ALERT_BEAT_PAUSE_MS
      });
    });
  }

  return queue;
}
