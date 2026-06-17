"use client";

import { useRouter } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { SCHOOLS_OPENING_SCREEN2_HERO_SRC } from "@/components/opening/InvestorMasteryHeroScreen";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { toDemoHref } from "@/lib/demo/demoHref";

type Props = {
  onContinue?: () => void;
};

/**
 * Bank/Broker meaning beat — full-bleed `screen-2.png` + single CTA.
 * Used in `/demo/meaning-screen` and the mobile preview inspector.
 */
export function BankBrokerMeaningScreen({ onContinue }: Props) {
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
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <img
          src={SCHOOLS_OPENING_SCREEN2_HERO_SRC}
          alt=""
          aria-hidden
          width={1080}
          height={1920}
          decoding="async"
          fetchPriority="high"
          className="iq-bank-meaning-screen-hero block h-full w-full select-none object-cover object-[center_6%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,3,8,0.08)_0%,transparent_12%,transparent_72%,rgba(3,3,8,0.92)_100%)]"
        />
      </div>

      <div className="relative z-10 shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <NeonButton
          type="button"
          onClick={handleContinue}
          className={[
            "w-full justify-center",
            "min-h-[52px] rounded-full px-6 py-3.5",
            "border-2 border-violet-300/45",
            "text-sm font-semibold tracking-[0.02em] normal-case"
          ].join(" ")}
        >
          Let&apos;s do this
        </NeonButton>
      </div>
    </div>
  );
}
