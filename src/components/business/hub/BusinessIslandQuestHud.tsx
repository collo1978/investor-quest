"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

type Props = {
  completedCards: number;
  totalCards: number;
  cards: readonly BusinessHubQuestCard[];
  companyLogoUrl?: string;
  companyName?: string;
  /** Animate the counter from this value (e.g. 0 → 1 after quiz return). */
  celebrateFrom?: number | null;
};

const RING_CX = 50;
const RING_CY = 50;
const RING_R = 36;
const RING_STROKE = 9;
const SEGMENT_GAP_DEG = 6;
const CELEBRATE_MS = 2200;

type SegmentTone = "locked" | "active" | "complete";

function segmentTone(card: BusinessHubQuestCard): SegmentTone {
  if (card.completed) return "complete";
  if (!card.locked) return "active";
  return "locked";
}

function SegmentedQuestRing({
  cards,
  uid,
  celebrate,
  celebrateSegmentIndex
}: {
  cards: readonly BusinessHubQuestCard[];
  uid: string;
  celebrate: boolean;
  celebrateSegmentIndex: number;
}) {
  const reduceMotion = useReducedMotion();
  const sorted = useMemo(
    () => [...cards].sort((a, b) => a.orderNumber - b.orderNumber),
    [cards]
  );
  const count = Math.max(sorted.length, 1);
  const circumference = 2 * Math.PI * RING_R;
  const segmentDeg = 360 / count;
  const arcDeg = Math.max(segmentDeg - SEGMENT_GAP_DEG, 1);
  const arcLen = (arcDeg / 360) * circumference;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff4c2" />
          <stop offset="40%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${uid}-track`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R + 4}
        fill="none"
        stroke="rgba(251, 191, 36, 0.42)"
        strokeWidth={1.5}
      />

      {sorted.map((card, i) => {
        const tone = segmentTone(card);
        const rotation = -90 + i * segmentDeg + SEGMENT_GAP_DEG / 2;
        const fillRatio =
          tone === "complete"
            ? 1
            : tone === "active"
              ? Math.max(0.12, card.progressPct / 100)
              : 0;
        const filledLen = arcLen * fillRatio;
        const isNewSegment = celebrate && i === celebrateSegmentIndex;

        return (
          <g key={card.slug} transform={`rotate(${rotation} ${RING_CX} ${RING_CY})`}>
            <circle
              cx={RING_CX}
              cy={RING_CY}
              r={RING_R}
              fill="none"
              stroke={`url(#${uid}-track)`}
              strokeWidth={RING_STROKE}
              strokeDasharray={`${arcLen} ${circumference - arcLen}`}
              opacity={0.85}
            />
            {fillRatio > 0 ? (
              <motion.circle
                cx={RING_CX}
                cy={RING_CY}
                r={RING_R}
                fill="none"
                stroke={`url(#${uid}-gold)`}
                strokeWidth={RING_STROKE - 1.5}
                strokeLinecap="butt"
                initial={
                  isNewSegment
                    ? { strokeDasharray: `0 ${circumference}` }
                    : undefined
                }
                animate={{
                  strokeDasharray: `${filledLen} ${circumference - filledLen}`
                }}
                transition={
                  isNewSegment
                    ? { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 0.35 }
                }
              />
            ) : null}
          </g>
        );
      })}

      {!reduceMotion &&
        celebrate &&
        sorted.map((card, i) => {
          if (i !== celebrateSegmentIndex) return null;
          const rotation = -90 + i * segmentDeg + segmentDeg / 2;
          return (
            <motion.g
              key={`spark-${card.slug}`}
              transform={`rotate(${rotation} ${RING_CX} ${RING_CY})`}
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <circle
                cx={RING_CX}
                cy={RING_CY - RING_R}
                r={2}
                fill="#fde68a"
              />
            </motion.g>
          );
        })}
    </svg>
  );
}

/**
 * Schools Business Island — compact game-style quest progress tracker.
 */
export function BusinessIslandQuestHud({
  completedCards,
  totalCards,
  cards,
  companyLogoUrl: _companyLogoUrl,
  companyName: _companyName,
  celebrateFrom = null
}: Props) {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const prevCompletedRef = useRef(completedCards);
  const mountedRef = useRef(false);
  const [celebrate, setCelebrate] = useState(false);
  const [celebrateSegmentIndex, setCelebrateSegmentIndex] = useState(-1);
  const [displayCompleted, setDisplayCompleted] = useState(completedCards);

  useEffect(() => {
    if (
      celebrateFrom != null &&
      celebrateFrom < completedCards &&
      !reduceMotion
    ) {
      setDisplayCompleted(celebrateFrom);
      const tick = window.setTimeout(
        () => setDisplayCompleted(completedCards),
        160
      );
      setCelebrateSegmentIndex(Math.max(0, celebrateFrom));
      setCelebrate(true);
      const clearCelebrate = window.setTimeout(
        () => setCelebrate(false),
        CELEBRATE_MS
      );
      return () => {
        window.clearTimeout(tick);
        window.clearTimeout(clearCelebrate);
      };
    }
    setDisplayCompleted(completedCards);
  }, [celebrateFrom, completedCards, reduceMotion]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevCompletedRef.current = completedCards;
      return;
    }
    if (celebrateFrom != null) {
      prevCompletedRef.current = completedCards;
      return;
    }
    if (completedCards > prevCompletedRef.current) {
      setCelebrateSegmentIndex(Math.max(0, completedCards - 1));
      setCelebrate(true);
      const clear = window.setTimeout(() => setCelebrate(false), CELEBRATE_MS);
      prevCompletedRef.current = completedCards;
      return () => window.clearTimeout(clear);
    }
    prevCompletedRef.current = completedCards;
  }, [completedCards, celebrateFrom]);

  return (
    <div
      className="iq-schools-hub-progress-card pointer-events-auto"
      role="status"
      aria-label={`Business Island progress, ${displayCompleted} of ${totalCards} quests complete`}
    >
      <span className="iq-schools-hub-progress-card__ring-pulse" aria-hidden />
      <div className="iq-schools-hub-progress-card__ring-wrap">
        <SegmentedQuestRing
          cards={cards}
          uid={uid}
          celebrate={celebrate}
          celebrateSegmentIndex={celebrateSegmentIndex}
        />
        <span className="iq-schools-hub-progress-card__ring-center" aria-hidden>
          {displayCompleted}
        </span>
      </div>
      <div className="iq-schools-hub-progress-card__copy">
        <p className="iq-schools-hub-progress-card__label">Business Island Progress</p>
        <p className="iq-schools-hub-progress-card__count">
          {displayCompleted} / {totalCards} Quests
        </p>
      </div>
    </div>
  );
}
