import type {
  HealthCheckItem,
  HealthCheckItemStatus,
  PlatformHealthCheckResult,
  PlatformHealthCounts
} from "@/lib/gameHealth/types";
import { isScorableOutcome } from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import { CATALOG_BY_CHECK_ID } from "@/lib/gameHealth/registry/checkCatalog";

const WARN_MULTIPLIER = 0.55;

export function isCriticalCheck(check: HealthCheckItem): boolean {
  if (check.status !== "fail") return false;
  const catalog = CATALOG_BY_CHECK_ID[check.id];
  return catalog?.blocksDemo ?? true;
}

export function countCheckResults(checks: PlatformHealthCheckResult[]): PlatformHealthCounts {
  const counts: PlatformHealthCounts = {
    pass: 0,
    warn: 0,
    fail: 0,
    critical: 0,
    pending: 0,
    unavailable: 0,
    total: 0
  };

  for (const c of checks) {
    counts.total += 1;
    const kind = c.outcomeKind;
    if (kind && !isScorableOutcome(kind)) {
      counts.unavailable += 1;
      continue;
    }
    if (c.status === "pending") {
      counts.pending += 1;
      continue;
    }
    if (c.status === "pass") counts.pass += 1;
    else if (c.status === "warn") counts.warn += 1;
    else if (c.status === "fail") {
      counts.fail += 1;
      if (c.severity === "critical" || ("blocksDemo" in c && c.blocksDemo)) {
        counts.critical += 1;
      }
    }
  }

  return counts;
}

/** Score only checks that represent actual problems or passes — not pending/unavailable. */
export function scoreFromChecks(
  checks: Array<{
    status: HealthCheckItemStatus;
    weight: number;
    outcomeKind?: PlatformHealthCheckResult["outcomeKind"];
  }>
): number {
  const runnable = checks.filter((c) => {
    if (c.outcomeKind && !isScorableOutcome(c.outcomeKind)) return false;
    return c.status !== "pending";
  });
  let total = 0;
  let earned = 0;

  for (const c of runnable) {
    total += c.weight;
    if (c.status === "pass") earned += c.weight;
    else if (c.status === "warn") earned += c.weight * WARN_MULTIPLIER;
  }

  return total ? Math.round((earned / total) * 100) : 100;
}

export function legacyComputeScore(checks: HealthCheckItem[]): number {
  return scoreFromChecks(
    checks.map((c) => ({
      status: c.status === "pending" ? "warn" : c.status,
      weight: c.weight
    }))
  );
}
