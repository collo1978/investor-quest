"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { BusinessQuestMapCard } from "@/components/business/BusinessQuestMapCard";
import { BusinessInvestorNotebookPanel } from "@/components/business/hub/BusinessInvestorNotebookPanel";
import { BusinessIslandQuestHud } from "@/components/business/hub/BusinessIslandQuestHud";
import { BusinessIslandStoryMarkers } from "@/components/business/hub/BusinessIslandStoryMarkers";
import { MasterInvestingPrinciplesPanel } from "@/components/business/hub/MasterInvestingPrinciplesPanel";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import {
  BUSINESS_ISLAND_STORY_LOCATIONS,
  primaryLocationForNotebookQuestion,
  type BusinessIslandStoryLocationId
} from "@/lib/business/businessIslandStoryLocations";
import {
  BUSINESS_ISLAND_STORY_PROGRESS_EVENT,
  isInvestorNotebookQuestionUnlocked,
  readBusinessIslandStoryProgress
} from "@/lib/business/businessIslandStoryProgress";
import { resolveBusinessHubJourney } from "@/lib/business/resolveBusinessHubJourney";
import type { Company } from "@/data/companies";

import { PRODIGY_MAP_ISLANDS } from "@/lib/schools/schoolsProdigyMapConfig";

type HubEntryPhase = "preview" | "entering" | "revealed";

type Props = {
  cards: readonly BusinessHubQuestCard[];
  company: Company;
  partnerId?: string;
  userId?: string;
  hubProgressPct: number;
  completedCards: number;
  celebrateFrom?: number | null;
  celebrateQuestSlug?: string | null;
  /** Gameplay UI fades in after the island camera settles. */
  uiRevealed?: boolean;
  cameraSettled?: boolean;
  /** Map zoom handoff — learner taps ENTER before gameplay UI appears. */
  entryGateActive?: boolean;
  entryPhase?: HubEntryPhase;
  /** Map camera hub — physical props on the zoomed island (not floating panels). */
  mapCameraHub?: boolean;
  /** HQ zoom beat before navigating to a quest. */
  onBeforeQuestNavigate?: (href: string) => void;
  onEnterHub?: () => void;
};

/**
 * Business Island game level — HQ centrepiece with quest, principles and progress
 * layered on the island environment (not dashboard chrome).
 */
