import { buildTakeawayAnswerBody } from "@/lib/quests/takeawayAnswer";
import {
  buildLessonSupportingBody,
  type LessonLayoutParts
} from "@/lib/quests/lessonAnswer";

/**
 * NVIDIA demo gold-standard card body: headline takeaway + white explanation.
 * Parsed by {@link parseTakeawayAnswerBody} for yellow/white UI.
 */
export function goldAnswer(takeaway: string, supporting: string): string {
  return buildTakeawayAnswerBody({
    takeaway: takeaway.trim(),
    supporting: supporting.trim()
  });
}

/** Lesson-style card body — intro, focus bullets, optional middle, closing line. */
export function lessonAnswer(parts: {
  /** Authoring label only — not shown as a yellow headline in the UI. */
  headline?: string;
  intro?: string;
  focusTitle?: string;
  focusBullets?: string[];
  middle?: string;
  closing?: string;
}): string {
  return buildLessonSupportingBody({
    intro: parts.intro,
    focusTitle: parts.focusTitle,
    focusBullets: parts.focusBullets,
    middle: parts.middle,
    closing: parts.closing
  });
}

export type { LessonLayoutParts };
