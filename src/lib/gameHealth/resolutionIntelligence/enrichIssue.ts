import type { FixActionId, GameHealthIssueRecord, HealthCheckItem } from "@/lib/gameHealth/types";

import {
  AUDIT_CATEGORY_CATALOG,
  COMM_CATEGORY_TO_AUDIT,
  DOMAIN_TO_AUDIT_CATEGORY
} from "./catalog";
import {
  detectedSummaryFromDetail,
  readActionableDetail
} from "./actionableDetail";
import type {
  AuditCategoryId,
  CheckOutcomeKind,
  IssueRecommendation,
  ResolutionHistoryEntry,
  ResolutionIntelligence,
  ResolutionStatus
} from "./types";
import { RESOLUTION_METADATA_KEY } from "./types";

export type IssueDraftInput = Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>;

export function inferAuditCategory(draft: IssueDraftInput): AuditCategoryId {
  const meta = draft.metadata ?? {};

  if (typeof meta.auditCategory === "string") {
    return meta.auditCategory as AuditCategoryId;
  }

  if (draft.issueKey.startsWith("comm:")) {
    const commCat = meta.communicationCategory as string | undefined;
    if (commCat && COMM_CATEGORY_TO_AUDIT[commCat]) {
      return COMM_CATEGORY_TO_AUDIT[commCat];
    }
    return "communication_quality";
  }

  if (draft.issueKey.startsWith("behavioral:")) return "behavioral_design";
  if (draft.issueKey.startsWith("gamification:")) return "gamification_mechanics";
  if (draft.issueKey.startsWith("quest_flow:")) return "quiz_quality";
  if (meta.category === "quest_flow") return "progression_systems";

  const domainId = meta.domainId as string | undefined;
  if (domainId && DOMAIN_TO_AUDIT_CATEGORY[domainId]) {
    return DOMAIN_TO_AUDIT_CATEGORY[domainId];
  }

  const checkId = (meta.checkItemId as string) ?? draft.issueKey;
  if (checkId.includes("mobile") || checkId.includes("tap")) return "mobile_experience";
  if (checkId.includes("jargon") || checkId.includes("plain")) return "learning_quality";
  if (checkId.includes("slow_") || checkId.includes("interaction")) return "ux_interaction";
  if (checkId.includes("xp") || checkId.includes("progress")) return "progression_systems";
  if (checkId.includes("map")) return "world_map";
  if (checkId.includes("supabase") || checkId.includes("communication_health")) {
    return checkId.includes("communication") ? "communication_quality" : "platform_infrastructure";
  }

  return "platform_infrastructure";
}

function recommendationsForDraft(
  draft: IssueDraftInput,
  category: AuditCategoryId
): IssueRecommendation[] {
  const template = AUDIT_CATEGORY_CATALOG[category];
  const fromTemplate = template.defaultRecommendations.map((r) => ({
    ...r,
    fixActionId: draft.fixAction as FixActionId | undefined,
    autoFixable: Boolean(draft.fixAction && draft.fixAction !== "mark_resolved")
  }));

  const actionable = readActionableDetail(draft.metadata);
  const primaryFinding = actionable?.findings[0];

  if (primaryFinding) {
    const operatorAction =
      draft.fixAction === "retry_generation"
        ? "Regenerate the flagged quest card"
        : actionable?.preferredFixLabel ?? "Review flagged copy in Mission Control";
    return [
      {
        action: operatorAction,
        rationale: primaryFinding.reason,
        priority: draft.severity === "critical" ? "high" : "medium",
        fixActionId: (draft.fixAction as FixActionId) ?? undefined,
        autoFixable: draft.fixAction === "retry_generation"
      },
      ...fromTemplate.slice(0, 1)
    ];
  }

  if (draft.suggestedFix) {
    return [
      {
        action: draft.suggestedFix,
        rationale: "Recommended fix from the latest audit pass.",
        priority: draft.severity === "critical" ? "high" : "medium",
        fixActionId: (draft.fixAction as FixActionId) ?? undefined,
        autoFixable: Boolean(draft.fixAction && draft.fixAction !== "mark_resolved")
      },
      ...fromTemplate.filter((t) => t.action !== draft.suggestedFix).slice(0, 2)
    ];
  }

  return fromTemplate;
}

