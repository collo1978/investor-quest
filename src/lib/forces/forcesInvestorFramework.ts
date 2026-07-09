import type { CompanyId } from "@/data/companies";
import type { ForcesInvestorFrameworkStoredState } from "@/lib/forces/forcesInvestorFrameworkStorage";

export type ForcesChecklistGroupId = "inside-forces" | "outside-forces";

export type ForcesChecklistSectionId =
  | "competitive-risk"
  | "customer-revenue-risk"
  | "operational-risk"
  | "execution-risk"
  | "economic-risk"
  | "government-regulatory-risk"
  | "global-risk"
  | "legal-cyber-risk";

export type ForcesInvestorPrincipleId =
  | "risk-innovation"
  | "risk-competitive-moat"
  | "risk-market-leadership"
  | "risk-adaptability"
  | "risk-customer-stickiness"
  | "risk-revenue-diversification"
  | "risk-customer-concentration"
  | "risk-demand-durability"
  | "risk-pricing-power"
  | "risk-product-dependence"
  | "risk-supply-chain-reliability"
  | "risk-manufacturing-capacity"
  | "risk-product-quality"
  | "risk-inventory-discipline"
  | "risk-supplier-dependence"
  | "risk-talent-strength"
  | "risk-acquisition-integration"
  | "risk-scaling-ability"
  | "risk-systems-controls"
  | "risk-strategy-delivery"
  | "risk-recession-sensitivity"
  | "risk-inflation-exposure"
  | "risk-interest-rate-exposure"
  | "risk-currency-risk"
  | "risk-customer-spending-cycles"
  | "risk-regulation-exposure"
  | "risk-export-trade-restrictions"
  | "risk-tax-risk"
  | "risk-antitrust-risk"
  | "risk-policy-dependence"
  | "risk-geopolitical-exposure"
  | "risk-geographic-concentration"
  | "risk-natural-disaster-risk"
  | "risk-energy-infrastructure-dependence"
  | "risk-climate-exposure"
  | "risk-cybersecurity-resilience"
  | "risk-data-privacy-risk"
  | "risk-litigation-exposure"
  | "risk-ip-protection"
  | "risk-compliance-strength";

export type ForcesChecklistGroupDef = {
  id: ForcesChecklistGroupId;
  label: string;
  emoji: string;
  subtitle: string;
  order: number;
};

export type ForcesInvestorSectionDef = {
  id: ForcesChecklistSectionId;
  groupId: ForcesChecklistGroupId;
  label: string;
  order: number;
  /** Hover tooltip — short coaching question. */
  sectionTooltip: string;
  /** Investor question shown when the section expands. */
  investorQuestion: string;
};

export type ForcesInvestorPrincipleDef = {
  id: ForcesInvestorPrincipleId;
  sectionId: ForcesChecklistSectionId;
  label: string;
  orderInSection: number;
  whyItMatters: string;
};

export type ChecklistSectionProgressState = "locked" | "active" | "completed";

export type ForcesPrincipleStatus = "locked" | "active" | "na" | "rated";

export type ForcesPrincipleView = ForcesInvestorPrincipleDef & {
  status: ForcesPrincipleStatus;
};

export type ForcesChecklistSectionView = ForcesInvestorSectionDef & {
  state: ChecklistSectionProgressState;
  progressPct: number;
  statusLabel: string;
  principles: ForcesPrincipleView[];
  completedPrincipleCount: number;
  applicablePrincipleCount: number;
};

export type ForcesChecklistGroupView = ForcesChecklistGroupDef & {
  sections: ForcesChecklistSectionView[];
};

export type ChecklistJourneyProgress = {
  pct: number;
  filledSegments: number;
  totalSegments: number;
};

export type ForcesInvestorChecklistSnapshot = {
  groups: ForcesChecklistGroupView[];
  sections: ForcesChecklistSectionView[];
  completedSectionCount: number;
  totalSections: number;
  activeSection: ForcesChecklistSectionView | null;
  nextLockedSection: ForcesChecklistSectionView | null;
  journey: ChecklistJourneyProgress;
  footerHint: string | null;
};

