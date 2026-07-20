/**
 * Fixed Investor Quality Checklist — same seven principles for every company.
 * Cards add evidence; end-of-quest screens capture the learner's binary rating.
 */

export const INVESTOR_QUALITY_CHECKLIST_ITEMS = [
  {
    id: "business-understanding",
    label: "Business Understanding",
    shortLabel: "Understanding",
    emoji: "🧠",
    plainEnglishExplanation:
      "Understanding how the business works and makes money. Great investors avoid investing in businesses they don't understand.",
    tooltipQuestion: "Do I clearly understand how this business works?",
    tooltipWhy: "Never invest in a business you don't understand."
  },
  {
    id: "value-proposition",
    label: "Value Proposition",
    shortLabel: "Value",
    emoji: "❤️",
    plainEnglishExplanation:
      "The reason customers choose this company's products instead of competitors.",
    tooltipQuestion: "Do they have a strong value proposition?",
    tooltipWhy:
      "Customers need a compelling reason to choose them over competitors."
  },
  {
    id: "competitive-advantage",
    label: "Competitive Advantage",
    shortLabel: "Comp Adv",
    emoji: "🏰",
    plainEnglishExplanation:
      "Something that makes a business difficult for competitors to copy or beat.",
    tooltipQuestion: "Do they have a durable competitive advantage?",
    tooltipWhy:
      "Businesses that are difficult to copy are more likely to stay successful over the long term."
  },
  {
    id: "growth-runway",
    label: "Growth Runway",
    shortLabel: "Growth",
    emoji: "🚀",
    plainEnglishExplanation:
      "The company's opportunity to keep growing over the long term.",
    tooltipQuestion: "Do they have a long runway for future growth?",
    tooltipWhy: "Investors look for businesses that can keep growing for many years."
  },
  {
    id: "industry-attractiveness",
    label: "Industry Attractiveness",
    shortLabel: "Industry",
    emoji: "🌍",
    plainEnglishExplanation:
      "Whether the company operates in an industry with good long-term opportunities.",
    tooltipQuestion: "Do they operate in an attractive industry?",
    tooltipWhy:
      "Some industries give companies better long-term opportunities than others."
  },
  {
    id: "business-model",
    label: "Business Model",
    shortLabel: "Model",
    emoji: "⚙️",
    plainEnglishExplanation:
      "How the company makes money and whether it can grow efficiently over time.",
    tooltipQuestion: "Do they have a high-quality business model?",
    tooltipWhy: "Strong business models grow efficiently and sustainably over time."
  },
  {
    id: "operational-resilience",
    label: "Operational Resilience",
    shortLabel: "Resilience",
    emoji: "🛡️",
    plainEnglishExplanation:
      "The business's ability to continue performing well despite challenges or disruptions.",
    tooltipQuestion: "Can the business handle challenges and keep operating well?",
    tooltipWhy:
      "Strong businesses keep performing well when challenges and disruption hit."
  }
] as const;

export type InvestorQualityChecklistItemId =
  (typeof INVESTOR_QUALITY_CHECKLIST_ITEMS)[number]["id"];

export type InvestorQualityChecklistItem =
  (typeof INVESTOR_QUALITY_CHECKLIST_ITEMS)[number];

/** Simple binary rating — negative maps to "Not yet" for Business Understanding only. */
export type InvestorQualityRatingValue = "no" | "yes";

/** @deprecated Legacy stored values — mapped for display only. */
export type LegacyInvestorQualityRatingValue =
  | "not-yet"
  | "mostly"
  | "very-well"
  | "weak"
  | "moderate"
  | "strong";

export type InvestorQualityRating = {
  value: InvestorQualityRatingValue | LegacyInvestorQualityRatingValue;
  updatedAt: number;
  questSlug: string;
};

export type InvestorQualityChecklistSnapshot = {
  /** Total evidence pieces collected per checklist item. */
  evidenceCount: Partial<Record<InvestorQualityChecklistItemId, number>>;
  /** Card slugs (`questSlug#card-id`) that contributed evidence. */
  evidenceCards: Partial<Record<InvestorQualityChecklistItemId, string[]>>;
  ratings: Partial<Record<InvestorQualityChecklistItemId, InvestorQualityRating>>;
};

/** NVIDIA Business Island — card → checklist evidence mapping. */
export const BUSINESS_QUEST_CARD_CHECKLIST_MAP: Record<
  string,
  Record<string, readonly InvestorQualityChecklistItemId[]>
