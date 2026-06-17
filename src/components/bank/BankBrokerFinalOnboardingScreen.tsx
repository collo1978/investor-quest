"use client";

import { NeonButton } from "@/components/NeonButton";

/** Final onboarding beat — full-bleed art + LET'S GO (`final-screen-onboarding.png`). */
export const BANK_FINAL_ONBOARDING_IMG_SRC =
  "/logos/final-screen-onboarding.png";

type Props = {
  onLetsGo: () => void;
  letsGoDisabled?: boolean;
};

/**
 * Image-first final onboarding screen (bank flow + `/onboarding` step 2).
 * CTA sits in the bottom dock so it does not cover artwork copy.
 */
export function BankBrokerFinalOnboardingScreen({
  onLetsGo,
  letsGoDisabled = false
}: Props) {
  return (
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]"
      role="main"
      aria-label="Your first company match"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_12%,rgba(139,92,246,0.12),transparent_58%)]"
      />

      <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
        <img
          src={BANK_FINAL_ONBOARDING_IMG_SRC}
          alt="Your matched company"
          width={1080}
          height={1920}
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full select-none object-contain object-top"
        />
      </div>

      <div className="iq-schools-opening-cta-dock relative z-10 shrink-0">
        <div className="mx-auto w-full max-w-[22rem]">
          <NeonButton
            type="button"
            disabled={letsGoDisabled}
            onClick={onLetsGo}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[52px] rounded-full px-6 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-bold uppercase tracking-[0.14em]"
            ].join(" ")}
          >
            LET&apos;S GO
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
