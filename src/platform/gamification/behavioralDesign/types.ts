/** Structured manual audit layer — ready for future analytics hooks. */

export type BehavioralAuditStatus =
  | "healthy"
  | "needs_review"
  | "weak"
  | "critical";

export type BehavioralAuditSourceType =
  | "manual"
  | "automated"
  | "analytics_future";

export type OctalysisDriveId =
  | "epic_meaning"
  | "accomplishment"
  | "empowerment"
  | "ownership"
  | "social"
  | "scarcity"
  | "unpredictability"
  | "loss_avoidance";

export type HookStageId = "trigger" | "action" | "variable_reward" | "investment";

export type SdtNeedId = "autonomy" | "competence" | "relatedness";

export type FoggFactorId = "motivation" | "ability" | "prompt";

export type BehavioralAuditScores = {
  octalysis: Record<OctalysisDriveId, number>;
  hook: Record<HookStageId, number>;
  sdt: Record<SdtNeedId, number>;
  fogg: Record<FoggFactorId, number>;
};

export type BehavioralAuditWarning = {
  id: string;
  message: string;
  severity: BehavioralAuditStatus;
};

export type BehavioralAuditOpportunity = {
  id: string;
  label: string;
  detail: string;
};

export type OctalysisDriveResult = {
  id: OctalysisDriveId;
  label: string;
  purpose: string;
  score: number;
  status: BehavioralAuditStatus;
  presentInProduct: string[];
  missingOpportunities: string[];
  hat: "white" | "black" | "neutral";
  brain: "left" | "right" | "both";
  motivation: "intrinsic" | "extrinsic" | "mixed";
};

export type OctalysisFrameworkResult = {
  frameworkId: "octalysis";
  label: string;
  purpose: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  sourceType: BehavioralAuditSourceType;
  drives: OctalysisDriveResult[];
  balance: {
    intrinsicPercent: number;
    extrinsicPercent: number;
    whiteHatPercent: number;
    blackHatPercent: number;
    leftBrainPercent: number;
    rightBrainPercent: number;
  };
  overused: string[];
  underused: string[];
  warnings: BehavioralAuditWarning[];
  suggestions: string[];
  presentSummary: string[];
};

export type HookStageResult = {
  id: HookStageId;
  label: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  presentInProduct: string[];
  missingOpportunities: string[];
};

export type HookFrameworkResult = {
  frameworkId: "hook";
  label: string;
  purpose: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  sourceType: BehavioralAuditSourceType;
  stages: HookStageResult[];
  warnings: BehavioralAuditWarning[];
  suggestions: string[];
};

export type SdtNeedResult = {
  id: SdtNeedId;
  label: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  presentInProduct: string[];
  missingOpportunities: string[];
};

export type SdtFrameworkResult = {
  frameworkId: "sdt";
  label: string;
  purpose: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  sourceType: BehavioralAuditSourceType;
  needs: SdtNeedResult[];
  warnings: BehavioralAuditWarning[];
  suggestions: string[];
};

export type FoggFactorResult = {
  id: FoggFactorId;
  label: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  presentInProduct: string[];
  missingOpportunities: string[];
};

export type FoggFrameworkResult = {
  frameworkId: "fogg";
  label: string;
  purpose: string;
  healthPercent: number;
  status: BehavioralAuditStatus;
  sourceType: BehavioralAuditSourceType;
  factors: FoggFactorResult[];
  warnings: BehavioralAuditWarning[];
  suggestions: string[];
};

export type BehavioralDesignAuditReport = {
  version: 1;
  updatedAt: string;
  sourceType: BehavioralAuditSourceType;
  overallHealthPercent: number;
  overallStatus: BehavioralAuditStatus;
  octalysis: OctalysisFrameworkResult;
  hook: HookFrameworkResult;
  sdt: SdtFrameworkResult;
  fogg: FoggFrameworkResult;
};
