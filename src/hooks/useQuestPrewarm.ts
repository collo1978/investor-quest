"use client";

import { useEffect, useRef } from "react";

import { companyById } from "@/data/companies";
import { isClientFastQuestMode } from "@/lib/quests/questGenerationModeClient";
import {
  QUEST_PREWARM_TARGETS,
  prewarmQuestAnswers
} from "@/lib/quests/questPrewarmClient";

/** Prewarm entry-quest answers when the active company changes (non-blocking). */
export function useQuestPrewarm(companyId: string) {
  const lastTicker = useRef<string | null>(null);

  useEffect(() => {
    if (isClientFastQuestMode()) return;
    const company = companyById(companyId);
    if (!company?.ticker) return;
    if (lastTicker.current === company.ticker) return;
    lastTicker.current = company.ticker;

    const timer = window.setTimeout(() => {
      for (const target of QUEST_PREWARM_TARGETS) {
        void prewarmQuestAnswers(
          company.ticker,
          target.pillarId,
          target.questSlug
        );
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [companyId]);
}
