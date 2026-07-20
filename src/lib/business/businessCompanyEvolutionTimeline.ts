import type { BusinessInvestorEvidenceCardDef } from "@/lib/business/businessInvestorEvidenceCards";

/** One stop on the interactive Company Evolution timeline. */
export type CompanyEvolutionChapterId =
  | "gpu-1999"
  | "cuda-2006"
  | "ai-2012"
  | "built-for-ai-2017"
  | "expand-2020"
  | "fullstack-today";

export type CompanyEvolutionChapterStatus =
  | "locked"
  | "active"
  | "complete"
  | "selected";

export type CompanyEvolutionMilestoneDef = {
  id: CompanyEvolutionChapterId;
  /** Matches evidence card id for progress persistence. */
  cardId: string;
  order: number;
  year: string;
  /** Short label under the node on the horizontal rail */
  shortLabel: string;
  /** Larger title in the content panel */
  title: string;
  /** Lightweight identity glyph */
  icon: string;
  whatHappened: string;
  whyItMattered: string;
  investorInsight: string;
  /** Bridges this stop to the next — reinforces cause → effect */
  leadsToNext?: string;
  /** Short teaser shown before the next milestone unlocks */
  unlockTeaser?: string;
  /** Cinematic intro before content */
  isMajorMoment?: boolean;
  specialTitle?: string;
};

/**
 * Interactive NVIDIA evolution timeline — the learning surface itself.
 */
export const COMPANY_EVOLUTION_MILESTONES: readonly CompanyEvolutionMilestoneDef[] = [
  {
    id: "gpu-1999",
    cardId: "evolution-1",
    order: 1,
    year: "1999",
    shortLabel: "GPU Invented",
    title: "GPU Invented",
    icon: "🎮",
    isMajorMoment: true,
    specialTitle: "BIRTH OF THE GPU",
    whatHappened:
      "NVIDIA invented the GPU and helped transform computer graphics and PC gaming — creating a whole new kind of chip.",
    whyItMattered:
      "NVIDIA wasn’t just competing on old products. It opened a new category that would later become the foundation for AI.",
    investorInsight:
      "Great companies can begin by inventing a new category — not only by improving what already exists.",
    leadsToNext:
      "Once GPUs were powerful and flexible, the next question was: what else could they compute besides graphics?",
    unlockTeaser: "The next breakthrough turned a graphics chip into a computing platform..."
  },
  {
    id: "cuda-2006",
    cardId: "evolution-2",
    order: 2,
    year: "2006",
    shortLabel: "CUDA",
    title: "CUDA",
    icon: "💻",
    isMajorMoment: true,
    specialTitle: "CUDA",
    whatHappened:
      "CUDA let developers use GPUs for general computing — science, data, and other hard problems — not just games.",
    whyItMattered:
      "NVIDIA shifted from “gaming hardware company” to “computing platform company.” The same chips now had a much bigger future.",
    investorInsight:
      "A powerful platform can create opportunities far beyond the product it was originally built for.",
    leadsToNext:
      "With GPUs open to general computing, researchers soon proved they were perfect for deep learning.",
    unlockTeaser: "The next breakthrough changed NVIDIA forever..."
  },
  {
    id: "ai-2012",
    cardId: "evolution-3",
    order: 3,
    year: "2012",
    shortLabel: "AI Breakthrough",
    title: "AI Breakthrough",
    icon: "🧠",
    isMajorMoment: true,
    specialTitle: "AI BREAKTHROUGH",
    whatHappened:
      "AlexNet won ImageNet using NVIDIA GPUs — proof that GPUs were extraordinarily effective for deep learning.",
    whyItMattered:
      "This “Big Bang” moment placed NVIDIA at the centre of modern AI. Parallel GPUs weren’t a side skill anymore — they were essential.",
    investorInsight:
      "One proof point can reveal a much larger future opportunity for a company’s technology.",
    leadsToNext:
      "Once AI demand arrived, NVIDIA redesigned its chips specifically for that workload.",
    unlockTeaser: "A new discovery has been unlocked..."
  },
  {
    id: "built-for-ai-2017",
    cardId: "evolution-4",
    order: 4,
    year: "2017",
    shortLabel: "Built for AI",
    title: "Built for AI",
    icon: "⚡",
    isMajorMoment: true,
    specialTitle: "BUILT FOR AI",
    whatHappened:
      "Tensor Cores and AI-focused architecture made NVIDIA hardware purpose-built for AI — not just adapted graphics chips.",
    whyItMattered:
      "NVIDIA stopped waiting for new uses of old tools. It purposely redesigned its technology for the AI era.",
    investorInsight:
      "Strong companies redesign for new opportunities instead of standing still.",
    leadsToNext:
      "With AI chips ready, NVIDIA needed the networking and systems to run AI at data-centre scale.",
    unlockTeaser: "The company was about to grow beyond chips..."
  },
  {
    id: "expand-2020",
    cardId: "evolution-5",
    order: 5,
    year: "2020",
    shortLabel: "Platform Expansion",
    title: "Platform Expansion",
    icon: "🌐",
    whatHappened:
      "Acquiring Mellanox brought high-speed networking, so NVIDIA platforms could connect and operate at data-centre scale.",
    whyItMattered:
      "NVIDIA was no longer only selling chips. It was building the connected infrastructure around them.",
    investorInsight:
      "Platform companies grow by surrounding their core technology with what customers need next.",
    leadsToNext:
      "Chips + networking opened the door to a full AI stack — hardware, systems, and software together.",
    unlockTeaser: "One last discovery completes the whole journey..."
  },
  {
    id: "fullstack-today",
    cardId: "evolution-6",
    order: 6,
    year: "Today",
    shortLabel: "Full-Stack AI Platform",
    title: "Full-Stack AI Platform",
    icon: "🏛️",
    whatHappened:
      "NVIDIA now combines chips, systems, networking, software, and AI tools into one complete computing platform.",
    whyItMattered:
      "What began as a graphics company became a full-stack AI computing infrastructure company.",
    investorInsight:
      "Investors should understand what a company has become — not only where it started."
  }
] as const;

