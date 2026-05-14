"use client";

import Link from "next/link";
import { ConvictionMeter } from "@/components/conviction/ConvictionMeter";
import { useGame } from "@/components/GameProvider";
import { useConviction } from "@/hooks/useConviction";
import { companyById } from "@/data/companies";

export default function ConvictionLeaderboardPage() {
  const { state } = useGame();
  const { leaderboard, meterFor } = useConviction();
  const company = companyById(state.activeCompanyId);
  const meter = meterFor(company.ticker);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-[var(--font-grotesk)] text-2xl text-ink-0 sm:text-3xl">
          Top conviction companies
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          Weighted by filing type (10-K ×3, 10-Q ×2, earnings ×1).
        </p>
      </div>

      <div className="mb-8">
        <ConvictionMeter meter={meter} ticker={company.ticker} />
      </div>

      <ol className="space-y-3">
        {leaderboard.length === 0 ? (
          <li className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-4 py-6 text-center text-sm text-ink-2">
            No conviction votes yet. Clear an island and share how you feel
            to populate this board.
          </li>
        ) : (
          leaderboard.map((row) => (
            <li
              key={row.ticker}
              className="flex items-center justify-between gap-4 rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-4 py-3 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] text-sm font-bold text-neon-300">
                  {row.rank}
                </span>
                <span className="font-semibold text-ink-0">{row.ticker}</span>
              </div>
              <span className="font-[var(--font-grotesk)] text-lg tabular-nums text-emerald-300">
                {row.confidentPct}%{" "}
                <span className="text-base" aria-hidden>
                  👍
                </span>
              </span>
            </li>
          ))
        )}
      </ol>

      <p className="mt-10 text-center text-xs text-ink-2">
        <Link href="/map" className="text-neon-300 underline-offset-2 hover:underline">
          Back to map
        </Link>
      </p>
    </main>
  );
}
