import { DOMAIN_BY_ID } from "@/lib/gameHealth/registry/domains";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import { COMM_CATEGORY_TO_AUDIT, DOMAIN_TO_AUDIT_CATEGORY } from "@/lib/gameHealth/resolutionIntelligence/catalog";
import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";

type IssueLike = Pick<GameHealthIssueRecord, "issueKey" | "metadata" | "fixAction">;

/** Actions allowed per domain — no cross-domain fixes. */
export const DOMAIN_ALLOWED_FIX_ACTIONS: Record<HealthDomainId, FixActionId[]> = {
  learning_quality: [
    "retry_generation",
    "clear_and_regenerate",
    "verify_resolution",
    "mark_resolved"
  ],
  communication_quality: [
    "retry_generation",
    "clear_and_regenerate",
    "verify_resolution",
    "mark_resolved"
  ],
  content_completeness: [
    "retry_generation",
    "clear_and_regenerate",
    "verify_resolution",
    "mark_resolved"
  ],
  player_progression: [
    "repair_quest_progress",
    "unlock_quest_quiz",
    "reset_quest_progress",
    "recheck_quest_flow",
    "verify_resolution",
    "mark_resolved"
  ],
  quest_session: ["enable_fast_mode", "verify_resolution", "mark_resolved"],
  world_map: ["verify_resolution", "mark_resolved"],
  platform_release: ["verify_resolution", "mark_resolved"],
  data_integrations: ["verify_resolution", "mark_resolved"],
  admin_operations: ["verify_resolution", "mark_resolved"]
};

const DEVELOPER_DOMAIN_IDS = new Set<HealthDomainId>([
  "platform_release",
  "data_integrations"
]);

export function inferIssueDomainId(issue: IssueLike): HealthDomainId {
  const meta = issue.metadata ?? {};
  const stored = meta.detectionDomainId as string | undefined;
  if (stored && stored in DOMAIN_BY_ID) {
    return stored as HealthDomainId;
  }

  const domainFromMeta = meta.domainId as string | undefined;
  if (domainFromMeta && domainFromMeta in DOMAIN_BY_ID) {
    return domainFromMeta as HealthDomainId;
  }

  if (issue.issueKey.startsWith("comm:")) {
    const commCat = meta.communicationCategory as string | undefined;
    if (commCat && COMM_CATEGORY_TO_AUDIT[commCat] === "learning_quality") {
      return "learning_quality";
    }
    return "communication_quality";
  }

  if (
    issue.issueKey.startsWith("quest_flow:") ||
    meta.category === "quest_flow"
  ) {
    return "player_progression";
  }

  if (issue.issueKey.startsWith("behavioral:")) return "player_progression";
  if (issue.issueKey.startsWith("gamification:")) return "player_progression";

  const checkId = String(meta.checkItemId ?? issue.issueKey).toLowerCase();
  if (checkId.includes("slow_") || checkId.includes("quest_page")) {
    return "quest_session";
  }
  if (checkId.includes("map")) return "world_map";
  if (
    checkId.includes("jargon") ||
    checkId.includes("plain") ||
    checkId.includes("human_first")
  ) {
    return "learning_quality";
  }
  if (checkId.includes("communication")) return "communication_quality";
  if (
    checkId.includes("quest_answer") ||
    checkId.includes("empty") ||
    checkId.includes("placeholder")
  ) {
    return "content_completeness";
  }

  const auditCat = meta.auditCategory as string | undefined;
  if (auditCat) {
    for (const [domainId, cat] of Object.entries(DOMAIN_TO_AUDIT_CATEGORY)) {
      if (cat === auditCat) return domainId as HealthDomainId;
    }
  }

  return "content_completeness";
}

export function domainLabelForId(domainId: HealthDomainId): string {
  return DOMAIN_BY_ID[domainId]?.label ?? domainId;
}

export function isDeveloperDomain(domainId: HealthDomainId): boolean {
  return DEVELOPER_DOMAIN_IDS.has(domainId);
}

export function isActionAllowedForDomain(
  action: FixActionId,
  domainId: HealthDomainId
): boolean {
  return DOMAIN_ALLOWED_FIX_ACTIONS[domainId]?.includes(action) ?? false;
}

export function filterActionsForDomain(
  actions: FixActionId[],
  domainId: HealthDomainId
): FixActionId[] {
  return actions.filter((a) => isActionAllowedForDomain(a, domainId));
}
