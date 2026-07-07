"use client";

import { useMemo } from "react";

import { InvestorQualityChecklistScorecard } from "@/components/business/investorQuality/InvestorQualityRatingScreen";
import { InvestorQualityChecklistTitleHint } from "@/components/business/investorQuality/InvestorQualityChecklistTitleHint";
import { useGame } from "@/components/GameProvider";
import { companyById } from "@/data/companies";
import { resolveInvestorQualityChecklistRows } from "@/lib/business/investorQualityChecklist";
import { useInvestorQualityChecklist } from "@/hooks/useInvestorQualityChecklist";
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

/** Company mastery progress artwork + investor quality checklist scorecard. */
export function SchoolsCompanyMasteryPanel({
  onClose,
  variant = "page"
}: SchoolsCompanyMasteryPanelProps) {
  const schoolsTour = isSchoolsDemoPlaythroughActive();
  const isOverlay = variant === "overlay";
  const { raw } = useGame();
  const companyId = raw.activeCompanyId;
  const companyName = companyById(companyId)?.name ?? "NVIDIA";
  const { snapshot } = useInvestorQualityChecklist(companyId);
  const rows = useMemo(
    () => resolveInvestorQualityChecklistRows(snapshot),
    [snapshot]
  );
  const hasChecklistProgress = rows.some(
    (row) => row.evidenceCount > 0 || row.ratingLabel
  );

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
      <div className="iq-schools-company-mastery-layout mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-3 py-4 sm:flex-row sm:items-start sm:justify-center sm:px-6">
        <div
          className="iq-schools-company-mastery-art-stage relative mx-auto shrink-0"
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

        {hasChecklistProgress ? (
          <InvestorQualityChecklistScorecard companyName={companyName} rows={rows} />
        ) : (
          <section className="iq-investor-quality-scorecard iq-investor-quality-scorecard--empty pointer-events-auto max-w-md">
            <header className="iq-investor-quality-scorecard__header">
              <InvestorQualityChecklistTitleHint titleClassName="iq-investor-quality-scorecard__eyebrow" />
              <h2 className="iq-investor-quality-scorecard__title">{companyName}</h2>
              <p className="iq-investor-quality-scorecard__meta">
                Complete Business Island quests to build your checklist from 10-K evidence.
              </p>
            </header>
          </section>
        )}
      </div>
    </div>
  );
}
