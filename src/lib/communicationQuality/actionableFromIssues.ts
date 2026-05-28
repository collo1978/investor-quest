import type { AuditActionableDetail } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import { actionableCardKey } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import { inferIssueDomainId } from "@/lib/operations/issueDomain";

function isActionableDetail(value: unknown): value is AuditActionableDetail {
  if (!value || typeof value !== "object") return false;
  const d = value as AuditActionableDetail;
  return d.version === 1 && Array.isArray(d.findings) && d.findings.length > 0;
}

/** Fallback when stored platform report lacks embedded communication audit. */
export function actionableDetailsFromOpenIssues(
  issues: GameHealthIssueRecord[],
  domainId: HealthDomainId
): AuditActionableDetail[] {
  const byKey = new Map<string, AuditActionableDetail>();

  for (const issue of issues) {
    if (issue.status !== "open") continue;
    const issueDomain =
      (typeof issue.metadata?.detectionDomainId === "string"
        ? issue.metadata.detectionDomainId
        : null) ?? inferIssueDomainId(issue);
    if (issueDomain !== domainId) continue;

    const detail = issue.metadata?.actionableDetail;
    if (!isActionableDetail(detail)) continue;

    byKey.set(actionableCardKey(detail), detail);
  }

  return [...byKey.values()];
}
