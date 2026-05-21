"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { MISSION_BRIEF_IMAGE_PATH } from "@/lib/screenAssetUrls";

/** Intrinsic size of `public/screens/mission-brief-image.webp` (full brief artwork). */
const BRIEF_IMG_W = 1117;
const BRIEF_IMG_H = 1408;

export type MissionBriefCardProps = {
  /** For `aria-labelledby` on parent dialogs (screen reader title). */
  titleId?: string;
  /** Announces the invisible CTA hit-area over the art’s button. */
  primaryLabel?: string;
  onPrimary: () => void;
};

export function MissionBriefCard({
  titleId = "quest-map-brief-title",
  primaryLabel = "Let's go",
  onPrimary
}: MissionBriefCardProps) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border-2 p-0.5 sm:p-1"
      style={{
        borderColor: "rgba(245,197,71,0.65)",
        background: "rgba(8,7,14,0.92)",
        boxShadow:
          "0 0 0 1px rgba(245,197,71,0.22), 0 20px 56px rgba(0,0,0,0.45), 0 0 64px rgba(245,197,71,0.22), 0 0 40px rgba(168,85,247,0.15)"
      }}
    >
      <span id={titleId} className="sr-only">
        10-K Quest mission brief
      </span>

      <div className="relative mx-auto w-full max-w-full">
        <Image
          src={MISSION_BRIEF_IMAGE_PATH}
          alt=""
          width={BRIEF_IMG_W}
          height={BRIEF_IMG_H}
          priority
          unoptimized
          sizes="(max-width: 640px) min(100vw,24rem), (max-width: 1024px) min(100vw,34rem), min(100vw,44rem)"
          className="mx-auto h-auto w-full max-h-[min(90dvh,920px)] min-h-0 select-none rounded-xl object-contain object-center"
        />
        {/* Hit target over the gold “LET’S GO” in the artwork — art stays pixel-perfect. */}
        <motion.button
          type="button"
          className="pointer-events-auto absolute bottom-[4%] left-[7%] right-[7%] top-[82.5%] z-[2] cursor-pointer rounded-xl border-0 bg-transparent p-0 outline-none ring-amber-400/70 focus-visible:ring-2"
          aria-label={primaryLabel}
          onClick={onPrimary}
          whileTap={{ scale: 0.99 }}
        />
      </div>
    </article>
  );
}
