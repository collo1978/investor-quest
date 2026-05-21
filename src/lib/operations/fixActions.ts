import type { FixActionId } from "@/lib/gameHealth/types";

export type OpsFixActionCopy = {
  action: FixActionId;
  label: string;
  description: string;
  variant: "primary" | "secondary" | "danger";
};

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

export function sortFixActionsForIssue(
  fixAction: string | null
): OpsFixActionCopy[] {
  if (!fixAction) return OPS_FIX_ACTIONS;

  const primary = OPS_FIX_ACTIONS.find((a) => a.action === fixAction);
  const rest = OPS_FIX_ACTIONS.filter((a) => a.action !== fixAction);
  return primary ? [primary, ...rest] : OPS_FIX_ACTIONS;
}
