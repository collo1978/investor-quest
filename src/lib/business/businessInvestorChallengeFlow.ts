import type { CompanyId } from "@/data/companies";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

/** Company Overview principles — read evidence → Investor Challenge (no per-card thumbs). */
export const INVESTOR_CHALLENGE_PRINCIPLE_IDS = [
  "business-purpose",
  "company-evolution",
  "global-presence"
] as const satisfies readonly InvestorPrincipleId[];

export type InvestorChallengePrincipleId =
  (typeof INVESTOR_CHALLENGE_PRINCIPLE_IDS)[number];

export type InvestorChallengeOutcome = "great" | "good" | "retry";

export type InvestorChallengeConceptGroup = {
  /** Short learner-facing hint — e.g. "what NVIDIA does". */
  label: string;
  /**
   * Plain-English stems/phrases that signal understanding of this idea.
   * Schools evaluation is lenient: any match passes.
   */
  keywords: readonly string[];
};

export type InvestorChallengeDef = {
  principleId: InvestorChallengePrincipleId;
  prompt: string;
  /** Soft floor so blank/one-word clicks don't pass. */
  minWords: number;
  /** Core ideas — matching any one is enough to pass in Schools. */
  conceptGroups: readonly InvestorChallengeConceptGroup[];
};

const NVDA_CHALLENGE_DEFS: Record<
  InvestorChallengePrincipleId,
  InvestorChallengeDef
> = {
  "business-purpose": {
    principleId: "business-purpose",
    prompt: "Explain what NVIDIA does in your own words.",
    minWords: 3,
    conceptGroups: [
      {
        label: "what NVIDIA does",
        keywords: [
          "chip",
          "gpu",
          "ai",
          "graphic",
          "graphics card",
          "video card",
          "computer chip",
          "ai chip",
          "processor",
          "hardware",
          "software",
          "semiconductor",
          "comput",
          "gaming",
          "faster",
          "train",
          "brain",
          "platform"
        ]
      }
    ]
  },
  "company-evolution": {
    principleId: "company-evolution",
    prompt: "Explain how NVIDIA has evolved over time in your own words.",
    minWords: 3,
    conceptGroups: [
      {
        label: "where NVIDIA started (graphics / GPU)",
        keywords: [
          "graphic",
          "gaming",
          "gpu",
          "started",
          "began",
          "invent",
          "chip",
          "video game",
          "pc gaming",
          "from"
        ]
      },
      {
        label: "what NVIDIA became (AI / full-stack platform)",
        keywords: [
          "ai",
          "cuda",
          "platform",
          "full stack",
          "fullstack",
          "full-stack",
          "infrastructure",
          "data centre",
          "data center",
          "network",
          "mellanox",
          "software",
          "became",
          "evolved",
          "transform",
          "deep learning",
          "tensor"
        ]
      }
    ]
  },
  "global-presence": {
    principleId: "global-presence",
    prompt:
      "Explain where NVIDIA operates around the world and why that matters.",
    minWords: 3,
    conceptGroups: [
      {
        label: "NVIDIA around the world",
        keywords: [
          "world",
          "global",
          "worldwide",
          "country",
          "countries",
          "market",
          "markets",
          "international",
          "everywhere",
          "operat",
          "around the world",
          "cloud",
          "startup",
          "research",
          "gamer",
          "customer",
          "enterprise",
          "industry",
          "industries",
          "health",
          "finance",
          "automotive",
          "manufactur",
          "telecom",
          "scientific",
          "scale"
        ]
      }
    ]
  }
};

export function usesInvestorChallengeFlow(
  principleId: InvestorPrincipleId
): principleId is InvestorChallengePrincipleId {
  return (INVESTOR_CHALLENGE_PRINCIPLE_IDS as readonly string[]).includes(
    principleId
  );
}

export function resolveInvestorChallengeDef(
  _companyId: CompanyId,
  principleId: InvestorChallengePrincipleId
): InvestorChallengeDef {
  return NVDA_CHALLENGE_DEFS[principleId];
}
