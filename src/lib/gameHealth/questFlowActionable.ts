import type { QuestFlowProblem } from "@/lib/gameHealth/questFlowChecks";
import {
  buildContentLocation,
  formatQuestSectionLabel,
  type AuditActionableDetail,
  type AuditFlaggedFinding
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";

const PROBLEM_COPY: Record<
  QuestFlowProblem,
  { reason: string; rewriteDirection: string; flaggedText: string }
> = {
  quest_not_found: {
    reason: "Quest definition missing from catalog for this company/pillar.",
    rewriteDirection: "Add quest to library or fix demo company routing.",
    flaggedText: "Quest route resolves but definition is missing."
  },
  no_cards_defined: {
    reason: "Quest has no readable cards — players cannot progress to quiz.",
    rewriteDirection: "Define card-1…card-N in quest library with investor questions.",
    flaggedText: "Card list is empty in quest config."
  },
  missing_quiz_config: {
    reason: "Quiz questions not configured — completion cannot award XP.",
    rewriteDirection: "Deploy build with quizConfig on this quest, then recheck flow.",
    flaggedText: "Quiz unlock path exists but quizConfig is missing."
  },
  quiz_locked_after_all_cards_read: {
    reason: "Simulated full read still does not unlock quiz button.",
    rewriteDirection: "Repair quest progress on device or fix read-slug composite keys.",
    flaggedText: "All cards marked read (simulated) but quiz stays locked."
  },
  completion_requires_quiz: {
    reason: "Quest marked complete without quiz pass — XP rules blocked.",
    rewriteDirection: "Ensure quiz is required and reachable before completion XP.",
    flaggedText: "Completion path bypasses quiz gate."
  },
  quiz_route_unknown: {
    reason: "No player route mapped for this pillar quest URL.",
    rewriteDirection: "Add hub route for pillar in questRouteFor mapping.",
    flaggedText: "Quest slug has no /business|/financials|… route."
  }
};

export function buildQuestFlowActionableDetail(input: {
  ticker: string;
  companyName: string;
  pillarId: string;
  questSlug: string;
  questTitle: string;
  problems: QuestFlowProblem[];
  cardIds: string[];
}): AuditActionableDetail {
  const findings: AuditFlaggedFinding[] = input.problems.map((p) => {
    const copy = PROBLEM_COPY[p];
    return {
      code: p,
      categoryLabel: "Quest flow",
      reason: copy.reason,
      flaggedText: copy.flaggedText,
      rewriteDirection: copy.rewriteDirection,
      severity: p === "missing_quiz_config" || p === "quiz_locked_after_all_cards_read"
        ? "critical"
        : "warning"
    };
  });

  const needsDeploy = input.problems.some(
    (p) => p === "missing_quiz_config" || p === "completion_requires_quiz"
  );
  const preferredFix = needsDeploy ? "deploy_fix" : "review_only";

  return {
    version: 1,
    location: buildContentLocation({
      ticker: input.ticker,
      companyName: input.companyName,
      pillarId: input.pillarId,
      questSlug: input.questSlug,
      questTitle: input.questTitle,
      cardId: input.cardIds[0] ?? null,
      contentKind: "quest_flow"
    }),
    findings,
    preferredFix,
    preferredFixLabel: needsDeploy
      ? "Deploy app or content config fix"
      : "Repair quest progress on test device, then recheck"
  };
}

export function questFlowProblemPlain(detail: AuditActionableDetail): string {
  const loc = detail.location;
  const first = detail.findings[0];
  const where = [
    loc.companyTicker,
    loc.pillarLabel,
    formatQuestSectionLabel(loc.questSlug, loc.questTitle)
  ]
    .filter(Boolean)
    .join(" · ");
  return first ? `${where}: ${first.reason}` : where;
}
