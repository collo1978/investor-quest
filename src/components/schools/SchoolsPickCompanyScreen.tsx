"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import { shouldShowSchoolsNavMenu } from "@/lib/schools/schoolsDemoMenu";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";
import {
  findSchoolsPickIndustry,
  findSchoolsPickSector,
  SCHOOLS_PICK_COMPANY_SECTORS
} from "@/lib/schools/schoolsPickCompanyCatalog";
import {
  isSchoolsPickCompanyComplete,
  readSchoolsPickCompanySelection,
  type SchoolsPickCompanySelection,
  writeSchoolsPickCompanySelection
} from "@/lib/schools/schoolsPickCompanyState";

export type SchoolsPickCompanyScreenProps = {
  onStartQuest: (selection: SchoolsPickCompanySelection) => void;
  onBack?: () => void;
};

const SELECT_CLASS =
  "iq-schools-pick-company-select pointer-events-auto w-full min-h-12 cursor-pointer appearance-none rounded-xl border border-amber-400/35 bg-[rgba(8,6,18,0.92)] px-4 py-3 pr-10 font-[var(--font-inter)] text-sm font-medium text-violet-50 shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition enabled:hover:border-amber-300/55 enabled:hover:shadow-[0_0_20px_rgba(245,197,71,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 disabled:cursor-not-allowed disabled:opacity-45";

function PickCompanyField({
  label,
  step,
  children
}: {
  label: string;
  step: number;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/75">
        <span
          aria-hidden
          className="grid h-5 w-5 place-items-center rounded-full border border-amber-400/40 bg-[rgba(245,197,71,0.08)] text-[10px] text-amber-100"
        >
          {step}
        </span>
        {label}
      </span>
      <div className="relative">{children}</div>
    </label>
  );
}

/**
 * Schools pick-company — cascading Sector → Industry → Company dropdowns.
 */
export function SchoolsPickCompanyScreen({
  onStartQuest,
  onBack
}: SchoolsPickCompanyScreenProps) {
  const pathname = usePathname();
  const { step } = useSchoolsDemoStory();
  const [sectorId, setSectorId] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [companyName, setCompanyName] = useState("");

  const sector = findSchoolsPickSector(sectorId);
  const industry = findSchoolsPickIndustry(sectorId, industryId);
  const companies = industry?.companies ?? [];

  const selection = useMemo(
    (): SchoolsPickCompanySelection => ({ sectorId, industryId, companyName }),
    [companyName, industryId, sectorId]
  );

  const canStartQuest = isSchoolsPickCompanyComplete(selection);
  const storyStep =
    isSchoolsDemoStoryModeActive() && isSchoolsDemoPath(pathname) ? step : null;
  const showNavMenu = shouldShowSchoolsNavMenu(pathname, storyStep);

  useRunOnceOnMount(() => {
    const saved = readSchoolsPickCompanySelection();
    setSectorId(saved.sectorId);
    setIndustryId(saved.industryId);
    setCompanyName(saved.companyName);
  });

  useEffect(() => {
    writeSchoolsPickCompanySelection(selection);
  }, [selection]);

  const handleSectorChange = (nextSectorId: string) => {
    setSectorId(nextSectorId);
    setIndustryId("");
    setCompanyName("");
  };

  const handleIndustryChange = (nextIndustryId: string) => {
    setIndustryId(nextIndustryId);
    setCompanyName("");
  };

  const handleStartQuest = () => {
    if (!canStartQuest) return;
    writeSchoolsPickCompanySelection(selection);
    onStartQuest(selection);
  };

  return (
    <div className="iq-schools-deck-pick-company relative isolate flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_8%,rgba(139,92,246,0.2),transparent_62%),radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(109,40,217,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [background-image:radial-gradient(rgba(245,197,71,0.22)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative z-20 flex min-h-0 flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <div
          className={
            showNavMenu
              ? "shrink-0 pt-[calc(env(safe-area-inset-top)+3.25rem)]"
              : "shrink-0 pt-[max(0.85rem,env(safe-area-inset-top))]"
          }
        >
          {onBack && !showNavMenu ? (
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/35 bg-[rgba(8,6,18,0.75)] text-lg text-violet-200/90 shadow-[0_0_14px_rgba(139,92,246,0.18)] transition hover:border-violet-400/55 hover:bg-violet-500/10"
            >
              ‹
            </button>
          ) : null}
        </div>

        <header className="pointer-events-none shrink-0 px-2 pb-6 pt-2 text-center">
          <h1 className="font-[var(--font-grotesk)] text-[clamp(1.75rem,3.2vw,2.75rem)] font-black uppercase leading-[0.95] tracking-[0.06em] text-white">
            Pick a Company
          </h1>
          <p className="mt-3 text-[clamp(0.85rem,1.2vw,1.05rem)] font-medium text-violet-100/85">
            Choose your sector, industry, and company to start your quest.
          </p>
        </header>

        <div className="relative z-30 mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col justify-center gap-5 py-2">
          <PickCompanyField label="Select Sector" step={1}>
            <select
              className={SELECT_CLASS}
              value={sectorId}
              onChange={(e) => handleSectorChange(e.target.value)}
              aria-label="Select sector"
            >
              <option value="">Choose a sector…</option>
              {SCHOOLS_PICK_COMPANY_SECTORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {`${item.icon} ${item.label}`}
                </option>
              ))}
            </select>
          </PickCompanyField>

          <PickCompanyField label="Select Industry" step={2}>
            <select
              className={SELECT_CLASS}
              value={industryId}
              disabled={!sectorId}
              onChange={(e) => handleIndustryChange(e.target.value)}
              aria-label="Select industry"
            >
              <option value="">
                {sectorId ? "Choose an industry…" : "Select a sector first"}
              </option>
              {(sector?.industries ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </PickCompanyField>

          <PickCompanyField label="Select Company" step={3}>
            <select
              className={SELECT_CLASS}
              value={companyName}
              disabled={!industryId}
              onChange={(e) => setCompanyName(e.target.value)}
              aria-label="Select company"
            >
              <option value="">
                {industryId ? "Choose a company…" : "Select an industry first"}
              </option>
              {companies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </PickCompanyField>

          {canStartQuest ? (
            <p className="text-center text-sm font-semibold tracking-[0.04em] text-amber-200/90">
              Ready to research {companyName} in {industry?.label}.
            </p>
          ) : (
            <p className="text-center text-xs text-ink-2">
              Complete all three steps to start your quest.
            </p>
          )}
        </div>
      </div>

      <footer className="iq-schools-opening-cta-dock pointer-events-none absolute inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto w-full max-w-lg px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] text-center">
          <NeonButton
            type="button"
            disabled={!canStartQuest}
            onClick={handleStartQuest}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[54px] rounded-full px-8 py-3.5",
              "border-2 border-amber-300/50",
              "text-sm font-bold uppercase tracking-[0.14em] text-amber-100",
              "shadow-[0_0_24px_rgba(245,197,71,0.18)]"
            ].join(" ")}
          >
            Start Quest
          </NeonButton>
        </div>
      </footer>
    </div>
  );
}
