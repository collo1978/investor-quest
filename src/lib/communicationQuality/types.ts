import type { PillarId } from "@/data/pillars";
import type { AuditFlaggedFinding } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";

/** Eight communication dimensions Mission Control scores. */
export type CommunicationCategoryId =
  | "conversational_tone"
  | "beginner_friendliness"
  | "question_alignment"
  | "jargon_detection"
  | "human_tone"
  | "emotional_clarity"
  | "cognitive_load"
  | "investor_clarity";

export type CommunicationContentKind =
  | "quest_card"
  | "quiz_explanation"
  | "mastery_summary"
  | "onboarding";

export type CommunicationSeverity = "info" | "warning" | "critical";

export type CommunicationWarning = {
  code: string;
  categoryId: CommunicationCategoryId;
  severity: CommunicationSeverity;
  /** Player-facing warning for Mission Control (no emoji — UI adds). */
  message: string;
  snippet?: string;
};

export type CommunicationContentAudit = {
  contentId: string;
  kind: CommunicationContentKind;
  ticker?: string;
  companyName?: string;
  pillarId?: PillarId | string;
  questSlug?: string;
  cardId?: string;
  source: string;
  question?: string;
  preview: string;
  /** Full audited text (for exact sentence extraction in Mission Control). */
  bodyText?: string;
  score: number;
  warnings: CommunicationWarning[];
  needsRegeneration: boolean;
  placeholder: boolean;
};

export type CommunicationCategoryResult = {
  id: CommunicationCategoryId;
  label: string;
  description: string;
  score: number;
  audited: number;
  weak: number;
  sampleWarnings: CommunicationWarning[];
};

export type CommunicationPillarScore = {
  pillarId: string;
  label: string;
  score: number;
  audited: number;
  weak: number;
};

export type CommunicationPhraseHit = {
  phrase: string;
  count: number;
  categoryId: CommunicationCategoryId;
};

export type CommunicationRegenerationTarget = {
  ticker: string;
  companyName: string;
  pillarId: string;
  pillarLabel: string;
  questSlug: string;
  questTitle: string;
  cardId: string;
  cardLabel: string;
  score: number;
  source: string;
  /** @deprecated Use findings[].reason */
  topWarnings: string[];
  preview: string;
  findings: AuditFlaggedFinding[];
  preferredFix: "regenerate" | "manual_rewrite";
};

export type CommunicationQualityReport = {
  version: 1;
  overallHealthPercent: number;
  executedAt: string;
  companiesAudited: string[];
  contentAudited: number;
  contentWeak: number;
  placeholderCount: number;
  categories: CommunicationCategoryResult[];
  pillarScores: CommunicationPillarScore[];
  topProblemPhrases: CommunicationPhraseHit[];
  recurringPatterns: Array<{ pattern: string; count: number }>;
  weakContent: CommunicationContentAudit[];
  cardsNeedingRegeneration: CommunicationRegenerationTarget[];
};