export const INVESTOR_CHECKLIST_FORCES_INTRO =
  "The criteria great investors use to judge risk — separating what management can control from what it cannot.";

export const INVESTOR_CHECKLIST_RISK_INTRO =
  "This section teaches how to evaluate company risk using evidence from the 10-K — not just listing risk factors.";

export const FORCES_INVESTOR_CHECKLIST_GROUPS: readonly ForcesChecklistGroupDef[] = [
  {
    id: "inside-forces",
    label: "Inside Forces",
    emoji: "🔵",
    subtitle: "Risks management can influence.",
    order: 1
  },
  {
    id: "outside-forces",
    label: "Outside Forces",
    emoji: "🌍",
    subtitle: "Risks management cannot control.",
    order: 2
  }
];

export const FORCES_INVESTOR_CHECKLIST_SECTIONS: readonly ForcesInvestorSectionDef[] = [
  {
    id: "competitive-risk",
    groupId: "inside-forces",
    label: "Competitive Risk",
    order: 1,
    sectionTooltip:
      "Can the company stay ahead of competitors and protect its competitive advantage?",
    investorQuestion:
      "Can this company maintain its competitive advantage over time?"
  },
  {
    id: "customer-revenue-risk",
    groupId: "inside-forces",
    label: "Customer & Revenue Risk",
    order: 2,
    sectionTooltip:
      "How vulnerable is the business if customers, products or demand change?",
    investorQuestion:
      "Could sales, demand, or customer relationships weaken?"
  },
  {
    id: "operational-risk",
    groupId: "inside-forces",
    label: "Operational Risk",
    order: 3,
    sectionTooltip:
      "Can the company consistently deliver its products and services?",
    investorQuestion:
      "Can the company consistently deliver its products or services?"
  },
  {
    id: "execution-risk",
    groupId: "inside-forces",
    label: "Execution Risk",
    order: 4,
    sectionTooltip:
      "Can management successfully execute its strategy and continue growing?",
    investorQuestion: "Can management execute the strategy successfully?"
  },
  {
    id: "economic-risk",
    groupId: "outside-forces",
    label: "Economic Risk",
    order: 5,
    sectionTooltip: "How could the economy affect the business?",
    investorQuestion: "How could the economy affect the business?"
  },
  {
    id: "government-regulatory-risk",
    groupId: "outside-forces",
    label: "Government & Regulatory Risk",
    order: 6,
    sectionTooltip:
      "Could laws, regulation or government actions impact the company?",
    investorQuestion:
      "Could laws, regulation, or government action impact the company?"
  },
  {
    id: "global-risk",
    groupId: "outside-forces",
    label: "Global Risk",
    order: 7,
    sectionTooltip: "Could worldwide events disrupt the business?",
    investorQuestion: "Could worldwide events disrupt the business?"
  },
  {
    id: "legal-cyber-risk",
    groupId: "outside-forces",
    label: "Legal & Cyber Risk",
    order: 8,
    sectionTooltip:
      "Could legal issues or cybersecurity incidents harm the company?",
    investorQuestion:
      "Could legal, data, or security failures damage the business?"
  }
];