> = {
  "what-they-do": {
    "card-1": ["business-understanding"],
    "card-2": ["business-understanding", "value-proposition"],
    "card-3": ["business-understanding"]
  },
  "why-buying": {
    "card-1": ["business-understanding"],
    "card-2": ["business-understanding"],
    "card-3": ["business-understanding"]
  },
  "everyday-life": {
    "card-1": ["competitive-advantage"],
    "card-2": ["competitive-advantage", "growth-runway"],
    "card-3": ["competitive-advantage"],
    "card-4": ["growth-runway"],
    "card-5": ["competitive-advantage", "business-model"]
  },
  "how-it-works": {
    "card-1": ["business-model"],
    "card-2": ["value-proposition"],
    "card-3": ["competitive-advantage"]
  },
  "why-they-stay": {
    "card-1": ["business-model"],
    "card-2": ["business-model"],
    "card-3": ["operational-resilience"],
    "card-4": ["operational-resilience"]
  },
  competition: {
    "card-1": ["industry-attractiveness"],
    "card-2": ["competitive-advantage"],
    "card-3": ["growth-runway"],
    "card-4": ["industry-attractiveness"]
  },
  "who-competes": {
    "card-1": ["competitive-advantage", "industry-attractiveness"],
    "card-2": ["competitive-advantage", "industry-attractiveness"],
    "card-3": ["competitive-advantage", "industry-attractiveness"],
    "card-4": ["competitive-advantage", "industry-attractiveness"],
    "card-5": ["competitive-advantage", "industry-attractiveness"]
  }
};

/** Principles to rate at end of quest — only if evidence was added this quest. */
export const BUSINESS_QUEST_END_RATING_ITEMS: Record<
  string,
  readonly InvestorQualityChecklistItemId[]
> = {
  "what-they-do": ["business-understanding", "value-proposition"],
  "why-buying": ["business-understanding"],
  "everyday-life": ["competitive-advantage", "growth-runway"],
  "how-it-works": ["value-proposition", "business-model", "competitive-advantage"],
  "why-they-stay": ["business-model", "operational-resilience"],
  competition: ["industry-attractiveness", "growth-runway"],
  "who-competes": ["competitive-advantage", "industry-attractiveness"]
};

export function resolveBinaryRatingOptions(
  itemId: InvestorQualityChecklistItemId
): readonly { value: InvestorQualityRatingValue; label: string }[] {
  const negativeLabel =
    itemId === "business-understanding" ? "Not yet" : "No";
  return [
    { value: "no", label: negativeLabel },
    { value: "yes", label: "Yes" }
  ];
}

export function resolveChecklistItem(
  id: InvestorQualityChecklistItemId
): InvestorQualityChecklistItem {
  const item = INVESTOR_QUALITY_CHECKLIST_ITEMS.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown checklist item: ${id}`);
  return item;
}

export function resolveCardChecklistItems(
  questSlug: string,
  cardId: string
): readonly InvestorQualityChecklistItemId[] {
  return BUSINESS_QUEST_CARD_CHECKLIST_MAP[questSlug]?.[cardId] ?? [];
}

export function resolveQuestEndRatingItems(
  questSlug: string
): readonly InvestorQualityChecklistItemId[] {
  return BUSINESS_QUEST_END_RATING_ITEMS[questSlug] ?? [];
}

function normalizeRatingValue(
  value: InvestorQualityRatingValue | LegacyInvestorQualityRatingValue
): InvestorQualityRatingValue | null {
  if (value === "yes" || value === "no") return value;
  if (value === "very-well" || value === "strong" || value === "mostly") {
    return "yes";
  }
  if (value === "not-yet" || value === "weak" || value === "moderate") {
    return "no";
  }
  return null;
}

export function formatInvestorQualityRatingLabel(
  itemId: InvestorQualityChecklistItemId,
  value:
    | InvestorQualityRatingValue
    | LegacyInvestorQualityRatingValue
    | undefined
    | null
): string | null {
  if (!value) return null;
  const normalized = normalizeRatingValue(value);
  if (!normalized) return null;
  return (
    resolveBinaryRatingOptions(itemId).find((opt) => opt.value === normalized)
      ?.label ?? null
  );
}

/** Company-specific assessment question — three-part copy for the rating card. */
export type CompanyAssessmentQuestion = {
  beforeHighlight: string;
  companyHighlight: string;
  afterHighlight: string;
};

export function resolveCompanyAssessmentQuestion(
  itemId: InvestorQualityChecklistItemId,
  companyName: string
): CompanyAssessmentQuestion {
  switch (itemId) {
    case "business-understanding":
      return {
        beforeHighlight: "Would you say ",
        companyHighlight: `${companyName}'s business`,
        afterHighlight: " is easy to understand?"
      };
    case "value-proposition":
      return {
        beforeHighlight: "Do you think ",
        companyHighlight: companyName,
        afterHighlight: " has a strong value proposition?"
      };
    case "competitive-advantage":
      return {
        beforeHighlight: "Would you say it would be difficult for competitors to beat ",
        companyHighlight: companyName,
        afterHighlight: "?"
      };
    case "growth-runway":
      return {
        beforeHighlight: "Would you say ",
        companyHighlight: companyName,
        afterHighlight: " has plenty of room to keep growing?"
      };
    case "industry-attractiveness":
      return {
        beforeHighlight: "Would you say the industry ",
        companyHighlight: companyName,
        afterHighlight: " operates in is attractive?"
      };
    case "business-model":
      return {
        beforeHighlight: "Would you say ",
        companyHighlight: `${companyName}'s business model`,
        afterHighlight: " is strong?"
      };
    case "operational-resilience":
      return {
        beforeHighlight: "Would you say ",
        companyHighlight: companyName,
        afterHighlight: " could handle challenges and keep operating?"
      };
    default:
      return {
        beforeHighlight: "Would you say ",
        companyHighlight: companyName,
        afterHighlight: " measures up on this quality?"
      };
  }
}

