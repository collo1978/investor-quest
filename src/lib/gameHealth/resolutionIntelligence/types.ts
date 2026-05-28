import type { FixActionId } from "@/lib/gameHealth/types";

/** Mission Control audit category — extensible for future domains. */
export type AuditCategoryId =
  | "communication_quality"
  | "learning_quality"
  | "behavioral_design"
  | "gamification_mechanics"
  | "ux_interaction"
  | "cognitive_load"
  | "investor_understanding"
  | "mobile_experience"
  | "quiz_quality"
  | "progression_systems"
  | "motivation_systems"
  | "content_completeness"
  | "player_progression"
  | "world_map"
  | "quest_session"
  | "platform_infrastructure"
  | "admin_operations";

export type ResolutionStatus =
  | "pending"
  | "regenerated"
  | "auto_fixed"
  | "manually_reviewed"
  | "resolved"
  | "needs_human_review";

/** How a check affects health scoring — not all non-pass outcomes are content failures. */
export type CheckOutcomeKind =
  | "actual_problem"
  | "skipped"
  | "pending_audit"
  | "audit_unavailable"
  | "registry_mismatch"
  | "infrastructure";

export type IssueRecommendation = {
  action: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  fixActionId?: FixActionId;
  autoFixable?: boolean;
};

export type ResolutionHistoryEntry = {
  status: ResolutionStatus;
  at: string;
  note?: string;
  action?: string;
};

export type VerificationSnapshot = {
  verifiedAt: string;
  beforeScore?: number | null;
  afterScore?: number | null;
  beforeStatus?: string | null;
  afterStatus?: string | null;
  probeIds?: string[];
  passed: boolean;
  summary: string;
};

/** Full Detect → Explain → Recommend → Resolve → Verify intelligence payload. */
export type ResolutionIntelligence = {
  version: 1;
  auditCategory: AuditCategoryId;
  auditCategoryLabel: string;
  /** Detect — what is wrong */
  detected: string;
  /** Explain — why this matters */
  whyItMatters: string;
  /** Recommend — ranked improvement actions */
  recommendations: IssueRecommendation[];
  /** Resolve — workflow status */
  resolutionStatus: ResolutionStatus;
  resolutionHistory: ResolutionHistoryEntry[];
  /** Verify — post-fix proof */
  verification?: VerificationSnapshot;
  checkOutcomeKind?: CheckOutcomeKind;
};

export const RESOLUTION_STATUS_LABELS: Record<ResolutionStatus, string> = {
  pending: "Pending",
  regenerated: "Regenerated",
  auto_fixed: "Auto-fixed",
  manually_reviewed: "Manually reviewed",
  resolved: "Resolved",
  needs_human_review: "Needs human review"
};

export const CHECK_OUTCOME_LABELS: Record<CheckOutcomeKind, string> = {
  actual_problem: "Content / system issue",
  skipped: "Skipped this pass",
  pending_audit: "Pending audit",
  audit_unavailable: "Audit unavailable",
  registry_mismatch: "Registry mismatch",
  infrastructure: "Infrastructure"
};

/** Metadata key stored on game_health_issues.metadata */
export const RESOLUTION_METADATA_KEY = "resolution" as const;
