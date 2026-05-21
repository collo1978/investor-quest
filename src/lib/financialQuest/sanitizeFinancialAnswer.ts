const WORD_ONES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19
};

const WORD_TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90
};

/** Parse simple English phrases up to 999 (e.g. "one hundred eleven", "sixty two"). */
function parseEnglishNumberPhrase(raw: string): number | null {
  const parts = raw
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+and\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return null;

  let total = 0;
  let current = 0;

  for (const part of parts) {
    if (part === "hundred") {
      current = (current || 1) * 100;
      continue;
    }
    if (part === "thousand") {
      current = (current || 1) * 1000;
      total += current;
      current = 0;
      continue;
    }
    const ones = WORD_ONES[part];
    const tens = WORD_TENS[part];
    if (ones != null) {
      current += ones;
      continue;
    }
    if (tens != null) {
      current += tens;
      continue;
    }
    return null;
  }

  return total + current;
}

function formatCompactDollars(value: number, unit: "billion" | "million"): string {
  const rounded =
    unit === "billion"
      ? Math.round(value * 10) / 10
      : Math.round(value);
  const text =
    rounded % 1 === 0 ? String(Math.trunc(rounded)) : rounded.toFixed(1);
  return `$${text} ${unit}`;
}

/** Remove markdown styling the model sometimes adds despite instructions. */
export function stripMarkdownFromAnswer(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/**
 * Enforce scannable numeric style ($111 billion, 12%) on generated answers.
 */
export function normalizeFinancialNumericFormatting(text: string): string {
  let out = text;

  // Spelled-out billions/millions → $N billion / $N million
  out = out.replace(
    /\b([a-z][a-z\s-]*?)\s+(billion|million)\b/gi,
    (match, words: string, unit: string) => {
      if (/\d/.test(words)) return match;
      const value = parseEnglishNumberPhrase(words);
      if (value == null || value <= 0) return match;
      return formatCompactDollars(
        value,
        unit.toLowerCase() as "billion" | "million"
      );
    }
  );

  // Drop trailing spelled thousands after a billion (e.g. "$34 billion, five hundred…")
  out = out.replace(
    /\$(\d+(?:\.\d+)?)\s+billion,\s+(?:[a-z\s-]+)(?=[.;,\s]|$)/gi,
    "$$$1 billion"
  );

  // 12 percent → 12%
  out = out.replace(/\b(\d+(?:\.\d+)?)\s+percent\b/gi, "$1%");

  // $111 billion dollars → $111 billion
  out = out.replace(
    /\$(\d+(?:\.\d+)?)\s+(billion|million)\s+dollars\b/gi,
    "$$$1 $2"
  );

  // 111 billion dollars → $111 billion
  out = out.replace(
    /\b(\d+(?:\.\d+)?)\s+(billion|million)\s+dollars\b/gi,
    "$$$1 $2"
  );

  // Digits + billion/million without $
  out = out.replace(
    /\b(?<!\$)(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s+(billion|million)\b/gi,
    "$$$1 $2"
  );

  // three years → 3 years (simple single-word numbers)
  out = out.replace(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+(years|year)\b/gi,
    (_, word: string, unit: string) => {
      const n = WORD_ONES[word.toLowerCase()];
      if (n == null) return _;
      return unit.toLowerCase() === "year" ? `${n} year` : `${n} years`;
    }
  );

  return out;
}

export function sanitizeFinancialAnswerText(text: string): string {
  return normalizeFinancialNumericFormatting(stripMarkdownFromAnswer(text));
}

/**
 * Short plain-text blurb for under charts/maps (2–3 sentences max).
 * Skips bullet lists — those belong in the visual or full answer fallback.
 */
export function extractVisualNarration(plainEnglishAnswer: string): string | null {
  const cleaned = sanitizeFinancialAnswerText(plainEnglishAnswer);
  const withoutInsight = cleaned
    .replace(/\n\s*Why investors care:\s*[\s\S]*$/i, "")
    .replace(/\n\s*Investor insight:\s*.+$/is, "")
    .trim();

  const mainBody = withoutInsight
    .replace(
      /^(?:What we know|What changed|What the filing says|What they actually do|Real-world analogy|Main [Ee]xplanation|Bottom [Ll]ine)\s*:?\s*/gim,
      ""
    )
    .trim();

  const beforeBullets = mainBody.split(/\n\s*[•\-\*]/)[0]?.trim() ?? "";
  const paragraphs = beforeBullets
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n+/g, " ").trim())
    .filter((p) => p.length > 0);

  const prose = paragraphs[0] ?? beforeBullets;
  if (!prose) return null;

  const sentences = prose.match(/[^.!?]+[.!?]+/g) ?? [prose];
  const picked = sentences.slice(0, 3).join(" ").trim();
  if (picked.length < 40) return picked || null;
  if (picked.length > 420) {
    return `${picked.slice(0, 417).trim()}…`;
  }
  return picked;
}
