"use client";

import { useRouter } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { toDemoHref } from "@/lib/demo/demoHref";

/** Bank/Broker Screen 2 — Future of Investing hero (`screen2-onboarding.png`). */
export const BANK_FUTURE_OF_INVESTING_HERO_SRC =
  "/logos/screen2-onboarding.png";

type Props = {
  onNewUser?: () => void;
  onExistingAccount?: () => void;
};

/**
 * Full-bleed Future of Investing beat + Duolingo-style dual CTAs.
 * Used in `/demo/future-of-investing` and the mobile preview inspector.
 */
export function BankBrokerFutureOfInvestingScreen({
  onNewUser,
  onExistingAccount
}: Props) {
  const router = useRouter();
  const isPreviewEmbed = useMobilePreviewEmbed();

  const handleNewUser = () => {
    if (isPreviewEmbed) return;
    if (onNewUser) {
      onNewUser();
      return;
    }
    router.replace(toDemoHref("/onboarding"));
  };

  const handleExistingAccount = () => {
    if (isPreviewEmbed) return;
    onExistingAccount?.();
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <img
          src={BANK_FUTURE_OF_INVESTING_HERO_SRC}
          alt=""
          aria-hidden
          width={1080}
          height={1920}
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full select-none object-cover object-center"
        />
      </div>

      <div className="iq-schools-opening-cta-dock relative z-10 shrink-0">
        <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-2.5">
          <NeonButton
            type="button"
            onClick={handleNewUser}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[52px] rounded-full px-6 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-semibold normal-case tracking-[0.02em]"
            ].join(" ")}
          >
            I&apos;m new
          </NeonButton>
          <button
            type="button"
            onClick={handleExistingAccount}
            className={[
              "iq-schools-opening-cta-secondary w-full",
              "cursor-pointer transition",
              "hover:border-violet-300/40 hover:bg-[rgba(255,255,255,0.07)]",
              "text-[0.7rem] font-semibold normal-case tracking-[0.04em]"
            ].join(" ")}
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
