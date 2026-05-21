"use client";

import { useCallback, type ReactNode } from "react";
import { GameProvider } from "@/components/GameProvider";
import { QuestContentCatalogProvider } from "@/components/platform/QuestContentCatalogProvider";
import type { GameAction, GameState, RewardEvent } from "@/engine";
import {
  telemetryFromGameAction,
  telemetryFromRewardEvents
} from "@/lib/analytics/telemetryFromEngine";

type Props = {
  children: ReactNode;
};

/**
 * Wraps `GameProvider` and forwards engine actions to Supabase analytics.
 * TODO: Replace demo user/partner ids with auth + org claims.
 */
export function AnalyticsTelemetryBridge({ children }: Props) {
  const onAction = useCallback(
    (input: {
      action: GameAction;
      state: GameState;
      events: RewardEvent[];
    }) => {
      telemetryFromGameAction(input.action, input.state);
      telemetryFromRewardEvents(input.events, input.state);
    },
    []
  );

  return (
    <QuestContentCatalogProvider>
      <GameProvider onAction={onAction}>{children}</GameProvider>
    </QuestContentCatalogProvider>
  );
}
