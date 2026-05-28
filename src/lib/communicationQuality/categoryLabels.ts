import type { CommunicationCategoryId } from "@/lib/communicationQuality/types";

export const COMMUNICATION_CATEGORY_DEFS: ReadonlyArray<{
  id: CommunicationCategoryId;
  label: string;
  description: string;
  checkId: string;
}> = [
  {
    id: "conversational_tone",
    label: "Conversational tone",
    description: "Natural, human voice — not robotic or textbook-like.",
    checkId: "communication_conversational_tone"
  },
  {
    id: "beginner_friendliness",
    label: "Beginner friendliness",
    description: "A beginner can follow without assumed finance or tech knowledge.",
    checkId: "communication_beginner_friendliness"
  },
  {
    id: "question_alignment",
    label: "Question alignment",
    description: "The answer stays focused on the question being asked.",
    checkId: "communication_question_alignment"
  },
  {
    id: "jargon_detection",
    label: "Jargon detection",
    description: "Finance, tech, corporate, and consultant wording flagged.",
    checkId: "communication_jargon_detection"
  },
  {
    id: "human_tone",
    label: "Human tone",
    description: "Sounds like a smart friend — not an AI rewriting a filing.",
    checkId: "communication_human_tone"
  },
  {
    id: "emotional_clarity",
    label: "Emotional clarity",
    description: "Easy to picture and emotionally intuitive for the player.",
    checkId: "communication_emotional_clarity"
  },
  {
    id: "cognitive_load",
    label: "Cognitive load",
    description: "Sentences are not too dense, abstract, or long.",
    checkId: "communication_cognitive_load"
  },
  {
    id: "investor_clarity",
    label: "Investor clarity",
    description: "Player understands why this matters and why investors care.",
    checkId: "communication_investor_clarity"
  }
];

export const COMMUNICATION_OVERALL_CHECK_ID = "communication_health_overall";

export const WARNING_COPY: Record<string, string> = {
  spec_sheets: '"spec sheets" may be too technical for beginners',
  stickiness: '"stickiness" is investor jargon — use plain loyalty language',
  leverages: 'Corporate wording detected ("leverages")',
  operates_across: 'Corporate wording detected ("operates across")',
  provides_solutions: 'Consultant phrasing detected ("provides solutions")',
  designs_and_sells: 'Corporate opener detected ("designs and sells")',
  in_simple_terms: 'Teacher wrap-up detected ("in simple terms")',
  em_dash: "Em dash or double hyphen detected. Use periods or commas instead",
  forced_analogy: 'Forced analogy detected ("Think of it like…")',
  investor_drift: "Investor analysis appearing too early in the main story",
  question_drift: "Answer drift detected — does not stay on the card question",
  question_drift_problem: "Customer-problem card drifted away from the everyday problem",
  ai_phrasing: "Sounds AI-generated",
  textbook_tone: "Textbook or essay tone detected",
  clever_meta: "Clever meta opening skips the real answer",
  too_long: "Sentence complexity too high — answer is too long",
  dense_sentences: "Sentences are too dense or overloaded",
  missing_real_life: "Hard to visualize — missing a real-life hook",
  missing_why_investors_care: "Investor takeaway unclear — missing why investors care",
  template_fallback: "No generated copy yet — template placeholder",
  empty: "Empty player-facing copy",
  corporate_opening: "Corporate or SEC-style opening",
  soft_jargon_stack: "Multiple soft jargon signals stacked together",
  innovation_filler: 'Vague "innovation" without a concrete everyday result',
  landscape: 'Buzzword detected ("landscape")',
  infrastructure: 'Tech jargon detected ("infrastructure")',
  hyperscaler: 'Finance/tech jargon detected ("hyperscaler")',
  ecosystem_buzz: 'Buzzword detected ("ecosystem")',
  stakeholders: 'Corporate wording detected ("stakeholders")',
  solutions: 'Corporate wording detected ("solutions")',
  hard_jargon: "Hard jargon detected — rewrite in everyday language",
  regular_people:
    'Vague audience phrasing ("regular people") — name WHO buys and WHY',
  normal_consumers:
    'Vague audience phrasing ("normal consumers") — name a specific customer segment',
  everyone:
    'Too generic ("everyone") — identify target customers and how they buy',
  all_kinds_of_users:
    'Too vague ("all kinds of users") — name the main customer type',
  people_upgrading_phones:
    'Weak phrasing ("people upgrading phones") — explain WHO buys and WHY the model is strong',
  most_buyers_regular:
    'Weak opener ("most buyers are regular") — use investor-quality customer insight',
  generic_customer_audience:
    "Customer/audience answer is too vague — identify WHO buys, WHY they buy, and WHY the model is strong",
  missing_target_customer_focus:
    "Missing target customer, value proposition, or business-model strength (loyalty, ecosystem, switching costs)"
};

export function warningMessage(code: string, snippet?: string): string {
  const base = WARNING_COPY[code] ?? `Communication issue: ${code.replace(/_/g, " ")}`;
  if (snippet?.trim()) return `${base} — "${snippet.trim().slice(0, 48)}"`;
  return base;
}

export function categoryLabel(id: CommunicationCategoryId): string {
  return COMMUNICATION_CATEGORY_DEFS.find((c) => c.id === id)?.label ?? id;
}

export function scoreToHealthStatus(score: number): "pass" | "warn" | "fail" {
  if (score >= 85) return "pass";
  if (score >= 65) return "warn";
  return "fail";
}
