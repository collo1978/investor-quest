import type { CompanyId } from "@/data/companies";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

/** Standard thumbs rating for every Business Island evidence card. */
export const BUSINESS_ISLAND_EVIDENCE_RATING = {
  strongEmoji: "👍",
  weakEmoji: "👎",
  strongAriaLabel: "I understand",
  weakAriaLabel: "Not yet"
} as const;

export type BusinessInvestorEvidenceCardDef = {
  id: string;
  principleId: InvestorPrincipleId;
  order: number;
  question: string;
  answer: string;
  /** Optional — fixed headline for identical A-section layout across all cards. */
  answerHeadline?: string;
  /** Optional — supporting copy under the headline. */
  answerBody?: string;
  bullets?: readonly string[];
  callout?: string;
  /** Shown on the rating card — specific to this evidence piece. */
  ratingPrompt: string;
};

const NVDA_BUSINESS_PURPOSE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "purpose-1",
    principleId: "business-purpose",
    order: 1,
    question: "What does NVIDIA actually do?",
    answer:
      'Think of NVIDIA as the company building the "brains" behind modern AI. It designs powerful computer chips and software that help computers do jobs that would normally take much longer, like training ChatGPT, running self-driving cars, creating realistic video games, and helping scientists make new discoveries.',
    answerHeadline:
      'Think of NVIDIA as the company building the "brains" behind modern AI.',
    answerBody:
      "It designs powerful computer chips and software that help computers do jobs that would normally take much longer, like training ChatGPT, running self-driving cars, creating realistic video games, and helping scientists make new discoveries.",
    ratingPrompt: "Do you understand what NVIDIA does?"
  },
  {
    id: "purpose-2",
    principleId: "business-purpose",
    order: 2,
    question: "What is NVIDIA's mission?",
    answer:
      "NVIDIA wants to make computers much smarter and much faster. Its goal is to help people and businesses solve problems that ordinary computers struggle with, making AI and advanced computing useful in everyday industries like healthcare, finance, manufacturing and transportation.",
    answerHeadline: "NVIDIA wants to make computers much smarter and much faster.",
    answerBody:
      "Its goal is to help people and businesses solve problems that ordinary computers struggle with, making AI and advanced computing useful in everyday industries like healthcare, finance, manufacturing and transportation.",
    ratingPrompt: "Do you understand NVIDIA's mission?"
  },
  {
    id: "purpose-3",
    principleId: "business-purpose",
    order: 3,
    question: "What makes NVIDIA different from other chip companies?",
    answer:
      "Most chip companies mainly sell computer chips. NVIDIA goes a step further. It builds the chips, the software and the AI tools that all work together as one complete system. That makes it much easier for customers to build powerful AI products and much harder for competitors to catch up.",
    answerHeadline: "Most chip companies mainly sell computer chips.",
    answerBody:
      "NVIDIA goes a step further. It builds the chips, the software and the AI tools that all work together as one complete system. That makes it much easier for customers to build powerful AI products and much harder for competitors to catch up.",
    ratingPrompt: "Do you understand what makes NVIDIA different?"
  }
];

const NVDA_COMPANY_EVOLUTION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "evolution-1",
    principleId: "company-evolution",
    order: 1,
    question: "How did NVIDIA get started?",
    answer:
      "NVIDIA began in 1993 with the idea of making computer graphics much faster. Its invention of the GPU transformed gaming and later became the foundation for modern AI.",
    answerHeadline:
      "NVIDIA began in 1993 with the idea of making computer graphics much faster.",
    answerBody:
      "Its invention of the GPU transformed gaming and later became the foundation for modern AI.",
    ratingPrompt: "Do you understand how NVIDIA got started?"
  },
  {
    id: "evolution-2",
    principleId: "company-evolution",
    order: 2,
    question: "What were the biggest turning points in NVIDIA's history?",
    answer:
      "Some of NVIDIA's biggest milestones include inventing the GPU, creating CUDA to unlock the power of GPUs for many industries, acquiring Mellanox to expand into networking, and launching products built specifically for AI.",
    answerHeadline: "NVIDIA's biggest milestones reshaped computing.",
    answerBody:
      "They include inventing the GPU, creating CUDA to unlock the power of GPUs for many industries, acquiring Mellanox to expand into networking, and launching products built specifically for AI.",
    ratingPrompt: "Do you understand NVIDIA's biggest turning points?"
  },
  {
    id: "evolution-3",
    principleId: "company-evolution",
    order: 3,
    question: "How did NVIDIA become an AI leader?",
    answer:
      "Although NVIDIA started in gaming, its technology turned out to be perfect for training AI models. Over time, it invested heavily in AI software, networking and computing platforms, becoming one of the world's leading AI companies.",
    answerHeadline:
      "NVIDIA's gaming roots turned out to be perfect for training AI models.",
    answerBody:
      "Over time, it invested heavily in AI software, networking and computing platforms, becoming one of the world's leading AI companies.",
    ratingPrompt: "Do you understand how NVIDIA became an AI leader?"
  }
];

