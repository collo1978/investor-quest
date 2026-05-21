"use client";

import { sortFixActionsForIssue } from "@/lib/operations/fixActions";
import type { FixActionId } from "@/lib/gameHealth/types";

import { OpsTouchButton } from "./OpsTouchButton";

export function OpsFixActionList({
  recommendedAction,
  busy,
  onRun
}: {
  recommendedAction: string | null;
  busy: FixActionId | null;
  onRun: (action: FixActionId) => void;
}) {
  const actions = sortFixActionsForIssue(recommendedAction);

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
