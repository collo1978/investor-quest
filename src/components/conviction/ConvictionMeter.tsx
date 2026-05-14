"use client";

import type { ConvictionMeter } from "@/lib/conviction";

export function ConvictionMeter({
  meter,
  ticker
}: {
  meter: ConvictionMeter;
  ticker: string;
}) {
  const has = meter.confidentWeight + meter.cautiousWeight > 0;
  return (
    <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-4 py-3 backdrop-blur-md">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2">
        Conviction meter · {ticker}
      </div>
      {!has ? (
        <p className="mt-2 text-sm text-ink-2">
          No conviction votes yet for this ticker.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-baseline gap-3 text-ink-0">
          <span className="font-[var(--font-grotesk)] text-2xl font-semibold tabular-nums text-emerald-300">
            {meter.confidentPct}%{" "}
            <span className="text-lg" aria-hidden>
              👍
            </span>
          </span>
          <span className="text-ink-2">·</span>
          <span className="font-[var(--font-grotesk)] text-lg tabular-nums text-orange-200/90">
            Cautious: {meter.cautiousPct}%{" "}
            <span className="text-base" aria-hidden>
              👎
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
