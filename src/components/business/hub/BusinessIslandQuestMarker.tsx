"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  BusinessQuestDiscoveryMark,
  BusinessQuestXpChip
} from "@/components/business/BusinessQuestDiscoveryMark";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { businessQuestDiscoveryAriaLabel } from "@/lib/business/businessQuestDiscovery";
import type { BusinessIslandQuestMarkerSlot } from "@/lib/business/businessIslandQuestMarkerPositions";

export type QuestMarkerVisualState =
  | "locked"
  | "available"
  | "active"
  | "completed";

type Props = {
  card: BusinessHubQuestCard;
  slot: BusinessIslandQuestMarkerSlot;
  state: QuestMarkerVisualState;
  onNavigate: (card: BusinessHubQuestCard) => void;
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
  onNavigate
}: Props) {
  const reduceMotion = useReducedMotion();
  const isActive = state === "active";
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const isUnlocked = !isLocked && !isCompleted;

  const wasLockedRef = useRef(card.locked);
  const [isFlipping, setIsFlipping] = useState(false);
  const [unlockBeacon, setUnlockBeacon] = useState(false);

  useEffect(() => {
    if (card.locked) {
      wasLockedRef.current = true;
      setUnlockBeacon(false);
      return;
    }
    if (wasLockedRef.current && !card.locked && card.orderNumber > 1) {
      if (reduceMotion) {
        setUnlockBeacon(true);
        window.setTimeout(() => setUnlockBeacon(false), 3200);
      } else {
        setIsFlipping(true);
        setUnlockBeacon(true);
      }
      wasLockedRef.current = false;
    }
  }, [card.locked, card.orderNumber, reduceMotion]);

  const ariaState = isCompleted
    ? "completed"
    : isLocked
      ? "locked"
      : isActive
        ? "active"
        : "available";

  const showPulse = isActive || unlockBeacon;

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
          unlockBeacon ? "iq-business-island-quest-marker--unlock-beacon" : "",
          `iq-business-island-quest-marker--order-${card.orderNumber}`
        ].join(" ")}
        aria-label={businessQuestDiscoveryAriaLabel(card.orderNumber, ariaState)}
        disabled={isLocked || isFlipping}
        onClick={() => {
          if (isLocked || isFlipping) return;
          onNavigate(card);
        }}
        whileTap={
          isLocked || isFlipping || reduceMotion
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
          {showPulse ? (
            <>
              <span
                className="iq-business-island-quest-marker__pulse iq-business-island-quest-marker__pulse--outer"
                aria-hidden
              />
              <span className="iq-business-island-quest-marker__pulse" aria-hidden />
            </>
          ) : null}

          <span
            className="iq-business-island-quest-marker__cap"
            style={{ perspective: 520 }}
          >
            {isCompleted ? (
              <span className="iq-business-island-quest-marker__tick" aria-hidden>
                ✓
              </span>
            ) : (
              <motion.span
                className="iq-business-island-quest-marker__flip"
                style={{ transformStyle: "preserve-3d" }}
                initial={false}
                animate={{ rotateY: isLocked ? 0 : 180 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.72,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onAnimationComplete={() => {
                  if (isFlipping) {
                    setIsFlipping(false);
                    window.setTimeout(() => setUnlockBeacon(false), 2800);
                  }
                }}
              >
                <span className="iq-business-island-quest-marker__flip-face iq-business-island-quest-marker__flip-face--front">
                  <span className="iq-business-island-quest-marker__lock-overlay">
                    <MarkerLockIcon />
                  </span>
                </span>
                <span className="iq-business-island-quest-marker__flip-face iq-business-island-quest-marker__flip-face--back">
                  <BusinessQuestDiscoveryMark variant="marker" />
                </span>
              </motion.span>
            )}
          </span>
        </span>

        <span className="iq-business-island-quest-marker__meta" aria-hidden>
          <span className="iq-business-island-quest-marker__num">
            {card.orderNumber}
          </span>
          {!isLocked ? (
            <BusinessQuestXpChip
              rewardXp={card.rewardXp}
              className="iq-business-island-quest-marker__xp"
            />
          ) : null}
        </span>
      </motion.button>
    </div>
  );
}
