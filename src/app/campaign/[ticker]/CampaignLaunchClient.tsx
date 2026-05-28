"use client";

import Link from "next/link";
import { useMemo } from "react";

import { NeonButton } from "@/components/NeonButton";
import { useGame } from "@/components/GameProvider";
import { COMPANIES, isCompanyId } from "@/data/companies";
import { isPlayableDemoCompanyId } from "@/lib/demo/playableDemo";

type Props = { ticker: string };

export function CampaignLaunchClient({ ticker }: Props) {
  const { actions } = useGame();
  const upper = ticker.toUpperCase();
  const match = useMemo(
    () => COMPANIES.find((c) => c.ticker.toUpperCase() === upper),
    [upper]
  );
  const canSwitch = match && isCompanyId(match.id) && isPlayableDemoCompanyId(match.id);

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#050508] text-ink-0 md:min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(168,85,247,0.2),transparent_55%)]"
      />
      <div className="relative z-[1] mx-auto max-w-lg px-6 py-10 md:py-14">
        <Link
          href="/explore/my-interests"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-1 hover:text-ink-0"
        >
          <span className="text-violet-300 group-hover:text-violet-200" aria-hidden>
            ←
          </span>
          Back to My Interests
        </Link>

        <h1
          className="mt-8 font-[var(--font-grotesk)] text-3xl md:text-4xl"
          style={{ textShadow: "0 0 36px rgba(168,85,247,0.35)" }}
        >
          Launch {upper}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-1">
          {canSwitch
            ? "This ticker matches a live Investor Quest campaign. Jump to the map to run quests, or switch your active company first."
            : "This ticker isn't in the demo yet — Apple, Nike, and NVIDIA are live. Open the map to continue your current campaign, or return to explore."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {canSwitch ? (
            <Link
              href="/map"
              onClick={() => {
                actions.setActiveCompany(match!.id);
              }}
              className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-[rgba(139,92,246,0.44)] bg-[rgba(139,92,246,0.14)] px-4 py-[10px] text-sm font-semibold text-neon-300 shadow-[0_0_0_1px_rgba(139,92,246,0.22),0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl transition hover:bg-[rgba(139,92,246,0.18)] active:translate-y-[0.5px]"
            >
              Enter map as {upper}
            </Link>
          ) : (
            <NeonButton href="/map">Open quest map</NeonButton>
          )}
          <NeonButton variant="ghost" href="/explore">
            Explore hub
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
