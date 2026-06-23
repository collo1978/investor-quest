export const JARVIS_BRIEF_CHAR_MS = 34;
export const JARVIS_BRIEF_LINE_GAP_MS = 340;
export const JARVIS_BRIEF_FINALE_FADE_MS = 720;
export const JARVIS_BRIEF_SCAN_DURATION_MS = 2600;

export type JarvisBriefLineVariant = "scan" | "heading" | "body" | "body-sm";

export type JarvisBriefLine = {
  id: string;
  text: string;
  variant: JarvisBriefLineVariant;
  pauseAfterMs?: number;
  showScanBar?: boolean;
};

export type JarvisBriefSegment = {
  id: string;
  lines: readonly JarvisBriefLine[];
  pauseAfterMs?: number;
  scanDurationMs?: number;
};

export const JARVIS_BRIEF_SEGMENTS: readonly JarvisBriefSegment[] = [
  {
    id: "analyze",
    lines: [
      {
        id: "scan",
        text: "ANALYZING INVESTOR LANDSCAPE...",
        variant: "scan",
        showScanBar: true,
        pauseAfterMs: 350
      }
    ],
    scanDurationMs: JARVIS_BRIEF_SCAN_DURATION_MS,
    pauseAfterMs: 900
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
    pauseAfterMs: 1050
  },
  {
    id: "cause",
    lines: [
      { id: "cause-h", text: "CAUSE IDENTIFIED", variant: "heading" },
      {
        id: "cause-b",
        text: "The answers are hidden inside reports that the best investors read, but most people never do.",
        variant: "body"
      }
    ],
    pauseAfterMs: 1050
  },
  {
    id: "threat",
    lines: [
      { id: "threat-h", text: "THREAT FOUND", variant: "heading" },
      { id: "threat-b", text: "Hype.", variant: "body" },
      {
        id: "threat-sm",
        text: "Headlines. Tips. Rumors. The crowd.",
        variant: "body-sm"
      }
    ],
    pauseAfterMs: 1100
  },
  {
    id: "mission",
    lines: [
      { id: "mission-h", text: "MISSION GENERATED", variant: "heading" },
      {
        id: "mission-b",
        text: "Learn how to research stocks properly.",
        variant: "body"
      }
    ],
    pauseAfterMs: 1050
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
    pauseAfterMs: 1150
  }
] as const;

export const JARVIS_BRIEF_FINALE = {
  title: "INVESTOR QUEST",
  tagline: "SLAY THE HYPE.",
  cta: "BEGIN QUEST"
} as const;

export type JarvisBriefQueueItem = {
  line: JarvisBriefLine;
  segmentId: string;
  isLastInSegment: boolean;
  segmentPauseAfterMs: number;
  scanDurationMs?: number;
};

export function buildJarvisBriefQueue(
  segments: readonly JarvisBriefSegment[]
): JarvisBriefQueueItem[] {
  const queue: JarvisBriefQueueItem[] = [];

  for (const segment of segments) {
    segment.lines.forEach((line, index) => {
      queue.push({
        line,
        segmentId: segment.id,
        isLastInSegment: index === segment.lines.length - 1,
        segmentPauseAfterMs: segment.pauseAfterMs ?? JARVIS_BRIEF_LINE_GAP_MS,
        scanDurationMs: segment.scanDurationMs
      });
    });
  }

  return queue;
}
