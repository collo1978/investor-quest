/**
 * R&D, innovation, moat, and competitive-advantage card copy.
 * Used in AI prompts, human-first gates, and communication audits.
 */

/** Casual filler and hype tails — reject in player copy. */
export const INNOVATION_RD_CASUAL_FILLER_RE =
  /\b(whatever'?s next|and so on|you name it|the next big thing|stay ahead of the curve|game[- ]?changer|disrupt(?:ing|ive)?|bleeding[- ]edge|cutting[- ]edge|next[- ]level|pours billions|pouring billions|leaped to|your life already lives here|close the gap fast|subscription to staying|R&D is the subscription)\b/i;

/** Buzzword stacks: long comma lists of tech categories without teaching. */
export const INNOVATION_RD_BUZZWORD_STACK_RE =
  /\b(?:custom chips?|cameras?|AI|Vision Pro|silicon|ecosystem|proprietary tech)[^.]{0,80}(?:,\s*(?:custom chips?|cameras?|AI|Vision Pro|silicon|ecosystem|proprietary|software|hardware)){2,}/i;

/** Cinematic / tech-bro marketing tone. */
export const INNOVATION_RD_HYPE_RE =
  /\b(unstoppable|dominat(?:e|ing) the|crush(?:es|ing)? rivals?|world[- ]class innovation|innovation machine|innovation powerhouse|tech giant flex|fearless bet|moonshot|revolutionary breakthrough)\b/i;

/** Main story explains investment + why it matters for the business. */
export const INNOVATION_RD_FOCUS_RE =
  /\b(invest|R&D|research and development|develop|improve|hardware|software|chips?|devices?|capabilities|integration|competitor|rival|copy|hard to copy|advantage|moat|ecosystem|switching|patents?|brand|proprietary|pricing power|premium|stay competitive|product cycle)\b/i;

export const INNOVATION_RD_HARD_RULES = `R&D / INNOVATION / MOAT CARDS
- Sentence 1: WHAT the company invests in (devices, chips, software, AI, product integration) — direct educational language, not a buzzword list.
- Sentence 2: WHY it matters — business impact (ecosystem strength, integration, cost or performance edge, switching costs, innovation moat).
- Sentence 3 (optional): One concrete filing-backed example (e.g. custom chips, cross-device features).
- BANNED: "whatever's next", "pours billions into", dramatic narration, hype, random comma-separated tech lists, tech-bro marketing.
- Tone: intelligent, clean, beginner-friendly, investor-focused — NOT cinematic or AI narration.
- You MAY name chips, software, AI, and ecosystem when each term teaches something (not stacked for effect).`;

export const INNOVATION_RD_STYLE_REFERENCE = `STYLE REFERENCE (R&D / moat — tone only):
"Apple invests heavily in R&D to improve its devices, chips, software, and AI capabilities.

That spending helps Apple ship integrated features across iPhone, Mac, and iPad and defend its premium position.

If rivals match speed and integration, upgrade cycles can slow.

Why investors care:
Steady R&D supports pricing power and keeps customers in the ecosystem."`;

export const INNOVATION_MOAT_STYLE_REFERENCE = `STYLE REFERENCE (what protects the business — tone only):
"Apple's edge comes from its brand, proprietary chips, software, and products that work together.

Customers stay because photos, messages, and subscriptions are tied to Apple devices.

Switching platforms means rebuilding habits and paid services.

Why investors care:
Hard-to-leave customers support higher prices and more Services revenue per buyer."`;

export const INNOVATION_RD_BAD_PATTERNS: ReadonlyArray<{
  id: string;
  re: RegExp;
}> = [
  { id: "whatevers_next", re: /\bwhatever'?s next\b/i },
  { id: "pours_billions", re: /\bpours? billions\b/i },
  { id: "rd_subscription", re: /\bR&D is the subscription\b/i },
  { id: "life_lives_here", re: /\byour life already lives here\b/i }
];

export function hasInnovationRdCasualFiller(text: string): boolean {
  return INNOVATION_RD_CASUAL_FILLER_RE.test(text);
}

export function hasInnovationRdBuzzwordStack(text: string): boolean {
  return INNOVATION_RD_BUZZWORD_STACK_RE.test(text);
}

export function hasInnovationRdHype(text: string): boolean {
  return INNOVATION_RD_HYPE_RE.test(text);
}

export function hasInnovationRdFocus(text: string): boolean {
  return INNOVATION_RD_FOCUS_RE.test(text);
}

export function hasInnovationRdQualityIssue(text: string): boolean {
  return (
    hasInnovationRdCasualFiller(text) ||
    hasInnovationRdBuzzwordStack(text) ||
    hasInnovationRdHype(text)
  );
}

/** Light cleanup for legacy stored answers (curated + DB). */
export function polishInnovationRdCopy(text: string): string {
  let out = text;
  out = out.replace(/\bwhatever'?s next\b/gi, "future products");
  out = out.replace(/\bpours billions into R&D\b/gi, "invests heavily in R&D");
  out = out.replace(/\bR&D is the subscription to staying premium\b/gi, "R&D helps defend premium pricing");
  out = out.replace(/\byour life already lives here\b/gi, "daily life is already tied to Apple");
  out = out.replace(/\bclose the gap fast\b/gi, "catch up quickly");
  return out;
}
