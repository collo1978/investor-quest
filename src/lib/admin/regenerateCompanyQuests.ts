import {
  COMPANIES,
  companyByTicker,
  type Company,
  type CompanyId
} from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import type { QuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import { runCompanySectionExtraction } from "@/lib/sec/extractionPipeline";
import { isSecApiConfigured } from "@/lib/sec/env";
import {
  AI_PIPELINE_PILLARS,
  regeneratePillarQuestContent
} from "@/lib/admin/pillarGeneration";
import {
  resolveFreshPlayerQuestSlugs,
  resolveUnlockedQuestSlugs
} from "@/lib/admin/resolveUnlockedQuestSlugs";

export type RegenerateScope = "island" | "company" | "all-companies";

export type RegenerateQuestContentParams = {
  ticker: string;
  pillarId?: PillarId;
  questSlug?: string;
  /** When set, only these card ids (within questSlug). */
  cardIds?: string[];
  runExtractIfMissing?: boolean;
  /** When true, only quests reachable after prerequisite completion (not hub_locked). */
  unlockedOnly?: boolean;
  /** When true with unlockedOnly, only entry quests (no prior questSlugs). */
  freshPlayerOnly?: boolean;
  generationOptions?: Partial<QuestGenerationOptions>;
};

export type PillarRegenerateReport = {
  pillarId: PillarId;
  questSlugs: string[];
  generated: number;
  skipped: number;
  errors: Array<{ questSlug: string; cardId: string; message: string }>;
  extractRan: boolean;
};

export type RegenerateQuestContentResult = {
  scope: RegenerateScope;
  ticker: string;
  companyId: CompanyId;
  extractRan: boolean;
  pillars: PillarRegenerateReport[];
  totalGenerated: number;
  totalSkipped: number;
  totalErrors: number;
};

function resolveAllowedSlugs(
  companyId: CompanyId,
  pillarId: PillarId,
  params: Pick<
    RegenerateQuestContentParams,
    "unlockedOnly" | "freshPlayerOnly"
  >
): Set<string> | undefined {
  if (params.freshPlayerOnly) {
    return resolveFreshPlayerQuestSlugs(companyId, pillarId);
  }
  if (params.unlockedOnly) {
    return resolveUnlockedQuestSlugs(companyId, pillarId);
  }
  return undefined;
}

export async function regenerateQuestContent(
  params: RegenerateQuestContentParams
): Promise<RegenerateQuestContentResult> {
  const company = companyByTicker(params.ticker);
  if (!company) {
    throw new Error(`Unknown ticker: ${params.ticker}`);
  }

  let extractRan = false;
  if (params.runExtractIfMissing && isSecApiConfigured()) {
    await runCompanySectionExtraction(company.ticker);
    extractRan = true;
  }

  const pillars = params.pillarId
    ? [params.pillarId]
    : [...AI_PIPELINE_PILLARS];

  const reports: PillarRegenerateReport[] = [];
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const pillarId of pillars) {
    const allowedQuestSlugs = resolveAllowedSlugs(company.id, pillarId, params);

    if (params.questSlug && allowedQuestSlugs && !allowedQuestSlugs.has(params.questSlug)) {
      reports.push({
        pillarId,
        questSlugs: [],
        generated: 0,
        skipped: 0,
        errors: [
          {
            questSlug: params.questSlug,
            cardId: "-",
            message:
              "Quest skipped: not in unlocked set (toggle off “unlocked only” or complete prerequisites)."
          }
        ],
        extractRan: false
      });
      totalErrors++;
      continue;
    }

    try {
      const result = await regeneratePillarQuestContent({
        pillarId,
        ticker: company.ticker,
        companyId: company.id,
        questSlug: params.questSlug,
        cardIds: params.cardIds,
        allowedQuestSlugs,
        runExtractIfMissing: false,
        generationOptions: params.generationOptions
      });

      reports.push({
        pillarId,
        questSlugs: result.questSlugs,
        generated: result.generated,
        skipped: result.skipped,
        errors: result.errors,
        extractRan: result.extractRan
      });
      totalGenerated += result.generated;
      totalSkipped += result.skipped;
      totalErrors += result.errors.length;
      if (result.extractRan) extractRan = true;
    } catch (err) {
      reports.push({
        pillarId,
        questSlugs: [],
        generated: 0,
        skipped: 0,
        errors: [
          {
            questSlug: params.questSlug ?? "all",
            cardId: "-",
            message: err instanceof Error ? err.message : "Pillar generation failed."
          }
        ],
        extractRan: false
      });
      totalErrors++;
    }
  }

  return {
    scope: params.pillarId
      ? "island"
      : params.ticker
        ? "company"
        : "all-companies",
    ticker: company.ticker,
    companyId: company.id,
    extractRan,
    pillars: reports,
    totalGenerated,
    totalSkipped,
    totalErrors
  };
}

export async function regenerateAllCompanies(
  params: Omit<RegenerateQuestContentParams, "ticker">
): Promise<RegenerateQuestContentResult[]> {
  const results: RegenerateQuestContentResult[] = [];
  for (const company of COMPANIES) {
    results.push(
      await regenerateQuestContent({
        ...params,
        ticker: company.ticker
      })
    );
  }
  return results;
}

export function listRegenerationCompanies(): readonly Company[] {
  return COMPANIES;
}
