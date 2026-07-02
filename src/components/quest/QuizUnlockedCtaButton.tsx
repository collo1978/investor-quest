"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";

type Props = {
  unlocked: boolean;
  onClick?: () => void;
  theme: PillarQuestTheme;
  label?: string;
  lockedLabel?: string;
  /** For tooltips when locked */
  lockedTitle?: string;
};

function LockToUnlockIcon({ unlocked }: { unlocked: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-[14px] w-[14px]"
      fill="none"
      aria-hidden
    >
      <motion.path
        d="M8 11V8.3C8 6.0 9.9 4.2 12.2 4.2c2.3 0 4.1 1.8 4.1 4.1V11"
        stroke="rgba(255,229,141,0.92)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{
          opacity: unlocked ? 0.6 : 0.95,
          pathLength: 1
        }}
      />
      <motion.rect
        x="6.2"
        y="11"
        width="11.6"
        height="9.8"
        rx="2.1"
        stroke="rgba(216,180,254,0.85)"
        strokeWidth="1.4"
        initial={false}
        animate={{
          stroke: unlocked ? "rgba(255,229,141,0.88)" : "rgba(216,180,254,0.75)"
        }}
      />
      <motion.path
        d="M14.8 8.6c0-1.6-1.2-2.7-2.7-2.7"
        stroke="rgba(245,197,71,0.95)"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: unlocked ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />
    </motion.svg>
  );
}

function SparkBurst({ burstKey }: { burstKey: number }) {
  const sparks = useMemo(
    () => [
      { x: -22, y: -8, d: 0.0 },
      { x: -10, y: -18, d: 0.04 },
      { x: 8, y: -20, d: 0.08 },
      { x: 22, y: -10, d: 0.12 },
      { x: 18, y: 6, d: 0.16 },
      { x: -18, y: 6, d: 0.2 }
    ],
    []
  );

  return (
    <AnimatePresence>
      <motion.div
        key={burstKey}
        className="pointer-events-none absolute left-1/2 top-1/2"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {sparks.map((s, i) => (
          <motion.span
            key={i}
            className="absolute h-[6px] w-[6px] rounded-full"
            style={{
              left: 0,
              top: 0,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.95), rgba(245,197,71,0.55), rgba(168,85,247,0.25))",
              boxShadow:
                "0 0 10px rgba(245,197,71,0.25), 0 0 14px rgba(168,85,247,0.18)"
            }}
            initial={{ x: 0, y: 0, scale: 0.6, opacity: 0 }}
            animate={{
              x: s.x,
              y: s.y,
              scale: [0.6, 1.0, 0.6],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 0.55, delay: s.d, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export function QuizUnlockedCtaButton({
  unlocked,
  onClick,
  theme,
  label = "QUIZ UNLOCKED",
  lockedLabel = "COMPLETE ALL CARDS TO UNLOCK",
  lockedTitle
}: Props) {
  const reduceMotion = !!useReducedMotion();
  const prevUnlockedRef = useRef(unlocked);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const was = prevUnlockedRef.current;
    prevUnlockedRef.current = unlocked;
    if (!was && unlocked) {
      setBurstKey((k) => k + 1);
    }
  }, [unlocked]);

  const isMission = theme.cardChrome === "mission";

  return (
    <motion.button
      type="button"
      disabled={!unlocked}
      aria-disabled={!unlocked}
      onClick={unlocked ? onClick : undefined}
      title={!unlocked ? lockedTitle : undefined}
      className={[
        "relative overflow-hidden rounded-full border px-6 py-2.5 sm:px-7 sm:py-3",
        "text-[11px] sm:text-[12px] font-extrabold uppercase tracking-[0.22em]",
        "transition disabled:cursor-not-allowed",
        isMission
          ? unlocked
            ? "iq-schools-mission-cta tracking-[0.08em]"
            : "iq-schools-mission-nav-btn tracking-[0.12em] disabled:opacity-100"
          : "disabled:opacity-60"
      ].join(" ")}
      style={
        isMission
          ? undefined
          : {
              borderColor: unlocked ? theme.border : "rgba(255,255,255,0.14)",
              color: unlocked ? theme.hi : "rgba(226,232,240,0.70)",
              background: unlocked
                ? `linear-gradient(135deg, rgba(0,0,0,0.20), ${theme.glowSoft})`
                : "transparent"
            }
      }
      initial={false}
      whileHover={unlocked ? { y: -2, scale: 1.02 } : undefined}
      whileTap={unlocked ? { scale: 0.985 } : undefined}
      animate={
        reduceMotion
          ? undefined
          : unlocked
            ? {
                boxShadow: [
                  `0 0 26px -8px ${theme.glow}`,
                  `0 0 46px -6px ${theme.glow}`,
                  `0 0 26px -8px ${theme.glow}`
                ]
              }
            : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              boxShadow: { duration: 2.1, repeat: Infinity, ease: "easeInOut" }
            }
      }
    >
      {/* Shimmer sweep */}
      {unlocked && !reduceMotion ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,229,141,0.18) 50%, transparent 65%)"
          }}
          initial={{ x: "-60%" }}
          animate={{ x: "160%" }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {/* Unlock pulse ring */}
      {!reduceMotion ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-[-10px] rounded-full"
          initial={false}
          animate={
            unlocked
              ? {
                  opacity: [0, 0.9, 0],
                  scale: [0.92, 1.08, 1.16]
                }
              : { opacity: 0 }
          }
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            border: "1px solid rgba(245,197,71,0.25)",
            boxShadow:
              "0 0 28px rgba(245,197,71,0.16), 0 0 22px rgba(168,85,247,0.18)"
          }}
        />
      ) : null}

      {/* One-shot sparks on unlock */}
      {unlocked && !reduceMotion ? <SparkBurst burstKey={burstKey} /> : null}

      <span className="relative inline-flex items-center gap-2">
        <LockToUnlockIcon unlocked={unlocked} />
        {unlocked ? label : lockedLabel}
      </span>
    </motion.button>
  );
}