export function resolveEndOfQuestRatingQuestion(
  itemId: InvestorQualityChecklistItemId,
  companyName: string
): string {
  const parts = resolveCompanyAssessmentQuestion(itemId, companyName);
  return `${parts.beforeHighlight}${parts.companyHighlight}${parts.afterHighlight}`;
}

export const INVESTOR_QUALITY_ASSESSMENT_STYLES = [
  "verdict",
  "strength-meter",
  "slider",
  "investor-stamp",
  "evidence-scale"
] as const;

export type InvestorQualityAssessmentStyle =
  (typeof INVESTOR_QUALITY_ASSESSMENT_STYLES)[number];

/** Each investing principle gets a consistent judgment style across Business Island. */
export function resolveAssessmentStyleForItem(
  itemId: InvestorQualityChecklistItemId
): InvestorQualityAssessmentStyle {
  switch (itemId) {
    case "business-understanding":
      return "verdict";
    case "value-proposition":
      return "verdict";
    case "competitive-advantage":
      return "slider";
    case "growth-runway":
      return "investor-stamp";
    case "industry-attractiveness":
      return "evidence-scale";
    case "business-model":
      return "verdict";
    case "operational-resilience":
      return "verdict";
    default: {
      const index = INVESTOR_QUALITY_CHECKLIST_ITEMS.findIndex(
        (item) => item.id === itemId
      );
      return INVESTOR_QUALITY_ASSESSMENT_STYLES[
        Math.max(0, index) % INVESTOR_QUALITY_ASSESSMENT_STYLES.length
      ]!;
    }
  }
}

/** @deprecated Prefer resolveAssessmentStyleForItem for stable per-principle styles. */
export function resolveAssessmentStyleForIndex(
  index: number
): InvestorQualityAssessmentStyle {
  return INVESTOR_QUALITY_ASSESSMENT_STYLES[
    index % INVESTOR_QUALITY_ASSESSMENT_STYLES.length
  ]!;
}

export function countChecklistEvidence(
  snapshot: InvestorQualityChecklistSnapshot
): number {
  return INVESTOR_QUALITY_CHECKLIST_ITEMS.reduce(
    (sum, item) => sum + (snapshot.evidenceCount[item.id] ?? 0),
    0
  );
}

export function countChecklistRated(
  snapshot: InvestorQualityChecklistSnapshot
): number {
  return INVESTOR_QUALITY_CHECKLIST_ITEMS.filter(
    (item) => snapshot.ratings[item.id]?.value
  ).length;
}

export type InvestorQualityChecklistRow = InvestorQualityChecklistItem & {
  evidenceCount: number;
  rating: InvestorQualityRating | null;
  ratingLabel: string | null;
};

export function resolveInvestorQualityChecklistRows(
  snapshot: InvestorQualityChecklistSnapshot
): InvestorQualityChecklistRow[] {
  return INVESTOR_QUALITY_CHECKLIST_ITEMS.map((item) => {
    const rating = snapshot.ratings[item.id] ?? null;
    return {
      ...item,
      evidenceCount: snapshot.evidenceCount[item.id] ?? 0,
      rating,
      ratingLabel: rating
        ? formatInvestorQualityRatingLabel(item.id, rating.value)
        : null
    };
  });
}

