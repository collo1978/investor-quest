/** Shared phrase patterns for communication quality audits. */

export const CORPORATE_PHRASE_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  { id: "designs_and_sells", re: /\bdesigns and sells\b/i },
  { id: "provides_solutions", re: /\bprovides? solutions\b/i },
  { id: "operates_across", re: /\boperates across\b/i },
  { id: "leverages", re: /\bleverages?\b/i },
  { id: "delivers_value", re: /\bdelivers value\b/i },
  { id: "landscape", re: /\blandscape\b/i },
  { id: "stakeholders", re: /\bstakeholders\b/i },
  { id: "strategic", re: /\bstrategic\b/i },
  { id: "in_simple_terms", re: /\bin simple terms\b/i }
];

export const FINANCE_JARGON_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  { id: "spec_sheets", re: /\bspec sheets?\b/i },
  { id: "stickiness", re: /\bstickiness\b/i },
  { id: "hyperscaler", re: /\bhyperscalers?\b/i },
  { id: "semiconductor", re: /\bsemiconductor\b/i },
  { id: "ebitda", re: /\bebitda\b/i },
  { id: "covenant", re: /\bcovenant/i },
  { id: "basis_points", re: /\bbasis points?\b/i }
];

export const TECH_JARGON_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  { id: "infrastructure", re: /\binfrastructure\b/i },
  { id: "hyperscaler", re: /\bhyperscalers?\b/i },
  { id: "semiconductor", re: /\bsemiconductor\b/i },
  { id: "gpu", re: /\bgpu\b|\bgraphics processing units?\b/i },
  { id: "workload", re: /\bworkloads?\b/i }
];

export const AI_PHRASE_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  { id: "ai_phrasing", re: /\b(it'?s worth noting|in today'?s|delve|tapestry|multifaceted|pivotal|underscores|showcases|boasts|nestled|realm|ever-evolving|cutting-edge|best-in-class|world-class|mission-critical)\b/i }
];

export const TEXTBOOK_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  {
    id: "textbook_tone",
    re: /\b(furthermore|moreover|consequently|nevertheless|in conclusion|it is important to note|one must consider|companies such as)\b/i
  }
];

export const FORCED_ANALOGY_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  {
    id: "forced_analogy",
    re: /\bthink of [\w']+ (?:like|as)\b|\bit'?s like trying to\b|\bpicture it like\b/i
  }
];

export { GENERIC_CUSTOMER_AUDIENCE_PATTERNS } from "@/lib/quests/customerAudienceCopy";

export const INVESTOR_DRIFT_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  {
    id: "investor_drift",
    re: /\b(spec sheets?|stickiness|investors? (?:watch|care|pay attention)|pricing power|recurring revenue|market position|ecosystem strength|customer loyalty|valuation|the product, not|revenue driver)\b/i
  }
];

export const SOFT_JARGON_PATTERNS: ReadonlyArray<{ id: string; re: RegExp }> = [
  { id: "ecosystem_buzz", re: /\b(?:platform|technology|compute|computing)\s+ecosystem\b|\becosystem strength\b/i },
  { id: "solutions", re: /\bsolutions\b/i },
  { id: "innovation_filler", re: /\b(?:the )?innovation behind\b|\bmight not realize the innovation\b|\binnovation hype\b/i }
];

export const EM_DASH_PATTERN = { id: "em_dash", re: /[—–]|\s--\s/ };

export function extractMainStory(text: string): string {
  const trimmed = text.trim();
  const cut = trimmed.match(/\n\s*Why investors care:\s*/i);
  if (cut?.index != null) return trimmed.slice(0, cut.index).trim();
  return trimmed
    .replace(/\n\s*Why it matters:\s*[\s\S]*$/i, "")
    .replace(/\n\s*Investor insight:\s*[\s\S]*$/i, "")
    .trim();
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function scanPatterns(
  text: string,
  patterns: ReadonlyArray<{ id: string; re: RegExp }>
): Array<{ id: string; snippet: string }> {
  const hits: Array<{ id: string; snippet: string }> = [];
  for (const { id, re } of patterns) {
    const m = text.match(re);
    if (m) hits.push({ id, snippet: m[0] });
  }
  return hits;
}
