import type { CommunicationCategoryId } from "@/lib/communicationQuality/types";
import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import { allActionableDetailsFromReport, LEGACY_COMM_DOMAIN_CHECK_IDS } from "@/lib/communicationQuality/actionableDisplay";
import { COMMUNICATION_CATEGORY_DEFS } from "@/lib/communicationQuality/categoryLabels";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import type { PlatformHealthDomainResult } from "@/lib/gameHealth/types";

import { buildSubsectionGroupedRecovery } from "./buildCheckRecovery";
import {
  RECOVERY_SEVERITY_ORDER,
  type DomainRecoveryIntelligence,
  type RecoveryImpactDriver,
  type RecoverySeverity
} from "./types";

const CATEGORY_SEVERITY: Record<CommunicationCategoryId, RecoverySeverity> = {
  question_alignment: "high",
  beginner_friendliness: "high",
  jargon_detection: "high",
  conversational_tone: "medium",
  human_tone: "medium",
  emotional_clarity: "medium",
  cognitive_load: "medium",
  investor_clarity: "low"
};

const CATEGORY_FIX_ACTION: Record<CommunicationCategoryId, string> = {
  question_alignment: "Fix question drift",
  beginner_friendliness: "Simplify beginner-unfriendly copy",
  jargon_detection: "Resolve jargon issues",
  conversational_tone: "Regenerate robotic tone cards",
  human_tone: "Humanize AI-sounding copy",
  emotional_clarity: "Add real-life hooks",
  cognitive_load: "Shorten dense answers",
  investor_clarity: "Clarify why investors care"
};

function countCardsWithCategory(
  report: CommunicationQualityReport,
  categoryId: CommunicationCategoryId
): number {
  const keys = new Set<string>();
  for (const target of report.cardsNeedingRegeneration) {
    const hit = target.findings.some((f) => f.categoryId === categoryId);
    if (hit) {
      keys.add(`${target.ticker}:${target.pillarId}:${target.questSlug}:${target.cardId}`);
    }
  }
  if (keys.size > 0) return keys.size;

  let n = 0;
  for (const item of report.weakContent) {
    if (item.warnings.some((w) => w.categoryId === categoryId)) n += 1;
  }
  return n;
}

function categoryDragAndRecovery(
  report: CommunicationQualityReport,
  categoryId: CommunicationCategoryId
): { drag: number; recovery: number } {
  const cat = report.categories.find((c) => c.id === categoryId);
  if (!cat || cat.audited === 0) return { drag: 0, recovery: 0 };

  const gap = Math.max(0, 100 - cat.score);
  const weakRatio = Math.min(1, cat.weak / Math.max(cat.audited, 1));
  const cardHits = countCardsWithCategory(report, categoryId);

  const drag = Math.round(gap * 0.22 * weakRatio + Math.min(6, cardHits * 0.35));
  const recovery = Math.round(gap * 0.35 * weakRatio + Math.min(8, cardHits * 0.45));

  return {
    drag: Math.max(cardHits > 0 ? 2 : 0, drag),
    recovery: Math.max(cardHits > 0 ? 2 : 0, recovery)
  };
}

function capDrivers(
  currentScore: number,
  drivers: RecoveryImpactDriver[]
): RecoveryImpactDriver[] {
  const sorted = [...drivers].sort((a, b) => b.scoreDragPercent - a.scoreDragPercent);
  const gap = Math.max(0, 100 - currentScore);
  let recoveryBudget = gap;

  return sorted.map((d) => {
    const recovery = Math.min(d.recoveryPercent, recoveryBudget);
    recoveryBudget = Math.max(0, recoveryBudget - recovery);
    return { ...d, recoveryPercent: recovery };
  });
}

