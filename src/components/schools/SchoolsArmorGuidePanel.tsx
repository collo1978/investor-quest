"use client";

import {
  SCHOOLS_ARMOR_GUIDE_IMAGE_NATURAL,
  SCHOOLS_ARMOR_GUIDE_IMAGE_SRC
} from "@/lib/schools/schoolsArmorGuideConfig";
import { isSchoolsDemoPlaythroughActive } from "@/lib/schools/schoolsDemoPlaythrough";

const { width: ART_W, height: ART_H } = SCHOOLS_ARMOR_GUIDE_IMAGE_NATURAL;
const ART_ASPECT = ART_W / ART_H;

export type SchoolsArmorGuidePanelProps = {
  onClose: () => void;
  /** `overlay` = profile modal; `page` = standalone route shell. */
  variant?: "overlay" | "page";
};

/** Investor armor guide artwork + Profile CTA. */
export function SchoolsArmorGuidePanel({
  onClose,
  variant = "page"
}: SchoolsArmorGuidePanelProps) {
  const schoolsTour = isSchoolsDemoPlaythroughActive();
  const isOverlay = variant === "overlay";

  return (
    <div
      className={[
        isOverlay
          ? "iq-schools-armor-guide-overlay fixed inset-0 z-50 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#040308]"
          : "iq-schools-armor-guide-deck relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#040308]",
        schoolsTour && !isOverlay ? "max-h-[100dvh]" : "",
        !isOverlay ? "min-h-[100dvh]" : ""
      ].join(" ")}
      role="dialog"
      aria-modal={isOverlay ? "true" : undefined}
      aria-label="Investor armor guide"
      style={{ ["--iq-armor-guide-art-aspect" as string]: ART_ASPECT }}
    >
      <div
        className="iq-schools-armor-guide-art-stage relative mx-auto"
        style={{ aspectRatio: `${ART_W} / ${ART_H}` }}
      >
        <img
          src={SCHOOLS_ARMOR_GUIDE_IMAGE_SRC}
          alt="Investor armor guide"
          width={ART_W}
          height={ART_H}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-fill"
        />

        <div className="pointer-events-none absolute inset-0 z-10">
          <button
            type="button"
            aria-label="Return to profile"
            onClick={onClose}
            className="iq-schools-armor-guide-got-it-btn pointer-events-auto absolute right-[clamp(0.65rem,2.4vw,1.15rem)] bottom-[clamp(0.75rem,3vw,1.35rem)] z-20 m-0 inline-flex min-h-11 min-w-[9.5rem] cursor-pointer items-center justify-center border-0 px-6"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
