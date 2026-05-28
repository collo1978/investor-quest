import { inferIssueDomainId } from "@/lib/operations/issueDomain";
import type { PlatformHealthReport } from "@/lib/gameHealth/types";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

type IssueDraft = Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>;

/** Attach domain id + score at detection time for inline verify UI. */
export function stampIssueDomainScores(
  drafts: IssueDraft[],
  platformReport: PlatformHealthReport | null | undefined
): IssueDraft[] {
  if (!platformReport) return drafts;

  const scoreByDomain = Object.fromEntries(
    platformReport.domains.map((d) => [d.domainId, d.score])
  ) as Record<string, number>;

  return drafts.map((draft) => {
    const domainId = inferIssueDomainId(draft);
    return {
      ...draft,
      metadata: {
        ...draft.metadata,
        detectionDomainId: domainId,
        detectionDomainScore: scoreByDomain[domainId] ?? null
      }
    };
  });
}