export function buildCommunicationRecovery(
  report: CommunicationQualityReport,
  domainId: HealthDomainId,
  domainLabel: string,
  currentScore: number
): DomainRecoveryIntelligence {
  const drivers: RecoveryImpactDriver[] = [];

  if (domainId === "learning_quality") {
    const learningCards = allActionableDetailsFromReport(report, "learning_quality");
    const n = learningCards.length;
    if (n > 0) {
      const gap = Math.max(0, 100 - currentScore);
      drivers.push({
        id: "learning_plain_language",
        label: `Plain language (${n} card${n === 1 ? "" : "s"})`,
        severity: "high",
        scoreDragPercent: Math.min(28, Math.round(gap * 0.55)),
        recoveryPercent: Math.min(24, Math.round(gap * 0.45)),
        fixAction: "Regenerate flagged cards with everyday language",
        count: n,
        link: { kind: "actionable_filter", filter: "learning_domain" }
      });
    }
  }

  const placeholders = report.placeholderCount;
  const regenCards = report.cardsNeedingRegeneration.length;
  const regenNonPlaceholder = report.cardsNeedingRegeneration.filter(
    (t) => !t.findings.some((f) => f.code === "template_fallback")
  ).length;

  if (placeholders > 0) {
    const drag = Math.min(28, Math.round(placeholders * 1.4));
    const recovery = Math.min(24, Math.round(placeholders * 1.25));
    drivers.push({
      id: "placeholders",
      label: `${placeholders} placeholder card${placeholders === 1 ? "" : "s"}`,
      severity: "critical",
      scoreDragPercent: drag,
      recoveryPercent: recovery,
      fixAction: "Replace placeholders (SEC extract + regenerate)",
      count: placeholders,
      link: { kind: "actionable_filter", filter: "placeholders" }
    });
  }

  if (regenNonPlaceholder > 0) {
    const drag = Math.min(22, Math.round(regenNonPlaceholder * 0.45));
    const recovery = Math.min(18, Math.round(regenNonPlaceholder * 0.38));
    drivers.push({
      id: "regen_cards",
      label: `${regenNonPlaceholder} card${regenNonPlaceholder === 1 ? "" : "s"} needing regeneration`,
      severity: placeholders > 0 ? "high" : "critical",
      scoreDragPercent: drag,
      recoveryPercent: recovery,
      fixAction: "Regenerate flagged cards",
      count: regenNonPlaceholder,
      link: { kind: "actionable_filter", filter: "regen" }
    });
  } else if (regenCards > 0 && placeholders === 0) {
    drivers.push({
      id: "regen_cards",
      label: `${regenCards} card${regenCards === 1 ? "" : "s"} needing regeneration`,
      severity: "high",
      scoreDragPercent: Math.min(18, Math.round(regenCards * 0.4)),
      recoveryPercent: Math.min(15, Math.round(regenCards * 0.35)),
      fixAction: "Regenerate flagged cards",
      count: regenCards,
      link: { kind: "actionable_filter", filter: "regen" }
    });
  }

  const skipCategoryDrivers =
    domainId === "learning_quality" &&
    drivers.some((d) => d.id === "learning_plain_language");

  const categoryIds = skipCategoryDrivers
    ? []
    : domainId === "learning_quality"
      ? (["jargon_detection", "beginner_friendliness", "cognitive_load", "conversational_tone"] as const)
      : (COMMUNICATION_CATEGORY_DEFS.map((d) => d.id) as CommunicationCategoryId[]);

  for (const categoryId of categoryIds) {
    const cardCount = countCardsWithCategory(report, categoryId);
    const cat = report.categories.find((c) => c.id === categoryId);
    if (cardCount === 0 && (!cat || cat.weak === 0)) continue;

    const { drag, recovery } = categoryDragAndRecovery(report, categoryId);
    if (drag <= 0 && recovery <= 0) continue;

    const def = COMMUNICATION_CATEGORY_DEFS.find((d) => d.id === categoryId);
    const countLabel = cardCount > 0 ? cardCount : cat?.weak ?? 0;

    drivers.push({
      id: `category:${categoryId}`,
      label: `${countLabel} ${def?.label.toLowerCase() ?? categoryId} issue${countLabel === 1 ? "" : "s"}`,
      severity: CATEGORY_SEVERITY[categoryId],
      scoreDragPercent: drag,
      recoveryPercent: recovery,
      fixAction: CATEGORY_FIX_ACTION[categoryId],
      count: countLabel,
      link: { kind: "actionable_filter", filter: "category", categoryId }
    });
  }

  const normalized = capDrivers(currentScore, drivers).sort(
    (a, b) => b.scoreDragPercent - a.scoreDragPercent
  );

  const sortedForOrder = [...normalized].sort((a, b) => {
    const sev = RECOVERY_SEVERITY_ORDER[a.severity] - RECOVERY_SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return b.recoveryPercent - a.recoveryPercent;
  });

  return {
    domainId,
    domainLabel,
    currentScore,
    drivers: normalized,
    recommendedOrder: sortedForOrder.map((d, i) => ({
      step: i + 1,
      action: d.fixAction,
      driverId: d.id,
      severity: d.severity
    })),
    estimatedRecovery: sortedForOrder.map((d) => ({
      action: d.fixAction,
      recoveryPercent: d.recoveryPercent,
      driverId: d.id
    })),
    totalRecoverablePercent: Math.min(
      Math.max(0, 100 - currentScore),
      normalized.reduce((a, d) => a + d.recoveryPercent, 0)
    )
  };
}

