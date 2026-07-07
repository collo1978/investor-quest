import { companyById, COMPANIES, type CompanyId } from "@/data/companies";
import {
  INVESTOR_RUNGS,
  investorLadderProgress,
  investorTitleFromXp
} from "@/data/progression/investorLadder";
import type { BadgeId } from "@/engine/progression/badges";
import { levelProgress } from "@/engine/progression/xp";
import type { GameState } from "@/engine/progression/state";
import {
  BUSINESS_INVESTOR_CHECKLIST_SECTIONS,
  BUSINESS_INVESTOR_PRINCIPLES,
  resolveBusinessInvestorChecklistSnapshot,
  type BusinessChecklistSectionId
} from "@/lib/business/businessInvestorFramework";
import { isPrincipleEvidenceComplete } from "@/lib/business/businessInvestorEvidenceHelpers";
import {
  readBusinessInvestorFrameworkState,
  type BusinessInvestorFrameworkStoredState
} from "@/lib/business/businessInvestorFrameworkStorage";
import { getPlayableDemoCompanies } from "@/lib/demo/playableDemo";

const EMPTY_FRAMEWORK_STATE: BusinessInvestorFrameworkStoredState = {
  naPrinciples: {},
  evidenceRatings: {},
  sectionQuizPassed: {}
};

function readFrameworkState(
  companyId: CompanyId,
  includeClientStorage: boolean
): BusinessInvestorFrameworkStoredState {
  if (!includeClientStorage) return EMPTY_FRAMEWORK_STATE;
  return readBusinessInvestorFrameworkState(companyId);
}

import type {
  InvestorProfileSnapshot,
  ProfileAchievement,
  ProfileCompanyView,
  ProfileQuizResult,
  ProfileSectorRow,
  ProfileStatistics
} from "@/lib/profile/investorProfileTypes";

const SECTION_SHORT_LABELS: Record<BusinessChecklistSectionId, string> = {
  "company-overview": "Business",
  "products-services": "Products",
  "customers-markets": "Customers",
  "business-model": "Business Model",
  "competitive-position": "Competition",
  operations: "Operations"
};

const PROFILE_ACHIEVEMENT_DEFS: {
  id: string;
  badgeId: BadgeId;
  title: string;
  detail: string;
}[] = [
  {
    id: "first-quiz",
    badgeId: "quiz-pass",
    title: "First Quiz Passed",
    detail: "Passed your first quest quiz."
  },
  {
    id: "company-overview",
    badgeId: "company-overview-complete",
    title: "Company Overview Complete",
    detail: "Finished the Company Overview checklist section."
  },
  {
    id: "evidence-collector",
    badgeId: "evidence-collector",
    title: "Evidence Collector",
    detail: "Rated evidence across a full Investor Principle."
  },
  {
    id: "checklist-complete",
    badgeId: "investor-checklist-complete",
    title: "Investor Checklist Complete",
    detail: "Passed every Business Investor Checklist section quiz."
  },
  {
    id: "ten-k",
    badgeId: "ten-k-rookie",
    title: "10-K Rookie",
    detail: "Cleared the full-map final challenge."
  }
];

function resolveCompanyView(
  companyId: CompanyId,
  game: GameState,
  includeClientStorage: boolean
): ProfileCompanyView {
  const company = companyById(companyId);
  const progress = game.companies[companyId];
  const stored = readFrameworkState(companyId, includeClientStorage);
  const completedQuestSlugs =
    progress?.pillars.business?.completedQuestSlugs ?? [];
  const started =
    Boolean(progress) &&
    (completedQuestSlugs.length > 0 ||
      Object.keys(stored.evidenceRatings).length > 0 ||
      Object.keys(stored.sectionQuizPassed ?? {}).length > 0);

  const snapshot = resolveBusinessInvestorChecklistSnapshot({
    companyId,
    stored,
    completedQuestSlugs,
    currentQuestSlug: null,
    currentQuestProgressPct: 0
  });

  const sections = snapshot.sections.map((section) => ({
    id: section.id,
    emoji: section.emoji,
    label: section.label,
    shortLabel: SECTION_SHORT_LABELS[section.id],
    state: section.state,
    quizStatus: section.quizStatus,
    overallRating: section.overallRating
  }));

  const mastered = snapshot.completedSectionCount >= snapshot.totalSections;

  return {
    id: companyId,
    name: company.name,
    ticker: company.ticker,
    sector: company.sector,
    started,
    mastered,
    masteryPct: Math.round(
      (snapshot.completedSectionCount / Math.max(snapshot.totalSections, 1)) * 100
    ),
    sectionsCompleted: snapshot.completedSectionCount,
    totalSections: snapshot.totalSections,
    sections,
    overallRating: snapshot.sections.every((s) => s.state === "completed")
      ? snapshot.sections[snapshot.sections.length - 1]?.overallRating ?? null
      : snapshot.activeSection?.overallRating ?? null
  };
}

