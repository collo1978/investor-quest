"use client";

import {
  SCHOOLS_COMPANY_MASTERY_PROGRESS_IMAGE_NATURAL,
  SCHOOLS_COMPANY_MASTERY_PROGRESS_IMAGE_SRC
} from "@/lib/schools/schoolsCompanyMasteryConfig";
import { isSchoolsDemoPlaythroughActive } from "@/lib/schools/schoolsDemoPlaythrough";

const { width: ART_W, height: ART_H } = SCHOOLS_COMPANY_MASTERY_PROGRESS_IMAGE_NATURAL;
const ART_ASPECT = ART_W / ART_H;

export type SchoolsCompanyMasteryPanelProps = {
  onClose: () => void;
  /** `overlay` = profile modal; `page` = standalone route shell. */
  variant?: "overlay" | "page";
};

/** Company mastery progress artwork + Got It CTA. */
export function SchoolsCompanyMasteryPanel({
  onClose,
  variant = "page"
}: SchoolsCompanyMasteryPanelProps) {
  const schoolsTour = isSchoolsDemoPlaythroughActive();
  const isOverlay = variant === "overlay";

  return (
    <div
      className={[
        isOverlay
          ? "iq-schools-company-mastery-overlay fixed inset-0 z-50 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#040308]"
          : "iq-schools-company-mastery-deck relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#040308]",
        schoolsTour && !isOverlay ? "max-h-[100dvh]" : "",
        !isOverlay ? "min-h-[100dvh]" : ""
      ].join(" ")}
      role="dialog"
      aria-modal={isOverlay ? "true" : undefined}
      aria-label="Company mastery"
      style={{ ["--iq-company-mastery-art-aspect" as string]: ART_ASPECT }}
    >
      <div
        className="iq-schools-company-mastery-art-stage relative mx-auto"
        style={{ aspectRatio: `${ART_W} / ${ART_H}` }}
      >
        <img
          src={SCHOOLS_COMPANY_MASTERY_PROGRESS_IMAGE_SRC}
          alt="Company mastery"
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
            className="iq-schools-armor-guide-got-it-btn pointer-events-auto absolute right-[clamp(0.65rem,2.4vw,1.15rem)] top-[clamp(0.35rem,1.6vw,0.75rem)] z-20 m-0 inline-flex min-h-11 min-w-[9.5rem] cursor-pointer items-center justify-center border-0 px-6"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