/** @deprecated Use COMPANY_EVOLUTION_MILESTONES */
export const COMPANY_EVOLUTION_CHAPTERS = COMPANY_EVOLUTION_MILESTONES.map((m) => ({
  id: m.id,
  cardId: m.cardId,
  chapterNumber: m.order,
  year: m.year,
  railLabel: m.shortLabel,
  title: m.title
}));

export type CompanyEvolutionMilestoneId = CompanyEvolutionChapterId;
export type CompanyEvolutionMilestoneStatus = CompanyEvolutionChapterStatus;

export const COMPANY_EVOLUTION_TIMELINE = COMPANY_EVOLUTION_MILESTONES.map((m) => ({
  id: m.id,
  year: m.year,
  label: m.shortLabel
}));

export const COMPANY_EVOLUTION_CHAPTER_XP = 15;

export const COMPANY_EVOLUTION_JOURNEY_SUMMARY = {
  eyebrow: "Journey complete",
  title: "You've travelled through NVIDIA's evolution.",
  body: "You now understand how a graphics company became a full-stack AI computing platform.",
  arc: [
    "GPU",
    "CUDA",
    "AI Breakthrough",
    "Built for AI",
    "Platform Expansion",
    "Full-Stack AI"
  ] as const
} as const;

export function resolveEvolutionMilestoneById(
  id: CompanyEvolutionChapterId | null | undefined
): CompanyEvolutionMilestoneDef | null {
  if (!id) return null;
  return COMPANY_EVOLUTION_MILESTONES.find((m) => m.id === id) ?? null;
}

export function resolveEvolutionChapterForCardId(
  cardId: string | null | undefined
): CompanyEvolutionMilestoneDef | null {
  if (!cardId) return null;
  return COMPANY_EVOLUTION_MILESTONES.find((m) => m.cardId === cardId) ?? null;
}

export function resolveEvolutionMilestoneIdsForCard(
  card: BusinessInvestorEvidenceCardDef | null | undefined
): readonly CompanyEvolutionChapterId[] {
  const milestone = resolveEvolutionChapterForCardId(card?.id);
  return milestone ? [milestone.id] : [];
}

export function resolveCompanyEvolutionChapterStatuses(args: {
  cards?: readonly BusinessInvestorEvidenceCardDef[];
  readCardIds: ReadonlySet<string>;
  activeCardId?: string | null;
  selectedId?: CompanyEvolutionChapterId | null;
  forceComplete?: boolean;
}): Record<CompanyEvolutionChapterId, CompanyEvolutionChapterStatus> {
  const { readCardIds, forceComplete = false } = args;
  const statuses = Object.fromEntries(
    COMPANY_EVOLUTION_MILESTONES.map((m) => [m.id, "locked" as CompanyEvolutionChapterStatus])
  ) as Record<CompanyEvolutionChapterId, CompanyEvolutionChapterStatus>;

  if (forceComplete) {
    for (const m of COMPANY_EVOLUTION_MILESTONES) statuses[m.id] = "complete";
    return statuses;
  }

  let firstIncomplete: CompanyEvolutionMilestoneDef | null = null;
  for (const m of COMPANY_EVOLUTION_MILESTONES) {
    if (readCardIds.has(m.cardId)) {
      statuses[m.id] = "complete";
    } else if (!firstIncomplete) {
      firstIncomplete = m;
      statuses[m.id] = "active";
    }
  }

  return statuses;
}

export const resolveCompanyEvolutionMilestoneStatuses = resolveCompanyEvolutionChapterStatuses;

export function resolveCompanyEvolutionTimelineProgress(
  statuses: Record<CompanyEvolutionChapterId, CompanyEvolutionChapterStatus>
): number {
  const total = COMPANY_EVOLUTION_MILESTONES.length;
  if (total === 0) return 0;
  let completeCount = 0;
  let activeIndex = -1;
  COMPANY_EVOLUTION_MILESTONES.forEach((m, index) => {
    if (statuses[m.id] === "complete") completeCount += 1;
    if (statuses[m.id] === "active") activeIndex = index;
  });
  if (completeCount >= total) return 1;
  if (activeIndex >= 0) return Math.min(1, completeCount / Math.max(1, total - 1));
  return completeCount / Math.max(1, total - 1);
}

export function resolveNextUnlockedEvolutionMilestone(
  readCardIds: ReadonlySet<string>
): CompanyEvolutionMilestoneDef | null {
  return COMPANY_EVOLUTION_MILESTONES.find((m) => !readCardIds.has(m.cardId)) ?? null;
}

export function isEvolutionTimelineComplete(readCardIds: ReadonlySet<string>): boolean {
  return COMPANY_EVOLUTION_MILESTONES.every((m) => readCardIds.has(m.cardId));
}
