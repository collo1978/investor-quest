/** Classify short quest answers into scannable visual beats. */

export type AnswerBeatKind = "everyday" | "analogy" | "insight";

export type ScannableAnswerBeat = {
  kind: AnswerBeatKind;
  sentences: string[];
};

const ANALOGY_RE =
  /\b(think of (?:it|them|this|the company|nvidia|apple|tesla|microsoft) like|you can think of|it's like|it is like|imagine|picture this|like the )\b/i;

/** Relatable phrases to subtly highlight (longest first). */
export const RELATABLE_ANCHOR_PHRASES = [
  "AI assistant",
  "AI chat app",
  "AI chat",
  "AI tools",
  "ChatGPT",
  "video games",
  "smartphones",
  "powerful chips",
  "gaming",
  "streaming",
  "subscriptions",
  "engine",
  "data centers",
  "cloud",
  "apps you",
  "popular AI",
  "self-driving",
  "electric cars",
  "online stores",
  "social media",
  "chip",
  "chips"
] as const;

export function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const parts = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length > 0) return parts;
  return [normalized];
}

export function isAnalogySentence(sentence: string): boolean {
  return ANALOGY_RE.test(sentence);
}

/** Turn paragraph blocks into everyday → analogy hook → insight beats. */
export function buildScannableBeats(paragraphs: string[]): ScannableAnswerBeat[] {
  const sentences: string[] = [];
  for (const p of paragraphs) {
    const chunk = p.replace(/\n+/g, " ").trim();
    if (!chunk) continue;
    if (isAnalogySentence(chunk) && !chunk.includes(". ")) {
      sentences.push(chunk);
    } else {
      sentences.push(...splitIntoSentences(chunk));
    }
  }

  if (!sentences.length) return [];

  const analogyIdx = sentences.findIndex((s) => isAnalogySentence(s));

  if (analogyIdx === -1) {
    if (sentences.length === 1) {
      return [{ kind: "everyday", sentences }];
    }
    return [
      { kind: "everyday", sentences: [sentences[0]!] },
      { kind: "insight", sentences: sentences.slice(1) }
    ];
  }

  const beats: ScannableAnswerBeat[] = [];
  const before = sentences.slice(0, analogyIdx);
  const analogy = sentences[analogyIdx]!;
  const after = sentences.slice(analogyIdx + 1);

  if (before.length) {
    beats.push({ kind: "everyday", sentences: before });
  }
  beats.push({ kind: "analogy", sentences: [analogy] });
  if (after.length) {
    beats.push({ kind: "insight", sentences: after });
  }

  return beats;
}

export type AnchorSpan = { text: string; highlight: boolean };

/** Split text into plain + highlighted spans for anchor phrases. */
export function splitAnchorHighlights(text: string): AnchorSpan[] {
  if (!text.trim()) return [{ text: "", highlight: false }];

  const lower = text.toLowerCase();
  const matches: Array<{ start: number; end: number }> = [];

  for (const phrase of RELATABLE_ANCHOR_PHRASES) {
    const p = phrase.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(p, from);
      if (idx === -1) break;
      const end = idx + p.length;
      const overlaps = matches.some(
        (m) => !(end <= m.start || idx >= m.end)
      );
      if (!overlaps) matches.push({ start: idx, end });
      from = idx + 1;
    }
  }

  if (!matches.length) return [{ text, highlight: false }];

  matches.sort((a, b) => a.start - b.start);

  const spans: AnchorSpan[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      spans.push({ text: text.slice(cursor, m.start), highlight: false });
    }
    spans.push({ text: text.slice(m.start, m.end), highlight: true });
    cursor = m.end;
  }
  if (cursor < text.length) {
    spans.push({ text: text.slice(cursor), highlight: false });
  }

  return spans.filter((s) => s.text.length > 0);
}