function resolveGlobalStatistics(
  game: GameState,
  companyViews: ProfileCompanyView[],
  includeClientStorage: boolean
): ProfileStatistics {
  let evidenceCardsCompleted = 0;
  let evidenceRatingsSubmitted = 0;
  let principlesCompleted = 0;
  let checklistSectionsCompleted = 0;
  let quizzesPassed = 0;
  let questsCompleted = 0;
  let xpEarned = 0;

  for (const company of getPlayableDemoCompanies()) {
    const progress = game.companies[company.id];
    if (!progress) continue;
    xpEarned += progress.xp;
    questsCompleted += Object.values(progress.pillars).reduce(
      (sum, pillar) => sum + pillar.completedQuestSlugs.length,
      0
    );

    const stored = readFrameworkState(company.id, includeClientStorage);
    evidenceRatingsSubmitted += Object.keys(stored.evidenceRatings).length;
    evidenceCardsCompleted += Object.keys(stored.evidenceRatings).length;
    checklistSectionsCompleted += Object.keys(stored.sectionQuizPassed ?? {}).length;
    quizzesPassed += Object.keys(stored.sectionQuizPassed ?? {}).length;

    for (const principle of BUSINESS_INVESTOR_PRINCIPLES) {
      if (isPrincipleEvidenceComplete(company.id, principle.id, stored)) {
        principlesCompleted++;
      }
    }
  }

  const activeProgress = game.companies[game.activeCompanyId];
  const quizStreak = activeProgress?.streaks.quiz.streak ?? 0;

  return {
    xpEarned,
    evidenceCardsCompleted,
    evidenceRatingsSubmitted,
    principlesCompleted,
    checklistSectionsCompleted,
    quizzesPassed,
    companiesStarted: companyViews.filter((c) => c.started).length,
    companiesMastered: companyViews.filter((c) => c.mastered).length,
    questsCompleted,
    quizStreak
  };
}

function resolveSectorMastery(companyViews: ProfileCompanyView[]): ProfileSectorRow[] {
  const sectorMap = new Map<
    string,
    { started: number; mastered: number; masterySum: number; count: number }
  >();

  for (const company of COMPANIES) {
    if (!sectorMap.has(company.sector)) {
      sectorMap.set(company.sector, {
        started: 0,
        mastered: 0,
        masterySum: 0,
        count: 0
      });
    }
    sectorMap.get(company.sector)!.count++;
  }

  for (const view of companyViews) {
    const bucket = sectorMap.get(view.sector);
    if (!bucket) continue;
    if (view.started) {
      bucket.started++;
      bucket.masterySum += view.masteryPct;
    }
    if (view.mastered) bucket.mastered++;
  }

  return Array.from(sectorMap.entries())
    .map(([sector, data]) => ({
      sector,
      masteryPct:
        data.started > 0 ? Math.round(data.masterySum / data.started) : 0,
      companiesStarted: data.started,
      companiesMastered: data.mastered,
      locked: data.started === 0
    }))
    .sort((a, b) => b.masteryPct - a.masteryPct);
}

function resolveQuizResults(companyViews: ProfileCompanyView[]): ProfileQuizResult[] {
  const results: ProfileQuizResult[] = [];
  for (const company of companyViews) {
    for (const section of company.sections) {
      if (section.quizStatus !== "passed") continue;
      results.push({
        sectionId: section.id,
        emoji: section.emoji,
        label: section.label,
        passed: true,
        companyTicker: company.ticker
      });
    }
  }
  return results;
}

