import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";

export type OpsFixActionCopy = {
  action: FixActionId;
  label: string;
  description: string;
  variant: "primary" | "secondary" | "danger";
};

/** Quest card → quiz progression fixes (Mission Control mobile). */
export const QUEST_FLOW_FIX_ACTIONS: OpsFixActionCopy[] = [
  {
    action: "repair_quest_progress",
    label: "Repair quest progress",
    description:
      "On this device, mark all quest cards as read so the quiz can unlock.",
    variant: "primary"
  },
  {
    action: "unlock_quest_quiz",
    label: "Unlock quiz for this quest",
    description: "Force-read all cards for this quest on this device.",
    variant: "primary"
  },
  {
    action: "reset_quest_progress",
    label: "Reset quest progress",
    description: "Clear read state for this quest on this device and start over.",
    variant: "danger"
  },
  {
    action: "recheck_quest_flow",
    label: "Recheck quest flow",
    description: "Run Mission Control checks again for quiz unlock rules.",
    variant: "secondary"
  },
  {
    action: "mark_resolved",
    label: "Mark as fixed",
    description: "Dismiss after you confirmed players can reach the quiz.",
    variant: "secondary"
  }
];

export const OPS_FIX_ACTIONS: OpsFixActionCopy[] = [
  {
    action: "retry_generation",
    label: "Retry answer",
    description: "Ask the AI to write this quest card again.",
    variant: "primary"
  },
  {
    action: "use_cached_answer",
    label: "Use last good answer",
    description: "Show the last saved answer instead of waiting on AI.",
    variant: "secondary"
  },
  {
    action: "clear_and_regenerate",
    label: "Clear & regenerate snapshot",
    description: "Remove the bad answer and create a fresh one.",
    variant: "danger"
  },
  {
    action: "enable_fast_mode",
    label: "Turn on fast mode",
    description: "Speed up AI for demos — fewer rewrite passes.",
    variant: "secondary"
  },
  {
    action: "disable_heavy_checks",
    label: "Pause strict language checks",
    description: "Emergency demo mode — answers save faster.",
    variant: "secondary"
  },
  {
    action: "mark_resolved",
    label: "Mark as fixed",
    description: "Dismiss this alert after you handled it.",
    variant: "secondary"
  }
];

export function isQuestFlowIssue(issue: GameHealthIssueRecord | null): boolean {
  return (
    issue?.issueKey.startsWith("quest_flow:") === true ||
    issue?.metadata?.category === "quest_flow"
  );
}

export function fixActionsForIssue(
  issue: GameHealthIssueRecord | null,
  recommendedAction: string | null
): OpsFixActionCopy[] {
  if (isQuestFlowIssue(issue)) {
    const primary = QUEST_FLOW_FIX_ACTIONS.find(
      (a) => a.action === recommendedAction
    );
    const rest = QUEST_FLOW_FIX_ACTIONS.filter((a) => a.action !== recommendedAction);
    return primary ? [primary, ...rest] : QUEST_FLOW_FIX_ACTIONS;
  }
  return sortFixActionsForIssue(recommendedAction);
}

export function sortFixActionsForIssue(
  fixAction: string | null
): OpsFixActionCopy[] {
  if (!fixAction) return OPS_FIX_ACTIONS;

  const primary = OPS_FIX_ACTIONS.find((a) => a.action === fixAction);
  const rest = OPS_FIX_ACTIONS.filter((a) => a.action !== fixAction);
  return primary ? [primary, ...rest] : OPS_FIX_ACTIONS;
}