export function buildResolutionIntelligence(
  draft: IssueDraftInput,
  opts?: {
    existing?: ResolutionIntelligence | null;
    checkOutcomeKind?: CheckOutcomeKind;
  }
): ResolutionIntelligence {
  const category = inferAuditCategory(draft);
  const template = AUDIT_CATEGORY_CATALOG[category];
  const existing = opts?.existing;

  const actionable = readActionableDetail(draft.metadata);
  const primaryFinding = actionable?.findings[0];

  const whyItMatters =
    primaryFinding?.reason ||
    (typeof draft.metadata?.whyItMatters === "string" && draft.metadata.whyItMatters) ||
    template.defaultWhyItMatters;

  const detected = actionable
    ? detectedSummaryFromDetail(actionable)
    : draft.problemPlain || draft.title;

  const resolutionStatus: ResolutionStatus =
    existing?.resolutionStatus ?? "pending";

  const history: ResolutionHistoryEntry[] = existing?.resolutionHistory ?? [];
  if (!existing) {
    history.push({
      status: "pending",
      at: new Date().toISOString(),
      note: "Detected on health audit"
    });
  }

  return {
    version: 1,
    auditCategory: category,
    auditCategoryLabel: template.label,
    detected,
    whyItMatters,
    recommendations: recommendationsForDraft(draft, category),
    resolutionStatus,
    resolutionHistory: history,
    verification: existing?.verification,
    checkOutcomeKind: opts?.checkOutcomeKind
  };
}

export function enrichIssueDraft(
  draft: IssueDraftInput,
  existingIssue?: GameHealthIssueRecord | null
): IssueDraftInput {
  const existingResolution = existingIssue
    ? readResolutionIntelligence(existingIssue.metadata)
    : null;

  const resolution = buildResolutionIntelligence(draft, {
    existing: existingResolution
  });

  return {
    ...draft,
    metadata: {
      ...draft.metadata,
      auditCategory: resolution.auditCategory,
      [RESOLUTION_METADATA_KEY]: resolution
    }
  };
}

export function readResolutionIntelligence(
  metadata: Record<string, unknown> | undefined | null
): ResolutionIntelligence | null {
  if (!metadata) return null;
  const raw = metadata[RESOLUTION_METADATA_KEY];
  if (!raw || typeof raw !== "object") return null;
  const r = raw as ResolutionIntelligence;
  if (r.version !== 1 || !r.detected) return null;
  return r;
}

export function appendResolutionHistory(
  resolution: ResolutionIntelligence,
  entry: ResolutionHistoryEntry
): ResolutionIntelligence {
  return {
    ...resolution,
    resolutionStatus: entry.status,
    resolutionHistory: [...resolution.resolutionHistory, entry]
  };
}

export function checkOutcomeKindForItem(
  check: HealthCheckItem
): CheckOutcomeKind {
  if (check.outcomeKind) return check.outcomeKind;
  if (check.status === "pending") return "pending_audit";
  if (check.status === "pass") return "actual_problem";
  return "actual_problem";
}

export function outcomeKindFromMessage(message: string): CheckOutcomeKind {
  const m = message.toLowerCase();
  if (m.includes("registry mismatch")) return "registry_mismatch";
  if (m.includes("audit unavailable") || m.includes("could not complete")) {
    return "audit_unavailable";
  }
  if (m.includes("waiting for browser")) return "pending_audit";
  if (m.includes("scheduled for a later")) return "pending_audit";
  if (m.includes("not run in this")) return "skipped";
  if (m.includes("supabase") || m.includes("database")) return "infrastructure";
  return "actual_problem";
}

export function isScorableOutcome(kind: CheckOutcomeKind): boolean {
  return kind === "actual_problem";
}
