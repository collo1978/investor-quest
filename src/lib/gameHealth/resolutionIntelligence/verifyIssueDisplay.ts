import type { VerificationSnapshot } from "./types";

export type VerifyIssueResult = {
  passed: boolean;
  summary: string;
  beforeScore?: number | null;
  afterScore?: number | null;
  afterStatus?: string | null;
  probeIds?: string[];
};

export function buildVerificationSnapshot(
  result: VerifyIssueResult,
  before?: VerificationSnapshot | null
): VerificationSnapshot {
  return {
    verifiedAt: new Date().toISOString(),
    beforeScore:
      result.beforeScore ??
      before?.afterScore ??
      before?.beforeScore ??
      null,
    afterScore: result.afterScore ?? null,
    beforeStatus: before?.afterStatus ?? before?.beforeStatus ?? null,
    afterStatus: result.afterStatus ?? (result.passed ? "pass" : "fail"),
    probeIds: result.probeIds,
    passed: result.passed,
    summary: result.summary
  };
}

/** Score delta label for UI (client-safe). */
export function formatVerificationDelta(v: VerificationSnapshot): string | null {
  if (v.beforeScore == null || v.afterScore == null) return null;
  const delta = v.afterScore - v.beforeScore;
  if (delta === 0) return "No score change";
  return delta > 0 ? `+${delta} pts` : `${delta} pts`;
}