export const FORCES_INVESTOR_PRINCIPLES: readonly ForcesInvestorPrincipleDef[] = [
  {
    id: "risk-innovation",
    sectionId: "competitive-risk",
    label: "Innovation",
    orderInSection: 1,
    whyItMatters:
      "Companies that stop innovating often lose their edge to faster-moving rivals."
  },
  {
    id: "risk-competitive-moat",
    sectionId: "competitive-risk",
    label: "Competitive Advantage / Moat",
    orderInSection: 2,
    whyItMatters:
      "A durable moat protects profits when competitors try to catch up."
  },
  {
    id: "risk-market-leadership",
    sectionId: "competitive-risk",
    label: "Market Leadership",
    orderInSection: 3,
    whyItMatters:
      "Market leaders often have more resources to defend their position."
  },
  {
    id: "risk-adaptability",
    sectionId: "competitive-risk",
    label: "Adaptability",
    orderInSection: 4,
    whyItMatters:
      "Technology shifts quickly — companies must adapt or fall behind."
  },
  {
    id: "risk-customer-stickiness",
    sectionId: "competitive-risk",
    label: "Customer Stickiness",
    orderInSection: 5,
    whyItMatters:
      "Sticky customers are harder for rivals to steal away."
  },
  {
    id: "risk-revenue-diversification",
    sectionId: "customer-revenue-risk",
    label: "Revenue Diversification",
    orderInSection: 1,
    whyItMatters:
      "Spreading revenue across products and customers reduces dependence on any single source."
  },
  {
    id: "risk-customer-concentration",
    sectionId: "customer-revenue-risk",
    label: "Customer Concentration",
    orderInSection: 2,
    whyItMatters:
      "Losing one big customer can hurt badly if too much revenue depends on them."
  },
  {
    id: "risk-demand-durability",
    sectionId: "customer-revenue-risk",
    label: "Demand Durability",
    orderInSection: 3,
    whyItMatters:
      "Investors want demand that lasts — not a short-lived fad."
  },
  {
    id: "risk-pricing-power",
    sectionId: "customer-revenue-risk",
    label: "Pricing Power",
    orderInSection: 4,
    whyItMatters:
      "Weak pricing power often signals intense competition or commoditised products."
  },
  {
    id: "risk-product-dependence",
    sectionId: "customer-revenue-risk",
    label: "Product Dependence",
    orderInSection: 5,
    whyItMatters:
      "Relying on one hero product creates risk if demand shifts."
  },
  {
    id: "risk-supply-chain-reliability",
    sectionId: "operational-risk",
    label: "Supply Chain Reliability",
    orderInSection: 1,
    whyItMatters:
      "Broken supply chains can halt production and disappoint customers."
  },
  {
    id: "risk-manufacturing-capacity",
    sectionId: "operational-risk",
    label: "Manufacturing / Delivery Capacity",
    orderInSection: 2,
    whyItMatters:
      "Companies must deliver at scale — bottlenecks limit growth and damage trust."
  },
  {
    id: "risk-product-quality",
    sectionId: "operational-risk",
    label: "Product Quality",
    orderInSection: 3,
    whyItMatters:
      "Quality problems erode brand reputation and invite competitors in."
  },
  {
    id: "risk-inventory-discipline",
    sectionId: "operational-risk",
    label: "Inventory Discipline",
    orderInSection: 4,
    whyItMatters:
      "Poor inventory management ties up cash and signals weak demand forecasting."
  },
  {
    id: "risk-supplier-dependence",
    sectionId: "operational-risk",
    label: "Supplier Dependence",
    orderInSection: 5,
    whyItMatters:
      "Depending on too few suppliers creates vulnerability if one fails."
  },
  {
    id: "risk-talent-strength",
    sectionId: "execution-risk",
    label: "Talent Strength",
    orderInSection: 1,
    whyItMatters:
      "Great strategies fail without the right people to execute them."
  },
  {
    id: "risk-acquisition-integration",
    sectionId: "execution-risk",
    label: "Acquisition Integration",
    orderInSection: 2,
    whyItMatters:
      "Many acquisitions destroy value when integration goes poorly."
  },
  {
    id: "risk-scaling-ability",
    sectionId: "execution-risk",
    label: "Scaling Ability",
    orderInSection: 3,
    whyItMatters:
      "Fast growth only helps if the company can scale without breaking."
  },
  {
    id: "risk-systems-controls",
    sectionId: "execution-risk",
    label: "Systems & Controls",
    orderInSection: 4,
    whyItMatters:
      "Weak internal controls increase the risk of costly mistakes or fraud."
  },
  {
    id: "risk-strategy-delivery",
    sectionId: "execution-risk",
    label: "Strategy Delivery",
    orderInSection: 5,
    whyItMatters:
      "Investors judge management on whether strategy becomes real results."
  },
  {
    id: "risk-recession-sensitivity",
    sectionId: "economic-risk",
    label: "Recession Sensitivity",
    orderInSection: 1,
    whyItMatters:
      "Some businesses hold up in downturns; others see sales collapse."
  },
  {
    id: "risk-inflation-exposure",
    sectionId: "economic-risk",
    label: "Inflation Exposure",
    orderInSection: 2,
    whyItMatters:
      "Rising costs can squeeze margins if the company cannot pass them on."
  },
  {
    id: "risk-interest-rate-exposure",
    sectionId: "economic-risk",
    label: "Interest Rate Exposure",
    orderInSection: 3,
    whyItMatters:
      "Higher rates increase borrowing costs and can cool customer spending."
  },
  {
    id: "risk-currency-risk",
    sectionId: "economic-risk",
    label: "Currency Risk",
    orderInSection: 4,
    whyItMatters:
      "Exchange rate swings can change reported profits for global businesses."
  },
  {
    id: "risk-customer-spending-cycles",
    sectionId: "economic-risk",
    label: "Customer Spending Cycles",
    orderInSection: 5,
    whyItMatters:
      "When customers cut spending, cyclical businesses feel it first."
  },
  {
    id: "risk-regulation-exposure",
    sectionId: "government-regulatory-risk",
    label: "Regulation Exposure",
    orderInSection: 1,
    whyItMatters:
      "New rules can raise costs, limit products, or reshape entire industries."
  },
  {
    id: "risk-export-trade-restrictions",
    sectionId: "government-regulatory-risk",
    label: "Export / Trade Restrictions",
    orderInSection: 2,
    whyItMatters:
      "Trade barriers can block sales to key markets overnight."
  },
  {
    id: "risk-tax-risk",
    sectionId: "government-regulatory-risk",
    label: "Tax Risk",
    orderInSection: 3,
    whyItMatters:
      "Tax law changes can reduce profits and shift where companies invest."
  },
  {
    id: "risk-antitrust-risk",
    sectionId: "government-regulatory-risk",
    label: "Antitrust Risk",
    orderInSection: 4,
    whyItMatters:
      "Dominant companies may face limits on growth through acquisitions or pricing."
  },
  {
    id: "risk-policy-dependence",
    sectionId: "government-regulatory-risk",
    label: "Policy Dependence",
    orderInSection: 5,
    whyItMatters:
      "Businesses tied to government subsidies or contracts face policy risk."
  },
  {
    id: "risk-geopolitical-exposure",
    sectionId: "global-risk",
    label: "Geopolitical Exposure",
    orderInSection: 1,
    whyItMatters:
      "Wars, sanctions, and political tension can disrupt supply chains and sales."
  },
  {
    id: "risk-geographic-concentration",
    sectionId: "global-risk",
    label: "Geographic Concentration",
    orderInSection: 2,
    whyItMatters:
      "Heavy exposure to one region magnifies local shocks."
  },
  {
    id: "risk-natural-disaster-risk",
    sectionId: "global-risk",
    label: "Natural Disaster Risk",
    orderInSection: 3,
    whyItMatters:
      "Earthquakes, floods, and fires can shut factories and data centres."
  },
  {
    id: "risk-energy-infrastructure-dependence",
    sectionId: "global-risk",
    label: "Energy / Infrastructure Dependence",
    orderInSection: 4,
    whyItMatters:
      "Power outages or infrastructure failures can halt operations."
  },
  {
    id: "risk-climate-exposure",
    sectionId: "global-risk",
    label: "Climate Exposure",
    orderInSection: 5,
    whyItMatters:
      "Climate change brings physical risks and shifting regulations."
  },
  {
    id: "risk-cybersecurity-resilience",
    sectionId: "legal-cyber-risk",
    label: "Cybersecurity Resilience",
    orderInSection: 1,
    whyItMatters:
      "Cyber attacks can steal data, halt systems, and destroy customer trust."
  },
  {
    id: "risk-data-privacy-risk",
    sectionId: "legal-cyber-risk",
    label: "Data Privacy Risk",
    orderInSection: 2,
    whyItMatters:
      "Privacy failures bring fines, lawsuits, and lasting reputational damage."
  },
  {
    id: "risk-litigation-exposure",
    sectionId: "legal-cyber-risk",
    label: "Litigation Exposure",
    orderInSection: 3,
    whyItMatters:
      "Major lawsuits can drain cash and distract management for years."
  },
  {
    id: "risk-ip-protection",
    sectionId: "legal-cyber-risk",
    label: "IP Protection",
    orderInSection: 4,
    whyItMatters:
      "Weak IP protection lets rivals copy valuable technology and brands."
  },
  {
    id: "risk-compliance-strength",
    sectionId: "legal-cyber-risk",
    label: "Compliance Strength",
    orderInSection: 5,
    whyItMatters:
      "Compliance failures invite penalties and signal weak governance."
  }
];

