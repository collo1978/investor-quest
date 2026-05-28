import { CATALOG_BY_CHECK_ID } from "@/lib/gameHealth/registry/checkCatalog";
import { outcomeKindFromMessage } from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import type { CheckOutcomeKind } from "@/lib/gameHealth/resolutionIntelligence/types";
import type { HealthCheckItem, HealthCheckItemStatus } from "@/lib/gameHealth/types";
import type { HealthSeverity } from "@/lib/gameHealth/types";

export function enrichHealthCheck(
  partial: {
    id: string;
    name: string;
    status: HealthCheckItemStatus;
    message: string;
    weight?: number;
    laymanSummary?: string;
    durationMs?: number;
    suggestedFix?: string;
    outcomeKind?: CheckOutcomeKind;
  }
): HealthCheckItem {
  const catalog = CATALOG_BY_CHECK_ID[partial.id];
  const weight = partial.weight ?? catalog?.weight ?? 5;
  const blocksDemo = catalog?.blocksDemo ?? partial.status === "fail";
  const severity: HealthSeverity =
    partial.status === "fail"
      ? blocksDemo
        ? "critical"
        : "warning"
      : partial.status === "warn"
        ? "warning"
        : partial.status === "pending"
          ? "info"
          : "info";

  return {
    id: partial.id,
    name: partial.name,
    status: partial.status,
    message: partial.message,
    laymanSummary: partial.laymanSummary,
    durationMs: partial.durationMs,
    weight,
    domainId: catalog?.domainId ?? "platform_release",
    subsectionId: catalog?.subsectionId ?? "environment",
    checkType: catalog?.checkType ?? "automated",
    severity,
    suggestedFix:
      partial.suggestedFix ??
      catalog?.defaultSuggestedFix ??
      "Review this check in Mission Control.",
    blocksDemo,
    outcomeKind:
      partial.outcomeKind ??
      (partial.status === "pending"
        ? outcomeKindFromMessage(partial.message)
        : partial.status === "pass"
          ? undefined
          : "actual_problem")
  };
}

/** @deprecated Use enrichHealthCheck */
export function item(
  id: string,
  name: string,
  status: HealthCheckItemStatus,
  message: string,
  weight: number,
  opts?: {
    layman?: string;
    durationMs?: number;
    suggestedFix?: string;
    outcomeKind?: CheckOutcomeKind;
  }
): HealthCheckItem {
  return enrichHealthCheck({
    id,
    name,
    status,
    message,
    weight,
    laymanSummary: opts?.layman,
    durationMs: opts?.durationMs,
    suggestedFix: opts?.suggestedFix,
    outcomeKind: opts?.outcomeKind
  });
}
