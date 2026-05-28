import type { AnalyticsEventName } from "@/platform/types";
import type {
  BehavioralAuditScores,
  BehavioralAuditSourceType,
  BehavioralAuditStatus,
  BehavioralDesignAuditReport,
  FoggFrameworkResult,
  HookFrameworkResult,
  OctalysisFrameworkResult,
  SdtFrameworkResult
} from "@/platform/gamification/behavioralDesign/types";

/** Scope for future multi-tenant reporting (platform-wide for now). */
export type BehavioralIntelligenceScope = "platform" | "partner" | "cohort";

export type BehavioralMetricCategory =
  | "engagement"
  | "retention"
  | "progression"
  | "quest_flow"
  | "quiz_performance"
  | "exploration"
  | "streaks"
  | "motivation"
  | "friction"
  | "onboarding";

export type MetricDataStatus = "live" | "placeholder" | "unavailable";

export type BehavioralMetricDefinition = {
  id: string;
  label: string;
  category: BehavioralMetricCategory;
  unit: "count" | "percent" | "ratio" | "minutes" | "score";
  description: string;
  /** Optional link to analytics event catalog */
  analyticsEvent?: AnalyticsEventName;
  aggregation: string;
  status: MetricDataStatus;
};

export type MetricValue = {
  metricId: string;
  value: number | null;
  previousValue?: number | null;
  windowLabel: string;
  status: MetricDataStatus;
  sampledAt: string;
};

export type BehavioralAnalyticsSnapshot = {
  version: 1;
  scope: BehavioralIntelligenceScope;
  scopeId: string | null;
  windowDays: number;
  generatedAt: string;
  source: "placeholder" | "warehouse" | "mixed";
  metrics: MetricValue[];
  /** Human note when data is simulated */
  dataDisclaimer: string;
};

export type FrameworkAnalyticsQuestion = {
  id: string;
  question: string;
  metricIds: string[];
  /** Populated when analytics connected */
  insightPreview?: string;
};

export type FrameworkMetricBinding = {
  frameworkId: "octalysis" | "hook" | "sdt" | "fogg";
  dimensionId: string;
  metricIds: string[];
  analyticsQuestions: string[];
};

export type FrameworkAnalyticsLayer = {
  frameworkId: "octalysis" | "hook" | "sdt" | "fogg";
  label: string;
  status: MetricDataStatus;
  questions: FrameworkAnalyticsQuestion[];
  /** Metric-driven score 0–100 when live; null = not yet computed */
  analyticsHealthPercent: number | null;
  metricHighlights: Array<{
    metricId: string;
    label: string;
    value: string;
    trend?: "up" | "down" | "flat";
  }>;
};

export type BehaviorStoryEvidence = {
  kind: "manual_score" | "metric" | "pattern";
  label: string;
  detail?: string;
};

export type BehaviorStoryBlock = {
  id: string;
  title: string;
  narrative: string;
  tone: "insight" | "risk" | "opportunity" | "strength";
  frameworks: Array<"octalysis" | "hook" | "sdt" | "fogg">;
  evidence: BehaviorStoryEvidence[];
  /** Future: broker, school, bank, internal */
  audiences: Array<"internal" | "school" | "broker" | "bank" | "program">;
};

/** Top-level human summary — scannable, non-technical */
export type BehaviorStorySummaryItem = {
  id: string;
  label: string;
  description: string;
  /** Visual key for UI (progress, social, friction, etc.) */
  visual: "progress" | "onboarding" | "learning" | "curiosity" | "retention" | "social" | "rewards" | "friction" | "habit" | "trust";
};

export type PlayerJourneyMood = "high" | "medium" | "low" | "rising";

export type PlayerJourneyStage = {
  id: string;
  label: string;
  mood: PlayerJourneyMood;
  caption: string;
};

export type BehaviorStorySummary = {
  oneLine: string;
  whatsWorking: BehaviorStorySummaryItem[];
  needsAttention: BehaviorStorySummaryItem[];
  biggestOpportunity: {
    title: string;
    description: string;
    actionHint: string;
  };
  playerJourney: PlayerJourneyStage[];
};

export type BehaviorStoryReport = {
  version: 2;
  generatedAt: string;
  confidence: "manual" | "blended" | "analytics";
  headline: string;
  executiveSummary: string;
  /** Plain-English top summary for brokers, schools, and ops */
  summary: BehaviorStorySummary;
  blocks: BehaviorStoryBlock[];
  /** One-liners for client PDF / partner dashboards */
  clientTakeaways: string[];
};

export type ClientReportAudience = "school" | "broker" | "bank" | "program" | "internal";

export type ClientReportSlice = {
  audience: ClientReportAudience;
  title: string;
  summary: string;
  highlights: string[];
  recommendedActions: string[];
};

export type BehavioralIntelligenceReport = {
  version: 2;
  updatedAt: string;
  scope: BehavioralIntelligenceScope;
  /** Manual framework audit (existing) */
  audit: BehavioralDesignAuditReport;
  /** Placeholder or live analytics */
  analytics: BehavioralAnalyticsSnapshot;
  analyticsLayers: FrameworkAnalyticsLayer[];
  behaviorStory: BehaviorStoryReport;
  clientReports: ClientReportSlice[];
  /** Combined score: manual + analytics when available */
  intelligenceScore: number;
  intelligenceStatus: BehavioralAuditStatus;
  dataMaturity: "manual_only" | "placeholder_analytics" | "live_analytics";
};

/** Input for intelligence pipeline */
export type BehavioralIntelligenceInput = {
  manualScores: BehavioralAuditScores;
  analytics?: BehavioralAnalyticsSnapshot | null;
};

export type { OctalysisFrameworkResult, HookFrameworkResult, SdtFrameworkResult, FoggFrameworkResult, BehavioralDesignAuditReport, BehavioralAuditSourceType };
