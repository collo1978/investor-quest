import { DOMAIN_BY_ID } from "@/lib/gameHealth/registry/domains";
import type {
  DemoReadinessResult,
  HealthDomainId,
  PlatformHealthDomainResult
} from "@/lib/gameHealth/types";
import { scoreToStatusLabel } from "@/lib/gameHealth/statusLabel";
import type { HealthStatusLabel } from "@/lib/gameHealth/types";

const DEMO_READY_MIN_OVERALL = 90;
const DEMO_READY_MIN_CRITICAL_DOMAIN = 70;

export function evaluateDemoReadiness(input: {
  overallScore: number;
  domains: PlatformHealthDomainResult[];
}): DemoReadinessResult {
  const blockers: string[] = [];
  let ready = true;

  if (input.overallScore < DEMO_READY_MIN_OVERALL) {
    ready = false;
    blockers.push(`Overall platform health is ${input.overallScore}% (need ${DEMO_READY_MIN_OVERALL}%+).`);
  }

  for (const domain of input.domains) {
    const def = DOMAIN_BY_ID[domain.domainId];
    if (!def?.demoCritical) continue;

    if (domain.counts.critical > 0) {
      ready = false;
      blockers.push(
        `${def.label}: ${domain.counts.critical} critical issue(s) blocking demo.`
      );
    } else if (domain.score < DEMO_READY_MIN_CRITICAL_DOMAIN && domain.counts.fail > 0) {
      ready = false;
      blockers.push(`${def.label} is at ${domain.score}% with active failures.`);
    }
  }

  let status: HealthStatusLabel;
  if (ready && input.overallScore >= DEMO_READY_MIN_OVERALL) {
    status = "Demo Ready";
  } else if (input.overallScore >= 70) {
    status = "Good, but check warnings";
  } else if (input.overallScore >= 50) {
    status = "Needs fixes before demo";
  } else {
    status = "Not demo ready";
  }

  if (!ready && status === "Demo Ready") {
    status = "Good, but check warnings";
  }

  return {
    ready,
    status,
    blockers: blockers.slice(0, 6),
    overallScore: input.overallScore
  };
}

export function findBottleneckDomain(
  domains: PlatformHealthDomainResult[]
): HealthDomainId | null {
  const runnable = domains.filter((d) => d.counts.total > d.counts.pending);
  if (runnable.length === 0) return null;

  return runnable.reduce((worst, d) => (d.score < worst.score ? d : worst)).domainId;
}

export { scoreToStatusLabel };
