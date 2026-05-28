"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { MISSION_BRIEF_IMAGE_PATH } from "@/lib/screenAssetUrls";

/** Intrinsic size of `public/screens/mission-brief-image.webp` (full brief artwork). */
const BRIEF_IMG_W = 1117;
const BRIEF_IMG_H = 1408;

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export type MissionBriefCardProps = {
  /** For `aria-labelledby` on parent dialogs (screen reader title). */
  titleId?: string;
  /** Announces the invisible CTA hit-area over the art’s button. */
  primaryLabel?: string;
  onPrimary: () => void;
  /** Stronger entrance glow for first map visit overlay. */
  variant?: "default" | "cinematic";
};

export function MissionBriefCard({
  titleId = "quest-map-brief-title",
  primaryLabel = "Let's go",
  onPrimary,
  variant = "default"
}: MissionBriefCardProps) {
  const reduceMotion = useReducedMotion();
  const cinematic = variant === "cinematic";

  return (
    <motion.article
      className={[
        "relative overflow-hidden rounded-2xl border-2 p-0.5 sm:rounded-[1.35rem] sm:p-1",
        cinematic ? "border-[rgba(245,197,71,0.72)]" : ""
      ].join(" ")}
      style={{
        borderColor: cinematic ? undefined : "rgba(245,197,71,0.65)",
        background: "rgba(8,7,14,0.94)",
        boxShadow: cinematic
          ? "0 0 0 1px rgba(245,197,71,0.28), 0 24px 64px rgba(0,0,0,0.55), 0 0 80px rgba(245,197,71,0.28), 0 0 56px rgba(139,92,246,0.2)"
          : "0 0 0 1px rgba(245,197,71,0.22), 0 20px 56px rgba(0,0,0,0.45), 0 0 64px rgba(245,197,71,0.22), 0 0 40px rgba(168,85,247,0.15)"
      }}
      initial={reduceMotion || !cinematic ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion || !cinematic
          ? undefined
          : { duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.2 }
      }
    >
      {cinematic ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-[linear-gradient(145deg,rgba(245,197,71,0.08)_0%,rgba(139,92,246,0.06)_48%,transparent_72%)]"
        />
      ) : null}
      <span id={titleId} className="sr-only">
        10-K Quest mission brief
      </span>

      <div className="relative mx-auto w-full max-w-full px-0.5 py-0.5 sm:px-1 sm:py-1">
        <Image
          src={MISSION_BRIEF_IMAGE_PATH}
          alt=""
          width={BRIEF_IMG_W}
          height={BRIEF_IMG_H}
          priority
          unoptimized
          sizes="(max-width: 640px) min(100vw,24rem), (max-width: 1024px) min(100vw,34rem), min(100vw,44rem)"
          className="mx-auto h-auto w-full max-h-[min(78dvh,880px)] min-h-0 select-none rounded-xl object-contain object-center sm:max-h-[min(82dvh,920px)]"
        />
        <motion.button
          type="button"
          className="pointer-events-auto absolute bottom-[4%] left-[7%] right-[7%] top-[82.5%] z-[2] cursor-pointer rounded-xl border-0 bg-transparent p-0 outline-none ring-amber-400/70 focus-visible:ring-2"
          aria-label={primaryLabel}
          onClick={onPrimary}
          whileHover={reduceMotion ? undefined : { scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        />
      </div>
    </motion.article>
  );
}
