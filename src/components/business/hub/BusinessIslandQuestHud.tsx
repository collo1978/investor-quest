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
const RING_R = 38;
const RING_STROKE = 10;
const SEGMENT_GAP_DEG = 6;
const CELEBRATE_MS = 2200;

type SegmentTone = "locked" | "active" | "complete";

function segmentTone(card: BusinessHubQuestCard): SegmentTone {
  if (card.completed) return "complete";
  if (!card.locked) return "active";
  return "locked";
}

function HudDivider() {
  return (
    <div className="flex items-center gap-1.5 py-0.5" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(245,197,71,0.4)] to-transparent" />
      <svg viewBox="0 0 8 8" className="h-1.5 w-1.5 shrink-0" aria-hidden>
        <path
          d="M4 0.5 L7.5 4 L4 7.5 L0.5 4 Z"
          fill="rgba(245,197,71,0.18)"
          stroke="rgba(255,236,170,0.55)"
          strokeWidth="0.6"
        />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(245,197,71,0.4)] to-transparent" />
    </div>
  );
}

function RingCompletionFx({
  active,
  uid
}: {
  active: boolean;
  uid: string;
}) {
  const reduceMotion = useReducedMotion();
  if (!active || reduceMotion) return null;

  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-[-4%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(255,236,170,0.75) 318deg, rgba(255,251,235,0.95) 328deg, transparent 345deg)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "5px"
        }}
        initial={{ rotate: 0, opacity: 0.9 }}
        animate={{ rotate: 360, opacity: 0 }}
        transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
      />
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <motion.circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R + 5}
          fill="none"
          stroke={`url(#${uid}-gold)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="14 230"
          initial={{ rotate: -90, opacity: 0.95 }}
          animate={{ rotate: 270, opacity: 0 }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${RING_CX}px ${RING_CY}px` }}
          filter={`url(#${uid}-gold-glow)`}
        />
      </svg>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={`burst-${i}`}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-[#fff9db] shadow-[0_0_8px_#fde68a]"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i / 6) * Math.PI * 2) * 52,
            y: Math.sin((i / 6) * Math.PI * 2) * 52,
            opacity: 0,
            scale: 0.2
          }}
          transition={{ duration: 0.85, ease: "easeOut", delay: i * 0.03 }}
        />
      ))}
    </>
  );
}

function SegmentedIslandRing({
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
          <stop offset="35%" stopColor="#fcd34d" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${uid}-purple`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#2e1065" />
        </linearGradient>
        <filter id={`${uid}-gold-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 0.85 0 0 0  0 0 0.2 0 0  0 0 0 0.9 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-spark`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R + 6}
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth={2}
        opacity={0.62}
      />

      {sorted.map((card, i) => {
        const tone = segmentTone(card);
        const rotation = -90 + i * segmentDeg + SEGMENT_GAP_DEG / 2;
        const fillRatio =
          tone === "complete"
            ? 1
            : tone === "active"
              ? Math.max(0.14, card.progressPct / 100)
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
              stroke={`url(#${uid}-purple)`}
              strokeWidth={RING_STROKE}
              strokeDasharray={`${arcLen} ${circumference - arcLen}`}
              opacity={0.95}
            />
            <circle
              cx={RING_CX}
              cy={RING_CY}
              r={RING_R}
              fill="none"
              stroke="rgba(255,229,141,0.28)"
              strokeWidth={RING_STROKE + 0.6}
              strokeDasharray={`${arcLen} ${circumference - arcLen}`}
            />
            {fillRatio > 0 ? (
              <motion.circle
                cx={RING_CX}
                cy={RING_CY}
                r={RING_R}
                fill="none"
                stroke={`url(#${uid}-gold)`}
                strokeWidth={RING_STROKE - 1}
                strokeLinecap="butt"
                initial={
                  isNewSegment
                    ? { strokeDasharray: `0 ${circumference}` }
                    : undefined
                }
                animate={{ strokeDasharray: `${filledLen} ${circumference - filledLen}` }}
                transition={
                  isNewSegment
                    ? { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 0.35 }
                }
                filter={`url(#${uid}-gold-glow)`}
              />
            ) : null}
          </g>
        );
      })}

      {!reduceMotion &&
        sorted.map((card, i) => {
          if (segmentTone(card) !== "complete" && segmentTone(card) !== "active") {
            return null;
          }
          const rotation = -90 + i * segmentDeg + segmentDeg / 2;
          return (
            <motion.g
              key={`spark-${card.slug}`}
              transform={`rotate(${rotation} ${RING_CX} ${RING_CY})`}
              animate={{ opacity: [0.2, 0.85, 0.2] }}
              transition={{
                duration: 2.8 + i * 0.25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <circle
                cx={RING_CX}
                cy={RING_CY - RING_R}
                r={1.4}
                fill="#fff9db"
                filter={`url(#${uid}-spark)`}
              />
            </motion.g>
          );
        })}
    </svg>
  );
}

