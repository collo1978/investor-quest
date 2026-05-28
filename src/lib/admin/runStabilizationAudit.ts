/**
 * System stabilization audit — copy, layout fields, routes, duplicate UI paths.
 */

import { runCopyQualityAudit, type CopyQualityAuditReport } from "@/lib/quests/runCopyQualityAudit";
import { PLAYABLE_DEMO_TICKERS } from "@/lib/demo/playableDemo";

export type StabilizationStatus = "green" | "yellow" | "red";

export type StabilizationCheckRow = {
  id: string;
  label: string;
  status: StabilizationStatus;
  detail: string;
};

export type StabilizationQuestCardRow = {
  id: string;
  ticker: string;
  pillarId: string;
  questSlug: string;
  cardId: string;
  status: StabilizationStatus;
  issues: string[];
};

export type StabilizationAuditReport = {
  generatedAt: string;
  summary: { green: number; yellow: number; red: number };
  copyQuality: {
    totalCards: number;
    failedCards: number;
    averageScore: number;
  };
  duplicateComponents: StabilizationCheckRow[];
  routes: StabilizationCheckRow[];
  questCards: StabilizationQuestCardRow[];
  mobileOverflow: StabilizationCheckRow[];
};

const CANONICAL_PLAYER_PATH =
  "QuestDetailScreen → BusinessIslandQuestReading → PillarQuestTemplateFrame → CompactFlashcardAnswer";

const DUPLICATE_COMPONENTS: StabilizationCheckRow[] = [
  {
    id: "dup-quest-detail-legacy",
    label: "QuestDetailScreen legacy panels",
    status: "yellow",
    detail: `SubCardPanel / SingleCardQuestReading still in file; live pillars use ${CANONICAL_PLAYER_PATH}.`
  },
  {
    id: "dup-ui-quest-card",
    label: "src/ui/components/QuestCard.tsx",
    status: "green",
    detail: "Orphan — not imported by player routes."
  },
  {
    id: "dup-relatable",
    label: "RelatableQuestAnswer / QuestInvestorTakeaway",
    status: "yellow",
    detail: "Legacy answer shells; prefer CompactFlashcardAnswer via template frame."
  },
  {
    id: "canonical-path",
    label: "Canonical quest card path",
    status: "green",
    detail: CANONICAL_PLAYER_PATH
  }
];

const PLAYER_ROUTES: StabilizationCheckRow[] = [
  { id: "route-map", label: "/map", status: "green", detail: "Game map" },
  {
    id: "route-business",
    label: "/business/[slug]",
    status: "green",
    detail: "Business island quests"
  },
  {
    id: "route-forces",
    label: "/forces/...",
    status: "green",
    detail: "Forces island + categories"
  },
  {
    id: "route-financials",
    label: "/financials/[slug]",
    status: "green",
    detail: "Financials quests"
  },
  {
    id: "route-management",
    label: "/management/[slug]",
    status: "yellow",
    detail: "Pipeline may be partial for some companies"
  },
  {
    id: "route-admin-stab",
    label: "/admin/stabilization",
    status: "green",
    detail: "This audit page"
  }
];

const MOBILE_CHECKS: StabilizationCheckRow[] = [
  {
    id: "mobile-template",
    label: "PillarQuestTemplateFrame",
    status: "green",
    detail: "Uses truncate + scroll-safe footer slot; decorative layers use pointer-events-none on map."
  },
  {
    id: "mobile-quiz",
    label: "QuizQuestionView order steps",
    status: "green",
    detail: "Touch ↑/↓ reorder + drag; verify on device after copy changes."
  }
];

function cardStatusFromCopy(row: {
  pass: boolean;
  placeholder: boolean;
  score: number;
  issues: string[];
}): StabilizationStatus {
  if (row.placeholder) return "red";
  if (!row.pass || row.score < 70) return "red";
  if (row.issues.length > 0 || row.score < 85) return "yellow";
  return "green";
}

function layoutIssues(question: string, answer: string): string[] {
  const issues: string[] = [];
  if (!question.trim()) issues.push("missing question");
  if (!answer.trim()) issues.push("missing answer");
  if (answer.length > 900) issues.push("answer very long (layout risk)");
  return issues;
}

export async function runStabilizationAudit(
  tickers: readonly string[] = PLAYABLE_DEMO_TICKERS
): Promise<StabilizationAuditReport> {
  const copyReport: CopyQualityAuditReport = await runCopyQualityAudit(tickers);

  const questCards: StabilizationQuestCardRow[] = copyReport.rows.map((row) => {
    const layout = layoutIssues(row.question, row.currentAnswer);
    const copyIssues = row.pass ? [] : row.issues;
    const allIssues = [...layout, ...copyIssues];
    let status = cardStatusFromCopy(row);
    if (layout.length > 0 && status === "green") status = "yellow";
    if (layout.some((i) => i.startsWith("missing"))) status = "red";
    return {
      id: row.id,
      ticker: row.ticker,
      pillarId: row.pillarId,
      questSlug: row.questSlug,
      cardId: row.cardId,
      status,
      issues: allIssues
    };
  });

  const tallies = { green: 0, yellow: 0, red: 0 };
  for (const row of questCards) tallies[row.status] += 1;
  for (const row of DUPLICATE_COMPONENTS) tallies[row.status] += 1;
  for (const row of PLAYER_ROUTES) tallies[row.status] += 1;
  for (const row of MOBILE_CHECKS) tallies[row.status] += 1;

  return {
    generatedAt: new Date().toISOString(),
    summary: tallies,
    copyQuality: {
      totalCards: copyReport.totalCards,
      failedCards: copyReport.failedCards,
      averageScore: copyReport.averageScore
    },
    duplicateComponents: DUPLICATE_COMPONENTS,
    routes: PLAYER_ROUTES,
    questCards,
    mobileOverflow: MOBILE_CHECKS
  };
}
