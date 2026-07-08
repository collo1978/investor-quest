import type { CompanyId } from "@/data/companies";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { ChecklistSectionQuizStatus } from "@/lib/business/businessChecklistSectionQuizHelpers";
import {
  isSectionPrinciplesEvidenceComplete,
  resolveSectionQuizStatus
} from "@/lib/business/businessChecklistSectionQuizHelpers";

import type { BusinessInvestorFrameworkStoredState } from "@/lib/business/businessInvestorFrameworkStorage";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";

export type { ChecklistSectionQuizStatus } from "@/lib/business/businessChecklistSectionQuizHelpers";

/** Binary evidence rating — rolls up to principle and section. */
export type InvestorEvidenceRating = "strong" | "weak";

/** Computed rollup for principles and sections. */
export type InvestorRollupRating = "strong" | "weak" | "mixed";

export type BusinessChecklistSectionId =
  | "company-overview"
  | "products-services"
  | "customers-markets"
  | "business-model"
  | "competitive-position"
  | "operations";

export type InvestorPrincipleId =
  | "business-purpose"
  | "company-evolution"
  | "global-presence"
  | "value-proposition"
  | "product-portfolio"
  | "innovation"
  | "customer-base"
  | "end-markets"
  | "geographic-reach"
  | "revenue-model"
  | "revenue-drivers"
  | "business-structure"
  | "competitive-advantage"
  | "market-position"
  | "competitive-strategy"
  | "supply-chain"
  | "sales-distribution"
  | "partnerships-ecosystem";

export type BusinessInvestorSectionDef = {
  id: BusinessChecklistSectionId;
  label: string;
  emoji: string;
  order: number;
  /** Hub quest that unlocks this section's evidence path. */
  questSlug: string;
};

export type BusinessInvestorPrincipleDef = {
  id: InvestorPrincipleId;
  sectionId: BusinessChecklistSectionId;
  label: string;
  orderInSection: number;
  whyItMatters: string;
};

export const BUSINESS_INVESTOR_CHECKLIST_SECTIONS: readonly BusinessInvestorSectionDef[] =
  [
    {
      id: "company-overview",
      label: "Company Overview",
      emoji: "🏢",
      order: 1,
      questSlug: "what-they-do"
    },
    {
      id: "products-services",
      label: "Products & Services",
      emoji: "📦",
      order: 2,
      questSlug: "why-buying"
    },
    {
      id: "customers-markets",
      label: "Customers & Markets",
      emoji: "👥",
      order: 3,
      questSlug: "everyday-life"
    },
    {
      id: "business-model",
      label: "Business Model",
      emoji: "💰",
      order: 4,
      questSlug: "how-it-works"
    },
    {
      id: "competitive-position",
      label: "Competitive Position",
      emoji: "🏆",
      order: 5,
      questSlug: "competition"
    },
    {
      id: "operations",
      label: "Operations",
      emoji: "⚙️",
      order: 6,
      questSlug: "why-they-stay"
    }
  ];