const CARD_AUDIT_DOMAIN_IDS = new Set<PlatformHealthDomainResult["domainId"]>([
  "learning_quality",
  "communication_quality"
]);

/** Shown when card audit is not embedded yet — client auto-loads flagged cards. */
export function buildPendingCardAuditIntelligence(
  domain: PlatformHealthDomainResult
): DomainRecoveryIntelligence {
  const gap = Math.max(0, 100 - domain.score);
  const driverId = "load_card_audit";
  return {
    domainId: domain.domainId,
    domainLabel: domain.label,
    currentScore: domain.score,
    drivers: [
      {
        id: driverId,
        label: "Flagged cards (load audit)",
        severity: gap > 25 ? "high" : "medium",
        scoreDragPercent: Math.min(30, Math.round(gap * 0.5)),
        recoveryPercent: Math.min(22, Math.round(gap * 0.4)),
        fixAction: "Load flagged cards to see exact sentences and fix paths",
        link: { kind: "actionable_filter", filter: "all" }
      }
    ],
    recommendedOrder: [
      {
        step: 1,
        action: "Load flagged cards to see exact sentences and fix paths",
        driverId,
        severity: "high"
      }
    ],
    estimatedRecovery: [
      {
        action: "Load flagged cards to see exact sentences and fix paths",
        recoveryPercent: Math.min(22, Math.round(gap * 0.4)),
        driverId
      }
    ],
    totalRecoverablePercent: Math.min(gap, Math.round(gap * 0.4))
  };
}

export function domainRequiresCardAudit(
  domainId: PlatformHealthDomainResult["domainId"]
): boolean {
  return CARD_AUDIT_DOMAIN_IDS.has(domainId);
}

export function buildDomainRecoveryIntelligence(
  domain: PlatformHealthDomainResult,
  communicationQuality?: CommunicationQualityReport | null
): DomainRecoveryIntelligence | null {
  const needsCardAudit = domainRequiresCardAudit(domain.domainId);

  if (needsCardAudit && !communicationQuality) {
    return buildPendingCardAuditIntelligence(domain);
  }

  const useCommReport =
    communicationQuality &&
    (domain.domainId === "communication_quality" || domain.domainId === "learning_quality");

  if (useCommReport) {
    const details = allActionableDetailsFromReport(communicationQuality, domain.domainId);
    let intel = buildCommunicationRecovery(
      communicationQuality,
      domain.domainId,
      domain.label,
      domain.score
    );
    if (intel.drivers.length === 0 && details.length > 0) {
      const n = details.length;
      const gap = Math.max(0, 100 - domain.score);
      intel = {
        ...intel,
        drivers: [
          {
            id: "flagged_cards",
            label: `Flagged cards (${n})`,
            severity: "high",
            scoreDragPercent: Math.min(30, Math.round(gap * 0.5)),
            recoveryPercent: Math.min(25, Math.round(gap * 0.4)),
            fixAction: "Regenerate or rewrite flagged cards",
            count: n,
            affectedCardCount: n,
            link: { kind: "actionable_filter", filter: "all" }
          }
        ],
        recommendedOrder: [
          {
            step: 1,
            action: "Regenerate or rewrite flagged cards",
            driverId: "flagged_cards",
            severity: "high"
          }
        ],
        estimatedRecovery: [
          {
            action: "Regenerate or rewrite flagged cards",
            recoveryPercent: Math.min(25, Math.round(gap * 0.4)),
            driverId: "flagged_cards"
          }
        ],
        totalRecoverablePercent: Math.min(gap, Math.round(gap * 0.4))
      };
    }
    if (intel.drivers.length > 0) return intel;
    if (needsCardAudit) {
      return buildPendingCardAuditIntelligence(domain);
    }
  }

  if (needsCardAudit) {
    return buildPendingCardAuditIntelligence(domain);
  }

  const exclude =
    communicationQuality && domain.domainId === "communication_quality"
      ? LEGACY_COMM_DOMAIN_CHECK_IDS
      : undefined;

  return buildSubsectionGroupedRecovery(
    domain,
    exclude ? { excludeCheckIds: exclude } : undefined
  );
}
