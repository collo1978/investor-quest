"use client";

import { usePathname } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { GameProvider } from "@/components/GameProvider";
import { DemoStoryOrchestrator } from "@/components/demo/DemoStoryOrchestrator";
import { DemoStoryProvider } from "@/components/demo/DemoStoryProvider";
import { SchoolsDemoStoryOrchestrator } from "@/components/schools/SchoolsDemoStoryOrchestrator";
import { SchoolsDemoStoryProvider } from "@/components/schools/SchoolsDemoStoryProvider";
import { QuestContentCatalogProvider } from "@/components/platform/QuestContentCatalogProvider";
import type { GameAction, GameState, RewardEvent } from "@/engine";
import {
  telemetryFromGameAction,
  telemetryFromRewardEvents
} from "@/lib/analytics/telemetryFromEngine";
import { isSchoolsDemoProtectedPath } from "@/lib/schools/schoolsDemoProtection";

type Props = {
  children: ReactNode;
};

/**
 * Wraps `GameProvider` and forwards engine actions to Supabase analytics.
 * TODO: Replace demo user/partner ids with auth + org claims.
 */
export function AnalyticsTelemetryBridge({ children }: Props) {
  const pathname = usePathname();
  const telemetryEnabled = !isSchoolsDemoProtectedPath(pathname);

  const onAction = useCallback(
    (input: {
      action: GameAction;
      state: GameState;
      events: RewardEvent[];
    }) => {
      if (!telemetryEnabled) return;
      telemetryFromGameAction(input.action, input.state);
      telemetryFromRewardEvents(input.events, input.state);
    },
    [telemetryEnabled]
  );

  return (
    <QuestContentCatalogProvider>
      <GameProvider onAction={onAction}>
        <DemoStoryProvider>
          <SchoolsDemoStoryProvider>
            <DemoStoryOrchestrator />
            <SchoolsDemoStoryOrchestrator />
            {children}
          </SchoolsDemoStoryProvider>
        </DemoStoryProvider>
      </GameProvider>
    </QuestContentCatalogProvider>
  );
}
