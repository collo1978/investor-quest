"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BusinessQuestMapCard } from "@/components/business/BusinessQuestMapCard";
import { BusinessIslandAcademySign } from "@/components/business/hub/BusinessIslandAcademySign";
import { BusinessIslandQuestHud } from "@/components/business/hub/BusinessIslandQuestHud";
import { BusinessIslandQuestMarkers } from "@/components/business/hub/BusinessIslandQuestMarkers";
import { MasterInvestingPrinciplesLadderSheet } from "@/components/business/hub/MasterInvestingPrinciplesLadderSheet";
import { MasterInvestingPrinciplesPanel } from "@/components/business/hub/MasterInvestingPrinciplesPanel";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { resolveBusinessHubJourney } from "@/lib/business/resolveBusinessHubJourney";
import type { Company } from "@/data/companies";
import { useMemo, useState, type CSSProperties } from "react";

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
  const [ladderOpen, setLadderOpen] = useState(false);

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
    <BusinessIslandAcademySign
      companyId={company.id}
      cards={cards}
      onOpenLadder={() => setLadderOpen(true)}
    />
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
            <span className="iq-prodigy-map__sign-sub">How do they make money?</span>
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
          How do they make money?
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
          completedCards={completedCards}
          totalCards={cards.length}
          cards={cards}
          companyName={company.name}
          celebrateFrom={celebrateFrom}
        />
      </motion.div>

      {mapCameraHub ? (
        <>
          <motion.aside
            className="iq-schools-island-hud__academy pointer-events-none"
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
            <BusinessIslandQuestMarkers
              cards={cards}
              company={company}
              partnerId={partnerId}
              userId={userId}
              onBeforeQuestNavigate={onBeforeQuestNavigate}
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

      {mapCameraHub ? (
        <MasterInvestingPrinciplesLadderSheet
          open={ladderOpen}
          onClose={() => setLadderOpen(false)}
          companyId={company.id}
          cards={cards}
        />
      ) : null}
    </div>
  );
}
