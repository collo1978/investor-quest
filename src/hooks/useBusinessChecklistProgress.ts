"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useGame } from "@/components/GameProvider";
import type { CompanyId } from "@/data/companies";
import { buildBusinessHubCards } from "@/lib/business/buildBusinessHubCards";
import {
  resolveBusinessInvestorChecklistSnapshot,
  type BusinessInvestorChecklistSnapshot
} from "@/lib/business/businessInvestorFramework";
import {
  BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT,
  readBusinessInvestorFrameworkState
} from "@/lib/business/businessInvestorFrameworkStorage";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";

type Options = {
  companyId: CompanyId;
  currentQuestSlug?: string | null;
  currentQuestProgressPct?: number;
  cards?: readonly BusinessHubQuestCard[];
};

/** Reactive Business Investor Checklist — sections, principles, rollup ratings. */
export function useBusinessChecklistProgress({
  companyId,
  currentQuestSlug = null,
  currentQuestProgressPct = 0,
  cards: cardsOverride
}: Options): {
  snapshot: BusinessInvestorChecklistSnapshot;
  cards: readonly BusinessHubQuestCard[];
  refresh: () => void;
} {
  const { raw } = useGame();
  const { quests, readSet, questViewBySlug } = usePillarHubQuestData(
    "business",
    companyId
  );
  const [tick, setTick] = useState(0);
  const [stored, setStored] = useState(() =>
    readBusinessInvestorFrameworkState(companyId)
  );

  const refresh = useCallback(() => {
    setStored(readBusinessInvestorFrameworkState(companyId));
    setTick((n) => n + 1);
  }, [companyId]);

  useEffect(() => {
    const onReset = () => refresh();
    const onFrameworkChange = () => refresh();
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onReset);
    window.addEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, onFrameworkChange);
    window.addEventListener("storage", onFrameworkChange);
    return () => {
      window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onReset);
      window.removeEventListener(
        BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT,
        onFrameworkChange
      );
      window.removeEventListener("storage", onFrameworkChange);
    };
  }, [refresh]);

  const companyProgress = raw.companies[companyId];
  const questCompletedAtBySlug =
    companyProgress?.pillars.business?.completedAt ?? {};
  const completedQuestSlugs =
    companyProgress?.pillars.business?.completedQuestSlugs ?? [];

  const cards = useMemo(() => {
    if (cardsOverride) return cardsOverride;
    return buildBusinessHubCards(
      quests,
      questViewBySlug,
      readSet,
      questCompletedAtBySlug,
      stored
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick busts cache after demo reset
  }, [
    cardsOverride,
    quests,
    questViewBySlug,
    readSet,
    questCompletedAtBySlug,
    stored,
    tick
  ]);

  const snapshot = useMemo(
    () =>
      resolveBusinessInvestorChecklistSnapshot({
        companyId,
        stored,
        cards,
        completedQuestSlugs,
        currentQuestSlug,
        currentQuestProgressPct
      }),
    [
      companyId,
      stored,
      cards,
      completedQuestSlugs,
      currentQuestSlug,
      currentQuestProgressPct
    ]
  );

  return { snapshot, cards, refresh };
}
