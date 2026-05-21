import type { PillarId } from "@/data/pillars";

/** API + generation wiring per pillar (expand as islands ship). */
export type PillarQuestPipelineConfig = {
  pillarId: PillarId;
  /** POST /api/{generatePath}?ticker=&slug= */
  generatePath: string;
  /** GET /api/companies/{ticker}/{answersPath}/{slug} */
  answersPath: string;
};

const CONFIGS: Partial<Record<PillarId, PillarQuestPipelineConfig>> = {
  financials: {
    pillarId: "financials",
    generatePath: "financials/generate",
    answersPath: "financial-quest-answers"
  },
  business: {
    pillarId: "business",
    generatePath: "business/generate",
    answersPath: "business-quest-answers"
  },
  management: {
    pillarId: "management",
    generatePath: "management/generate",
    answersPath: "management-quest-answers"
  },
  forces: {
    pillarId: "forces",
    generatePath: "forces/generate",
    answersPath: "forces-quest-answers"
  }
};

export function getPillarQuestPipelineConfig(
  pillarId: PillarId
): PillarQuestPipelineConfig | null {
  return CONFIGS[pillarId] ?? null;
}

export function pillarHasQuestPipeline(pillarId: PillarId): boolean {
  return Boolean(CONFIGS[pillarId]);
}
