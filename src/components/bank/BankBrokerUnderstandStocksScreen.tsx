"use client";

import { useRouter } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { toDemoHref } from "@/lib/demo/demoHref";

/** Bank/Broker Screen 3 — Understand Stocks hero (`screen3-onboarding.png`). */
export const BANK_UNDERSTAND_STOCKS_HERO_SRC =
  "/logos/screen3-onboarding.png";

type Props = {
  onContinue?: () => void;
};

/**
 * Full-bleed Understand Stocks beat + single Continue CTA.
 * Used in `/demo/understand-stocks` and the mobile preview inspector.
 */
export function BankBrokerUnderstandStocksScreen({ onContinue }: Props) {
  const router = useRouter();
  const isPreviewEmbed = useMobilePreviewEmbed();

  const handleContinue = () => {
    if (isPreviewEmbed) return;

    if (onContinue) {
      onContinue();
      return;
    }

    router.replace(toDemoHref("/onboarding"));
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#030308]">
        <img
          src={BANK_UNDERSTAND_STOCKS_HERO_SRC}
          alt=""
          aria-hidden
          width={1080}
          height={1920}
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full select-none object-contain object-center"
        />
      </div>

      <div className="iq-schools-opening-cta-dock relative z-10 shrink-0">
        <div className="mx-auto w-full max-w-[22rem]">
          <NeonButton
            type="button"
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
