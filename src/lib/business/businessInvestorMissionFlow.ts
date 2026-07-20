import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import {
  usesInvestorChallengeFlow,
  type InvestorChallengePrincipleId
} from "@/lib/business/businessInvestorChallengeFlow";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";
import { evidenceCardsReadForPrinciple } from "@/lib/business/businessInvestorEvidenceHelpers";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";
import type { BusinessInvestorFrameworkStoredState } from "@/lib/business/businessInvestorFrameworkStorage";

/** XP awarded when a Company Overview mission is completed. */
export const INVESTOR_MISSION_XP_REWARD = 100;

export type InvestorMissionKnowledgeItemStatus = "complete" | "active" | "pending";

export type InvestorMissionKnowledgeItem = {
  id: string;
  label: string;
  status: InvestorMissionKnowledgeItemStatus;
  kind: "evidence" | "challenge";
};

export type CompanyInvestorMissionTheme = {
  accent: string;
  accentRgb: string;
  accentSoft: string;
  accentGlow: string;
  label: string;
};

const DEFAULT_MISSION_THEME: CompanyInvestorMissionTheme = {
  accent: "#a78bfa",
  accentRgb: "167, 139, 250",
  accentSoft: "rgba(167, 139, 250, 0.14)",
  accentGlow: "rgba(167, 139, 250, 0.35)",
  label: "Investor Quest"
};

const COMPANY_MISSION_THEMES: Partial<Record<CompanyId, CompanyInvestorMissionTheme>> = {
  nvda: {
    accent: "#76b900",
    accentRgb: "118, 185, 0",
    accentSoft: "rgba(118, 185, 0, 0.12)",
    accentGlow: "rgba(118, 185, 0, 0.38)",
    label: "NVIDIA"
  },
  aapl: {
    accent: "#a2aaad",
    accentRgb: "162, 170, 173",
    accentSoft: "rgba(162, 170, 173, 0.14)",
    accentGlow: "rgba(162, 170, 173, 0.32)",
    label: "Apple"
  },
  msft: {
    accent: "#00a4ef",
    accentRgb: "0, 164, 239",
    accentSoft: "rgba(0, 164, 239, 0.12)",
    accentGlow: "rgba(0, 164, 239, 0.32)",
    label: "Microsoft"
  },
  tsla: {
    accent: "#e82127",
    accentRgb: "232, 33, 39",
    accentSoft: "rgba(232, 33, 39, 0.12)",
    accentGlow: "rgba(232, 33, 39, 0.32)",
    label: "Tesla"
  }
};

const MISSION_QUESTIONS: Record<
  InvestorChallengePrincipleId,
  (companyName: string) => string
> = {
  "business-purpose": (companyName) => `Can I explain what ${companyName} does?`,
  "company-evolution": (companyName) =>
    `How has ${companyName} evolved over time?`,
  "global-presence": () => `In what foreign markets does this business operate?`
};

/** Short checklist labels — derived from evidence card questions per company. */
const MISSION_EVIDENCE_LABELS: Record<
  InvestorChallengePrincipleId,
  readonly string[]
> = {
  "business-purpose": ["What {company} does", "{company}'s mission"],
  "company-evolution": [
    "GPU Invented",
    "CUDA",
    "AI Breakthrough",
    "Built for AI",
    "Platform Expansion",
    "Full-Stack AI Platform"
  ],
  "global-presence": ["Who uses {company}'s products", "Industries that rely on {company}"]
};

const CHALLENGE_CHECKLIST_LABEL = "Explain it in your own words";

export function usesInvestorMissionFlow(principleId: InvestorPrincipleId): boolean {
  return usesInvestorChallengeFlow(principleId);
}

export function resolveCompanyInvestorMissionTheme(
  companyId: CompanyId
): CompanyInvestorMissionTheme {
  return COMPANY_MISSION_THEMES[companyId] ?? DEFAULT_MISSION_THEME;
}

export function resolveInvestorMissionQuestion(
  companyId: CompanyId,
  principleId: InvestorChallengePrincipleId
): string {
  const company = companyById(companyId);
  const builder = MISSION_QUESTIONS[principleId];
  return builder(company.name);
}

function fillCompanyToken(text: string, companyName: string): string {
  return text.replace(/\{company\}/g, companyName);
}

export function buildInvestorMissionKnowledgeItems(
  companyId: CompanyId,
  principleId: InvestorChallengePrincipleId,
  stored: BusinessInvestorFrameworkStoredState
): readonly InvestorMissionKnowledgeItem[] {
  const company = companyById(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  const read = evidenceCardsReadForPrinciple(principleId, stored);
  const labelTemplates = MISSION_EVIDENCE_LABELS[principleId];
  const allEvidenceRead = cards.every((card) => read.has(card.id));
  const challenge = stored.principleChallengePassed[principleId];
  const challengeComplete = challenge === "great" || challenge === "good";
  const nextUnreadCard = cards.find((card) => !read.has(card.id));

  const evidenceItems: InvestorMissionKnowledgeItem[] = cards.map((card, index) => {
    const template = labelTemplates[index] ?? card.question;
    const label = fillCompanyToken(template, company.name);
    let status: InvestorMissionKnowledgeItemStatus = "pending";
    if (read.has(card.id)) {
      status = "complete";
    } else if (nextUnreadCard?.id === card.id) {
      status = "active";
    }
    return {
      id: card.id,
      label,
      kind: "evidence",
      status
    };
  });

  let challengeStatus: InvestorMissionKnowledgeItemStatus = "pending";
  if (challengeComplete) {
    challengeStatus = "complete";
  } else if (allEvidenceRead) {
    challengeStatus = "active";
  }

  return [
    ...evidenceItems,
    {
      id: "challenge",
      label: CHALLENGE_CHECKLIST_LABEL,
      kind: "challenge",
      status: challengeStatus
    }
  ];
}

export function isInvestorMissionKnowledgeComplete(
  items: readonly InvestorMissionKnowledgeItem[]
): boolean {
  return items.length > 0 && items.every((item) => item.status === "complete");
}

export function investorMissionProgressLabel(
  items: readonly InvestorMissionKnowledgeItem[]
): string {
  const complete = items.filter((item) => item.status === "complete").length;
  return `${complete}/${items.length}`;
}
