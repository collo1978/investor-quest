"use client";

import { ConvictionQueueHost } from "@/components/conviction";
import { ToastHost } from "@/components/ToastHost";
import { useOptionalGame } from "@/components/GameProvider";
import { pillarById } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { NVDA_UNLOCK_FX } from "@/lib/demo/nvidiaDemoVoice";
import { LevelUpFx, UnlockFx, QuestCompletionFx } from "@/ui";

/**
 * Game feedback layer for `/schools/demo/*` — mirrors AppShell FX without learner chrome.
 */
export function SchoolsDemoGameFx() {
  const game = useOptionalGame();
  if (!game) return null;

  const { fx } = game;

  const unlockedPillarTitle = (() => {
    if (!fx.unlockTitle) return undefined;
    try {
      return pillarById(fx.unlockTitle as Parameters<typeof pillarById>[0])
        .title;
    } catch {
      return fx.unlockTitle;
    }
  })();

  return (
    <>
      <ToastHost />
      <ConvictionQueueHost />
      <LevelUpFx
        triggerKey={fx.levelUpKey}
        detail={fx.level ? `Reached Level ${fx.level}` : undefined}
      />
      <UnlockFx
        triggerKey={fx.unlockKey}
        title={unlockedPillarTitle ?? "New island"}
        detail={
          CONTROLLED_DEMO_MODE
            ? NVDA_UNLOCK_FX.detail
            : "The bridge is live — continue your expedition on the map."
        }
      />
      <QuestCompletionFx
        triggerKey={fx.completionKey}
        xpGained={fx.completionXp ?? undefined}
      />
    </>
  );
}