function resolveAchievements(
  game: GameState,
  companyViews: ProfileCompanyView[],
  includeClientStorage: boolean
): ProfileAchievement[] {
  const activeBadges = game.companies[game.activeCompanyId]?.badges ?? {};
  const aggregateBadges = new Set<BadgeId>();
  for (const company of getPlayableDemoCompanies()) {
    for (const badgeId of Object.keys(game.companies[company.id]?.badges ?? {})) {
      aggregateBadges.add(badgeId as BadgeId);
    }
  }

  const anyPrincipleComplete = includeClientStorage
    ? companyViews.some((view) => {
        const stored = readFrameworkState(view.id, true);
        return BUSINESS_INVESTOR_PRINCIPLES.some((p) =>
          isPrincipleEvidenceComplete(view.id, p.id, stored)
        );
      })
    : false;

  const anyOverviewComplete = companyViews.some((view) =>
    view.sections.some(
      (s) => s.id === "company-overview" && s.quizStatus === "passed"
    )
  );

  const anyChecklistComplete = companyViews.some((view) => view.mastered);

  const computedEarned: Partial<Record<BadgeId, boolean>> = {
    "quiz-pass": aggregateBadges.has("quiz-pass"),
    "company-overview-complete":
      aggregateBadges.has("company-overview-complete") || anyOverviewComplete,
    "evidence-collector":
      aggregateBadges.has("evidence-collector") || anyPrincipleComplete,
    "investor-checklist-complete":
      aggregateBadges.has("investor-checklist-complete") || anyChecklistComplete,
    "ten-k-rookie": aggregateBadges.has("ten-k-rookie")
  };

  return PROFILE_ACHIEVEMENT_DEFS.map((def) => {
    const meta = activeBadges[def.badgeId] ?? null;
    const earned =
      Boolean(meta) || Boolean(computedEarned[def.badgeId]);
    return {
      id: def.id,
      badgeId: def.badgeId,
      title: def.title,
      detail: def.detail,
      earned,
      earnedAt: meta?.awardedAt ?? null
    };
  });
}

export function resolveInvestorProfileSnapshot(
  game: GameState,
  opts?: { includeClientStorage?: boolean }
): InvestorProfileSnapshot {
  const includeClientStorage = opts?.includeClientStorage ?? false;
  const activeCompanyId = game.activeCompanyId as CompanyId;
  const progress = game.companies[activeCompanyId];
  const xp = progress?.xp ?? 0;
  const lp = levelProgress(xp);
  const ladder = investorLadderProgress(xp);
  const nextRung =
    ladder.rank < INVESTOR_RUNGS.length ? INVESTOR_RUNGS[ladder.rank] : null;

  const companies = getPlayableDemoCompanies().map((c) =>
    resolveCompanyView(c.id, game, includeClientStorage)
  );
  const activeCompany =
    companies.find((c) => c.id === activeCompanyId) ?? companies[0]!;

  const playerName = game.playerName?.trim() || "Investor";
  const initials =
    playerName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "IQ";

  return {
    playerName,
    initials,
    level: progress?.level ?? 1,
    xp,
    title: investorTitleFromXp(xp),
    xpInBand: lp.inLevel,
    xpBandTotal: lp.needed,
    xpBandPct: lp.pct,
    xpToNextTitle: nextRung ? Math.max(0, nextRung.xp - xp) : 0,
    nextTitle: nextRung?.title ?? null,
    activeCompanyId: activeCompany.id,
    statistics: resolveGlobalStatistics(game, companies, includeClientStorage),
    companies,
    sectorMastery: resolveSectorMastery(companies),
    quizResults: resolveQuizResults(companies),
    achievements: resolveAchievements(game, companies, includeClientStorage)
  };
}

/** Badge IDs to persist when checklist milestones are met. */
export function resolveChecklistBadgeIdsToAward(
  companyId: CompanyId
): BadgeId[] {
  const stored = readBusinessInvestorFrameworkState(companyId);
  const out: BadgeId[] = [];

  const overviewPassed = stored.sectionQuizPassed?.["company-overview"];
  if (overviewPassed) out.push("company-overview-complete");

  const anyPrincipleComplete = BUSINESS_INVESTOR_PRINCIPLES.some((p) =>
    isPrincipleEvidenceComplete(companyId, p.id, stored)
  );
  if (anyPrincipleComplete) out.push("evidence-collector");

  const passedCount = Object.keys(stored.sectionQuizPassed ?? {}).length;
  if (passedCount >= BUSINESS_INVESTOR_CHECKLIST_SECTIONS.length) {
    out.push("investor-checklist-complete");
  }

  return out;
}
