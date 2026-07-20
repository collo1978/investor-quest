"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { SchoolsBusinessHubIslandLayout } from "@/components/business/hub/SchoolsBusinessHubIslandLayout";
import { buildBusinessHubCards } from "@/lib/business/buildBusinessHubCards";
import {
  BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT,
  readBusinessInvestorFrameworkState
} from "@/lib/business/businessInvestorFrameworkStorage";
import { companyById, type CompanyId } from "@/data/companies";
import { initialCompanyProgress } from "@/engine/progression/state";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { getAnalyticsUserId } from "@/lib/analytics/identity";
import { markSchoolsBusinessIslandHubEntered } from "@/lib/schools/schoolsBusinessIslandZoomEnter";
import { consumeSchoolsHubCelebrateReturn } from "@/lib/schools/schoolsQuestRewardFlow";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

type Props = {
  onBackToMap: () => void;
  onQuestEnterRequest: (href: string) => void;
  onProgressTierChange?: (completedCards: number, totalCards: number) => void;
  uiVisible?: boolean;
};

/**
 * Gameplay UI only — physical props over the camera-zoomed Prodigy map island.
 */
export function SchoolsMapBusinessIslandHubUiOverlay({
  onBackToMap,
  onQuestEnterRequest,
  onProgressTierChange,
  uiVisible = true
}: Props) {
  const pathname = usePathname();
  const { state, raw, hydrated } = useGame();
  const [uiRevealed, setUiRevealed] = useState(false);
  const [hubCelebrateFrom, setHubCelebrateFrom] = useState<number | null>(null);
  const [checklistTick, setChecklistTick] = useState(0);
  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const userId = getAnalyticsUserId();

  const { partnerId, quests, readSet, questViewBySlug } =
    usePillarHubQuestData("business", companyId);

  const companyProgress =
    raw.companies[raw.activeCompanyId] ?? initialCompanyProgress();

  const questCompletedAtBySlug = useMemo(
    () => companyProgress.pillars.business?.completedAt ?? {},
    [companyProgress.pillars.business?.completedAt]
  );

  const checklistStored = useMemo(
    () => readBusinessInvestorFrameworkState(companyId),
    [companyId, checklistTick]
  );

  useEffect(() => {
    const bump = () => setChecklistTick((n) => n + 1);
    window.addEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const hubCards = useMemo(
    () =>
      buildBusinessHubCards(
        quests,
        questViewBySlug,
        readSet,
        questCompletedAtBySlug,
        checklistStored
      ),
    [quests, questViewBySlug, readSet, questCompletedAtBySlug, checklistStored]
  );

  const islandProgressPct = useMemo(() => {
    if (hubCards.length === 0) return 0;
    const sum = hubCards.reduce(
      (acc, c) => acc + (c.locked ? 0 : c.completed ? 100 : c.progressPct),
      0
    );
    return Math.round(sum / hubCards.length);
  }, [hubCards]);

  const completedCards = useMemo(
    () => hubCards.filter((c) => c.completed).length,
    [hubCards]
  );

  useEffect(() => {
    markSchoolsBusinessIslandHubEntered();
    preloadQuestDetailChunks();
    const revealTimer = window.setTimeout(() => setUiRevealed(true), 160);
    return () => window.clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    if (consumeSchoolsHubCelebrateReturn()) {
      setHubCelebrateFrom(completedCards > 0 ? completedCards - 1 : 0);
    }
  }, [pathname, completedCards]);

  useEffect(() => {
    onProgressTierChange?.(completedCards, hubCards.length);
  }, [completedCards, hubCards.length, onProgressTierChange]);

  if (!hydrated || hubCards.length === 0) {
    return null;
  }

  return (
    <div
      className={[
        "iq-schools-map-camera-hub-ui pointer-events-none absolute inset-0 z-[40] overflow-hidden",
        uiVisible ? "" : "iq-schools-map-camera-hub-ui--hq-zoom"
      ].join(" ")}
    >
      <SchoolsBusinessHubIslandLayout
        cards={hubCards}
        company={company}
        partnerId={partnerId}
        userId={userId}
        hubProgressPct={islandProgressPct}
        completedCards={completedCards}
        celebrateFrom={hubCelebrateFrom}
        uiRevealed={uiRevealed && uiVisible}
        cameraSettled={uiVisible}
        mapCameraHub
        onBeforeQuestNavigate={onQuestEnterRequest}
        entryGateActive={false}
        entryPhase="revealed"
      />

      <div
        className="pointer-events-none absolute bottom-3 left-2 z-[50] sm:bottom-4 sm:left-4"
        style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={onBackToMap}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[rgba(245,197,71,0.42)] bg-[rgba(8,7,4,0.88)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,229,141,0.96)] shadow-[0_0_20px_rgba(245,197,71,0.18)] backdrop-blur-md transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 sm:px-3.5 sm:py-2.5 sm:text-[11.5px]"
        >
          <span aria-hidden className="text-[14px] leading-none">
            ←
          </span>
          Back to map
        </button>
      </div>
    </div>
  );
}
