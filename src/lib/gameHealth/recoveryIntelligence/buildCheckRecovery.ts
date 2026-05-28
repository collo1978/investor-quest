import { isScorableOutcome } from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import type { PlatformHealthCheckResult, PlatformHealthDomainResult } from "@/lib/gameHealth/types";

import {
  RECOVERY_SEVERITY_ORDER,
  type DomainRecoveryIntelligence,
  type RecoveryImpactDriver,
  type RecoverySeverity
} from "./types";

const WARN_MULTIPLIER = 0.55;

function severityForCheck(check: PlatformHealthCheckResult): RecoverySeverity {
  if (check.status === "fail" && (check.blocksDemo || check.severity === "critical")) {
    return "critical";
  }
  if (check.status === "fail") return "high";
  if (check.id.includes("empty") || check.id.includes("placeholder")) return "critical";
  if (check.id.includes("quest_flow") || check.id.includes("progression")) return "critical";
  if (check.id.includes("jargon") || check.id.includes("slow")) return "high";
  if (check.status === "warn") return "medium";
  return "low";
}

function earnedWeight(check: PlatformHealthCheckResult): number {
  if (check.status === "pass") return check.weight;
  if (check.status === "warn") return check.weight * WARN_MULTIPLIER;
  return 0;
}

function scorableChecks(checks: PlatformHealthCheckResult[]): PlatformHealthCheckResult[] {
  return checks.filter(
    (c) => c.status !== "pending" && (!c.outcomeKind || isScorableOutcome(c.outcomeKind))
  );
}

/** Per-check score lift if that check alone moved to pass. */
function dragPointsForCheck(
  check: PlatformHealthCheckResult,
  totalWeight: number
): number {
  if (check.status === "pass" || totalWeight <= 0) return 0;
  const gain = check.weight - earnedWeight(check);
  return Math.max(1, Math.round((gain / totalWeight) * 100));
}

function recoveryPointsForCheck(
  check: PlatformHealthCheckResult,
  totalWeight: number
): number {
  return dragPointsForCheck(check, totalWeight);
}

function buildStepsAndEstimates(drivers: RecoveryImpactDriver[]) {
  const sorted = [...drivers].sort((a, b) => {
    const sev = RECOVERY_SEVERITY_ORDER[a.severity] - RECOVERY_SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return b.scoreDragPercent - a.scoreDragPercent;
  });

  return {
    recommendedOrder: sorted.map((d, i) => ({
      step: i + 1,
      action: d.fixAction,
      driverId: d.id,
      severity: d.severity
    })),
    estimatedRecovery: sorted.map((d) => ({
      action: d.fixAction,
      recoveryPercent: d.recoveryPercent,
      driverId: d.id
    }))
  };
}

function capRecoverable(currentScore: number, drivers: RecoveryImpactDriver[]): number {
  const gap = Math.max(0, 100 - currentScore);
  const sum = drivers.reduce((a, d) => a + d.recoveryPercent, 0);
  return Math.min(gap, sum);
}

export function buildCheckBasedRecovery(
  domain: PlatformHealthDomainResult,
  options?: { excludeCheckIds?: Set<string> }
): DomainRecoveryIntelligence | null {
  const allChecks = domain.subsections.flatMap((s) => s.checks);
  const exclude = options?.excludeCheckIds ?? new Set<string>();
  const checks = scorableChecks(allChecks).filter(
    (c) => !exclude.has(c.id) && c.status !== "pass"
  );

  if (checks.length === 0) return null;

  const totalWeight = scorableChecks(allChecks).reduce((a, c) => a + c.weight, 0);

  const drivers: RecoveryImpactDriver[] = checks
    .map((check) => {
      const drag = dragPointsForCheck(check, totalWeight);
      const recovery = recoveryPointsForCheck(check, totalWeight);
      return {
        id: check.id,
        label: check.name,
        severity: severityForCheck(check),
        scoreDragPercent: drag,
        recoveryPercent: recovery,
        fixAction: check.suggestedFix || `Resolve: ${check.name}`,
        link: { kind: "check" as const, checkId: check.id }
      };
    })
    .sort((a, b) => b.scoreDragPercent - a.scoreDragPercent);

  const { recommendedOrder, estimatedRecovery } = buildStepsAndEstimates(drivers);

  return {
    domainId: domain.domainId,
    domainLabel: domain.label,
    currentScore: domain.score,
    drivers,
    recommendedOrder,
    estimatedRecovery,
    totalRecoverablePercent: capRecoverable(domain.score, drivers)
  };
}

/** Merge drivers that share a subsection label (cleaner for dense domains). */
export function buildSubsectionGroupedRecovery(
  domain: PlatformHealthDomainResult,
  options?: { excludeCheckIds?: Set<string> }
): DomainRecoveryIntelligence | null {
  const exclude = options?.excludeCheckIds ?? new Set<string>();
  const drivers: RecoveryImpactDriver[] = [];

  for (const sub of domain.subsections) {
    const checks = scorableChecks(sub.checks).filter(
      (c) => !exclude.has(c.id) && c.status !== "pass"
    );
    if (checks.length === 0) continue;

    const subTotal = scorableChecks(sub.checks).reduce((a, c) => a + c.weight, 0);
    const drag = checks.reduce((a, c) => a + dragPointsForCheck(c, subTotal), 0);
    const recovery = checks.reduce((a, c) => a + recoveryPointsForCheck(c, subTotal), 0);
    const worst = checks.reduce((w, c) =>
      RECOVERY_SEVERITY_ORDER[severityForCheck(c)] < RECOVERY_SEVERITY_ORDER[w]
        ? severityForCheck(c)
        : w
    , severityForCheck(checks[0]));

    const fixAction =
      checks.length === 1
        ? checks[0].suggestedFix
        : `Fix ${checks.length} issue(s) in ${sub.label}`;

    drivers.push({
      id: `subsection:${sub.subsectionId}`,
      label: `${sub.label} (${checks.length} check${checks.length === 1 ? "" : "s"})`,
      severity: worst,
      scoreDragPercent: Math.min(35, drag),
      recoveryPercent: Math.min(30, recovery),
      fixAction: fixAction || `Review ${sub.label}`,
      count: checks.length,
      link: { kind: "subsection" as const, subsectionId: sub.subsectionId }
    });
  }

  if (drivers.length === 0) return null;

  drivers.sort((a, b) => b.scoreDragPercent - a.scoreDragPercent);
  const { recommendedOrder, estimatedRecovery } = buildStepsAndEstimates(drivers);

  return {
    domainId: domain.domainId,
    domainLabel: domain.label,
    currentScore: domain.score,
    drivers,
    recommendedOrder,
    estimatedRecovery,
    totalRecoverablePercent: capRecoverable(domain.score, drivers)
  };
}
