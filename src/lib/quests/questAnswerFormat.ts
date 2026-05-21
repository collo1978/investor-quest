import { sanitizeQuestAnswerText } from "@/lib/quests/sanitizeQuestAnswer";

/** Shared voice — instant clarity, not a mini article. */
export const QUEST_BEGINNER_VOICE = `VOICE
- TikTok clarity + Apple simplicity: one beat per sentence, spoken aloud in your head.
- Goal: "Ohhh… I get what this company does now." NOT "I'm reading a simplified tech article."
- Conversational, light, fast — never comprehensive, never lecture-y.
- Pick ONE idea for this card. Leave everything else out.

TEENAGER PICTURE TEST (hard rule — enforced before save)
- If a normal teenager cannot instantly picture where this company shows up in real life → rewrite.
- They should understand what it helps power and why people use it — NOT technical product categories.

LENGTH (hard cap)
- Before "Why investors care:" write at most 4 short sentences (3 is ideal).
- Each sentence: roughly 8–14 words. Never stack clauses with "and" / "which" / "while".
- Main story: ~45–75 words total. If you wrote more, cut until it fits.

STRUCTURE (exactly this shape)
1. One relatable everyday moment (games, shopping, phones, streaming, driving, work tools people know).
2. One simple analogy ("Think of it like…" / "It's like…") — one image only.
3. One plain sentence: what the company helps people DO or what role it plays in everyday life for THIS card — human terms only.
4. Optional 4th sentence ONLY if the card question needs one filing fact you cannot fold into sentence 3.

SENTENCE 3 — CRITICAL (what they do / role in life)
- Explain what technology helps people DO and where people already experience it.
- NOT what the technical system is called.
- BAD: "They mainly sell powerful graphics processing units for computing platforms."
- BAD: "They provide accelerated computing infrastructure for complex tasks."
- GOOD: "They make the powerful chips helping AI tools, games, and smart technology run faster and smoother."
- GOOD: "They earn money selling those chips to big tech and game companies."
- Never end the main story on a technical category name.

REAL-WORLD FIRST — NOT TECHNICAL-FIRST
- Do NOT begin with: GPUs, infrastructure, accelerated computing, cloud platforms, ecosystems, rendering, analytics, SDKs, computing platforms, semiconductor terminology.
- Start with where people already experience the company, products/tools they recognize, everyday situations.

JARGON (zero tolerance — auto-rejected)
- BANNED: GPU, graphics processing unit, SDK, rendering, infrastructure, analytics, accelerated computing, data center, data center platform, computing platform, cloud platform, semiconductor, hyperscaler, workload, complex tasks, processing units, networks of computers, ecosystem (buzzword), training AI models.
- BANNED phrases: "rendering realistic graphics", "computing platforms", "specialized chips for advanced computing".
- Prefer: "chips helping AI tools and games run faster", "tech inside phones you already use", "tools that feel fast when you scroll or play".

OPENING RULE
- Sentence 1 MUST be everyday life — never open with what the company builds technically.
- Good: "If you've used a popular AI chat app…", "When you play a sharp-looking game…", "You might not see their name, but…"
- Bad first words: [Company] develops, provides, specializes, offers solutions, builds platforms, They mainly sell [technical noun].

HUMAN UNDERSTANDING > TECHNICAL PRECISION
- Optimize for instantly understandable — not technically comprehensive.

CUSTOMER PROBLEM QUESTIONS ("What problem does it solve…")
- Lead with pain WITHOUT the company, then consequence, then analogy, then benefit WITH them.
- Never: industries tour, "solutions", innovation hype, "technology is crucial", company-description-first.
- Good: "without this, games lag, AI feels slow, apps struggle to respond quickly."

BANNED
- Section headings in the story (no "What we know", "Bottom line", etc.)
- Bullet points, numbered lists, corporate filler ("leverages", "landscape", "strategic", "robust", "synergies", "industries", "innovation" as filler)
- Repeating the same idea twice; extra "also" sentences`;

/** Sentence order for the main explanation (before Why investors care). */
export const QUEST_ANSWER_FORMAT = `FORMAT (strict)
- NO markdown: no **, no #, no bullets (• - *), no backticks.
- NO headings inside the main story.

Write at most 4 short sentences for the main story (3 preferred). You may use one blank line after sentence 2 for breathing room — do not write long paragraphs.

Sentence 1 — EVERYDAY MOMENT (required)
One familiar situation the reader can picture in 2 seconds.

Sentence 2 — ANALOGY (required)
One "Think of it like…" line. Warm, not childish.

Sentence 3 — WHAT THEY HELP DO (required)
One clear plain-English line: what role the company plays in everyday life or what it helps power for THIS card only. Use what people notice, not engineering categories. No extra topics.

Sentence 4 — OPTIONAL
Only if sentence 3 cannot answer the card without one more plain fact. Otherwise skip.

Then one blank line and the only allowed label:
Why investors care:
Exactly 1 short sentence — the investor takeaway. No Wall Street slang.

- Answer ONLY this card's question. Do not repeat earlier cards on this quest.

STYLE REFERENCE (length and tone only — use THIS company's facts from excerpts):
"If you've used a popular AI chat app or played a sharp-looking game, you've already bumped into NVIDIA's world.

Think of them like the shop that sells the engine inside many smart computers — not the app you tap on.

They make the powerful chips helping AI tools, games, and smart technology run faster and smoother.

Why investors care:
If AI and gaming keep growing, demand for those engines can keep rising."`;

