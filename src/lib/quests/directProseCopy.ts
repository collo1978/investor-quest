/**
 * Direct prose rules — no em dashes, no cinematic AI narration.
 * Used in prompts, quality gates, and normalizeQuestProse.
 */

/** Any em dash, en dash, or spaced double hyphen in player copy. */
export const EM_DASH_IN_COPY_RE = /[—–]|\s--\s/;

/** Dramatic filler lines (with or without dashes). */
export const DRAMATIC_NARRATION_RE =
  /\b(but the real story|the real story is|the real story matters|the twist:|there'?s more (?:to it |beneath|under)|beneath the surface|deeper story|the deeper story matters|bigger than the devices|bigger picture than|more to the story|the story (?:is|goes) (?:bigger|deeper)|what really matters is the story|that'?s where it gets interesting|that makes every judgment sharper|context completes the picture|execution is where plans meet reality|durable edges compound over time|your life already lives here|feels like moving house)\b/i;

export const DIRECT_PROSE_VOICE_RULES = `DIRECT PROSE (all player-facing copy)
- No em dashes (—), en dashes (–), or double hyphens (--) in sentences. Use periods or commas.
- No cinematic pivots: "the real story", "the twist", "beneath the surface", "that makes every judgment sharper".
- Write like a smart teacher explaining investing clearly. One fact per sentence.
- Good: "Most revenue still comes from iPhone." / "Services create recurring revenue after the device is sold."
- Bad: "You see where the money comes from — that makes every judgment sharper."`;
