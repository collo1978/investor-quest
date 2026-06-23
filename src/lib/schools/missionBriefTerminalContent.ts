export const MISSION_BRIEF_TERMINAL_CHAR_MS = 38;
export const MISSION_BRIEF_TERMINAL_LINE_GAP_MS = 360;
export const MISSION_BRIEF_TERMINAL_FADE_MS = 720;
export const MISSION_BRIEF_TERMINAL_FINALE_FADE_MS = 680;

export type MissionBriefTerminalLineVariant = "system" | "heading" | "body" | "banner";

export type MissionBriefTerminalLine = {
  id: string;
  text: string;
  variant: MissionBriefTerminalLineVariant;
  revealMode?: "type" | "fade";
  /** Pause after this line finishes (ms). */
  pauseAfterMs?: number;
};

export type MissionBriefTerminalSegment = {
  id: string;
  lines: readonly MissionBriefTerminalLine[];
  /** Pause after the whole section (ms). */
  pauseAfterMs?: number;
};

export const MISSION_BRIEF_TERMINAL_SEGMENTS: readonly MissionBriefTerminalSegment[] = [
  {
    id: "boot",
    lines: [
      {
        id: "connecting",
        text: "> CONNECTING...",
        variant: "system",
        pauseAfterMs: 1000
      },
      {
        id: "granted",
        text: "> ACCESS GRANTED",
        variant: "system",
        pauseAfterMs: 1000
      },
      {
        id: "banner",
        text: "INVESTOR QUEST TERMINAL",
        variant: "banner",
        revealMode: "fade",
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
    pauseAfterMs: 1000
  },
  {
    id: "reason",
    lines: [
      { id: "reason-h", text: "REASON IDENTIFIED", variant: "heading" },
      {
        id: "reason-b",
        text: "The answers are hidden inside reports that the best investors read, but most people never do.",
        variant: "body"
      }
    ],
    pauseAfterMs: 1000
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
    pauseAfterMs: 1000
  },
  {
    id: "mission",
    lines: [
      { id: "mission-h", text: "MISSION ASSIGNED", variant: "heading" },
      {
        id: "mission-b",
        text: "Learn how to research stocks properly.",
        variant: "body"
      }
    ],
    pauseAfterMs: 1000
  },
  {
    id: "reward",
    lines: [
      { id: "reward-h", text: "REWARD UNLOCKED", variant: "heading" },
      {
        id: "reward-b",
        text: "Become a smarter investor for life.",
        variant: "body"
      }
    ],
    pauseAfterMs: 1100
  }
] as const;

export const MISSION_BRIEF_TERMINAL_FINALE = {
  headline: "SLAY THE HYPE.",
  subtitle: "Your first quest begins now.",
  cta: "BEGIN QUEST"
} as const;

export type MissionBriefTerminalQueueItem = {
  line: MissionBriefTerminalLine;
  segmentId: string;
  isLastInSegment: boolean;
  segmentPauseAfterMs: number;
};

/** Flatten segments into a typed playback queue. */
export function buildMissionBriefTerminalQueue(
  segments: readonly MissionBriefTerminalSegment[]
): MissionBriefTerminalQueueItem[] {
  const queue: MissionBriefTerminalQueueItem[] = [];

  for (const segment of segments) {
    segment.lines.forEach((line, index) => {
      queue.push({
        line,
        segmentId: segment.id,
        isLastInSegment: index === segment.lines.length - 1,
        segmentPauseAfterMs: segment.pauseAfterMs ?? MISSION_BRIEF_TERMINAL_LINE_GAP_MS
      });
    });
  }

  return queue;
}