export const BUSINESS_INVESTOR_PRINCIPLES: readonly BusinessInvestorPrincipleDef[] =
  [
    {
      id: "business-purpose",
      sectionId: "company-overview",
      label: "Business Purpose",
      orderInSection: 1,
      whyItMatters:
        "Understanding why a company exists helps you understand what it's trying to achieve."
    },
    {
      id: "company-evolution",
      sectionId: "company-overview",
      label: "Company Evolution",
      orderInSection: 2,
      whyItMatters:
        "Seeing how a company has evolved shows whether it can adapt and grow."
    },
    {
      id: "global-presence",
      sectionId: "company-overview",
      label: "Global Presence",
      orderInSection: 3,
      whyItMatters:
        "Knowing where a company operates helps you understand its size and reach."
    },
    {
      id: "value-proposition",
      sectionId: "products-services",
      label: "Value Proposition",
      orderInSection: 1,
      whyItMatters:
        "Investors look for businesses that solve real customer problems and offer something competitors struggle to match."
    },
    {
      id: "product-portfolio",
      sectionId: "products-services",
      label: "Product Portfolio",
      orderInSection: 2,
      whyItMatters:
        "A broad range of products can reduce risk and create more opportunities for future growth."
    },
    {
      id: "innovation",
      sectionId: "products-services",
      label: "Innovation",
      orderInSection: 3,
      whyItMatters:
        "Companies that keep innovating are more likely to stay competitive over the long term."
    },
    {
      id: "customer-base",
      sectionId: "customers-markets",
      label: "Customer Base",
      orderInSection: 1,
      whyItMatters:
        "Investors prefer companies with a large and diverse customer base rather than relying on just a few customers."
    },
    {
      id: "end-markets",
      sectionId: "customers-markets",
      label: "End Markets",
      orderInSection: 2,
      whyItMatters:
        "Companies serving multiple growing markets often have more opportunities to grow over time."
    },
    {
      id: "geographic-reach",
      sectionId: "customers-markets",
      label: "Geographic Reach",
      orderInSection: 3,
      whyItMatters:
        "Companies that operate globally can reach more customers and aren't dependent on one country's economy."
    },
    {
      id: "revenue-model",
      sectionId: "business-model",
      label: "Revenue Model",
      orderInSection: 1,
      whyItMatters:
        "Understanding how a company makes money is essential before investing."
    },
    {
      id: "revenue-drivers",
      sectionId: "business-model",
      label: "Revenue Drivers",
      orderInSection: 2,
      whyItMatters:
        "Investors want to know what is actually driving future growth, not just what the company sells today."
    },
    {
      id: "business-structure",
      sectionId: "business-model",
      label: "Business Structure",
      orderInSection: 3,
      whyItMatters:
        "Understanding how a business is organised helps investors see where revenue comes from and how management reports performance."
    },
    {
      id: "competitive-advantage",
      sectionId: "competitive-position",
      label: "Competitive Advantage",
      orderInSection: 1,
      whyItMatters:
        "Great businesses have something that competitors struggle to copy, allowing them to stay successful for many years."
    },
    {
      id: "market-position",
      sectionId: "competitive-position",
      label: "Market Position",
      orderInSection: 2,
      whyItMatters:
        "Market leaders often have stronger brands, better customer relationships and more resources to keep growing."
    },
    {
      id: "competitive-strategy",
      sectionId: "competitive-position",
      label: "Competitive Strategy",
      orderInSection: 3,
      whyItMatters:
        "Investors want to know how a company plans to stay ahead as technology changes."
    },
    {
      id: "supply-chain",
      sectionId: "operations",
      label: "Supply Chain",
      orderInSection: 1,
      whyItMatters:
        "A reliable supply chain helps the business deliver products consistently."
    },
    {
      id: "sales-distribution",
      sectionId: "operations",
      label: "Sales & Distribution",
      orderInSection: 2,
      whyItMatters:
        "Even great products need an effective way to reach customers."
    },
    {
      id: "partnerships-ecosystem",
      sectionId: "operations",
      label: "Partnerships & Ecosystem",
      orderInSection: 3,
      whyItMatters:
        "Strong partnerships can strengthen the business and create long-term advantages."
    }
  ];

/** Principles marked N/A by default for a company (adaptive checklist). */
export const DEFAULT_NA_PRINCIPLES_BY_COMPANY: Partial<
  Record<CompanyId, readonly InvestorPrincipleId[]>
> = {};

export type ChecklistSectionProgressState = "locked" | "active" | "completed";

export type InvestorPrincipleStatus = "locked" | "active" | "na" | "rated";

export type InvestorEvidenceSlotView = {
  cardId: string;
  /** null = not yet rated; strong/weak = player's thumbs choice. */
  rating: InvestorEvidenceRating | null;
};

export type InvestorPrincipleView = BusinessInvestorPrincipleDef & {
  status: InvestorPrincipleStatus;
  /** Computed from evidence ratings — never set manually. */
  rating: InvestorRollupRating | null;
  /** Strong / Weak / Mixed when rated — never "Pending". */
  ratingLabel: string | null;
  evidenceRatingCount: number;
  /** Per-card evidence collection — empty when no evidence cards defined. */
  evidenceSlotCards: readonly InvestorEvidenceSlotView[];
};

