"use client";

import { motion, useReducedMotion } from "framer-motion";

import { NeonButton } from "@/components/NeonButton";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { NVDA_MISSION_BRIEF } from "@/lib/demo/nvidiaDemoVoice";

const MISSION_STEPS = [
  "Mark quests as read",
  "Complete the quiz",
  "Unlock the next island"
] as const;

type Props = {
  open: boolean;
  onDismiss: () => void;
};

export function BusinessIslandMissionBriefModal({ open, onDismiss }: Props) {
  const reduceMotion = useReducedMotion();

  if (!open) return null;

  const brief = CONTROLLED_DEMO_MODE ? NVDA_MISSION_BRIEF : null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-island-brief-title"
      className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {/* Light scrim — map art stays visible; no full-screen blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgba(5,5,15,0.14)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 50% 42%, transparent 35%, rgba(5,5,15,0.28) 72%, rgba(4,2,14,0.42) 100%)"
        }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="relative w-full max-w-[min(100%,22rem)] overflow-hidden rounded-[22px] border-2 border-[rgba(245,197,71,0.62)] bg-[rgba(10,9,20,0.94)] p-6 shadow-[0_0_0_1px_rgba(245,197,71,0.28),0_20px_48px_rgba(0,0,0,0.38),0_0_40px_rgba(245,197,71,0.16)] backdrop-blur-md sm:max-w-md sm:p-7"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[22px] bg-[linear-gradient(135deg,rgba(245,197,71,0.12),rgba(139,92,246,0.08),transparent_55%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,197,71,0.65),transparent)]"
        />

        <header className="relative text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(245,197,71,0.9)]">
            {brief?.kicker ?? "Business Island"}
          </p>
          <h2
            id="business-island-brief-title"
            className="mt-3 font-[var(--font-grotesk)] text-2xl font-extrabold tracking-tight text-ink-0 sm:text-[1.65rem]"
          >
            {brief?.title ?? "Your Mission"}
          </h2>
        </header>

        <div className="relative mt-5 space-y-4 text-center">
          <p className="text-sm leading-relaxed text-ink-1">
            {brief?.lead ?? "Every great investor first understands the business."}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neon-300">
            {brief?.stepsTitle ?? "Complete the Business Quests"}
          </p>
          <ul className="mx-auto max-w-[16rem] space-y-2.5 text-left text-sm text-ink-0">
            {(brief?.steps ?? MISSION_STEPS).map((step) => (
              <li key={step} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[rgba(245,197,71,0.45)] bg-[rgba(245,197,71,0.1)] text-[10px] font-bold text-[rgba(245,197,71,0.95)]"
                >
                  ✓
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-7">
          <NeonButton
            type="button"
            className="relative z-[1] w-full justify-center"
            onClick={onDismiss}
          >
            {brief?.cta ?? "Let's go"}
          </NeonButton>
        </div>
      </motion.article>
    </motion.div>
  );
}
