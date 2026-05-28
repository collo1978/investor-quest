import { buildFrameworkAnalyticsLayers } from "@/platform/gamification/behavioralDesign/analytics/buildFrameworkAnalyticsLayers";
import { buildClientReportSlices } from "@/platform/gamification/behavioralDesign/analytics/clientReports";
import { generateBehaviorStory } from "@/platform/gamification/behavioralDesign/analytics/generateBehaviorStory";
import { getAnalyticsProvider } from "@/platform/gamification/behavioralDesign/analytics/analyticsProvider";
import { evaluateBehavioralDesign } from "@/platform/gamification/behavioralDesign/evaluateBehavioralDesign";
import type {
  BehavioralIntelligenceInput,
  BehavioralIntelligenceReport
} from "@/platform/gamification/behavioralDesign/analytics/types";
import type { BehavioralAuditStatus } from "@/platform/gamification/behavioralDesign/types";

function statusFromScore(score: number): BehavioralAuditStatus {
  if (score >= 75) return "healthy";
  if (score >= 60) return "needs_review";
  if (score >= 45) return "weak";
  return "critical";
}

function blendIntelligenceScore(
  manualPercent: number,
  analyticsLayers: ReturnType<typeof buildFrameworkAnalyticsLayers>
): number {
  const analyticsPercents = analyticsLayers
    .map((l) => l.analyticsHealthPercent)
    .filter((p): p is number => p != null);
  if (analyticsPercents.length === 0) return manualPercent;
  const analyticsAvg = Math.round(
    analyticsPercents.reduce((a, b) => a + b, 0) / analyticsPercents.length
  );
  return Math.round(manualPercent * 0.65 + analyticsAvg * 0.35);
}

export function buildBehavioralIntelligence(
  input: BehavioralIntelligenceInput
): BehavioralIntelligenceReport {
  const audit = evaluateBehavioralDesign(input.manualScores);
  const analytics =
    input.analytics ??
    null;

  const analyticsLayers = analytics
    ? buildFrameworkAnalyticsLayers(analytics)
    : [];

  const behaviorStory = generateBehaviorStory(audit, analytics);
  const clientReports = buildClientReportSlices(audit, behaviorStory);

  const hasLive = analytics?.metrics.some((m) => m.status === "live") ?? false;
  const dataMaturity: BehavioralIntelligenceReport["dataMaturity"] = hasLive
    ? "live_analytics"
    : analytics
      ? "placeholder_analytics"
      : "manual_only";

  const intelligenceScore = blendIntelligenceScore(audit.overallHealthPercent, analyticsLayers);

  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    scope: "platform",
    audit,
    analytics: analytics ?? {
      version: 1,
      scope: "platform",
      scopeId: null,
      windowDays: 28,
      generatedAt: new Date().toISOString(),
      source: "placeholder",
      metrics: [],
      dataDisclaimer: "No analytics snapshot — manual audit only."
    },
    analyticsLayers,
    behaviorStory,
    clientReports,
    intelligenceScore,
    intelligenceStatus: statusFromScore(intelligenceScore),
    dataMaturity
  };
}

/** Async entry: fetches analytics via provider then builds report */
export async function buildBehavioralIntelligenceAsync(
  manualScores: BehavioralIntelligenceInput["manualScores"],
  options?: { scopeId?: string | null; windowDays?: number }
): Promise<BehavioralIntelligenceReport> {
  const provider = getAnalyticsProvider();
  const analytics = await provider.fetchSnapshot({
    scope: "platform",
    scopeId: options?.scopeId ?? null,
    windowDays: options?.windowDays ?? 28
  });
  return buildBehavioralIntelligence({ manualScores, analytics });
}