export type BusinessChecklistSectionView = BusinessInvestorSectionDef & {
  state: ChecklistSectionProgressState;
  progressPct: number;
  /** Computed from applicable principle ratings — never set manually. */
  overallRating: InvestorRollupRating | null;
  /** Game-style status badge — never "Pending". */
  statusLabel: string;
  principles: InvestorPrincipleView[];
  ratedPrincipleCount: number;
  applicablePrincipleCount: number;
  /** Section-end quiz — locked until all principle evidence is rated. */
  quizStatus: ChecklistSectionQuizStatus;
};

export type ChecklistJourneyProgress = {
  pct: number;
  filledSegments: number;
  totalSegments: number;
  /** e.g. "■■□□□□" */
  bar: string;
};

export type BusinessInvestorChecklistSnapshot = {
  sections: BusinessChecklistSectionView[];
  completedSectionCount: number;
  totalSections: number;
  ratedSectionCount: number;
  activeSection: BusinessChecklistSectionView | null;
  nextLockedSection: BusinessChecklistSectionView | null;
  journey: ChecklistJourneyProgress;
  footerHint: string | null;
};

export const INVESTOR_CHECKLIST_HEADER_INTRO =
  "The criteria great investors use to judge the quality of a business before investing.";

export const INVESTOR_CHECKLIST_BUSINESS_INTRO =
  "This section focuses on understanding how the company works, who it serves, how it makes money, and how it competes.";

export function resolveInvestorPrinciple(
  principleId: InvestorPrincipleId
): BusinessInvestorPrincipleDef {
  const principle = BUSINESS_INVESTOR_PRINCIPLES.find((p) => p.id === principleId);
  if (!principle) throw new Error(`Unknown investor principle: ${principleId}`);
  return principle;
}

