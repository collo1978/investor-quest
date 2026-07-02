"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";

type Props = {
  xp: number;
  /** Unique per correct-answer moment — retriggers confetti + pop. */
  triggerKey: string;
  variant?: "mission" | "default";
};

/**
 * Per-question correct-answer burst — confetti + floating XP pop (Schools quiz).
 */
export function SchoolsQuizMicroRewardFx({
  xp,
  triggerKey,
  variant = "mission"
}: Props) {
  const reduceMotion = useReducedMotion();
  const isMission = variant === "mission";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-3 z-30 flex justify-center sm:-top-4"
      aria-live="polite"
      aria-label={`Plus ${xp} experience points`}
    >
      {!reduceMotion ? (
        <ConfettiBurst
          triggerKey={triggerKey}
          count={26}
          spreadX={150}
          fallDistance={170}
          originTopPct={48}
          particleDurationSec={1.5}
          maxParticleDelaySec={0.32}
          activeDurationMs={2400}
          className="!absolute inset-x-[-12%] -top-8 bottom-0"
        />
      ) : null}

      <motion.div
        key={triggerKey}
        className={
          isMission
            ? "iq-schools-quiz-micro-xp relative"
            : "relative flex flex-col items-center rounded-full border-2 border-[rgba(245,197,71,0.55)] bg-[rgba(7,7,18,0.88)] px-5 py-2.5 shadow-glow backdrop-blur-md"
        }
        initial={
          reduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.35, y: 18, rotate: -8 }
        }
        animate={
          reduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: [0, 1, 1, 1],
                scale: [0.35, 1.14, 0.96, 1],
                y: [18, -6, -2, 0],
                rotate: [-8, 4, -2, 0]
              }
        }
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : {
                duration: 0.72,
                times: [0, 0.38, 0.62, 1],
                ease: [0.22, 1, 0.36, 1]
              }
        }
      >
        {!reduceMotion ? (
          <motion.span
            aria-hidden
            className="iq-schools-quiz-micro-xp__ring pointer-events-none absolute inset-[-10px] rounded-full"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.7, 1.35, 1.55] }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          />
        ) : null}

        <motion.span
          aria-hidden
          className="iq-schools-quiz-micro-xp__sparkle pointer-events-none absolute -right-1 -top-1 text-[15px]"
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1, rotate: 0 }
              : { opacity: [0, 1, 1], scale: [0, 1.2, 1], rotate: [-20, 12, 0] }
          }
          transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          ✨
        </motion.span>

        <div className="relative flex items-baseline gap-1.5">
          <motion.span
            className={
              isMission
                ? "iq-schools-quiz-micro-xp__value tabular-nums"
                : "font-[var(--font-grotesk)] text-[clamp(1.65rem,4.8vw,2rem)] font-black tabular-nums text-[#F5C547]"
            }
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            +{xp}
          </motion.span>
          <span
            className={
              isMission
                ? "iq-schools-quiz-micro-xp__label"
                : "text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5C547]/90"
            }
          >
            XP
          </span>
        </div>
      </motion.div>
    </div>
  );
}