/**
 * Premium segmented quest HUD — ring-first quest artifact.
 */
export function BusinessIslandQuestHud({
  completedCards,
  totalCards,
  cards,
  companyLogoUrl,
  companyName = "Company",
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
      className="iq-business-island-quest-hud pointer-events-auto relative flex items-center overflow-hidden rounded-full py-1.5 pl-1.5 pr-3 sm:pr-4"
      role="status"
      aria-label={`Business Island progress, ${displayCompleted} of ${totalCards} cards`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[rgba(255,220,120,0.78)] shadow-[inset_0_1px_0_rgba(255,248,210,0.4),0_0_0_1px_rgba(139,92,246,0.24)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[3px] rounded-full border border-[rgba(245,197,71,0.18)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[rgba(8,5,16,0.94)] backdrop-blur-md"
      />

      {/* Ring halo — visual focus */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 z-0 h-[108%] w-[58%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,197,71,0.28)_0%,rgba(139,92,246,0.12)_38%,transparent_72%)] blur-xl"
        animate={
          celebrate && !reduceMotion
            ? { opacity: [0.55, 1, 0.72] }
            : { opacity: 0.85 }
        }
        transition={
          celebrate && !reduceMotion
            ? { duration: 1.1, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.4 }
        }
      />

      <div className="relative z-[1] h-[7rem] w-[7rem] shrink-0 sm:h-[7.75rem] sm:w-[7.75rem]">
        <RingCompletionFx active={celebrate} uid={uid} />
        <SegmentedIslandRing
          cards={cards}
          uid={uid}
          celebrate={celebrate}
          celebrateSegmentIndex={celebrateSegmentIndex}
        />
        <motion.div
          className="absolute inset-[26%] flex items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(245,197,71,0.4)] bg-[rgba(2,2,6,0.98)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.18)]"
          animate={
            celebrate && !reduceMotion
              ? {
                  scale: [1, 1.14, 1.04, 1],
                  boxShadow: [
                    "inset 0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(139,92,246,0.18)",
                    "inset 0 2px 8px rgba(0,0,0,0.8), 0 0 32px rgba(245,197,71,0.55)",
                    "inset 0 2px 8px rgba(0,0,0,0.8), 0 0 22px rgba(139,92,246,0.28)"
                  ]
                }
              : undefined
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {companyLogoUrl ? (
            <motion.img
              src={companyLogoUrl}
              alt=""
              className="h-[100%] w-[100%] object-contain"
              draggable={false}
              animate={
                celebrate && !reduceMotion
                  ? { scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.35)", "brightness(1)"] }
                  : undefined
              }
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <span className="font-[var(--font-grotesk)] text-[11px] font-bold uppercase tracking-wider text-[rgba(255,229,141,0.7)]">
              {companyName.slice(0, 2)}
            </span>
          )}
        </motion.div>
      </div>

      <div className="relative z-[1] min-w-[5.5rem] pl-1.5 sm:min-w-[6rem] sm:pl-2">
        <HudDivider />
        <p className="text-center font-[var(--font-grotesk)] text-[9px] font-bold uppercase tracking-[0.13em] text-[rgba(190,242,100,0.88)] sm:text-[10px]">
          Business Island
        </p>
        <HudDivider />
        <p className="text-center font-[var(--font-grotesk)] text-[1.35rem] font-bold tabular-nums leading-none text-white sm:text-[1.5rem]">
          {displayCompleted} / {totalCards}
        </p>
      </div>
    </div>
  );
}
