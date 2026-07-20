"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BusinessIslandBonusInvestigation } from "@/components/business/hub/BusinessIslandBonusInvestigation";
import { BusinessIslandLocationExperience } from "@/components/business/hub/BusinessIslandLocationExperience";
import { BusinessIslandNvidiaCampusAtmosphere } from "@/components/business/hub/BusinessIslandNvidiaCampusAtmosphere";
import { BusinessIslandStoryLocationDock } from "@/components/business/hub/BusinessIslandStoryLocationDock";
import { BusinessIslandStoryLocationMarker } from "@/components/business/hub/BusinessIslandStoryLocationMarker";
import type { Company } from "@/data/companies";
import {
  digDeeperKey,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";
import { resolveLocationExperience } from "@/lib/business/businessIslandLocationExperience";
import {
  BUSINESS_ISLAND_CAMPUS_HUB,
  BUSINESS_ISLAND_STORY_LOCATIONS,
  buildBusinessIslandSpokePathD,
  businessIslandStoryLocationPosition,
  type BusinessIslandStoryLocationDef,
  type BusinessIslandStoryLocationId
} from "@/lib/business/businessIslandStoryLocations";
import {
  BUSINESS_ISLAND_STORY_PROGRESS_EVENT,
  completeBonusInvestigation,
  isBusinessIslandDistrictCleared,
  markBusinessIslandStoryLocationVisited,
  markInvestorNotebookQuestionMastered,
  readBusinessIslandStoryProgress,
  resolveActiveBusinessIslandStoryLocationId,
  resolveBusinessIslandStoryLocationState,
  resolveClearedBusinessIslandDistrictIds,
  resolveNextBusinessIslandStoryLocation,
  type BonusInvestigationRef
} from "@/lib/business/businessIslandStoryProgress";
import { resolveBonusInvestigationPrompt } from "@/lib/business/businessIslandBonusInvestigations";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import {
  XP_CHECKLIST_MASTERY,
  XP_DIG_DEEPER_CHALLENGE
} from "@/engine/progression/xpEconomy";
import { useOptionalGame } from "@/components/GameProvider";

type Props = {
  company: Company;
  partnerId?: string;
  userId?: string;
  /** Retained for hub layout compatibility — journey stays on-island. */
  onBeforeQuestNavigate?: (href: string) => void;
  /** Checklist opens this campus district. */
  openLocationId?: BusinessIslandStoryLocationId | null;
  /** Optional mission to open inside the district. */
  openQuestionId?: InvestorNotebookQuestionId | null;
  onOpenLocationConsumed?: () => void;
};

type TravelBeat = {
  fromId: BusinessIslandStoryLocationId;
  next: BusinessIslandStoryLocationDef | null;
  evidenceLabel: string;
};

function parsePercent(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * NVIDIA campus districts — few landmarks, clear path, missions inside each district.
 */
export function BusinessIslandStoryMarkers({
  company,
  partnerId,
  userId,
  onBeforeQuestNavigate,
  openLocationId = null,
  openQuestionId = null,
  onOpenLocationConsumed
}: Props) {
  const game = useOptionalGame();
  const reduceMotion = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState<BusinessIslandStoryLocationId | null>(
    null
  );
  const [insideId, setInsideId] = useState<BusinessIslandStoryLocationId | null>(
    null
  );
  const [focusQuestionId, setFocusQuestionId] =
    useState<InvestorNotebookQuestionId | null>(null);
  const [travel, setTravel] = useState<TravelBeat | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeBonus, setActiveBonus] = useState<BonusInvestigationRef | null>(
    null
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const progress = useMemo(
    () => readBusinessIslandStoryProgress(company.id),
    [company.id, tick]
  );
  const cleared = useMemo(
    () => resolveClearedBusinessIslandDistrictIds(progress),
    [progress]
  );
  const activeId = useMemo(
    () => resolveActiveBusinessIslandStoryLocationId(cleared),
    [cleared]
  );
  const selected = useMemo(
    () =>
      selectedId
        ? BUSINESS_ISLAND_STORY_LOCATIONS.find((loc) => loc.id === selectedId) ??
          null
        : null,
    [selectedId]
  );
  const inside = useMemo(
    () =>
      insideId
        ? BUSINESS_ISLAND_STORY_LOCATIONS.find((loc) => loc.id === insideId) ??
          null
        : null,
    [insideId]
  );

  const pendingBonus = progress.pendingBonus;
  const hqLocation = useMemo(
    () =>
      BUSINESS_ISLAND_STORY_LOCATIONS.find((loc) => loc.id === "district-hq") ??
      null,
    []
  );
  // Sits just above the Headquarters node — the Bonus Investigation belongs to HQ.
  const bonusMarkerPos = useMemo(() => {
    if (!hqLocation) return null;
    const pos = businessIslandStoryLocationPosition(hqLocation, mobile);
    return {
      left: `${parsePercent(pos.left)}%`,
      top: `${Math.max(parsePercent(pos.top) - 14, 4)}%`
    };
  }, [hqLocation, mobile]);
  const bonusPrompt = useMemo(
    () =>
      pendingBonus
        ? resolveBonusInvestigationPrompt(
            pendingBonus.questionId,
            pendingBonus.index,
            company.name
          )
        : "",
    [pendingBonus, company.name]
  );
  const showBonusMarker =
    Boolean(pendingBonus) && !inside && !activeBonus && Boolean(bonusMarkerPos);

  const pathPoints = useMemo(
    () =>
      BUSINESS_ISLAND_STORY_LOCATIONS.map((location) => {
        const pos = businessIslandStoryLocationPosition(location, mobile);
        return {
          id: location.id,
          x: parsePercent(pos.left),
          y: parsePercent(pos.top)
        };
      }),
    [mobile]
  );

  const litCount = useMemo(() => {
    let count = 0;
    for (const location of BUSINESS_ISLAND_STORY_LOCATIONS) {
      const state = resolveBusinessIslandStoryLocationState(
        location.id,
        cleared,
        activeId
      );
      if (state === "locked") break;
      count += 1;
    }
    return Math.max(count, cleared.size > 0 ? 1 : 0);
  }, [cleared, activeId]);

  useEffect(() => {
    if (insideId) {
      setPan({ x: 0, y: 0 });
      return;
    }
    const focusId = travel?.next?.id ?? selectedId ?? activeId;
    if (!focusId || reduceMotion) {
      setPan({ x: 0, y: 0 });
      return;
    }
    const location = BUSINESS_ISLAND_STORY_LOCATIONS.find((loc) => loc.id === focusId);
    if (!location) return;
    const pos = businessIslandStoryLocationPosition(location, mobile);
    const x = parsePercent(pos.left);
    const y = parsePercent(pos.top);
    setPan({
      x: (50 - x) * 0.14,
      y: (52 - y) * 0.12
    });
  }, [selectedId, activeId, mobile, reduceMotion, travel, insideId]);

  useEffect(() => {
    if (!travel) return;
    const delay = reduceMotion ? 500 : 2200;
    const t = window.setTimeout(() => setTravel(null), delay);
    return () => window.clearTimeout(t);
  }, [travel, reduceMotion]);

  const handleEnterPlace = useCallback(
    (location: BusinessIslandStoryLocationDef, questionId?: InvestorNotebookQuestionId | null) => {
      setSelectedId(null);
      setFocusQuestionId(questionId ?? null);
      setInsideId(location.id);
      trackUserEvent({
        eventType: "user_started_quest",
        pillar: "Business",
        questId: location.id,
        companyTicker: company.ticker,
        companyName: company.name,
        partnerId,
        userId,
        metadata: {
          questTitle: location.chapterTitle,
          orderNumber: location.order,
          entry: "island-district-experience",
          placeTheme: location.placeTheme,
          roomName: resolveLocationExperience(location.id).roomName,
          focusQuestionId: questionId ?? null
        }
      });
    },
    [company, partnerId, userId]
  );

  const handleSelect = useCallback(
    (location: BusinessIslandStoryLocationDef) => {
      if (location.id === "district-hq") {
        handleEnterPlace(location);
        return;
      }
      setSelectedId(location.id);
    },
    [handleEnterPlace]
  );

  useEffect(() => {
    if (!openLocationId) return;
    const location = BUSINESS_ISLAND_STORY_LOCATIONS.find(
      (loc) => loc.id === openLocationId
    );
    const questionId = openQuestionId;
    onOpenLocationConsumed?.();
    if (!location) return;
    handleEnterPlace(location, questionId);
  }, [
    openLocationId,
    openQuestionId,
    onOpenLocationConsumed,
    handleEnterPlace
  ]);

  const handleMissionMastered = useCallback(
    (questionId: InvestorNotebookQuestionId) => {
      const before = readBusinessIslandStoryProgress(company.id);
      if (before.masteredQuestionIds.includes(questionId)) return;
      markInvestorNotebookQuestionMastered(company.id, questionId);
      game?.actions.awardBonusXp(
        XP_CHECKLIST_MASTERY,
        `Checklist mastery: ${questionId}`
      );

      const location = inside;
      if (location) {
        const after = readBusinessIslandStoryProgress(company.id);
        if (
          isBusinessIslandDistrictCleared(location.id, after) &&
          !after.visitedLocationIds.includes(location.id)
        ) {
          markBusinessIslandStoryLocationVisited(company.id, location.id);
          const next = resolveNextBusinessIslandStoryLocation(location.id);
          setTravel({
            fromId: location.id,
            next,
            evidenceLabel: `${location.placeName} complete`
          });
        }
      }
      setTick((n) => n + 1);
    },
    [company.id, game, inside]
  );

  const handleLeavePlace = useCallback(
    (markVisited: boolean) => {
      const location = inside;
      setInsideId(null);
      setFocusQuestionId(null);
      if (!location || !markVisited) return;
      const latest = readBusinessIslandStoryProgress(company.id);
      if (!isBusinessIslandDistrictCleared(location.id, latest)) return;
      if (latest.visitedLocationIds.includes(location.id)) return;

      markBusinessIslandStoryLocationVisited(company.id, location.id);
      const next = resolveNextBusinessIslandStoryLocation(location.id);
      setTravel({
        fromId: location.id,
        next,
        evidenceLabel: `${location.placeName} complete`
      });
    },
    [inside, company.id]
  );

  const handleOpenBonus = useCallback(() => {
    if (!pendingBonus) return;
    setSelectedId(null);
    setActiveBonus(pendingBonus);
  }, [pendingBonus]);

  const handleBonusSolved = useCallback(() => {
    if (!activeBonus) return;
    const result = completeBonusInvestigation(
      company.id,
      activeBonus.questionId,
      activeBonus.index
    );
    if (result) {
      game?.actions.awardBonusXp(
        XP_DIG_DEEPER_CHALLENGE,
        `Bonus Investigation: ${digDeeperKey(activeBonus.questionId, activeBonus.index)}`
      );
    }
    setTick((n) => n + 1);
  }, [activeBonus, company.id, game]);

  const handleBonusExit = useCallback(() => {
    setActiveBonus(null);
  }, []);

  return (
    <div
      className={[
        "iq-business-island-story-markers pointer-events-none",
        inside ? "iq-business-island-story-markers--inside" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${company.name} NVIDIA innovation campus`}
    >
      <motion.div
        className="iq-business-island-story-stage"
        animate={{
          x: `${pan.x}%`,
          y: `${pan.y}%`,
          opacity: inside ? 0.22 : 1,
          scale: inside ? 1.05 : 1
        }}
        transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <BusinessIslandNvidiaCampusAtmosphere />

        {/* Progress glow only — circuit roads live in the campus plate art */}
        <svg
          className="iq-business-island-story-path"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <circle
            className="iq-business-island-story-path__hub"
            cx={BUSINESS_ISLAND_CAMPUS_HUB.x}
            cy={BUSINESS_ISLAND_CAMPUS_HUB.y}
            r={2.2}
          />
          {pathPoints.map((point, index) => {
            if (index >= litCount) return null;
            const spokeD = buildBusinessIslandSpokePathD(
              BUSINESS_ISLAND_CAMPUS_HUB,
              point
            );
            return (
              <path
                key={`spoke-lit-${point.id}`}
                className="iq-business-island-story-path__spoke iq-business-island-story-path__spoke--lit"
                d={spokeD}
                fill="none"
              />
            );
          })}
        </svg>

        {BUSINESS_ISLAND_STORY_LOCATIONS.map((location) => {
          const pos = businessIslandStoryLocationPosition(location, mobile);
          const state = resolveBusinessIslandStoryLocationState(
            location.id,
            cleared,
            activeId
          );
          const masteredInDistrict = location.notebookQuestionIds.filter((id) =>
            progress.masteredQuestionIds.includes(id)
          ).length;
          return (
            <BusinessIslandStoryLocationMarker
              key={location.id}
              location={location}
              left={pos.left}
              top={pos.top}
              state={state}
              companyName={company.name}
              missionsDone={masteredInDistrict}
              missionsTotal={location.notebookQuestionIds.length}
              onSelect={handleSelect}
            />
          );
        })}

        {showBonusMarker && bonusMarkerPos ? (
          <motion.button
            type="button"
            className="iq-business-island-bonus-marker pointer-events-auto"
            style={{ left: bonusMarkerPos.left, top: bonusMarkerPos.top }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleOpenBonus}
            aria-label={`Start Bonus Investigation: ${bonusPrompt}`}
          >
            <span className="iq-business-island-bonus-marker__pulse" aria-hidden />
            <span className="iq-business-island-bonus-marker__badge" aria-hidden>
              🔍
            </span>
            <span className="iq-business-island-bonus-marker__label">
              Bonus Investigation
            </span>
          </motion.button>
        ) : null}
      </motion.div>

      {!inside ? (
        <BusinessIslandStoryLocationDock
          location={selected}
          companyName={company.name}
          state={
            selected
              ? resolveBusinessIslandStoryLocationState(
                  selected.id,
                  cleared,
                  activeId
                )
              : null
          }
          masteredCount={
            selected
              ? selected.notebookQuestionIds.filter((id) =>
                  progress.masteredQuestionIds.includes(id)
                ).length
              : 0
          }
          onClose={() => setSelectedId(null)}
          onContinue={(loc) => handleEnterPlace(loc)}
        />
      ) : null}

      <AnimatePresence>
        {inside ? (
          <BusinessIslandLocationExperience
            key={inside.id}
            location={inside}
            companyId={company.id}
            companyName={company.name}
            alreadyExplored={cleared.has(inside.id)}
            masteredQuestionIds={progress.masteredQuestionIds}
            focusQuestionId={focusQuestionId}
            onBeforeQuestNavigate={onBeforeQuestNavigate}
            onMissionMastered={handleMissionMastered}
            onLeave={handleLeavePlace}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeBonus ? (
          <BusinessIslandBonusInvestigation
            key={digDeeperKey(activeBonus.questionId, activeBonus.index)}
            companyName={company.name}
            questionId={activeBonus.questionId}
            index={activeBonus.index}
            onSolved={handleBonusSolved}
            onExit={handleBonusExit}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {travel && !inside ? (
          <motion.div
            key={`${travel.fromId}-travel`}
            className="iq-business-island-story-travel pointer-events-none"
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="iq-business-island-story-travel__evidence">
              {travel.evidenceLabel}
            </p>
            {travel.next ? (
              <>
                <p className="iq-business-island-story-travel__next-label">
                  Next district unlocked
                </p>
                <p className="iq-business-island-story-travel__next-place">
                  {travel.next.placeName}
                </p>
                <p className="iq-business-island-story-travel__next-room">
                  {travel.next.missionLine.replace(/NVIDIA/g, company.name)}
                </p>
              </>
            ) : (
              <p className="iq-business-island-story-travel__next-place">
                Campus journey complete
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
