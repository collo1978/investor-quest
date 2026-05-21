const DEFAULT_MAX_CHARS = 11_000;
const MIN_FALLBACK_CHARS = 4_000;

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function scoreParagraph(paragraph: string, keywords: readonly string[]): number {
  const p = normalize(paragraph);
  let score = 0;
  for (const kw of keywords) {
    const k = kw.trim().toLowerCase();
    if (!k) continue;
    if (p.includes(k)) score += k.split(/\s+/).length > 1 ? 3 : 1;
  }
  return score;
}

/**
 * Pull Item 1A paragraphs most relevant to a Forces topic before sending to OpenAI.
 */
export function extractRelevantRiskExcerpts(
  fullText: string,
  keywords: readonly string[],
  maxChars = DEFAULT_MAX_CHARS
): { excerpt: string; matched: boolean } {
  const trimmed = fullText.trim();
  if (!trimmed) return { excerpt: "", matched: false };

  const paragraphs = trimmed
    .split(/\n{2,}|(?=\n[A-Z][A-Za-z0-9\s,&\-]{3,80}\n)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  const scored = paragraphs
    .map((p) => ({ p, score: scoreParagraph(p, keywords) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const fallback = trimmed.slice(0, Math.min(trimmed.length, MIN_FALLBACK_CHARS));
    return {
      excerpt: `${fallback}${trimmed.length > fallback.length ? "\n\n[excerpt truncated — no keyword match]" : ""}`,
      matched: false
    };
  }

  const parts: string[] = [];
  let len = 0;
  for (const { p } of scored) {
    if (len + p.length > maxChars) break;
    parts.push(p);
    len += p.length + 2;
  }

  return {
    excerpt: parts.join("\n\n"),
    matched: true
  };
}
