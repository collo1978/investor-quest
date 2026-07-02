"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { BusinessIslandQuestMarkerSlot } from "@/lib/business/businessIslandQuestMarkerPositions";

export type QuestMarkerVisualState = "active" | "locked" | "completed";

type Props = {
  card: BusinessHubQuestCard;
  slot: BusinessIslandQuestMarkerSlot;
  state: QuestMarkerVisualState;
  onSelect: (card: BusinessHubQuestCard) => void;
};

function MarkerLockIcon() {
  return (
    <span className="iq-business-island-quest-marker__lock" aria-hidden>
      <span className="iq-business-island-quest-marker__lock-shackle" />
      <span className="iq-business-island-quest-marker__lock-body">
        <span className="iq-business-island-quest-marker__lock-keyhole" />
      </span>
    </span>
  );
}

export function BusinessIslandQuestMarker({
  card,
  slot,
  state,
  onSelect
}: Props) {
  const reduceMotion = useReducedMotion();
  const isActive = state === "active";
  const isLocked = state === "locked";
  const isCompleted = state === "completed";

  const label = isCompleted
    ? `Quest ${card.orderNumber} complete — ${card.title}`
    : isLocked
      ? `Quest ${card.orderNumber} locked`
      : `Current quest — ${card.title}`;

  return (
    <div
      className="iq-business-island-quest-marker-anchor"
      style={{ left: slot.left, top: slot.top }}
    >
      <motion.button
        type="button"
        className={[
          "iq-business-island-quest-marker pointer-events-auto",
          `iq-business-island-quest-marker--${state}`,
          `iq-business-island-quest-marker--order-${card.orderNumber}`
        ].join(" ")}
        aria-label={label}
        disabled={isLocked}
        onClick={() => {
          if (!isLocked) onSelect(card);
        }}
        whileTap={
          isLocked || reduceMotion
            ? undefined
            : { scale: 0.94, transition: { duration: 0.12 } }
        }
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.42,
          delay: 0.08 + card.orderNumber * 0.04,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
      <span className="iq-business-island-quest-marker__shadow" aria-hidden />
      <span className="iq-business-island-quest-marker__post" aria-hidden />

      <span className="iq-business-island-quest-marker__head">
        {isActive ? (
          <>
            <span
              className="iq-business-island-quest-marker__pulse iq-business-island-quest-marker__pulse--outer"
              aria-hidden
            />
            <span className="iq-business-island-quest-marker__pulse" aria-hidden />
          </>
        ) : null}

        <span className="iq-business-island-quest-marker__cap">
          {isCompleted ? (
            <span className="iq-business-island-quest-marker__tick" aria-hidden>
              ✓
            </span>
          ) : isLocked ? (
            <span className="iq-business-island-quest-marker__lock-overlay">
              <MarkerLockIcon />
            </span>
          ) : (
            <span className="iq-business-island-quest-marker__beacon" aria-hidden />
          )}
        </span>
      </span>
      </motion.button>
    </div>
  );
}