const NVDA_GLOBAL_PRESENCE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "presence-1",
    principleId: "global-presence",
    order: 1,
    question: "Who uses NVIDIA's products?",
    answer:
      "NVIDIA's customers include the world's biggest cloud companies, AI startups, researchers, gamers, designers and large businesses across many industries.",
    answerHeadline:
      "NVIDIA's customers include the world's biggest cloud companies and AI startups.",
    answerBody:
      "Researchers, gamers, designers and large businesses across many industries also rely on its products.",
    ratingPrompt: "Do you understand who uses NVIDIA's products?"
  },
  {
    id: "presence-2",
    principleId: "global-presence",
    order: 2,
    question: "Which industries rely on NVIDIA's technology?",
    answer:
      "Its technology is used in healthcare, finance, manufacturing, automotive, telecommunications, scientific research, gaming and many other industries that need powerful computing.",
    answerHeadline:
      "NVIDIA's technology spans healthcare, finance, manufacturing and more.",
    answerBody:
      "Automotive, telecommunications, scientific research, gaming and many other industries that need powerful computing also rely on it.",
    ratingPrompt: "Do you understand which industries rely on NVIDIA?"
  },
  {
    id: "presence-3",
    principleId: "global-presence",
    order: 3,
    question: "Where is NVIDIA making the biggest impact?",
    answer:
      "NVIDIA's technology is helping power some of the world's biggest trends, including artificial intelligence, autonomous vehicles, cloud computing, robotics and scientific discovery.",
    answerHeadline:
      "NVIDIA is helping power some of the world's biggest technology trends.",
    answerBody:
      "That includes artificial intelligence, autonomous vehicles, cloud computing, robotics and scientific discovery.",
    ratingPrompt: "Do you understand where NVIDIA is making the biggest impact?"
  }
];

const NVDA_VALUE_PROPOSITION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "value-1",
    principleId: "value-proposition",
    order: 1,
    question: "What problem does NVIDIA solve?",
    answer:
      "NVIDIA helps computers handle incredibly difficult tasks much faster than traditional computers. Its technology powers things like artificial intelligence, scientific research, self-driving cars and advanced graphics that would otherwise take much longer to process.",
    answerHeadline:
      "NVIDIA helps computers handle incredibly difficult tasks much faster than traditional computers.",
    answerBody:
      "Its technology powers things like artificial intelligence, scientific research, self-driving cars and advanced graphics that would otherwise take much longer to process.",
    ratingPrompt: "Do you understand the problem NVIDIA solves?"
  },
  {
    id: "value-2",
    principleId: "value-proposition",
    order: 2,
    question: "Why do customers choose NVIDIA?",
    answer:
      "Customers choose NVIDIA because it doesn't just sell chips. It provides the chips, software and tools needed to build powerful AI systems, making it much easier for businesses to develop and run advanced applications.",
    answerHeadline: "Customers choose NVIDIA because it doesn't just sell chips.",
    answerBody:
      "It provides the chips, software and tools needed to build powerful AI systems, making it much easier for businesses to develop and run advanced applications.",
    ratingPrompt: "Do you understand why customers choose NVIDIA?"
  },
  {
    id: "value-3",
    principleId: "value-proposition",
    order: 3,
    question: "What makes NVIDIA's products so valuable?",
    answer:
      "NVIDIA's products save customers time and help them build better technology faster. By combining powerful hardware with software that works seamlessly together, customers can solve problems that would be difficult or impossible using ordinary computers.",
    answerHeadline: "NVIDIA's products save customers time and help them build better technology faster.",
    answerBody:
      "By combining powerful hardware with software that works seamlessly together, customers can solve problems that would be difficult or impossible using ordinary computers.",
    ratingPrompt: "Do you understand what makes NVIDIA's products valuable?"
  }
];