export function resolveInvestorSection(
  sectionId: BusinessChecklistSectionId
): BusinessInvestorSectionDef {
  const section = BUSINESS_INVESTOR_CHECKLIST_SECTIONS.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Unknown checklist section: ${sectionId}`);
  return section;
}

export function principlesForSection(
  sectionId: BusinessChecklistSectionId
): readonly BusinessInvestorPrincipleDef[] {
  return BUSINESS_INVESTOR_PRINCIPLES.filter((p) => p.sectionId === sectionId).sort(
    (a, b) => a.orderInSection - b.orderInSection
  );
}

export function computeChecklistJourneyProgress(
  snapshot: Pick<
    BusinessInvestorChecklistSnapshot,
    "completedSectionCount" | "totalSections"
  >
): ChecklistJourneyProgress {
  const totalSegments = snapshot.totalSections;
  const filledSegments = Math.max(
    0,
    Math.min(totalSegments, snapshot.completedSectionCount)
  );
  const pct =
    totalSegments > 0 ? Math.round((filledSegments / totalSegments) * 100) : 0;

  return {
    pct,
    filledSegments,
    totalSegments,
    bar:
      "■".repeat(filledSegments) + "□".repeat(totalSegments - filledSegments)
  };
}

/** @deprecated Prefer journey bar UI — kept for compact labels. */
export function formatChecklistProgressCount(
  snapshot: BusinessInvestorChecklistSnapshot
): string {
  return `${computeChecklistJourneyProgress(snapshot).pct}% Complete`;
}

export function formatRollupRatingLabel(
  rating: InvestorRollupRating
): string {
  if (rating === "strong") return "Strong";
  if (rating === "weak") return "Weak";
  return "Mixed";
}

export function resolveSectionStatusLabel(
  section: Pick<
    BusinessChecklistSectionView,
    "state" | "overallRating"
  >
): string {
  if (section.state === "active") return "✨ Active";
  if (section.state === "locked") return "";
  if (section.overallRating === "strong") return "🟢 Strong";
  if (section.overallRating === "weak") return "🔴 Weak";
  if (section.overallRating === "mixed") return "🟡 Mixed";
  return "✅ Complete";
}

export function resolvePrincipleMarker(
  principle: Pick<InvestorPrincipleView, "status">
): string {
  if (principle.status === "na") return "—";
  if (principle.status === "locked") return "🔒";
  if (principle.status === "rated") return "✅";
  return "🔓";
}

export function resolveChecklistFooterHint(
  snapshot: BusinessInvestorChecklistSnapshot
): string | null {
  const { activeSection, nextLockedSection } = snapshot;

  if (activeSection?.quizStatus === "ready" && nextLockedSection) {
    return `Complete the ${activeSection.label} quiz to unlock ${nextLockedSection.label}.`;
  }

  if (activeSection && nextLockedSection) {
    return `Complete ${activeSection.label} to unlock ${nextLockedSection.label}.`;
  }

  if (activeSection) {
    const activePrinciple = activeSection.principles.find(
      (principle) => principle.status === "active"
    );
    if (activePrinciple) {
      return `🔓 Current quest: ${activePrinciple.label}`;
    }
    return `✨ In progress: ${activeSection.emoji} ${activeSection.label}`;
  }

  if (nextLockedSection) {
    return `🔓 Next unlock: ${nextLockedSection.emoji} ${nextLockedSection.label}`;
  }

  if (snapshot.completedSectionCount >= snapshot.totalSections) {
    return "🏆 Business Island mastered — every milestone complete.";
  }

  return null;
}

/** Roll up child ratings — N/A and null entries are excluded. */
export function rollupInvestorRatings(
  ratings: readonly (InvestorRollupRating | null)[]
): InvestorRollupRating | null {
  const applicable = ratings.filter(
    (rating): rating is InvestorRollupRating => rating != null
  );
  if (applicable.length === 0) return null;
  if (applicable.every((rating) => rating === "strong")) return "strong";
  if (applicable.every((rating) => rating === "weak")) return "weak";
  return "mixed";
}

/** Evidence ratings → single principle rating (majority of thumbs up/down). */
export function computePrincipleRatingFromEvidence(
  evidenceRatings: readonly InvestorEvidenceRating[]
): InvestorRollupRating | null {
  if (evidenceRatings.length === 0) return null;

  let strongCount = 0;
  let weakCount = 0;
  for (const rating of evidenceRatings) {
    if (rating === "strong") strongCount++;
    else weakCount++;
  }

  if (strongCount > weakCount) return "strong";
  if (weakCount > strongCount) return "weak";
  return "mixed";
}

function resolveCompletedSlugs(
  cards: readonly BusinessHubQuestCard[] | undefined,
  completedQuestSlugs: readonly string[] | undefined
): Set<string> {
  if (cards?.length) {
    return new Set(cards.filter((c) => c.completed).map((c) => c.slug));
  }
  return new Set(completedQuestSlugs ?? []);
}

function resolveCardProgressPct(
  cards: readonly BusinessHubQuestCard[] | undefined,
  questSlug: string,
  fallbackPct: number
): number {
  if (!cards?.length) return fallbackPct;
  const card = cards.find((c) => c.slug === questSlug);
  return card?.progressPct ?? fallbackPct;
}

function isPrincipleNa(
  principleId: InvestorPrincipleId,
  companyId: CompanyId,
  stored: BusinessInvestorFrameworkStoredState
): boolean {
  if (stored.naPrinciples[principleId]) return true;
  return (DEFAULT_NA_PRINCIPLES_BY_COMPANY[companyId] ?? []).includes(principleId);
}

function evidenceRatingsForPrinciple(
  principleId: InvestorPrincipleId,
  stored: BusinessInvestorFrameworkStoredState
): InvestorEvidenceRating[] {
  const prefix = `${principleId}#`;
  return Object.entries(stored.evidenceRatings)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value)
    .filter((value): value is InvestorEvidenceRating => value != null);
}