export function resolveForcesInvestorSection(
  sectionId: ForcesChecklistSectionId
): ForcesInvestorSectionDef {
  const section = FORCES_INVESTOR_CHECKLIST_SECTIONS.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Unknown forces checklist section: ${sectionId}`);
  return section;
}

export function resolveForcesInvestorPrinciple(
  principleId: ForcesInvestorPrincipleId
): ForcesInvestorPrincipleDef {
  const principle = FORCES_INVESTOR_PRINCIPLES.find((p) => p.id === principleId);
  if (!principle) throw new Error(`Unknown forces investor principle: ${principleId}`);
  return principle;
}

export function principlesForForcesSection(
  sectionId: ForcesChecklistSectionId
): readonly ForcesInvestorPrincipleDef[] {
  return FORCES_INVESTOR_PRINCIPLES.filter((p) => p.sectionId === sectionId).sort(
    (a, b) => a.orderInSection - b.orderInSection
  );
}

export function resolveForcesPrincipleMarker(
  principle: Pick<ForcesPrincipleView, "status">
): string {
  if (principle.status === "na") return "—";
  if (principle.status === "locked") return "🔒";
  if (principle.status === "rated") return "✅";
  return "🔓";
}

export function resolveForcesSectionStatusLabel(
  section: Pick<ForcesChecklistSectionView, "state">
): string {
  if (section.state === "active") return "✨ Active";
  if (section.state === "locked") return "";
  return "✅ Complete";
}

function isPrincipleComplete(
  principleId: ForcesInvestorPrincipleId,
  stored: ForcesInvestorFrameworkStoredState
): boolean {
  const prefix = `${principleId}#`;
  const ratings = Object.keys(stored.evidenceRatings).filter((key) =>
    key.startsWith(prefix)
  );
  return ratings.length > 0 && ratings.every((key) => stored.evidenceRatings[key] != null);
}

