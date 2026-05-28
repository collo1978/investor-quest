import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import { PLATFORM_HEALTH_DOMAINS, DOMAIN_BY_ID } from "@/lib/gameHealth/registry/domains";
import {
  CATALOG_BY_CHECK_ID,
  HEALTH_CHECK_CATALOG
} from "@/lib/gameHealth/registry/checkCatalog";
import type { HealthCheckCatalogEntry } from "@/lib/gameHealth/registry/types";
import {
  evaluateDemoReadiness,
  findBottleneckDomain
} from "@/lib/gameHealth/demoReadiness";
import { countCheckResults, scoreFromChecks } from "@/lib/gameHealth/scoring";
import type {
  HealthCheckItem,
  HealthCheckItemStatus,
  PlatformHealthCheckResult,
  PlatformHealthDomainResult,
  PlatformHealthReport,
  PlatformHealthSubsectionResult
} from "@/lib/gameHealth/types";

function toPlatformCheck(item: HealthCheckItem): PlatformHealthCheckResult {
  return {
    id: item.id,
    name: item.name,
    status: item.status,
    message: item.message,
    laymanSummary: item.laymanSummary,
    durationMs: item.durationMs,
    weight: item.weight,
    domainId: item.domainId,
    subsectionId: item.subsectionId,
    checkType: item.checkType,
    severity: item.severity,
    suggestedFix: item.suggestedFix,
    blocksDemo: item.blocksDemo,
    outcomeKind: item.outcomeKind
  };
}

function pendingCheckFromCatalog(entry: HealthCheckCatalogEntry): PlatformHealthCheckResult {
  return {
    id: entry.id,
    name: entry.name,
    status: "pending",
    message:
      entry.checkType === "browser"
        ? "Waiting for browser lab (Phase 3)."
        : entry.implementationPhase > 1
          ? "Scheduled for a later automated audit phase."
          : "Not run in this audit pass.",
    weight: entry.weight,
    domainId: entry.domainId,
    subsectionId: entry.subsectionId,
    checkType: entry.checkType,
    severity: "info",
    suggestedFix: entry.defaultSuggestedFix,
    blocksDemo: entry.blocksDemo
  };
}

function buildSubsection(
  domainId: PlatformHealthDomainResult["domainId"],
  subsectionId: string,
  label: string,
  checks: PlatformHealthCheckResult[]
): PlatformHealthSubsectionResult {
  return {
    subsectionId,
    label,
    score: scoreFromChecks(checks),
    counts: countCheckResults(checks),
    checks
  };
}

export function buildPlatformHealthReport(
  executedChecks: HealthCheckItem[],
  communicationQuality?: CommunicationQualityReport | null
): PlatformHealthReport {
  const executedById = new Map(executedChecks.map((c) => [c.id, toPlatformCheck(c)]));

  const allChecks: PlatformHealthCheckResult[] = HEALTH_CHECK_CATALOG.map((entry) => {
    const ran = executedById.get(entry.id);
    if (ran) return ran;
    if (entry.implementationPhase === 1 && entry.checkType === "automated") {
      return {
        ...pendingCheckFromCatalog(entry),
        status: "pending" as HealthCheckItemStatus,
        message: "Automated check did not run in this pass (registry mismatch).",
        outcomeKind: "registry_mismatch" as const
      };
    }
    return pendingCheckFromCatalog(entry);
  });

  const domains: PlatformHealthDomainResult[] = PLATFORM_HEALTH_DOMAINS.map((domain) => {
    const subsections = domain.subsections.map((sub) => {
      const subChecks = allChecks.filter(
        (c) => c.domainId === domain.id && c.subsectionId === sub.id
      );
      return buildSubsection(domain.id, sub.id, sub.label, subChecks);
    });

    const domainChecks = allChecks.filter((c) => c.domainId === domain.id);

    return {
      domainId: domain.id,
      label: domain.label,
      description: domain.description,
      weight: domain.weight,
      demoCritical: domain.demoCritical,
      score: scoreFromChecks(domainChecks),
      counts: countCheckResults(domainChecks),
      subsections
    };
  });

  const runnableChecks = allChecks.filter((c) => c.status !== "pending");
  const overallScore = scoreFromChecks(runnableChecks);
  const demoReadiness = evaluateDemoReadiness({ overallScore, domains });
  const bottleneckDomainId = findBottleneckDomain(domains);
  const bottleneck = bottleneckDomainId ? DOMAIN_BY_ID[bottleneckDomainId] : null;

  const passed = executedChecks.filter((c) => c.status === "pass");
  const warnings = executedChecks.filter((c) => c.status === "warn");
  const failed = executedChecks.filter((c) => c.status === "fail");

  return {
    version: 1,
    overallScore,
    overallCounts: countCheckResults(allChecks),
    demoReadiness,
    bottleneckDomainId,
    bottleneckLabel: bottleneck?.label ?? null,
    domains,
    communicationQuality: communicationQuality ?? null,
    executedAt: new Date().toISOString(),
    legacy: {
      passedChecks: passed,
      warnings,
      failedChecks: failed
    }
  };
}

/** Rebuild report from a stored check (flat lists + optional snapshot). */
export function platformReportFromCheckRecord(input: {
  passedChecks: HealthCheckItem[];
  warnings: HealthCheckItem[];
  failedChecks: HealthCheckItem[];
  platformReport?: PlatformHealthReport | null;
  score?: number;
}): PlatformHealthReport {
  if (input.platformReport?.version === 1) {
    return input.platformReport;
  }

  const executed = [
    ...input.passedChecks,
    ...input.warnings,
    ...input.failedChecks
  ].map((c) => {
    const catalog = CATALOG_BY_CHECK_ID[c.id];
    return enrichLegacyCheck(c, catalog);
  });

  const report = buildPlatformHealthReport(executed);
  if (input.score != null && !input.platformReport) {
    report.overallScore = input.score;
  }
  return report;
}

function enrichLegacyCheck(
  c: HealthCheckItem,
  catalog: HealthCheckCatalogEntry | undefined
): HealthCheckItem {
  if (c.domainId && c.subsectionId) return c;
  return {
    ...c,
    domainId: catalog?.domainId ?? "platform_release",
    subsectionId: catalog?.subsectionId ?? "environment",
    checkType: catalog?.checkType ?? "automated",
    severity:
      c.severity ??
      (c.status === "fail" ? "critical" : c.status === "warn" ? "warning" : "info"),
    suggestedFix: c.suggestedFix ?? catalog?.defaultSuggestedFix ?? "",
    blocksDemo: c.blocksDemo ?? catalog?.blocksDemo ?? c.status === "fail"
  };
}