function resolveSectionStates(
  stored: BusinessInvestorFrameworkStoredState,
  companyId: CompanyId,
  currentQuestSlug: string | null,
  currentQuestProgressPct: number
): Record<BusinessChecklistSectionId, { state: ChecklistSectionProgressState; progressPct: number }> {
  const result = {} as Record<
    BusinessChecklistSectionId,
    { state: ChecklistSectionProgressState; progressPct: number }
  >;
  let foundActive = false;

  for (const section of BUSINESS_INVESTOR_CHECKLIST_SECTIONS) {
    const priorSections = BUSINESS_INVESTOR_CHECKLIST_SECTIONS.filter(
      (s) => s.order < section.order
    );
    const priorComplete = priorSections.every(
      (s) => stored.sectionQuizPassed?.[s.id] === true
    );

    if (stored.sectionQuizPassed?.[section.id]) {
      result[section.id] = { state: "completed", progressPct: 100 };
      continue;
    }

    if (!priorComplete) {
      result[section.id] = { state: "locked", progressPct: 0 };
      continue;
    }

    if (!foundActive) {
      foundActive = true;
      const inQuest = currentQuestSlug === section.questSlug;
      const evidenceComplete = isSectionPrinciplesEvidenceComplete(
        companyId,
        section.id,
        stored
      );
      result[section.id] = {
        state: "active",
        progressPct: inQuest
          ? evidenceComplete
            ? 90
            : currentQuestProgressPct
          : evidenceComplete
            ? 90
            : 0
      };
    } else {
      result[section.id] = { state: "locked", progressPct: 0 };
    }
  }

  return result;
}

function resolveEvidenceSlotCards(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored: BusinessInvestorFrameworkStoredState
): readonly InvestorEvidenceSlotView[] {
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  return cards.map((card) => ({
    cardId: card.id,
    rating: stored.evidenceRatings[`${principleId}#${card.id}`] ?? null
  }));
}

function isPrincipleFullyEvidenceRated(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored: BusinessInvestorFrameworkStoredState
): boolean {
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  if (cards.length === 0) return false;
  return cards.every(
    (card) => stored.evidenceRatings[`${principleId}#${card.id}`] != null
  );
}

function buildPrincipleView(
  principleDef: BusinessInvestorPrincipleDef,
  input: {
    companyId: CompanyId;
    stored: BusinessInvestorFrameworkStoredState;
    status: InvestorPrincipleStatus;
    rating: InvestorRollupRating | null;
    evidenceRatingCount: number;
  }
): InvestorPrincipleView {
  return {
    ...principleDef,
    status: input.status,
    rating: input.rating,
    ratingLabel: input.rating ? formatRollupRatingLabel(input.rating) : null,
    evidenceRatingCount: input.evidenceRatingCount,
    evidenceSlotCards: resolveEvidenceSlotCards(
      input.companyId,
      principleDef.id,
      input.stored
    )
  };
}

function resolvePrinciplesForSection(input: {
  sectionId: BusinessChecklistSectionId;
  sectionUnlocked: boolean;
  companyId: CompanyId;
  stored: BusinessInvestorFrameworkStoredState;
}): InvestorPrincipleView[] {
  let foundActive = false;

  return principlesForSection(input.sectionId).map((principleDef) => {
    const isNa = isPrincipleNa(principleDef.id, input.companyId, input.stored);
    if (isNa) {
      return buildPrincipleView(principleDef, {
        companyId: input.companyId,
        stored: input.stored,
        status: "na",
        rating: null,
        evidenceRatingCount: 0
      });
    }

    if (!input.sectionUnlocked) {
      return buildPrincipleView(principleDef, {
        companyId: input.companyId,
        stored: input.stored,
        status: "locked",
        rating: null,
        evidenceRatingCount: 0
      });
    }

    const evidenceRatings = evidenceRatingsForPrinciple(
      principleDef.id,
      input.stored
    );
    const allEvidenceRated = isPrincipleFullyEvidenceRated(
      input.companyId,
      principleDef.id,
      input.stored
    );
    const rating = allEvidenceRated
      ? computePrincipleRatingFromEvidence(evidenceRatings)
      : null;

    if (allEvidenceRated && rating) {
      return buildPrincipleView(principleDef, {
        companyId: input.companyId,
        stored: input.stored,
        status: "rated",
        rating,
        evidenceRatingCount: evidenceRatings.length
      });
    }

    if (!foundActive) {
      foundActive = true;
      return buildPrincipleView(principleDef, {
        companyId: input.companyId,
        stored: input.stored,
        status: "active",
        rating: null,
        evidenceRatingCount: evidenceRatings.length
      });
    }

    return buildPrincipleView(principleDef, {
      companyId: input.companyId,
      stored: input.stored,
      status: "locked",
      rating: null,
      evidenceRatingCount: 0
    });
  });
}