const NVDA_PRODUCT_PORTFOLIO_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "portfolio-1",
    principleId: "product-portfolio",
    order: 1,
    question: "What products does NVIDIA sell?",
    answer:
      "NVIDIA is best known for its GPUs, but it also develops networking equipment, AI software, complete computing systems and platforms for industries like healthcare, gaming and autonomous driving.",
    answerHeadline: "NVIDIA is best known for its GPUs.",
    answerBody:
      "It also develops networking equipment, AI software, complete computing systems and platforms for industries like healthcare, gaming and autonomous driving.",
    ratingPrompt: "Do you understand what products NVIDIA sells?"
  },
  {
    id: "portfolio-2",
    principleId: "product-portfolio",
    order: 2,
    question: "Does NVIDIA sell more than computer chips?",
    answer:
      "Yes. NVIDIA has grown far beyond selling chips. Today it offers complete AI platforms that combine hardware, software, networking and developer tools into one integrated solution.",
    answerHeadline: "Yes — NVIDIA has grown far beyond selling chips.",
    answerBody:
      "Today it offers complete AI platforms that combine hardware, software, networking and developer tools into one integrated solution.",
    ratingPrompt: "Do you understand NVIDIA's full product range?"
  },
  {
    id: "portfolio-3",
    principleId: "product-portfolio",
    order: 3,
    question: "How do NVIDIA's products work together?",
    answer:
      "Instead of selling individual products, NVIDIA designs many of its products to work as one complete system. This makes it easier for customers to build powerful AI infrastructure while keeping everything compatible.",
    answerHeadline:
      "NVIDIA designs many of its products to work as one complete system.",
    answerBody:
      "This makes it easier for customers to build powerful AI infrastructure while keeping everything compatible.",
    ratingPrompt: "Do you understand how NVIDIA's products work together?"
  }
];

const NVDA_INNOVATION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "innovation-1",
    principleId: "innovation",
    order: 1,
    question: "Why is innovation so important to NVIDIA?",
    answer:
      "Innovation has been at the centre of NVIDIA since the company was founded. Many of its biggest successes came from creating entirely new technologies rather than simply improving existing ones.",
    answerHeadline:
      "Innovation has been at the centre of NVIDIA since the company was founded.",
    answerBody:
      "Many of its biggest successes came from creating entirely new technologies rather than simply improving existing ones.",
    ratingPrompt: "Do you understand why innovation matters to NVIDIA?"
  },
  {
    id: "innovation-2",
    principleId: "innovation",
    order: 2,
    question: "How much does NVIDIA invest in innovation?",
    answer:
      "NVIDIA has invested tens of billions of dollars into research and development over its history. This continuous investment has helped it remain one of the world's leading technology companies.",
    answerHeadline:
      "NVIDIA has invested tens of billions of dollars into research and development.",
    answerBody:
      "This continuous investment has helped it remain one of the world's leading technology companies.",
    ratingPrompt: "Do you understand NVIDIA's investment in innovation?"
  },
  {
    id: "innovation-3",
    principleId: "innovation",
    order: 3,
    question: "How does innovation keep NVIDIA ahead?",
    answer:
      "By constantly developing new chips, software and AI platforms, NVIDIA stays ahead of changing technology and gives customers reasons to continue building on its ecosystem.",
    answerHeadline:
      "NVIDIA constantly develops new chips, software and AI platforms.",
    answerBody:
      "This keeps it ahead of changing technology and gives customers reasons to continue building on its ecosystem.",
    ratingPrompt: "Do you understand how innovation keeps NVIDIA ahead?"
  }
];

/** Company-specific evidence cards — extend as more principles ship. */
export const BUSINESS_INVESTOR_EVIDENCE_BY_COMPANY: Partial<
  Record<CompanyId, Partial<Record<InvestorPrincipleId, readonly BusinessInvestorEvidenceCardDef[]>>>
> = {
  nvda: {
    "business-purpose": NVDA_BUSINESS_PURPOSE_CARDS,
    "company-evolution": NVDA_COMPANY_EVOLUTION_CARDS,
    "global-presence": NVDA_GLOBAL_PRESENCE_CARDS,
    "value-proposition": NVDA_VALUE_PROPOSITION_CARDS,
    "product-portfolio": NVDA_PRODUCT_PORTFOLIO_CARDS,
    "innovation": NVDA_INNOVATION_CARDS
  }
};

export function resolveInvestorEvidenceCards(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): readonly BusinessInvestorEvidenceCardDef[] {
  const cards = BUSINESS_INVESTOR_EVIDENCE_BY_COMPANY[companyId]?.[principleId] ?? [];
  return [...cards].sort((a, b) => a.order - b.order);
}

export function resolveNextInvestorEvidenceCard(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  ratedCardIds: ReadonlySet<string>
): BusinessInvestorEvidenceCardDef | null {
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  return cards.find((card) => !ratedCardIds.has(card.id)) ?? null;
}

/** Quest slug that launches a principle's evidence path. */
export const PRINCIPLE_EVIDENCE_QUEST_SLUG: Partial<
  Record<InvestorPrincipleId, string>
> = {
  "business-purpose": "what-they-do",
  "company-evolution": "what-they-do",
  "global-presence": "what-they-do",
  "value-proposition": "why-buying",
  "product-portfolio": "why-buying",
  "innovation": "why-buying"
};

export function questSlugForPrincipleEvidence(
  principleId: InvestorPrincipleId
): string | null {
  return PRINCIPLE_EVIDENCE_QUEST_SLUG[principleId] ?? null;
}
