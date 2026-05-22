import { companyByTicker, type CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import type { QuestDefinition } from "@/data/quests/types";
import { getDemoRefreshPlan, type DemoRefreshJob } from "@/lib/demoContentRefresh/config";
import type { GameHealthIssueRecord, HealthCheckItem } from "@/lib/gameHealth/types";
import { usesPillarQuestCardTemplate } from "@/components/quest/pillarQuestTheme";
import {
  computeQuestCardReadProgress,
  questCardCompositeSlug
} from "@/lib/quests/questCardReadProgress";

export type QuestFlowProblem =
  | "quest_not_found"
  | "no_cards_defined"
  | "missing_quiz_config"
  | "quiz_locked_after_all_cards_read"
  | "completion_requires_quiz"
  | "quiz_route_unknown";

export type QuestFlowAudit = {
  ticker: string;
  companyId: CompanyId;
  companyName: string;
  pillarId: PillarId;
  questSlug: string;
  questTitle: string;
  cardsRequired: number;
  cardIds: string[];
  /** Simulated: every card slug present in readQuestSlugs. */
  simulatedAllCardsRead: boolean;
  hasQuiz: boolean;
  quizUnlockedWhenAllRead: boolean;
  lockReasonsWhenSimulated: string[];
  problems: QuestFlowProblem[];
  questRoute: string | null;
};

function questRouteFor(pillarId: PillarId, questSlug: string): string | null {
  if (pillarId === "business") return `/business/${questSlug}`;
  if (pillarId === "financials") return `/financials/${questSlug}`;
  if (pillarId === "forces") return `/forces/${questSlug}`;
  if (pillarId === "management") return `/management/${questSlug}`;
  return null;
}

export function auditQuestFlow(
  companyId: CompanyId,
  ticker: string,
  companyName: string,
  pillarId: PillarId,
  questSlug: string
): QuestFlowAudit {
  const quest = findQuestDefinition(companyId, pillarId, questSlug);

  const base = {
    ticker,
    companyId,
    companyName,
    pillarId,
    questSlug,
    questTitle: quest?.title ?? questSlug,
    cardsRequired: 0,
    cardIds: [] as string[],
    simulatedAllCardsRead: false,
    hasQuiz: false,
    quizUnlockedWhenAllRead: false,
    lockReasonsWhenSimulated: [] as string[],
    problems: [] as QuestFlowProblem[],
    questRoute: questRouteFor(pillarId, questSlug)
  };

  if (!quest) {
    return { ...base, problems: ["quest_not_found"] };
  }

  if (!base.questRoute) {
    base.problems.push("quiz_route_unknown");
  }

  return auditQuestDefinition(base, quest);
}

function auditQuestDefinition(
  base: Omit<QuestFlowAudit, "problems"> & { problems: QuestFlowProblem[] },
  quest: QuestDefinition
): QuestFlowAudit {
  const cards = quest.cards ?? [];
  const cardIds = cards.map((c) => c.id);
  const simulatedReads = cardIds.map((id) =>
    questCardCompositeSlug(base.questSlug, id)
  );

  const progress = computeQuestCardReadProgress({
    parentSlug: base.questSlug,
    cards,
    readQuestSlugs: simulatedReads,
    quizConfig: quest.quizConfig
  });

  const problems: QuestFlowProblem[] = [...base.problems];
  const usesTemplate = usesPillarQuestCardTemplate(base.pillarId);
  const expectsCardQuizHandoff = usesTemplate && cards.length > 0;
  const completionRequiresQuiz = quest.completionState.kind === "quiz";

  if (cards.length === 0 && completionRequiresQuiz && usesTemplate) {
    problems.push("no_cards_defined");
  }

  if (completionRequiresQuiz && !progress.hasQuiz) {
    problems.push("completion_requires_quiz");
  }

  if (expectsCardQuizHandoff && (completionRequiresQuiz || base.pillarId === "business") && !progress.hasQuiz) {
    problems.push("missing_quiz_config");
  }

  if (progress.allCardsRead && !progress.quizUnlocked) {
    problems.push("quiz_locked_after_all_cards_read");
  }

  return {
    ...base,
    questTitle: quest.title,
    cardsRequired: progress.cardsRequired,
    cardIds,
    simulatedAllCardsRead: progress.allCardsRead,
    hasQuiz: progress.hasQuiz,
    quizUnlockedWhenAllRead: progress.quizUnlocked,
    lockReasonsWhenSimulated: progress.lockReasons,
    problems: [...new Set(problems)]
  };
}

export function runDemoQuestFlowAudits(
  jobs: DemoRefreshJob[] = getDemoRefreshPlan()
): QuestFlowAudit[] {
  return jobs.map((job) => {
    const co = companyByTicker(job.ticker);
    return auditQuestFlow(
      job.companyId,
      job.ticker,
      job.companyName,
      job.pillarId,
      job.questSlug
    );
  });
}

function flowCheckItem(
  audits: QuestFlowAudit[],
  broken: QuestFlowAudit[]
): HealthCheckItem {
  const weight = 18;
  if (broken.length === 0) {
    return {
      id: "quest_flow_demo",
      name: "Quest quiz unlock (demo companies)",
      status: "pass",
      message: `All ${audits.length} priority demo quests unlock the quiz when every card is read.`,
      weight
    };
  }

  const critical = broken.filter((b) =>
    b.problems.some(
      (p) =>
        p === "missing_quiz_config" ||
        p === "quiz_locked_after_all_cards_read" ||
        p === "completion_requires_quiz" ||
        p === "quest_not_found"
    )
  );

  const names = broken
    .slice(0, 4)
    .map((b) => `${b.ticker} ${b.pillarId}/${b.questSlug}`)
    .join("; ");

  return {
    id: "quest_flow_demo",
    name: "Quest quiz unlock (demo companies)",
    status: critical.length > 0 ? "fail" : "warn",
    message: `${broken.length} demo quest(s) have broken card→quiz flow: ${names}${broken.length > 4 ? "…" : ""}.`,
    laymanSummary: "Players may get stuck before the quiz.",
    weight
  };
}

export function buildQuestFlowIssueDrafts(
  audits: QuestFlowAudit[]
): Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>[] {
  const drafts: Omit<
    GameHealthIssueRecord,
    "id" | "checkId" | "createdAt" | "updatedAt" | "status"
  >[] = [];

  for (const a of audits) {
    if (a.problems.length === 0) continue;

    const critical = a.problems.some(
      (p) =>
        p === "missing_quiz_config" ||
        p === "quiz_locked_after_all_cards_read" ||
        p === "completion_requires_quiz" ||
        p === "quest_not_found"
    );

    const problemLine = a.problems.join(", ");
    const suggestedFix =
      a.problems.includes("missing_quiz_config") ||
      a.problems.includes("completion_requires_quiz")
        ? "Deploy the latest app build with quiz configs on business quests, then run Recheck quest flow."
        : a.problems.includes("quiz_locked_after_all_cards_read")
          ? "Tap Repair quest progress on a test phone, or Reset quest progress if reads look wrong."
          : "Open the fix panel and tap Repair quest progress, then recheck.";

    drafts.push({
      issueKey: `quest_flow:${a.ticker}:${a.pillarId}:${a.questSlug}`,
      severity: critical ? "critical" : "warning",
      title: "Players may get stuck before the quiz.",
      problemPlain: `${a.companyName} (${a.ticker}) · ${a.pillarId} · ${a.questTitle}: ${problemLine}.`,
      whatUsersSee: "Players may get stuck before the quiz.",
      suggestedFix,
      fixAction: "repair_quest_progress",
      companyTicker: a.ticker,
      companyName: a.companyName,
      pillarId: a.pillarId,
      questSlug: a.questSlug,
      cardId: null,
      metadata: {
        category: "quest_flow",
        cardsRequired: a.cardsRequired,
        cardsReadSimulated: a.simulatedAllCardsRead ? a.cardsRequired : 0,
        completedCards: a.simulatedAllCardsRead ? a.cardsRequired : 0,
        missingCardIds: a.simulatedAllCardsRead ? [] : a.cardIds,
        cardIds: a.cardIds,
        quizUnlockedWhenAllRead: a.quizUnlockedWhenAllRead,
        hasQuiz: a.hasQuiz,
        lockReasons: a.lockReasonsWhenSimulated,
        problems: a.problems,
        questRoute: a.questRoute,
        quizButtonWouldDisable:
          a.simulatedAllCardsRead && !a.quizUnlockedWhenAllRead
      }
    });
  }

  return drafts;
}

export function runQuestFlowHealthChecks(): {
  audits: QuestFlowAudit[];
  summaryCheck: HealthCheckItem;
  issueDrafts: Omit<
    GameHealthIssueRecord,
    "id" | "checkId" | "createdAt" | "updatedAt" | "status"
  >[];
} {
  const audits = runDemoQuestFlowAudits();
  const broken = audits.filter((a) => a.problems.length > 0);
  return {
    audits,
    summaryCheck: flowCheckItem(audits, broken),
    issueDrafts: buildQuestFlowIssueDrafts(audits)
  };
}
