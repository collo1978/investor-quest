"use client";

import { fixActionsForIssue } from "@/lib/operations/fixActions";
import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";

import { OpsTouchButton } from "./OpsTouchButton";

export function OpsFixActionList({
  issue,
  recommendedAction,
  busy,
  onRun
}: {
  issue?: GameHealthIssueRecord | null;
  recommendedAction: string | null;
  busy: FixActionId | null;
  onRun: (action: FixActionId) => void;
}) {
  const actions = fixActionsForIssue(issue ?? null, recommendedAction);

  return (
    <div className="space-y-3">
      {actions.map((btn, index) => (
        <OpsTouchButton
          key={btn.action}
          variant={index === 0 ? btn.variant : "secondary"}
          disabled={Boolean(busy)}
          onClick={() => onRun(btn.action)}
          description={btn.description}
        >
          {busy === btn.action ? "Working…" : btn.label}
        </OpsTouchButton>
      ))}
    </div>
  );
}
