import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import type {
  HealthCheckType,
  HealthDomainId
} from "@/lib/gameHealth/registry/types";
import type { CheckOutcomeKind } from "@/lib/gameHealth/resolutionIntelligence/types";

export type { HealthDomainId, HealthCheckType };

export type HealthCheckItemStatus = "pass" | "warn" | "fail" | "pending";

export type HealthSeverity = "info" | "warning" | "critical";

export type HealthStatusLabel =
  | "Demo Ready"
  | "Good, but check warnings"
  | "Needs fixes before demo"
  | "Not demo ready";

export type HealthCheckItem = {
  id: string;
  name: string;
  status: HealthCheckItemStatus;
  message: string;
  laymanSummary?: string;
  durationMs?: number;
  weight: number;
  domainId: HealthDomainId;
  subsectionId: string;
  checkType: HealthCheckType;
  severity: HealthSeverity;
  suggestedFix: string;
  blocksDemo: boolean;
  /** When set, controls whether this check affects health scores. */
  outcomeKind?: CheckOutcomeKind;
};

export type PlatformHealthCounts = {
  pass: number;
  warn: number;
  fail: number;
  critical: number;
  pending: number;
  /** Checks not scored — skipped, unavailable, registry mismatch, infrastructure. */
  unavailable: number;
  total: number;
};

export type PlatformHealthCheckResult = HealthCheckItem;

export type PlatformHealthSubsectionResult = {
  subsectionId: string;
  label: string;
  score: number;
  counts: PlatformHealthCounts;
  checks: PlatformHealthCheckResult[];
};

export type PlatformHealthDomainResult = {
  domainId: HealthDomainId;
  label: string;
  description: string;
  weight: number;
  demoCritical: boolean;
  score: number;
  counts: PlatformHealthCounts;
  subsections: PlatformHealthSubsectionResult[];
};

export type DemoReadinessResult = {
  ready: boolean;
  status: HealthStatusLabel;
  blockers: string[];
  overallScore: number;
};

export type PlatformHealthReport = {
  version: 1;
  overallScore: number;
  overallCounts: PlatformHealthCounts;
  demoReadiness: DemoReadinessResult;
  bottleneckDomainId: HealthDomainId | null;
  bottleneckLabel: string | null;
  domains: PlatformHealthDomainResult[];
  /** Communication intelligence — cards, quizzes, mastery copy. */
  communicationQuality?: CommunicationQualityReport | null;
  executedAt: string;
  legacy: {
    passedChecks: HealthCheckItem[];
    warnings: HealthCheckItem[];
    failedChecks: HealthCheckItem[];
  };
};

export type GameHealthIssueRecord = {
  id: string;
  checkId: string | null;
  issueKey: string;
  severity: HealthSeverity;
  title: string;
  problemPlain: string;
  whatUsersSee: string;
  suggestedFix: string;
  fixAction: string | null;
  companyTicker: string | null;
  companyName: string | null;
  pillarId: string | null;
  questSlug: string | null;
  cardId: string | null;
  status: "open" | "resolved" | "ignored";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type GameHealthCheckRecord = {
  id: string;
  score: number;
  statusLabel: HealthStatusLabel;
  passedChecks: HealthCheckItem[];
  warnings: HealthCheckItem[];
  failedChecks: HealthCheckItem[];
  suggestedFixes: string[];
  slowestRoute: string | null;
  durationMs: number | null;
  createdAt: string;
  issues?: GameHealthIssueRecord[];
  platformReport?: PlatformHealthReport | null;
};

export type GameHealthSettings = {
  alertEmail: string | null;
  alertBelowScore: number;
  alertOnCritical: boolean;
  alertOnSlowLoading: boolean;
  checkIntervalMinutes: number;
  demoEmergencyFastMode: boolean;
  demoEmergencySkipJargon: boolean;
  lastAlertScore: number | null;
  lastAlertAt: string | null;
};

export type FixActionId =
  | "retry_generation"
  | "use_cached_answer"
  | "clear_and_regenerate"
  | "enable_fast_mode"
  | "disable_heavy_checks"
  | "mark_resolved"
  | "repair_quest_progress"
  | "reset_quest_progress"
  | "unlock_quest_quiz"
  | "recheck_quest_flow"
  | "verify_resolution";

/** Optional client-side repair payload (localStorage on test device). */
export type FixActionClientRepair = {
  kind: "quest_progress";
  mode: "repair" | "reset" | "unlock_quiz";
  companyId: string;
  pillarId: string;
  questSlug: string;
  cardIds: string[];
};
