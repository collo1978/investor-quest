import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import { evaluateDemoReadiness, findBottleneckDomain } from "@/lib/gameHealth/demoReadiness";
import { DOMAIN_BY_ID } from "@/lib/gameHealth/registry/domains";
import { domainScoreFromCommunicationReport } from "@/lib/gameHealth/recoveryIntelligence/domainScores";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import type {
  PlatformHealthDomainResult,
  PlatformHealthReport
} from "@/lib/gameHealth/types";

function weightedOverallFromDomains(domains: PlatformHealthDomainResult[]): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const d of domains) {
    weightedSum += d.score * d.weight;
    totalWeight += d.weight;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100;
}

/** Client-safe: align domain + overall scores with latest communication audit. */
export function applyCommunicationAuditToPlatformReport(
  report: PlatformHealthReport,
  communicationQuality: CommunicationQualityReport
): PlatformHealthReport {
  const commDomainScores: Partial<Record<HealthDomainId, number>> = {
    learning_quality: domainScoreFromCommunicationReport(
      communicationQuality,
      "learning_quality"
    ),
    communication_quality: domainScoreFromCommunicationReport(
      communicationQuality,
      "communication_quality"
    )
  };

  const domains = report.domains.map((d) => {
    const synced = commDomainScores[d.domainId];
    if (synced == null) return d;
    return { ...d, score: synced };
  });

  const overallScore = weightedOverallFromDomains(domains);
  const demoReadiness = evaluateDemoReadiness({ overallScore, domains });
  const bottleneckDomainId = findBottleneckDomain(domains);
  const bottleneck = bottleneckDomainId ? DOMAIN_BY_ID[bottleneckDomainId] : null;

  return {
    ...report,
    domains,
    overallScore,
    demoReadiness,
    bottleneckDomainId,
    bottleneckLabel: bottleneck?.label ?? null,
    communicationQuality,
    executedAt: communicationQuality.executedAt
  };
}

/** After background refresh, keep fresher on-demand audit scores if DB snapshot is older. */
export function mergePlatformReportWithLiveAudit(
  stored: PlatformHealthReport,
  live: PlatformHealthReport | null | undefined
): PlatformHealthReport {
  const liveComm = live?.communicationQuality;
  const storedComm = stored.communicationQuality;
  if (!liveComm) return stored;
  if (!storedComm || liveComm.executedAt >= storedComm.executedAt) {
    return applyCommunicationAuditToPlatformReport(stored, liveComm);
  }
  return stored;
}
