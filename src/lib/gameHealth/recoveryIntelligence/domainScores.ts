import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";

const LEARNING_CATEGORY_IDS = [
  "jargon_detection",
  "beginner_friendliness",
  "question_alignment",
  "cognitive_load",
  "conversational_tone"
] as const;

export function domainScoreFromCommunicationReport(
  report: CommunicationQualityReport,
  domainId: HealthDomainId
): number {
  if (domainId === "learning_quality") {
    const cats = report.categories.filter((c) =>
      LEARNING_CATEGORY_IDS.includes(c.id as (typeof LEARNING_CATEGORY_IDS)[number])
    );
    if (cats.length === 0) return report.overallHealthPercent;
    return Math.round(cats.reduce((sum, c) => sum + c.score, 0) / cats.length);
  }
  if (domainId === "communication_quality") {
    return report.overallHealthPercent;
  }
  return report.overallHealthPercent;
}