/** Items eligible for end-of-quest rating given evidence collected this quest session. */
export function resolvePendingQuestRatingItems(
  questSlug: string,
  sessionEvidenceItems: readonly InvestorQualityChecklistItemId[]
): InvestorQualityChecklistItemId[] {
  const endItems = resolveQuestEndRatingItems(questSlug);
  const sessionSet = new Set(sessionEvidenceItems);
  return endItems.filter((id) => sessionSet.has(id));
}

/** Rebuild quest session evidence from engine read slugs (browser session resume). */
export function resolveQuestEvidenceFromReadSlugs(
  questSlug: string,
  readQuestSlugs: readonly string[]
): InvestorQualityChecklistItemId[] {
  const items = new Set<InvestorQualityChecklistItemId>();
  for (const markSlug of readQuestSlugs) {
    if (!markSlug.startsWith(`${questSlug}#`) && markSlug !== questSlug) continue;
    const cardId = markSlug.includes("#")
      ? markSlug.split("#")[1]!
      : "card-1";
    for (const itemId of resolveCardChecklistItems(questSlug, cardId)) {
      items.add(itemId);
    }
  }
  return [...items];
}

/** Segmented bar width used in the quest sidebar panel. */
export const CHECKLIST_DISPLAY_SEGMENTS = 6;

export type ChecklistProgressTone = "empty" | "evidence" | "yes" | "no";

/** Max collectible evidence per principle across all Business Island quests. */
export function resolveMaxEvidenceCounts(): Record<
  InvestorQualityChecklistItemId,
  number
> {
  const counts = Object.fromEntries(
    INVESTOR_QUALITY_CHECKLIST_ITEMS.map((item) => [item.id, 0])
  ) as Record<InvestorQualityChecklistItemId, number>;

  for (const questCards of Object.values(BUSINESS_QUEST_CARD_CHECKLIST_MAP)) {
    for (const itemIds of Object.values(questCards)) {
      for (const itemId of itemIds) {
        counts[itemId] += 1;
      }
    }
  }

  return counts;
}

const MAX_EVIDENCE_BY_ITEM = resolveMaxEvidenceCounts();

export function resolveMaxEvidenceForItem(
  itemId: InvestorQualityChecklistItemId
): number {
  return Math.max(1, MAX_EVIDENCE_BY_ITEM[itemId] ?? 1);
}

/** Visible progress slots per quality (island max evidence, capped for UI). */
export function resolveDisplaySlotCount(
  itemId: InvestorQualityChecklistItemId
): number {
  return Math.min(
    CHECKLIST_DISPLAY_SEGMENTS,
    resolveMaxEvidenceForItem(itemId)
  );
}

/** Filled segment count — one lit slot per evidence piece, capped to display slots. */
export function resolveFilledSegmentCount(
  evidenceCount: number,
  itemId: InvestorQualityChecklistItemId
): number {
  if (evidenceCount <= 0) return 0;
  return Math.min(resolveDisplaySlotCount(itemId), evidenceCount);
}

export function normalizeStoredRatingValue(
  value: InvestorQualityRatingValue | LegacyInvestorQualityRatingValue | undefined
): InvestorQualityRatingValue | null {
  if (!value) return null;
  return normalizeRatingValue(value);
}

/** Bar colour tone — evidence fill only; assessment turns fill green/red. */
export function resolveChecklistProgressTone(
  evidenceCount: number,
  ratingValue:
    | InvestorQualityRatingValue
    | LegacyInvestorQualityRatingValue
    | undefined
): ChecklistProgressTone {
  if (evidenceCount <= 0) return "empty";
  const normalized = normalizeStoredRatingValue(ratingValue);
  if (normalized === "yes") return "yes";
  if (normalized === "no") return "no";
  return "evidence";
}

export type ChecklistQuestPanelRow = InvestorQualityChecklistItem & {
  evidenceCount: number;
  displaySlots: number;
  filledSegments: number;
  tone: ChecklistProgressTone;
  ratingLabel: string | null;
};

export function resolveChecklistQuestPanelRows(
  snapshot: InvestorQualityChecklistSnapshot
): ChecklistQuestPanelRow[] {
  return INVESTOR_QUALITY_CHECKLIST_ITEMS.map((item) => {
    const evidenceCount = snapshot.evidenceCount[item.id] ?? 0;
    const rating = snapshot.ratings[item.id];
    const tone = resolveChecklistProgressTone(evidenceCount, rating?.value);
    const displaySlots = resolveDisplaySlotCount(item.id);
    return {
      ...item,
      evidenceCount,
      displaySlots,
      filledSegments: resolveFilledSegmentCount(evidenceCount, item.id),
      tone,
      ratingLabel: rating
        ? formatInvestorQualityRatingLabel(item.id, rating.value)
        : null
    };
  });
}
