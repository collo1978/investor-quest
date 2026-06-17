"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import {
  BANK_BROKER_COMPANY_REVEAL_ROUTE,
  BANK_BROKER_SCREEN5_ONBOARDING_ROUTE
} from "@/lib/bank/bankBrokerPreviewRoutes";
import { hrefForBankOnboardingStep } from "@/lib/bank/bankBrokerOnboardingFlow";
import {
  PICK_INTERESTS_FALLBACK,
  PICK_INTERESTS_REQUIRED_COUNT,
  pickInterestsCatalogEqual,
  readPickInterestsSelection,
  writePickInterestsSelection
} from "@/lib/bank/pickInterestsState";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import type { OnboardingInterest } from "@/lib/onboarding/types";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";

type Props = {
  onContinue?: () => void;
  onBack?: () => void;
};

/**
 * “Pick 2 interests” — coded onboarding beat (bank/broker mobile preview flow).
 */
export function BankBrokerPickInterestsScreen({ onContinue, onBack }: Props) {
  const router = useRouter();
  const isPreviewEmbed = useMobilePreviewEmbed();
  const [selected, setSelected] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] =
    useState<OnboardingInterest[]>(PICK_INTERESTS_FALLBACK);

  useRunOnceOnMount(() => {
    setSelected(readPickInterestsSelection());
    warmBankPickInterestsCatalog();
  });

  useEffect(() => {
    writePickInterestsSelection(selected);
  }, [selected]);

  useEffect(() => {
    if (isPreviewEmbed || CONTROLLED_DEMO_MODE) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/onboarding/interests", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as { interests?: OnboardingInterest[] };
        if (cancelled || !body.interests?.length) return;
        setInterestOptions((current) =>
          pickInterestsCatalogEqual(current, body.interests!)
            ? current
            : body.interests!
        );
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPreviewEmbed]);

  const canContinue = selected.length === PICK_INTERESTS_REQUIRED_COUNT;
  const selectionHint = useMemo(() => {
    const n = selected.length;
    if (n === 0) return `Select ${PICK_INTERESTS_REQUIRED_COUNT} to continue`;
    if (n === 1) return "Select 1 more";
    return null;
  }, [selected.length]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= PICK_INTERESTS_REQUIRED_COUNT) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (onContinue) {
      onContinue();
      return;
    }

    const guestId = getOrCreateOnboardingGuestId();
    void fetch("/api/onboarding/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, interestIds: selected })
    });

    router.replace(
      hrefForBankOnboardingStep(BANK_BROKER_COMPANY_REVEAL_ROUTE, isPreviewEmbed)
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.replace(
      hrefForBankOnboardingStep(BANK_BROKER_SCREEN5_ONBOARDING_ROUTE, isPreviewEmbed)
    );
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(139,92,246,0.14),transparent_58%)]"
      />

      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5">
        <div className="mx-auto w-full max-w-[420px] pt-2 pb-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/35 bg-[rgba(8,6,18,0.75)] text-violet-200/90 shadow-[0_0_12px_rgba(139,92,246,0.15)] transition hover:border-violet-400/50 hover:bg-violet-500/10"
          >
            ‹
          </button>

          <header className="text-center">
            <h1 className="font-[var(--font-grotesk)] text-[1.65rem] font-extrabold leading-tight tracking-tight text-white sm:text-[1.85rem]">
              Pick 2 interests
            </h1>
            <p className="mt-2 text-sm text-ink-2">Will pick a stock to match.</p>
          </header>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-3 [content-visibility:visible]">
            {interestOptions.map((it) => {
              const active = selected.includes(it.id);
              const atMax = selected.length >= PICK_INTERESTS_REQUIRED_COUNT;
              const dimmed = !active && atMax;

              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => toggle(it.id)}
                  aria-pressed={active}
                  className={[
                    "group relative min-h-[5.5rem] rounded-2xl border px-2.5 py-3.5 text-center transition-[box-shadow,transform,background-color,border-color,opacity] duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-violet-400/55",
                    active
                      ? "border-[rgba(139,92,246,0.55)] bg-[rgba(139,92,246,0.14)] shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_24px_rgba(139,92,246,0.28)]"
                      : dimmed
                        ? "border-panel-border/60 bg-[rgba(255,255,255,0.02)] opacity-45"
                        : "border-panel-border bg-[rgba(255,255,255,0.03)] hover:border-violet-400/35 hover:bg-[rgba(139,92,246,0.08)] hover:shadow-[0_0_18px_rgba(139,92,246,0.16)] md:hover:scale-[1.02]"
                  ].join(" ")}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute right-2 top-2 text-[10px] font-bold text-violet-300"
                    >
                      ✓
                    </span>
                  ) : null}
                  <div className="text-lg text-neon-300 sm:text-xl">{it.icon}</div>
                  <div className="mt-1.5 text-[10px] font-semibold leading-snug text-ink-0 sm:text-[11px]">
                    {it.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="iq-schools-opening-cta-dock relative z-10 shrink-0">
        <div className="mx-auto w-full max-w-[22rem]">
          {selectionHint ? (
            <p className="mb-2 text-center text-[11px] text-ink-2">{selectionHint}</p>
          ) : null}
          <NeonButton
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[52px] rounded-full px-6 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-semibold normal-case tracking-[0.02em]"
            ].join(" ")}
          >
            Continue
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
