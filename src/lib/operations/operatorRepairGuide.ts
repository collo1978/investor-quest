import {
  actionableCardKey,
  questPlayPath,
  questRegenerateAdminPath,
  readActionableDetail
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import { readResolutionIntelligence } from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";

import {
  domainLabelForId,
  filterActionsForDomain,
  inferIssueDomainId,
  isDeveloperDomain
} from "./issueDomain";
import { operatorFixActionCopy } from "./fixActions";

export type OperatorFixType =
  | "one_tap_admin"
  | "regenerate_content"
  | "developer_required"
  | "monitoring_only";

export type OperatorUrgency = "critical" | "soon" | "when_convenient";

export type OperatorRepairGuide = {
  domainId: HealthDomainId;
  domainLabel: string;
  problem: string;
  rootCause: string;
  whyItMatters: string;
  playerImpact: string;
  flaggedSentence: string | null;
  exactFix: string;
  nextStep: string;
  fixType: OperatorFixType;
  fixTypeLabel: string;
  canOperatorFixAlone: boolean;
  expectedOutcome: string;
  scoreImpactLabel: string;
  urgency: OperatorUrgency;
  urgencyLabel: string;
  headline: string;
  primaryActionId: FixActionId | null;
  primaryActionLabel: string;
  verifyActionId: FixActionId;
  openContentHref: string | null;
  regenerateHref: string | null;
  developerSummary: string;
  detectionDomainScore: number | null;
};

const FIX_TYPE_LABELS: Record<OperatorFixType, string> = {
  one_tap_admin: "One-tap admin fix",
  regenerate_content: "Regenerate content",
  developer_required: "Developer investigation required",
  monitoring_only: "Monitor only"
};

const URGENCY_LABELS: Record<OperatorUrgency, string> = {
  critical: "Fix before demo",
  soon: "Fix soon",
  when_convenient: "When you have time"
};

const PRIMARY_LABELS: Record<FixActionId, string> = {
  retry_generation: "Regenerate affected card",
  clear_and_regenerate: "Clear and regenerate card",
  use_cached_answer: "Keep last saved answer",
  enable_fast_mode: "Enable demo fast mode",
  disable_heavy_checks: "Emergency faster saves (demo only)",
  mark_resolved: "Mark as handled",
  repair_quest_progress: "Repair quest progress",
  unlock_quest_quiz: "Unlock quiz on this device",
  reset_quest_progress: "Reset quest on this device",
  recheck_quest_flow: "Re-run quest flow check",
  verify_resolution: "Verify fix"
};

const DEVELOPER_CHECK_PREFIXES = [
  "supabase",
  "openai",
  "sec_config",
  "deploy",
  "prompts_synced",
  "quest_catalog",
  "quest_page_load",
  "supabase_live",
  "openai_live",
  "xp_progress_config"
];

function isQuestFlowIssue(issue: GameHealthIssueRecord): boolean {
  return (
    issue.issueKey.startsWith("quest_flow:") === true ||
    issue.metadata?.category === "quest_flow"
  );
}

function checkIdFromIssue(issue: GameHealthIssueRecord): string {
  return String(issue.metadata?.checkItemId ?? issue.issueKey ?? "");
}

function isDeveloperIssue(issue: GameHealthIssueRecord, domainId: HealthDomainId): boolean {
  if (isDeveloperDomain(domainId)) return true;
  const outcome = issue.metadata?.checkOutcomeKind as string | undefined;
  if (outcome === "infrastructure" || outcome === "registry_mismatch") return true;
  const id = checkIdFromIssue(issue).toLowerCase();
  return DEVELOPER_CHECK_PREFIXES.some((p) => id.includes(p));
}

function isMonitoringIssue(issue: GameHealthIssueRecord): boolean {
  if (issue.issueKey.startsWith("behavioral:") || issue.issueKey.startsWith("gamification:")) {
    return true;
  }
  const outcome = issue.metadata?.checkOutcomeKind as string | undefined;
  return outcome === "pending_audit" || outcome === "audit_unavailable";
}

function urgencyFromIssue(issue: GameHealthIssueRecord): OperatorUrgency {
  if (issue.severity === "critical") return "critical";
  if (isMonitoringIssue(issue)) return "when_convenient";
  return issue.severity === "warning" ? "soon" : "when_convenient";
}

function resolvePrimaryAction(
  issue: GameHealthIssueRecord,
  domainId: HealthDomainId
): FixActionId | null {
  if (isDeveloperIssue(issue, domainId)) return null;
  if (isMonitoringIssue(issue)) return "mark_resolved";

  let candidate: FixActionId | null = null;

  if (isQuestFlowIssue(issue)) {
    candidate = (issue.fixAction as FixActionId) ?? "repair_quest_progress";
  } else if (issue.issueKey.startsWith("comm:")) {
    const actionable = readActionableDetail(issue.metadata);
    candidate =
      actionable?.preferredFix === "regenerate"
        ? "retry_generation"
        : ((issue.fixAction as FixActionId) ?? "retry_generation");
  } else {
    const checkId = checkIdFromIssue(issue);
    if (domainId === "quest_session" && checkId.includes("slow_")) {
      candidate = "enable_fast_mode";
    } else if (
      domainId === "learning_quality" ||
      domainId === "communication_quality" ||
      domainId === "content_completeness"
    ) {
      if (checkId.includes("jargon") || checkId.includes("empty") || checkId.includes("quest_answer")) {
        candidate = "retry_generation";
      } else {
        candidate = (issue.fixAction as FixActionId) ?? "retry_generation";
      }
    } else {
      candidate = (issue.fixAction as FixActionId) ?? null;
    }
  }

  if (!candidate) return null;
  return filterActionsForDomain([candidate], domainId)[0] ?? null;
}

function fixTypeFromIssue(
  issue: GameHealthIssueRecord,
  primary: FixActionId | null,
  domainId: HealthDomainId
): OperatorFixType {
  if (isDeveloperIssue(issue, domainId)) return "developer_required";
  if (isMonitoringIssue(issue)) return "monitoring_only";
  if (
    primary === "retry_generation" ||
    primary === "clear_and_regenerate" ||
    issue.issueKey.startsWith("comm:")
  ) {
    return "regenerate_content";
  }
  if (primary === "mark_resolved" && !issue.fixAction) return "monitoring_only";
  return "one_tap_admin";
}

function buildProblemStatement(issue: GameHealthIssueRecord): string {
  const actionable = readActionableDetail(issue.metadata);
  const finding = actionable?.findings[0];
  const loc = actionable?.location;

  if (finding && loc) {
    const where = [
      loc.companyTicker,
      loc.pillarLabel,
      loc.questTitle ?? loc.questSlug,
      loc.cardLabel
    ]
      .filter(Boolean)
      .join(" · ");
    return where ? `${where}: ${finding.reason}` : finding.reason;
  }

  const intelligence = readResolutionIntelligence(issue.metadata);
  return intelligence?.detected ?? issue.problemPlain ?? issue.title;
}

function buildRootCause(issue: GameHealthIssueRecord): string {
  const actionable = readActionableDetail(issue.metadata);
  const finding = actionable?.findings[0];
  if (finding?.reason) return finding.reason;

  const intelligence = readResolutionIntelligence(issue.metadata);
  if (intelligence?.whyItMatters) return intelligence.whyItMatters;

  return issue.problemPlain || "Content or configuration does not meet quality gates.";
}

function buildExactFix(
  issue: GameHealthIssueRecord,
  fixType: OperatorFixType,
  primary: FixActionId | null
): string {
  if (fixType === "developer_required") {
    return "Send this to your developer — server or deployment fix required.";
  }
  if (fixType === "monitoring_only") {
    return "No urgent fix — monitor and mark handled when reviewed.";
  }
  if (primary) return PRIMARY_LABELS[primary];
  return "Verify fix after any change.";
}

function buildNextStep(
  issue: GameHealthIssueRecord,
  fixType: OperatorFixType,
  primary: FixActionId | null,
  domainLabel: string
): string {
  if (fixType === "developer_required") {
    return "Copy the issue summary for your developer. You cannot resolve this inside the game UI.";
  }
  if (fixType === "monitoring_only") {
    return "Review when convenient, then verify or mark handled.";
  }
  if (fixType === "regenerate_content") {
    return `Tap Fix this issue to regenerate the card, then Verify fix to confirm ${domainLabel} improved.`;
  }
  if (isQuestFlowIssue(issue)) {
    return "Tap Fix this issue to repair progress on this device, then verify the quiz unlocks.";
  }
  if (primary === "enable_fast_mode") {
    return `Enable demo fast mode for quicker loads during your session, then verify ${domainLabel}.`;
  }
  return `Tap Fix this issue, then Verify fix to confirm ${domainLabel} improved.`;
}

function buildExpectedOutcome(domainLabel: string, fixType: OperatorFixType): string {
  if (fixType === "developer_required") {
    return `${domainLabel} should recover after engineering fixes environment or deployment.`;
  }
  if (fixType === "monitoring_only") {
    return `Track ${domainLabel} on the next health check — no immediate player change expected.`;
  }
  return `${domainLabel} score should improve and this issue should clear after verification.`;
}

export function buildDeveloperSummary(issue: GameHealthIssueRecord): string {
  const domainId = inferIssueDomainId(issue);
  const lines = [
    `Investor Quest — Mission Control`,
    `Domain: ${domainLabelForId(domainId)}`,
    `Severity: ${issue.severity}`,
    `Problem: ${buildProblemStatement(issue)}`,
    `Root cause: ${buildRootCause(issue)}`,
    `Player impact: ${issue.whatUsersSee}`,
    issue.companyTicker ? `Company: ${issue.companyTicker}` : null,
    issue.questSlug ? `Quest: ${issue.questSlug}` : null,
    issue.cardId ? `Card: ${issue.cardId}` : null
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildOperatorRepairGuide(
  issue: GameHealthIssueRecord
): OperatorRepairGuide {
  const domainId = inferIssueDomainId(issue);
  const domainLabel = domainLabelForId(domainId);
  const primaryActionId = resolvePrimaryAction(issue, domainId);
  const fixType = fixTypeFromIssue(issue, primaryActionId, domainId);
  const urgency = urgencyFromIssue(issue);
  const actionable = readActionableDetail(issue.metadata);
  const finding = actionable?.findings[0];
  const intelligence = readResolutionIntelligence(issue.metadata);

  const detectionDomainScore =
    typeof issue.metadata?.detectionDomainScore === "number"
      ? issue.metadata.detectionDomainScore
      : null;

  const primaryActionLabel = primaryActionId
    ? PRIMARY_LABELS[primaryActionId]
    : fixType === "developer_required"
      ? "Copy issue for developer"
      : "Mark as handled";

  const exactFix = buildExactFix(issue, fixType, primaryActionId);
  const scoreImpactLabel = `Should improve ${domainLabel}`;

  const canOperatorFixAlone =
    fixType === "one_tap_admin" || fixType === "regenerate_content";

  let headline = "What to do next";
  if (fixType === "developer_required") headline = "Developer help needed";
  if (urgency === "critical") headline = "Fix before your demo";

  return {
    domainId,
    domainLabel,
    problem: buildProblemStatement(issue),
    rootCause: buildRootCause(issue),
    whyItMatters:
      intelligence?.whyItMatters ??
      "Players need clear, trustworthy quest copy to finish research.",
    playerImpact: issue.whatUsersSee || "Players may notice something off during quests.",
    flaggedSentence: finding?.flaggedText ?? null,
    exactFix,
    nextStep: buildNextStep(issue, fixType, primaryActionId, domainLabel),
    fixType,
    fixTypeLabel: FIX_TYPE_LABELS[fixType],
    canOperatorFixAlone,
    expectedOutcome: buildExpectedOutcome(domainLabel, fixType),
    scoreImpactLabel,
    urgency,
    urgencyLabel: URGENCY_LABELS[urgency],
    headline,
    primaryActionId,
    primaryActionLabel,
    verifyActionId: "verify_resolution",
    openContentHref: actionable ? questPlayPath(actionable) : null,
    regenerateHref: actionable ? questRegenerateAdminPath(actionable) : null,
    developerSummary: buildDeveloperSummary(issue),
    detectionDomainScore
  };
}

export function operatorPrimaryActionCopy(
  issue: GameHealthIssueRecord
): ReturnType<typeof operatorFixActionCopy> | null {
  const guide = buildOperatorRepairGuide(issue);
  if (!guide.primaryActionId) return null;
  const copy = operatorFixActionCopy(guide.primaryActionId);
  return { ...copy, label: guide.primaryActionLabel };
}

export function actionableKeyForIssue(issue: GameHealthIssueRecord): string | null {
  const detail = readActionableDetail(issue.metadata);
  return detail ? actionableCardKey(detail) : null;
}
