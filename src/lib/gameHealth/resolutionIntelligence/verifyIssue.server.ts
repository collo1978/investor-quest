import "server-only";

import { companyByTicker } from "@/data/companies";
import { runCommunicationQualityAudit } from "@/lib/communicationQuality";
import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import { runQuestFlowHealthChecks } from "@/lib/gameHealth/questFlowChecks";
import { fetchGameHealthIssue } from "@/lib/gameHealth/storage";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";
import { inferIssueDomainId } from "@/lib/operations/issueDomain";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";

import { readResolutionIntelligence } from "./enrichIssue";
import type { VerificationSnapshot } from "./types";
import type { VerifyIssueResult } from "./verifyIssueDisplay";

export type { VerifyIssueResult } from "./verifyIssueDisplay";
export { buildVerificationSnapshot } from "./verifyIssueDisplay";

export async function verifyIssueResolution(
  issueId: string
): Promise<VerifyIssueResult> {
  const issue = await fetchGameHealthIssue(issueId);
  if (!issue) {
    return { passed: false, summary: "Issue not found." };
  }

  const before = readResolutionIntelligence(issue.metadata);

  if (issue.issueKey.startsWith("comm:") && issue.issueKey !== "comm:placeholders") {
    return verifyCommunicationCard(issue, before?.verification);
  }

  if (issue.issueKey.startsWith("quest_flow:") || issue.metadata?.category === "quest_flow") {
    return verifyQuestFlow(issue, before?.verification);
  }

  if (issue.issueKey.startsWith("behavioral:")) {
    return {
      passed: false,
      summary:
        "Behavioral design fixes require manual review in Gamification admin — mark reviewed when done.",
      afterStatus: "needs_human_review"
    };
  }

  return verifyGenericCheck(issue, before?.verification);
}

function domainScoreFromReport(
  report: CommunicationQualityReport,
  domainId: HealthDomainId
): number {
  if (domainId === "learning_quality") {
    const learningCats = report.categories.filter((c) =>
      ["jargon_detection", "beginner_friendliness", "question_alignment", "cognitive_load"].includes(
        c.id
      )
    );
    if (learningCats.length === 0) return report.overallHealthPercent;
    return Math.round(
      learningCats.reduce((sum, c) => sum + c.score, 0) / learningCats.length
    );
  }
  return report.overallHealthPercent;
}

async function verifyCommunicationCard(
  issue: GameHealthIssueRecord,
  _prior?: VerificationSnapshot
): Promise<VerifyIssueResult> {
  try {
    const report = await runCommunicationQualityAudit();
    const domainId = inferIssueDomainId(issue);
    const ticker = issue.companyTicker ?? "";
    const cardId = issue.cardId ?? "";
    const questSlug = issue.questSlug ?? "";
    const pillarId = issue.pillarId ?? "";

    const target = report.cardsNeedingRegeneration.find(
      (c) =>
        c.ticker === ticker &&
        c.cardId === cardId &&
        c.questSlug === questSlug &&
        c.pillarId === pillarId
    );

    const stillWeak = Boolean(target);
    const afterScore = stillWeak
      ? (target?.score ?? domainScoreFromReport(report, domainId))
      : domainScoreFromReport(report, domainId);

    const beforeScore =
      typeof issue.metadata?.detectionDomainScore === "number"
        ? issue.metadata.detectionDomainScore
        : null;

    return {
      passed: !stillWeak,
      summary: stillWeak
        ? `Flagged card still below threshold (${afterScore}%).`
        : "Audit no longer flags this card — issue looks resolved.",
      beforeScore,
      afterScore,
      afterStatus: stillWeak ? "warn" : "pass",
      probeIds: ["communication_quality_audit"]
    };
  } catch (err) {
    return {
      passed: false,
      summary:
        err instanceof Error
          ? `Verification failed: ${err.message}`
          : "Communication audit unavailable for verification.",
      afterStatus: "audit_unavailable"
    };
  }
}

async function verifyQuestFlow(
  issue: GameHealthIssueRecord,
  _prior?: VerificationSnapshot
): Promise<VerifyIssueResult> {
  const flow = runQuestFlowHealthChecks();
  const stillOpen = flow.issueDrafts.some((d) => d.issueKey === issue.issueKey);

  return {
    passed: !stillOpen,
    summary: stillOpen
      ? "Quest flow audit still reports this issue."
      : "Quest flow recheck passed — unlock rules look healthy.",
    afterStatus: stillOpen ? "fail" : "pass",
    probeIds: ["quest_flow_health"]
  };
}

async function verifyGenericCheck(
  issue: GameHealthIssueRecord,
  _prior?: VerificationSnapshot
): Promise<VerifyIssueResult> {
  const checkId =
    (issue.metadata?.checkItemId as string) ?? issue.issueKey.replace(/^check:/, "");

  if (checkId.includes("slow_")) {
    return {
      passed: false,
      summary: "Re-run full Mission Control check to confirm route latency improved.",
      probeIds: [checkId]
    };
  }

  if (issue.fixAction === "retry_generation" || issue.fixAction === "clear_and_regenerate") {
    const ticker = issue.companyTicker;
    if (ticker && issue.cardId) {
      const company = companyByTicker(ticker);
      if (company) {
        return {
          passed: false,
          summary:
            "Content regenerated — run Verify after refreshing Mission Control to rescore communication.",
          probeIds: ["communication_quality_audit"]
        };
      }
    }
  }

  return {
    passed: false,
    summary: "Run a full health check on Mission Control to confirm this issue is cleared.",
    probeIds: checkId ? [checkId] : undefined
  };
}
