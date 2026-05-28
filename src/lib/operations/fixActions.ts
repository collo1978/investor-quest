import { filterActionsForDomain, inferIssueDomainId } from "@/lib/operations/issueDomain";
import { buildOperatorRepairGuide } from "@/lib/operations/operatorRepairGuide";
import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";

export type OpsFixActionCopy = {
  action: FixActionId;
  label: string;
  description: string;
  variant: "primary" | "secondary" | "danger";
};

const OPERATOR_COPY: Record<
  FixActionId,
  { label: string; description: string; variant: OpsFixActionCopy["variant"] }
> = {
  retry_generation: {
    label: "Regenerate affected card",
    description: "Writes a fresh AI answer for the flagged quest card.",
    variant: "primary"
  },
  use_cached_answer: {
    label: "Keep last saved answer",
    description: "Shows the previous answer without regenerating.",
    variant: "secondary"
  },
  clear_and_regenerate: {
    label: "Clear and regenerate card",
    description: "Removes the current answer and creates a new one.",
    variant: "danger"
  },
  enable_fast_mode: {
    label: "Enable demo fast mode",
    description: "Speeds up AI during demos. Turn off afterward for best quality.",
    variant: "primary"
  },
  disable_heavy_checks: {
    label: "Emergency faster saves",
    description: "Demo only — skips language quality checks.",
    variant: "danger"
  },
  verify_resolution: {
    label: "Verify fix",
    description: "Re-checks this issue and shows whether the domain score improved.",
    variant: "secondary"
  },
  mark_resolved: {
    label: "Mark as handled",
    description: "Dismiss after you confirmed players are unblocked.",
    variant: "secondary"
  },
  repair_quest_progress: {
    label: "Repair quest progress",
    description: "Marks all cards as read so the quiz can unlock on this device.",
    variant: "primary"
  },
  unlock_quest_quiz: {
    label: "Unlock quiz on this device",
    description: "Force-read all cards for this quest.",
    variant: "primary"
  },
  reset_quest_progress: {
    label: "Reset quest on this device",
    description: "Clears read progress for this quest.",
    variant: "danger"
  },
  recheck_quest_flow: {
    label: "Re-run quest flow check",
    description: "Runs Mission Control checks for quiz unlock rules.",
    variant: "secondary"
  }
};

export function operatorFixActionCopy(action: FixActionId): OpsFixActionCopy {
  const c = OPERATOR_COPY[action];
  return { action, ...c };
}

export function isQuestFlowIssue(issue: GameHealthIssueRecord | null): boolean {
  return (
    issue?.issueKey.startsWith("quest_flow:") === true ||
    issue?.metadata?.category === "quest_flow"
  );
}

/** Domain-scoped actions only — one primary + verify. */
export function operatorFixActionsForIssue(
  issue: GameHealthIssueRecord
): OpsFixActionCopy[] {
  const guide = buildOperatorRepairGuide(issue);
  const domainId = inferIssueDomainId(issue);
  const ids: FixActionId[] = [];

  if (guide.primaryActionId) ids.push(guide.primaryActionId);
  if (filterActionsForDomain(["verify_resolution"], domainId).length > 0) {
    ids.push("verify_resolution");
  }
  if (
    guide.fixType === "developer_required" &&
    !ids.includes("mark_resolved")
  ) {
    ids.push("mark_resolved");
  }

  const unique = [...new Set(filterActionsForDomain(ids, domainId))];
  return unique.map((id) => {
    const copy = operatorFixActionCopy(id);
    if (id === guide.primaryActionId) {
      return { ...copy, label: guide.primaryActionLabel };
    }
    return copy;
  });
}

/** @deprecated */
export const QUEST_FLOW_FIX_ACTIONS: OpsFixActionCopy[] = [
  operatorFixActionCopy("repair_quest_progress"),
  operatorFixActionCopy("verify_resolution")
];

/** @deprecated */
export const OPS_FIX_ACTIONS: OpsFixActionCopy[] = [
  operatorFixActionCopy("retry_generation"),
  operatorFixActionCopy("verify_resolution"),
  operatorFixActionCopy("mark_resolved")
];

/** @deprecated */
export function fixActionsForIssue(
  issue: GameHealthIssueRecord | null,
  _recommendedAction: string | null
): OpsFixActionCopy[] {
  if (!issue) return OPS_FIX_ACTIONS;
  return operatorFixActionsForIssue(issue);
}

export function sortFixActionsForIssue(_fixAction: string | null): OpsFixActionCopy[] {
  return OPS_FIX_ACTIONS;
}
