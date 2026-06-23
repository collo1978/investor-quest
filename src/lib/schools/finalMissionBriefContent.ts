export const FINAL_MISSION_BRIEF_CHAR_MS = 36;
export const FINAL_MISSION_BRIEF_LINE_GAP_MS = 380;
export const FINAL_MISSION_BRIEF_FADE_MS = 680;
export const FINAL_MISSION_BRIEF_FINALE_FADE_MS = 720;

export type FinalMissionBriefLineVariant =
  | "title-lg"
  | "title-sm"
  | "heading"
  | "body";

export type FinalMissionBriefLine = {
  id: string;
  text: string;
  variant: FinalMissionBriefLineVariant;
  revealMode?: "type" | "fade";
  pauseAfterMs?: number;
};

export type FinalMissionBriefSegment = {
  id: string;
  lines: readonly FinalMissionBriefLine[];
  pauseAfterMs?: number;
};

export const FINAL_MISSION_BRIEF_SEGMENTS: readonly FinalMissionBriefSegment[] = [
  {
    id: "title",
    lines: [
      {
        id: "title-lg",
        text: "INVESTOR QUEST",
        variant: "title-lg",
        revealMode: "fade",
        pauseAfterMs: 420
      },
      {
        id: "title-sm",
        text: "MISSION BRIEF",
        variant: "title-sm",
        revealMode: "fade",
        pauseAfterMs: 700
      }
    ],
    pauseAfterMs: 850
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
    pauseAfterMs: 1100
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
    pauseAfterMs: 1100
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
    pauseAfterMs: 1100
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
    pauseAfterMs: 1100
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
    pauseAfterMs: 1200
  }
] as const;

export const FINAL_MISSION_BRIEF_FINALE = {
  headline: "SLAY THE HYPE.",
  subtitle: "Your first quest begins now.",
  cta: "BEGIN QUEST"
} as const;

export type FinalMissionBriefQueueItem = {
  line: FinalMissionBriefLine;
  segmentId: string;
  isLastInSegment: boolean;
  segmentPauseAfterMs: number;
};

export function buildFinalMissionBriefQueue(
  segments: readonly FinalMissionBriefSegment[]
): FinalMissionBriefQueueItem[] {
  const queue: FinalMissionBriefQueueItem[] = [];

  for (const segment of segments) {
    segment.lines.forEach((line, index) => {
      queue.push({
        line,
        segmentId: segment.id,
        isLastInSegment: index === segment.lines.length - 1,
        segmentPauseAfterMs: segment.pauseAfterMs ?? FINAL_MISSION_BRIEF_LINE_GAP_MS
      });
    });
  }

  return queue;
}
