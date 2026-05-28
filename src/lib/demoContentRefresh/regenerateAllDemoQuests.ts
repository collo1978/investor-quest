import { COMPANIES, type Company, type CompanyId } from "@/data/companies";
import {
  regenerateQuestContent,
  type RegenerateQuestContentResult
} from "@/lib/admin/regenerateCompanyQuests";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import { COMPANY_CONTENT_BY_ID } from "@/data/quests/content";
import { AI_PIPELINE_PILLARS } from "@/lib/admin/pillarGeneration";

export const ALL_DEMO_COMPANY_TICKERS = COMPANIES.map((c) => c.ticker);

export type DemoCompanyRegenReport = {
  ticker: string;
  companyId: CompanyId;
  companyName: string;
  /** Players mostly see hand-authored overrides when true (e.g. Apple). */
  hasCuratedContentFile: boolean;
  /** What wins on screen for AI quest cards */
  playerVisibleSource: "curated_override" | "database_generated";
  totalGenerated: number;
  totalSkipped: number;
  totalErrors: number;
  extractRan: boolean;
  pillars: RegenerateQuestContentResult["pillars"];
  ok: boolean;
};

export type RegenerateAllDemoQuestsResult = {
  companies: DemoCompanyRegenReport[];
  summary: {
    companyCount: number;
    companiesRefreshed: number;
    companiesWithErrors: number;
    totalCardsGenerated: number;
    totalErrors: number;
    pillars: readonly string[];
  };
  durationMs: number;
};

export type RegenerateAllDemoQuestsOptions = {
  runExtractIfMissing?: boolean;
  /** Called before each company (for logs / UI). */
  onCompanyStart?: (company: Company) => void;
};

/**
 * Force-regenerate every AI-pipeline card for all six demo companies.
 * Uses smart-friend prompts + jargon/human-first gates (forceRegenerate, not fast mode).
 */
export async function regenerateAllDemoQuests(
  options: RegenerateAllDemoQuestsOptions = {}
): Promise<RegenerateAllDemoQuestsResult> {
  const start = Date.now();
  const generationOptions = resolveQuestGenerationOptions({
    forceRegenerate: true,
    fastMode: false,
    maxJargonRewrites: 3
  });

  const companies: DemoCompanyRegenReport[] = [];

  for (const company of COMPANIES) {
    options.onCompanyStart?.(company);
    const hasCurated = Boolean(COMPANY_CONTENT_BY_ID[company.id]);

    const result = await regenerateQuestContent({
      ticker: company.ticker,
      runExtractIfMissing: options.runExtractIfMissing ?? false,
      generationOptions
    });

    companies.push({
      ticker: company.ticker,
      companyId: company.id,
      companyName: company.name,
      hasCuratedContentFile: hasCurated,
      playerVisibleSource: hasCurated ? "curated_override" : "database_generated",
      totalGenerated: result.totalGenerated,
      totalSkipped: result.totalSkipped,
      totalErrors: result.totalErrors,
      extractRan: result.extractRan,
      pillars: result.pillars,
      ok: result.totalErrors === 0
    });
  }

  const totalCardsGenerated = companies.reduce((n, c) => n + c.totalGenerated, 0);
  const totalErrors = companies.reduce((n, c) => n + c.totalErrors, 0);

  return {
    companies,
    summary: {
      companyCount: COMPANIES.length,
      companiesRefreshed: companies.filter((c) => c.totalGenerated > 0).length,
      companiesWithErrors: companies.filter((c) => !c.ok).length,
      totalCardsGenerated,
      totalErrors,
      pillars: AI_PIPELINE_PILLARS
    },
    durationMs: Date.now() - start
  };
}