function isSectionPrinciplesComplete(
  sectionId: ForcesChecklistSectionId,
  stored: ForcesInvestorFrameworkStoredState
): boolean {
  const principles = principlesForForcesSection(sectionId);
  return principles.every((p) => isPrincipleComplete(p.id, stored));
}

function resolveSectionStates(
  stored: ForcesInvestorFrameworkStoredState
): Record<
  ForcesChecklistSectionId,
  { state: ChecklistSectionProgressState; progressPct: number }
> {
  const result = {} as Record<
    ForcesChecklistSectionId,
    { state: ChecklistSectionProgressState; progressPct: number }
  >;
  let foundActive = false;

  for (const section of FORCES_INVESTOR_CHECKLIST_SECTIONS) {
    const priorSections = FORCES_INVESTOR_CHECKLIST_SECTIONS.filter(
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
      const principlesComplete = isSectionPrinciplesComplete(section.id, stored);
      result[section.id] = {
        state: "active",
        progressPct: principlesComplete ? 90 : 0
      };
    } else {
      result[section.id] = { state: "locked", progressPct: 0 };
    }
  }

  return result;
}

function resolvePrinciplesForSection(input: {
  sectionId: ForcesChecklistSectionId;
  sectionUnlocked: boolean;
  stored: ForcesInvestorFrameworkStoredState;
}): ForcesPrincipleView[] {
  let foundActive = false;

  return principlesForForcesSection(input.sectionId).map((principleDef) => {
    if (input.stored.naPrinciples[principleDef.id]) {
      return { ...principleDef, status: "na" as const };
    }

    if (!input.sectionUnlocked) {
      return { ...principleDef, status: "locked" as const };
    }

    if (isPrincipleComplete(principleDef.id, input.stored)) {
      return { ...principleDef, status: "rated" as const };
    }

    if (!foundActive) {
      foundActive = true;
      return { ...principleDef, status: "active" as const };
    }

    return { ...principleDef, status: "locked" as const };
  });
}

