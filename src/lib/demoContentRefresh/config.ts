import { companyByTicker, type CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";

export const DEMO_REFRESH_TICKERS = ["NVDA", "AAPL", "NKE"] as const;

export type DemoRefreshTicker = (typeof DEMO_REFRESH_TICKERS)[number];

export type DemoRefreshPillarId = Extract<PillarId, "business" | "financials" | "forces">;

export type DemoRefreshJob = {
  id: string;
  ticker: DemoRefreshTicker;
  companyId: CompanyId;
  companyName: string;
  pillarId: DemoRefreshPillarId;
  questSlug: string;
  label: string;
};

const BUSINESS_SNAPSHOT = { pillarId: "business" as const, questSlug: "snapshot" };
const BUSINESS_REVENUE = { pillarId: "business" as const, questSlug: "revenue" };
const FIN_GROWTH = { pillarId: "financials" as const, questSlug: "growth" };
const FIN_PROFIT = { pillarId: "financials" as const, questSlug: "profitability" };
const FORCES_SUPPLY = {
  pillarId: "forces" as const,
  questSlug: "positive-inside-supply-chain"
};

/** Priority demo pairs — 3 companies × 5 quests = 15 jobs. */
export function buildDemoRefreshJobs(
  companies: Array<{ ticker: DemoRefreshTicker; companyId: CompanyId; companyName: string }>
): DemoRefreshJob[] {
  const templates = [
    { ...BUSINESS_SNAPSHOT, short: "Business Snapshot" },
    { ...BUSINESS_REVENUE, short: "Business Revenue" },
    { ...FIN_GROWTH, short: "Financials Growth" },
    { ...FIN_PROFIT, short: "Financials Profitability" },
    { ...FORCES_SUPPLY, short: "Forces · Supply chain" }
  ];

  const jobs: DemoRefreshJob[] = [];
  for (const co of companies) {
    for (const t of templates) {
      jobs.push({
        id: `${co.ticker}-${t.pillarId}-${t.questSlug}`,
        ticker: co.ticker,
        companyId: co.companyId,
        companyName: co.companyName,
        pillarId: t.pillarId,
        questSlug: t.questSlug,
        label: `${co.ticker} · ${t.short}`
      });
    }
  }
  return jobs;
}

export function getDemoRefreshPlan(): DemoRefreshJob[] {
  const companies: Array<{
    ticker: DemoRefreshTicker;
    companyId: CompanyId;
    companyName: string;
  }> = [];

  for (const ticker of DEMO_REFRESH_TICKERS) {
    const c = companyByTicker(ticker);
    if (!c) continue;
    companies.push({
      ticker,
      companyId: c.id,
      companyName: c.name
    });
  }

  return buildDemoRefreshJobs(companies);
}

export function findDemoRefreshJob(jobId: string): DemoRefreshJob | undefined {
  return getDemoRefreshPlan().find((j) => j.id === jobId);
}