export function SchoolsBusinessHubIslandLayout({
  cards,
  company,
  partnerId,
  userId,
  hubProgressPct,
  completedCards,
  celebrateFrom = null,
  celebrateQuestSlug = null,
  uiRevealed = true,
  cameraSettled = true,
  entryGateActive = false,
  entryPhase = "revealed",
  mapCameraHub = false,
  onBeforeQuestNavigate,
  onEnterHub
}: Props) {
  const reduceMotion = useReducedMotion();
  const [storyTick, setStoryTick] = useState(0);
  const [openLocationId, setOpenLocationId] =
    useState<BusinessIslandStoryLocationId | null>(null);
  const [openQuestionId, setOpenQuestionId] =
    useState<InvestorNotebookQuestionId | null>(null);

  const handleOpenMasteryQuestion = (questionId: InvestorNotebookQuestionId) => {
    const progress = readBusinessIslandStoryProgress(company.id);
    if (
      !progress.masteredQuestionIds.includes(questionId) &&
      !isInvestorNotebookQuestionUnlocked(questionId, progress)
    ) {
      return;
    }
    const place = primaryLocationForNotebookQuestion(questionId);
    if (!place) return;
    setOpenQuestionId(questionId);
    setOpenLocationId(place.id);
  };
  const businessIslandMeta = PRODIGY_MAP_ISLANDS.find((i) => i.id === "business");
  const entrySignStyle = businessIslandMeta
    ? ({
        ["--zone-accent" as string]: businessIslandMeta.path,
        ["--zone-edge" as string]: businessIslandMeta.landEdge,
        ["--zone-glow" as string]: businessIslandMeta.glow
      } as CSSProperties)
    : undefined;
  const { current } = useMemo(() => resolveBusinessHubJourney(cards), [cards]);
  const allComplete = current.completed && cards.every((c) => c.completed);

  useEffect(() => {
    if (!mapCameraHub) return;
    const bump = () => setStoryTick((n) => n + 1);
    window.addEventListener(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, [mapCameraHub]);

  const storyVisitedCount = useMemo(() => {
    if (!mapCameraHub) return completedCards;
    const progress = readBusinessIslandStoryProgress(company.id);
    return BUSINESS_ISLAND_STORY_LOCATIONS.filter((loc) =>
      loc.notebookQuestionIds.every((qid) =>
        progress.masteredQuestionIds.includes(qid)
      )
    ).length;
  }, [mapCameraHub, company.id, storyTick, completedCards]);
  const storyTotal = mapCameraHub
    ? BUSINESS_ISLAND_STORY_LOCATIONS.length
    : cards.length;

  const showUi = uiRevealed && cameraSettled;
  const showEntryCard = entryGateActive && entryPhase === "preview";
  const showLocationBadge = !showEntryCard && entryPhase !== "preview";

  const fadeIn = reduceMotion
    ? { initial: false, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: showUi ? 1 : 0 }
      };

  const riseIn = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0, scale: 1 } }
    : {
        initial: { opacity: 0, y: 12, scale: 0.94 },
        animate: {
          opacity: showUi ? 1 : 0,
          y: showUi ? 0 : 12,
          scale: showUi ? 1 : 0.94
        }
      };

  const questMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.92, y: 10 },
        animate: {
          opacity: showUi ? 1 : 0,
          scale: showUi ? 1 : 0.92,
          y: showUi ? 0 : 10
        },
        exit: { opacity: 0, scale: 0.96, y: -6 }
      };

  const principlesPanel = mapCameraHub ? (
    <div className="iq-schools-island-checklist-companion pointer-events-auto">
      <BusinessInvestorNotebookPanel
        companyId={company.id}
        onOpenMasteryQuestion={handleOpenMasteryQuestion}
      />
    </div>
  ) : (
    <div className="iq-schools-business-hub-island__principles pointer-events-auto">
      <MasterInvestingPrinciplesPanel
        companyId={company.id}
        variant="schools"
        presentation="island"
        cards={cards}
      />
    </div>
  );

  const missionBoard = (
    <>
      {!mapCameraHub ? (
        <>
          <span className="iq-schools-business-hub-island__quest-beam" aria-hidden />
          <span className="iq-schools-business-hub-island__quest-pin" aria-hidden />
          <p className="iq-schools-business-hub-island__slot-label iq-schools-business-hub-island__slot-label--quest">
            {allComplete ? "Island complete" : "Current Quest"}
          </p>
        </>
      ) : null}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          className={[
            "iq-schools-business-hub-island__quest-card pointer-events-auto",
            mapCameraHub ? "iq-schools-island-prop iq-schools-island-prop--mission-terminal" : ""
          ]
            .filter(Boolean)
            .join(" ")}
          {...questMotion}
          transition={{
            duration: celebrateQuestSlug ? 0.72 : 0.55,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {mapCameraHub ? (
            <>
              <span className="iq-schools-island-prop__kiosk-base" aria-hidden />
              <span className="iq-schools-island-prop__terminal-antenna" aria-hidden />
              <span className="iq-schools-island-prop__terminal-header" aria-hidden>
                Mission Board
              </span>
            </>
          ) : null}
          <BusinessQuestMapCard
            card={current}
            position={{}}
            company={company}
            partnerId={partnerId}
            userId={userId}
            staggerIndex={0}
            hubProgressPct={hubProgressPct}
            cardLayout="grid"
            journeyRole="current"
            onBeforeQuestNavigate={onBeforeQuestNavigate}
          />
        </motion.div>
      </AnimatePresence>
    </>
  );

  return (
    <div
      className={[
        "iq-schools-business-hub-island pointer-events-none absolute inset-0 z-[2]",
        mapCameraHub ? "overflow-visible" : "overflow-hidden",
        mapCameraHub ? "iq-schools-business-hub-island--map-camera" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showEntryCard ? (
        <motion.div
          className="iq-schools-business-hub-island__entry pointer-events-auto"
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="iq-prodigy-map__sign iq-schools-business-hub-island__entry-sign"
            style={entrySignStyle}
          >
            <span className="iq-prodigy-map__sign-title">Business Island</span>
            <span className="iq-prodigy-map__sign-sub">
              Travel through {company.name}&apos;s story
            </span>
            <div className="iq-prodigy-map__sign-row">
              <button
                type="button"
                className="iq-prodigy-map__chip iq-prodigy-map__chip--go iq-schools-business-hub-island__entry-enter"
                onClick={onEnterHub}
              >
                Enter
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Where am I? */}
      {showLocationBadge && !mapCameraHub ? (
      <motion.header
        className="iq-schools-business-hub-island__location pointer-events-none"
        {...fadeIn}
        transition={{ duration: 0.4, delay: showUi ? 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="iq-schools-business-hub-island__location-title">Business Island</p>
        <p className="iq-schools-business-hub-island__location-sub">
          Travel through {company.name}&apos;s story
        </p>
      </motion.header>
      ) : null}

      {/* Island progress — fixed HUD top-right in map-camera mode */}
      <motion.div
        className={[
          "iq-schools-business-hub-island__progress pointer-events-none",
          mapCameraHub ? "iq-schools-island-hud__progress" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        {...riseIn}
        transition={{ duration: 0.48, delay: showUi ? 0.12 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <BusinessIslandQuestHud
          completedCards={storyVisitedCount}
          totalCards={storyTotal}
          cards={cards}
          companyName={company.name}
          celebrateFrom={celebrateFrom}
          progressMode={mapCameraHub ? "places" : "quests"}
        />
      </motion.div>

      {mapCameraHub ? (
        <>
          <motion.aside
            className="iq-schools-island-hud__academy iq-schools-island-hud__academy--companion pointer-events-none"
            {...riseIn}
            transition={{ duration: 0.5, delay: showUi ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            {principlesPanel}
          </motion.aside>
          <motion.div
            className="iq-schools-island-hud__quest-markers pointer-events-none"
            {...riseIn}
            transition={{ duration: 0.52, delay: showUi ? 0.28 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <BusinessIslandStoryMarkers
              company={company}
              partnerId={partnerId}
              userId={userId}
              onBeforeQuestNavigate={onBeforeQuestNavigate}
              openLocationId={openLocationId}
              openQuestionId={openQuestionId}
              onOpenLocationConsumed={() => {
                setOpenLocationId(null);
                setOpenQuestionId(null);
              }}
            />
          </motion.div>
        </>
      ) : (
      <div className="iq-schools-business-hub-island__playfield" aria-hidden={false}>
        <div className="iq-schools-business-hub-island__path-glow pointer-events-none" aria-hidden />

        <motion.aside
          className="iq-schools-business-hub-island__principles-slot pointer-events-none"
          {...riseIn}
          transition={{ duration: 0.5, delay: showUi ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          {principlesPanel}
        </motion.aside>

        <motion.div
          className="iq-schools-business-hub-island__quest-slot pointer-events-none"
          {...riseIn}
          transition={{ duration: 0.52, delay: showUi ? 0.32 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          {missionBoard}
        </motion.div>
      </div>
      )}
    </div>
  );
}