export function resolveBusinessInvestorChecklistSnapshot(input: {
  companyId: CompanyId;
  stored: BusinessInvestorFrameworkStoredState;
  cards?: readonly BusinessHubQuestCard[];
  completedQuestSlugs?: readonly string[];
  currentQuestSlug?: string | null;
  currentQuestProgressPct?: number;
}): BusinessInvestorChecklistSnapshot {
  const sectionStates = resolveSectionStates(
    input.stored,
    input.companyId,
    input.currentQuestSlug ?? null,
    input.currentQuestProgressPct ?? 0
  );

  const sections: BusinessChecklistSectionView[] =
    BUSINESS_INVESTOR_CHECKLIST_SECTIONS.map((sectionDef) => {
      const { state, progressPct } = sectionStates[sectionDef.id];
      const sectionUnlocked = state !== "locked";

      const principles = resolvePrinciplesForSection({
        sectionId: sectionDef.id,
        sectionUnlocked,
        companyId: input.companyId,
        stored: input.stored
      });

      const applicablePrinciples = principles.filter((p) => p.status !== "na");
      const ratedPrinciples = applicablePrinciples.filter((p) => p.rating != null);
      const overallRating = rollupInvestorRatings(
        applicablePrinciples.map((p) => p.rating)
      );
      const quizStatus = resolveSectionQuizStatus({
        sectionId: sectionDef.id,
        sectionUnlocked,
        companyId: input.companyId,
        stored: input.stored
      });

      const resolvedSection: BusinessChecklistSectionView = {
        ...sectionDef,
        state,
        progressPct:
          quizStatus === "passed"
            ? 100
            : quizStatus === "ready"
              ? 90
              : progressPct,
        overallRating,
        statusLabel: resolveSectionStatusLabel({
          state,
          overallRating
        }),
        principles,
        ratedPrincipleCount: ratedPrinciples.length,
        applicablePrincipleCount: applicablePrinciples.length,
        quizStatus
      };

      return resolvedSection;
    });

  const completedSectionCount = sections.filter(
    (section) => section.state === "completed"
  ).length;
  const ratedSectionCount = sections.filter(
    (section) => section.overallRating != null
  ).length;
  const activeSection = sections.find((section) => section.state === "active") ?? null;
  const nextLockedSection =
    sections.find((section) => section.state === "locked") ?? null;

  const journeyBase = {
    completedSectionCount,
    totalSections: BUSINESS_INVESTOR_CHECKLIST_SECTIONS.length
  };
  const journey = computeChecklistJourneyProgress(journeyBase);
  const snapshot: BusinessInvestorChecklistSnapshot = {
    sections,
    completedSectionCount,
    totalSections: BUSINESS_INVESTOR_CHECKLIST_SECTIONS.length,
    ratedSectionCount,
    activeSection,
    nextLockedSection,
    journey,
    footerHint: null
  };

  snapshot.footerHint = resolveChecklistFooterHint(snapshot);

  return snapshot;
}

export function resolveSectionForQuest(
  questSlug: string
): BusinessInvestorSectionDef | null {
  return (
    BUSINESS_INVESTOR_CHECKLIST_SECTIONS.find((s) => s.questSlug === questSlug) ??
    null
  );
}

/** Page heading — e.g. "🏢 Company Overview". */
export function formatChecklistSectionHeading(
  section: BusinessInvestorSectionDef
): string {
  return `${section.emoji} ${section.label}`;
}
