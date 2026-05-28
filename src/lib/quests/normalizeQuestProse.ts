/**
 * Player-facing quest prose: periods and commas only — no em/en dashes or "--".
 */

import { formatPlayerCopy } from "@/lib/quests/questAnswerFormatter";

const SPACED_EM_EN = /\s+[—–]\s+/g;
const SPACED_DOUBLE_HYPHEN = /\s+--\s+/g;
const BARE_EM_EN = /[—–]/g;

function capitalizeAfterPeriod(text: string): string {
  return text.replace(/\.\s+([a-z])/g, (_m, letter: string) => `. ${letter.toUpperCase()}`);
}

/** Replace spaced em/en dashes and "--" with a comma or sentence break. */
export function normalizeQuestProseDashes(text: string): string {
  if (!/[—–]/.test(text) && !/\s--\s/.test(text)) return text;

  let out = text.replace(SPACED_EM_EN, (_match, offset: number, full: string) => {
    const after = full.slice(offset + _match.length);
    if (/^[a-z('"(\[]/.test(after)) return ", ";
    return ". ";
  });

  out = out.replace(SPACED_DOUBLE_HYPHEN, (_match, offset: number, full: string) => {
    const after = full.slice(offset + _match.length);
    if (/^[a-z('"(\[]/.test(after)) return ", ";
    return ". ";
  });

  out = out.replace(BARE_EM_EN, ". ");

  out = capitalizeAfterPeriod(out);
  out = out.replace(/\.\s+IPhone\b/g, ". iPhone");

  return out
    .replace(/\.\s+\./g, ".")
    .replace(/,\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Normalize any player-visible string (quests, toasts, tooltips, quizzes). */
export function normalizePlayerFacingCopy(text: string): string {
  return formatPlayerCopy(text);
}
