"use client";

import { useEffect, useState } from "react";

import { NeonButton } from "@/components/NeonButton";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  readPickInterestsSelection,
  writePickInterestsSelection
} from "@/lib/bank/pickInterestsState";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import {
  SCHOOLS_PICK_INTERESTS_GRID,
  SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT,
  type SchoolsPickInterestCard
} from "@/lib/schools/schoolsPickInterestsConfig";
import { shouldRunSchoolsDemoBackgroundSystems } from "@/lib/schools/schoolsDemoProtection";

export type SchoolsPickInterestsScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

function InterestGameCard({
  card,
  selected,
  dimmed,
  onToggle
}: {
  card: SchoolsPickInterestCard;
  selected: boolean;
  dimmed: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showEnergy = hovered || selected;

  const handleSelect = () => {
    if (dimmed) return;
    onToggle();
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={dimmed}
      aria-label={`Select ${card.label}`}
      onClick={handleSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={[
        "group relative z-10 flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border text-center transition-[transform,box-shadow,border-color,opacity] duration-200",
        "pointer-events-auto touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70",
        dimmed
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer md:hover:scale-[1.03]",
        selected
          ? "iq-schools-pick-interest-selected border-violet-200/70 bg-[rgba(139,92,246,0.18)]"
          : "border-violet-500/25 bg-[rgba(8,6,18,0.72)] md:hover:border-violet-300/45"
      ].join(" ")}
      style={{
        boxShadow: selected
          ? `0 0 0 1px rgba(196,181,253,0.45), 0 0 36px ${card.glow}, 0 0 64px rgba(109,40,217,0.22), inset 0 1px 0 rgba(255,255,255,0.12)`
          : showEnergy
            ? `0 0 24px rgba(139,92,246,0.22), inset 0 1px 0 rgba(255,255,255,0.06)`
            : "inset 0 1px 0 rgba(255,255,255,0.04)"
      }}
    >
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          card.accent
        ].join(" ")}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_58%)]"
      />

      {selected ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-violet-200/50 bg-[rgba(8,6,18,0.85)] text-xs font-bold text-violet-100 shadow-[0_0_16px_rgba(139,92,246,0.45)]"
        >
          ✓
        </span>
      ) : null}

      <span
        aria-hidden
        className={[
          "pointer-events-none relative text-[clamp(2rem,3.2vw,3.25rem)] leading-none transition-transform duration-200",
          showEnergy ? "scale-110 text-violet-100" : "text-violet-200/90"
        ].join(" ")}
      >
        {card.icon}
      </span>
      <span
        className={[
          "pointer-events-none relative mt-3 px-2 font-[var(--font-grotesk)] text-[clamp(0.72rem,1.05vw,0.95rem)] font-bold uppercase tracking-[0.08em]",
          selected ? "text-violet-50" : "text-ink-0"
        ].join(" ")}
      >
        {card.label}
      </span>
    </button>
  );
}

/** Schools onboarding — game-style pick 1 interest (4×2 grid). */
export function SchoolsPickInterestsScreen({
  onContinue,
  onBack
}: SchoolsPickInterestsScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const canContinue = selected.length === SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT;

  useRunOnceOnMount(() => {
    setSelected(
      readPickInterestsSelection().slice(0, SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT)
    );
    warmBankPickInterestsCatalog();
  });

  useEffect(() => {
    writePickInterestsSelection(selected);
  }, [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT === 1) return [id];
      if (prev.length >= SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT) return prev;
      return [...prev, id];
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (shouldRunSchoolsDemoBackgroundSystems()) {
      const guestId = getOrCreateOnboardingGuestId();
      void fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, interestIds: selected })
      });
    }
    onContinue();
  };

  return (
    <div className="iq-schools-deck-pick-interests relative isolate flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_8%,rgba(139,92,246,0.2),transparent_62%),radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(109,40,217,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [background-image:radial-gradient(rgba(139,92,246,0.35)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="iq-schools-deck-pick-body relative z-20 flex min-h-0 flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
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

        <header className="pointer-events-none shrink-0 px-2 pb-4 pt-1 text-center">
          <h1 className="font-[var(--font-grotesk)] text-[clamp(1.85rem,3.4vw,3rem)] font-black uppercase leading-[0.95] tracking-[0.06em] text-white">
            Pick 1 interest
          </h1>
          <p className="mt-3 text-[clamp(0.85rem,1.2vw,1.05rem)] font-medium text-violet-100/85">
            We&apos;ll choose a stock for your first quest.
          </p>
        </header>

        <div className="relative z-30 flex min-h-0 flex-1 items-center justify-center py-1 md:py-2">
          <div className="iq-schools-deck-pick-grid pointer-events-auto grid h-full w-full max-h-[min(58vh,580px)] max-w-[min(1240px,96vw)] grid-cols-4 grid-rows-2 gap-[clamp(0.75rem,1.35vw,1.25rem)]">
            {SCHOOLS_PICK_INTERESTS_GRID.map((card) => {
              const active = selected.includes(card.id);
              const atMax = selected.length >= SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT;
              const dimmed =
                SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT > 1 && !active && atMax;
              return (
                <InterestGameCard
                  key={card.id}
                  card={card}
                  selected={active}
                  dimmed={dimmed}
                  onToggle={() => toggle(card.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <footer className="iq-schools-opening-cta-dock pointer-events-none absolute inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto w-full max-w-lg px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] text-center">
          {canContinue ? (
            <p className="mb-3 text-sm font-semibold tracking-[0.04em] text-violet-200/90">
              Nice choice.
            </p>
          ) : (
            <p className="mb-3 text-xs text-ink-2">Select 1 to continue</p>
          )}
          <NeonButton
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
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
