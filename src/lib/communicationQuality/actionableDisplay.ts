import { buildActionableDetailFromAudit } from "@/lib/communicationQuality/buildActionableDetail";
import type {
  CommunicationQualityReport,
  CommunicationRegenerationTarget
} from "@/lib/communicationQuality/types";
import {
  actionableCardKey,
  buildContentLocation,
  preferredFixLabel,
  type AuditActionableDetail
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";

function detailFromTarget(target: CommunicationRegenerationTarget): AuditActionableDetail {
  return {
    version: 1,
    location: buildContentLocation({
      ticker: target.ticker,
      companyName: target.companyName,
      pillarId: target.pillarId,
      questSlug: target.questSlug,
      questTitle: target.questTitle,
      cardId: target.cardId,
      contentKind: "quest_card"
    }),
    findings: target.findings,
    preferredFix: target.preferredFix,
    preferredFixLabel: preferredFixLabel(target.preferredFix)
  };
}

/** Platform checks replaced by per-card actionable intelligence when a comm report exists. */
export const LEGACY_COMM_DOMAIN_CHECK_IDS = new Set<string>([
  "jargon_gate",
  "human_first_demo",
  "communication_conversational_tone",
  "communication_beginner_friendliness",
  "communication_question_alignment",
  "communication_jargon_detection",
  "communication_human_tone",
  "communication_emotional_clarity",
  "communication_cognitive_load",
  "communication_investor_clarity",
  "communication_health_overall"
]);

const LEARNING_FINDING_CATEGORIES = new Set([
  "jargon_detection",
  "beginner_friendliness",
  "cognitive_load",
  "conversational_tone",
  "question_alignment"
]);

export function hasActionableCommunicationIntelligence(
  report: CommunicationQualityReport | null | undefined
): boolean {
  if (!report) return false;
  return (
    report.cardsNeedingRegeneration.length > 0 ||
    report.weakContent.some((a) => a.ticker && a.questSlug && a.warnings.length > 0)
  );
}

export function shouldSuppressLegacyCommCheck(
  checkId: string,
  report: CommunicationQualityReport | null | undefined
): boolean {
  if (!hasActionableCommunicationIntelligence(report)) return false;
  return LEGACY_COMM_DOMAIN_CHECK_IDS.has(checkId);
}

function detailMatchesLearningDomain(detail: AuditActionableDetail): boolean {
  return detail.findings.some(
    (f) => f.categoryId != null && LEARNING_FINDING_CATEGORIES.has(f.categoryId)
  );
}

/** Regen targets + weak audits merged (deduped by card key). */
export function allActionableDetailsFromReport(
  report: CommunicationQualityReport,
  domainId?: HealthDomainId
): AuditActionableDetail[] {
  const byKey = new Map<string, AuditActionableDetail>();

  for (const target of report.cardsNeedingRegeneration) {
    const detail = detailFromTarget(target);
    byKey.set(actionableCardKey(detail), detail);
  }

  for (const audit of report.weakContent) {
    const detail = buildActionableDetailFromAudit(audit);
    if (!detail?.findings.length) continue;
    const key = actionableCardKey(detail);
    if (!byKey.has(key)) byKey.set(key, detail);
  }

  const details = [...byKey.values()];

  if (!domainId || domainId === "communication_quality") {
    return details;
  }

  if (domainId === "learning_quality") {
    const learning = details.filter(detailMatchesLearningDomain);
    return learning.length > 0 ? learning : details;
  }

  return details;
}

/** @deprecated Alias for allActionableDetailsFromReport */
export function actionableDetailsFromCommunicationReport(
  report: CommunicationQualityReport,
  domainId?: HealthDomainId
): AuditActionableDetail[] {
  return allActionableDetailsFromReport(report, domainId);
}
