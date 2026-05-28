import { DOMAIN_BY_ID } from "@/lib/gameHealth/registry/domains";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import type { PlatformHealthDomainResult } from "@/lib/gameHealth/types";

const EMPTY_COUNTS = {
  pass: 0,
  warn: 0,
  fail: 0,
  critical: 0,
  pending: 0,
  unavailable: 0,
  total: 0
};

/** Minimal domain row for client-side recovery rebuild (e.g. Communication panel). */
export function domainStubForRecovery(
  domainId: HealthDomainId,
  score: number
): PlatformHealthDomainResult {
  const def = DOMAIN_BY_ID[domainId];
  return {
    domainId,
    label: def?.label ?? domainId,
    description: def?.description ?? "",
    weight: def?.weight ?? 10,
    demoCritical: def?.demoCritical ?? false,
    score,
    counts: { ...EMPTY_COUNTS },
    subsections:
      def?.subsections.map((s) => ({
        subsectionId: s.id,
        label: s.label,
        score: 0,
        counts: { ...EMPTY_COUNTS },
        checks: []
      })) ?? []
  };
}
