"use client";

import { useRouter } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { BANK_BROKER_SCREEN5_ONBOARDING_ROUTE } from "@/lib/bank/bankBrokerPreviewRoutes";
import { hrefForBankOnboardingStep } from "@/lib/bank/bankBrokerOnboardingFlow";

/** Bank/Broker Screen 4 — intro beat (`screen4-onboarding.png`). */
export const BANK_ONBOARDING_SCREEN4_IMG_SRC =
  "/logos/screen4-onboarding.png?v=2";

type Props = {
  onContinue?: () => void;
};

/**
 * Full-bleed “2 quick questions” intro + OK → “Which sounds more like you?”.
 */
export function BankBrokerOnboardingScreen4({ onContinue }: Props) {
  const router = useRouter();
  const isPreviewEmbed = useMobilePreviewEmbed();

  const handleOk = () => {
    if (onContinue) {
      onContinue();
      return;
    }

    router.replace(
      hrefForBankOnboardingStep(BANK_BROKER_SCREEN5_ONBOARDING_ROUTE, isPreviewEmbed)
    );
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#030308]">
        <img
          src={BANK_ONBOARDING_SCREEN4_IMG_SRC}
          alt=""
          aria-hidden
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
            onClick={handleOk}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[52px] rounded-full px-6 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-semibold normal-case tracking-[0.02em]"
            ].join(" ")}
          >
            OK
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
