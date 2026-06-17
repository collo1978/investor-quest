"use client";

import { NeonButton } from "@/components/NeonButton";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { BANK_MOBILE_MAP_PATH } from "@/lib/bank/bankMobileMapConfig";
import { preloadImage } from "@/lib/preloadImage";

/** 10-K mission brief — dossier art (`public/logos/10k-mission-brief.png`). */
export const BANK_10K_MISSION_BRIEF_IMG_SRC = "/logos/10k-mission-brief.png";

type Props = {
  onMissionAccepted: () => void;
  acceptedDisabled?: boolean;
};

/**
 * Mission brief beat — `mobile-map.png` backdrop + dossier card + CTA.
 */
export function BankBroker10kMissionBriefScreen({
  onMissionAccepted,
  acceptedDisabled = false
}: Props) {
  useRunOnceOnMount(() => {
    preloadImage(BANK_MOBILE_MAP_PATH);
    preloadImage(BANK_10K_MISSION_BRIEF_IMG_SRC);
  });

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#05050F]"
      role="main"
      aria-label="10-K mission brief"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img
          src={BANK_MOBILE_MAP_PATH}
          alt=""
          className="h-full w-full object-cover object-center opacity-[0.82]"
        />
        <div className="absolute inset-0 bg-[rgba(3,3,8,0.42)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_70%_at_50%_40%,rgba(139,92,246,0.12),transparent_62%)]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pt-[max(2.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mt-[4vh] flex w-full max-w-[min(88vw,20rem)] flex-col items-stretch gap-3.5">
          <div
            className="relative w-full rounded-[1.2rem] border-2 p-1"
            style={{
              borderColor: "rgba(245,197,71,0.62)",
              background: "rgba(8,7,14,0.88)",
              boxShadow:
                "0 0 0 1px rgba(245,197,71,0.2), 0 20px 52px rgba(0,0,0,0.5), 0 0 48px rgba(245,197,71,0.18), 0 0 32px rgba(139,92,246,0.14)"
            }}
          >
            <img
              src={BANK_10K_MISSION_BRIEF_IMG_SRC}
              alt="10-K Quest mission brief"
              width={1080}
              height={1920}
              decoding="async"
              fetchPriority="high"
              className="relative z-[1] mx-auto block h-auto w-full max-h-[min(46dvh,360px)] select-none object-contain object-center"
            />
          </div>

          <NeonButton
            type="button"
            disabled={acceptedDisabled}
            onClick={onMissionAccepted}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[56px] rounded-full px-6 py-4",
              "border-2 border-[rgba(245,197,71,0.55)]",
              "text-base font-extrabold uppercase tracking-[0.18em]",
              "shadow-[0_0_28px_rgba(245,197,71,0.22),0_0_40px_rgba(139,92,246,0.18)]"
            ].join(" ")}
          >
            MISSION ACCEPTED
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
