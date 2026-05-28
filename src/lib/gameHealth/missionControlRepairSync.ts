import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

export type CardRepairFixMethod = "regenerated" | "manual_edit" | "verify_only" | "auto_fixed";

export type CardRepairChange = {
  ticker: string;
  pillarId: string;
  questSlug: string;
  cardId: string;
  fixMethod: CardRepairFixMethod;
  fixedAt: string;
  /** Exact flagged sentence from the audit. */
  beforeSentence: string;
  /** Rewritten sentence aligned to the same passage. */
  afterSentence: string;
  /** Optional longer after excerpt for review (first ~2 sentences). */
  afterExcerpt?: string;
  whatImproved: string;
  /** Bullet reasons operators can scan quickly. */
  improvementReasons: string[];
  whyPasses: string;
  /** Jargon or corporate phrases removed in the rewrite. */
  removedPhrases: string[];
  cardScoreBefore: number | null;
  cardScoreAfter: number;
  contentSource?: string;
};

export type RepairVerificationResult = {
  domainId: HealthDomainId;
  domainScore: number;
  beforeScore: number;
  communicationQuality: CommunicationQualityReport;
  communicationOverall: number;
  cardsStillFlagged: number;
  cardChange?: CardRepairChange | null;
};

export function issueMatchesRepairedCard(
  issue: GameHealthIssueRecord,
  change: CardRepairChange
): boolean {
  return (
    issue.companyTicker?.toUpperCase() === change.ticker.toUpperCase() &&
    issue.pillarId === change.pillarId &&
    issue.questSlug === change.questSlug &&
    issue.cardId === change.cardId
  );
}

export function filterOpenIssuesAfterCardRepair(
  issues: GameHealthIssueRecord[],
  change: CardRepairChange | null | undefined
): GameHealthIssueRecord[] {
  if (!change || change.cardScoreAfter < 70) return issues;
  return issues.filter((issue) => !issueMatchesRepairedCard(issue, change));
}