export type RelatableAnswerSections = {
  paragraphs: string[];
  whyInvestorsCare: string | null;
};

const ANALYST_HEADING =
  /^(?:What we know|What changed|What the filing says|Bottom line|Main [Ee]xplanation|What they actually do|Real-world analogy|Investor insight|Simple version|Why it matters)\s*:?\s*\n?/gim;

function stripAnalystHeadings(text: string): string {
  return text
    .replace(ANALYST_HEADING, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(body: string): string[] {
  const chunks = stripAnalystHeadings(body)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n+/g, " ").trim())
    .filter((p) => p.length > 0);

  if (chunks.length > 0) return chunks;

  const single = body.replace(/\n+/g, " ").trim();
  return single ? [single] : [];
}

/** Parse stored answer into flowing paragraphs + why (footer). */
export function parseRelatableQuestAnswer(
  plainEnglishAnswer: string | null | undefined,
  investorInsight?: string | null
): RelatableAnswerSections | null {
  const raw = plainEnglishAnswer?.trim();
  if (!raw) return null;

  let body = raw
    .replace(/\n\s*Simple [Vv]ersion:\s*[\s\S]*$/i, "")
    .trim();

  let why = investorInsight?.trim() || null;

  const embeddedWhy = body.match(/\n\s*Why investors care:\s*\n?([\s\S]+)$/i);
  if (embeddedWhy?.index != null) {
    body = body.slice(0, embeddedWhy.index).trim();
    why = why || embeddedWhy[1].trim() || null;
  } else {
    const legacyWhy = body.match(/\n\s*Why it matters:\s*\n?([\s\S]+)$/i);
    if (legacyWhy?.index != null) {
      body = body.slice(0, legacyWhy.index).trim();
      why = why || legacyWhy[1].trim() || null;
    } else {
      const legacyInsight = body.match(/\n\s*Investor insight:\s*(.+)\s*$/i);
      if (legacyInsight?.index != null) {
        body = body.slice(0, legacyInsight.index).trim();
        why = why || legacyInsight[1].trim() || null;
      }
    }
  }

  body = stripAnalystHeadings(body);

  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0 && !why) return null;

  return {
    paragraphs,
    whyInvestorsCare: why
  };
}

export function questAnswerPreviewText(
  plainEnglishAnswer: string,
  investorInsight?: string | null,
  maxLen = 220
): string {
  const parsed = parseRelatableQuestAnswer(plainEnglishAnswer, investorInsight);
  const combined = parsed
    ? parsed.paragraphs.join(" ")
    : plainEnglishAnswer;
  const t = combined.replace(/\s+/g, " ").trim();
  return t.length > maxLen ? `${t.slice(0, maxLen - 1).trim()}…` : t;
}

export function splitQuestAnswer(
  raw: string,
  sanitize: (text: string) => string = sanitizeQuestAnswerText
): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  let cleaned = sanitize(raw)
    .replace(/\n\s*Simple [Vv]ersion:\s*[\s\S]*$/i, "")
    .trim();

  let why: string | null = null;
  const whyMatch = cleaned.match(/\n\s*Why investors care:\s*\n?([\s\S]+)$/i);
  if (whyMatch?.index != null) {
    cleaned = cleaned.slice(0, whyMatch.index).trim();
    why = whyMatch[1].trim() || null;
  } else {
    const legacyWhy = cleaned.match(/\n\s*Why it matters:\s*\n?([\s\S]+)$/i);
    if (legacyWhy?.index != null) {
      cleaned = cleaned.slice(0, legacyWhy.index).trim();
      why = legacyWhy[1].trim() || null;
    } else {
      const legacyInsight = cleaned.match(/\n\s*Investor insight:\s*(.+)\s*$/i);
      if (legacyInsight?.index != null) {
        cleaned = cleaned.slice(0, legacyInsight.index).trim();
        why = legacyInsight[1].trim() || null;
      }
    }
  }

  const paragraphs = splitParagraphs(cleaned);
  const plainEnglishAnswer = paragraphs.join("\n\n").trim();

  return {
    plainEnglishAnswer,
    investorInsight: why
  };
}
