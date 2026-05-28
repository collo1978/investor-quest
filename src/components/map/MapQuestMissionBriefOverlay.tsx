"use client";

import { motion, useReducedMotion } from "framer-motion";

import { MissionBriefCard } from "@/components/map/MissionBriefCard";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

type Props = {
  open: boolean;
  onDismiss: () => void;
};

/**
 * First-visit map mission brief — full-screen cinematic overlay on /map.
 */
export function MapQuestMissionBriefOverlay({ open, onDismiss }: Props) {
  const reduceMotion = useReducedMotion();

  if (!open) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-map-brief-title"
      className="pointer-events-auto fixed inset-0 z-[140] flex items-center justify-center px-4 py-8 sm:px-6"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgba(3,3,8,0.55)] backdrop-blur-[2px]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_42%,rgba(139,92,246,0.2),transparent_62%)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,rgba(0,0,0,0.75),transparent_55%)]"
      />

      <motion.div
        className="relative z-10 w-full max-w-[min(100%,28rem)] sm:max-w-[30rem] md:max-w-[min(100%,34rem)]"
        initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { duration: 0.85, ease: EASE_OUT_EXPO, delay: 0.12 }
        }
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(245,197,71,0.2),rgba(139,92,246,0.14)_45%,transparent_72%)] blur-2xl"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.9, ease: EASE_OUT_EXPO }}
        />
        <MissionBriefCard
          variant="cinematic"
          titleId="quest-map-brief-title"
          primaryLabel="Let's go"
          onPrimary={onDismiss}
        />
      </motion.div>
    </motion.div>
  );
}