export function computeForcesChecklistJourneyProgress(
  snapshot: Pick<
    ForcesInvestorChecklistSnapshot,
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

  return { pct, filledSegments, totalSegments };
}

export function resolveForcesChecklistFooterHint(
  snapshot: ForcesInvestorChecklistSnapshot
): string | null {
  const { activeSection, nextLockedSection } = snapshot;

  if (activeSection && nextLockedSection) {
    return `Complete ${activeSection.label} to unlock ${nextLockedSection.label}.`;
  }

  if (activeSection) {
    const activePrinciple = activeSection.principles.find(
      (principle) => principle.status === "active"
    );
    if (activePrinciple) {
      return `🔓 Current focus: ${activePrinciple.label}`;
    }
    return `✨ In progress: ${activeSection.label}`;
  }

  if (nextLockedSection) {
    return `🔓 Next unlock: ${nextLockedSection.label}`;
  }

  if (snapshot.completedSectionCount >= snapshot.totalSections) {
    return "🏆 Risk Island mastered — every risk area evaluated.";
  }

  return null;
}

export function resolveForcesInvestorChecklistSnapshot(input: {
  companyId: CompanyId;
  stored: ForcesInvestorFrameworkStoredState;
}): ForcesInvestorChecklistSnapshot {
  void input.companyId;
  const sectionStates = resolveSectionStates(input.stored);

  const sections: ForcesChecklistSectionView[] =
    FORCES_INVESTOR_CHECKLIST_SECTIONS.map((sectionDef) => {
      const { state, progressPct } = sectionStates[sectionDef.id];
      const sectionUnlocked = state !== "locked";
      const principles = resolvePrinciplesForSection({
        sectionId: sectionDef.id,
        sectionUnlocked,
        stored: input.stored
      });
      const applicablePrinciples = principles.filter((p) => p.status !== "na");
      const completedPrinciples = applicablePrinciples.filter(
        (p) => p.status === "rated"
      );

      return {
        ...sectionDef,
        state,
        progressPct: state === "completed" ? 100 : progressPct,
        statusLabel: resolveForcesSectionStatusLabel({ state }),
        principles,
        completedPrincipleCount: completedPrinciples.length,
        applicablePrincipleCount: applicablePrinciples.length
      };
    });

  const groups: ForcesChecklistGroupView[] = FORCES_INVESTOR_CHECKLIST_GROUPS.map(
    (groupDef) => ({
      ...groupDef,
      sections: sections.filter((section) => section.groupId === groupDef.id)
    })
  );

  const completedSectionCount = sections.filter(
    (section) => section.state === "completed"
  ).length;
  const activeSection = sections.find((section) => section.state === "active") ?? null;
  const nextLockedSection =
    sections.find((section) => section.state === "locked") ?? null;

  const journeyBase = {
    completedSectionCount,
    totalSections: FORCES_INVESTOR_CHECKLIST_SECTIONS.length
  };

  const snapshot: ForcesInvestorChecklistSnapshot = {
    groups,
    sections,
    completedSectionCount,
    totalSections: FORCES_INVESTOR_CHECKLIST_SECTIONS.length,
    activeSection,
    nextLockedSection,
    journey: computeForcesChecklistJourneyProgress(journeyBase),
    footerHint: null
  };

  snapshot.footerHint = resolveForcesChecklistFooterHint(snapshot);
  return snapshot;
}
