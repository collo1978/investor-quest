"use client";

import { useEffect, useState } from "react";

import { NeonButton } from "@/components/NeonButton";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import {
  readSchoolsStocksExperienceSelections,
  SCHOOLS_STOCKS_EXPERIENCE_OPTIONS,
  writeSchoolsStocksExperienceSelections,
  type SchoolsStocksExperienceId,
  type SchoolsStocksExperienceOption
} from "@/lib/schools/schoolsStocksExperience";

export type SchoolsSoundsLikeYouScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

function ExperienceOptionCard({
  option,
  selected,
  onToggle
}: {
  option: SchoolsStocksExperienceOption;
  selected: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showEnergy = hovered || selected;

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={option.label}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={[
        "group relative flex min-h-0 w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 md:gap-4 md:px-4 md:py-3",
        "pointer-events-auto touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70",
        "md:hover:scale-[1.01]",
        selected
          ? "iq-schools-stocks-option--selected border-violet-200/65 bg-[rgba(139,92,246,0.16)]"
          : "border-violet-500/22 bg-[rgba(8,6,18,0.78)] md:hover:border-violet-300/42"
      ].join(" ")}
      style={{
        boxShadow: selected
          ? "0 0 0 1px rgba(196,181,253,0.4), 0 0 28px rgba(139,92,246,0.28), inset 0 1px 0 rgba(255,255,255,0.1)"
          : showEnergy
            ? "0 0 20px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)"
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(139,92,246,0.12),transparent_58%)] opacity-80"
      />

      <span
        aria-hidden
        className={[
          "pointer-events-none relative shrink-0 text-[clamp(1.35rem,2.2vw,1.75rem)] leading-none transition-transform duration-200",
          showEnergy ? "scale-110" : ""
        ].join(" ")}
      >
        {option.emoji}
      </span>

      <span
        className={[
          "pointer-events-none relative min-w-0 flex-1 font-[var(--font-inter)] text-[clamp(0.78rem,1.05vw,0.95rem)] font-medium leading-snug",
          selected ? "text-violet-50" : "text-violet-100/88"
        ].join(" ")}
      >
        {option.label}
      </span>

      <span
        aria-hidden
        className={[
          "pointer-events-none relative grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px] font-bold transition-all duration-200",
          selected
            ? "border-violet-200/55 bg-[rgba(8,6,18,0.9)] text-violet-100 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
            : "border-violet-500/20 bg-[rgba(8,6,18,0.45)] text-transparent"
        ].join(" ")}
      >
        ✓
      </span>
    </button>
  );
}

/**
 * Schools onboarding — stocks experience multi-select (screen 5).
 */
export function SchoolsSoundsLikeYouScreen({
  onContinue,
  onBack
}: SchoolsSoundsLikeYouScreenProps) {
  const [selected, setSelected] = useState<SchoolsStocksExperienceId[]>([]);
  const canContinue = selected.length > 0;

  useRunOnceOnMount(() => {
    setSelected(readSchoolsStocksExperienceSelections());
    warmBankPickInterestsCatalog();
  });

  useEffect(() => {
    writeSchoolsStocksExperienceSelections(selected);
  }, [selected]);

  const toggle = (id: SchoolsStocksExperienceId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="iq-schools-stocks-experience relative isolate flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_8%,rgba(139,92,246,0.2),transparent_62%),radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(109,40,217,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [background-image:radial-gradient(rgba(139,92,246,0.35)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="iq-schools-stocks-experience-body relative z-20 flex min-h-0 flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <div className="flex shrink-0 items-center pt-[max(0.85rem,env(safe-area-inset-top))]">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/35 bg-[rgba(8,6,18,0.75)] text-lg text-violet-200/90 shadow-[0_0_14px_rgba(139,92,246,0.18)] transition hover:border-violet-400/55 hover:bg-violet-500/10"
          >
            ‹
          </button>
        </div>

        <header className="pointer-events-none shrink-0 px-2 pb-3 pt-1 text-center md:pb-4">
          <h1 className="font-[var(--font-grotesk)] text-[clamp(1.55rem,2.8vw,2.35rem)] font-black uppercase leading-[0.98] tracking-[0.05em] text-white">
            When it comes to stocks...
          </h1>
          <p className="mt-2 text-[clamp(0.88rem,1.15vw,1.05rem)] font-medium text-violet-100/85">
            Pick all that sound like you.
          </p>
        </header>

        <div className="relative z-30 flex min-h-0 flex-1 items-center justify-center py-1">
          <div className="iq-schools-stocks-experience-grid pointer-events-auto grid h-full w-full max-w-[min(920px,96vw)] grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5 [&>button:last-child:nth-child(odd)]:md:col-span-2 [&>button:last-child:nth-child(odd)]:md:max-w-md [&>button:last-child:nth-child(odd)]:md:justify-self-center">
            {SCHOOLS_STOCKS_EXPERIENCE_OPTIONS.map((option) => (
              <ExperienceOptionCard
                key={option.id}
                option={option}
                selected={selected.includes(option.id)}
                onToggle={() => toggle(option.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="iq-schools-opening-cta-dock pointer-events-none absolute inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto w-full max-w-lg px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] text-center">
          {canContinue ? (
            <p className="mb-3 text-sm font-semibold tracking-[0.04em] text-violet-200/90">
              {selected.length === 1
                ? "Got it — 1 selected."
                : `Got it — ${selected.length} selected.`}
            </p>
          ) : (
            <p className="mb-3 text-xs text-ink-2">Pick at least 1 to continue</p>
          )}
          <NeonButton
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[54px] rounded-full px-8 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-bold uppercase tracking-[0.14em]"
            ].join(" ")}
          >
            Continue
          </NeonButton>
        </div>
      </footer>
    </div>
  );
}
