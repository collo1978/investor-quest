"use client";

import { useState } from "react";

import type {
  ClientReportAudience,
  ClientReportSlice
} from "@/platform/gamification/behavioralDesign/analytics/types";
import { opsPanel } from "@/components/operations/opsTheme";

const AUDIENCE_LABELS: Record<ClientReportAudience, string> = {
  school: "Schools",
  broker: "Brokers",
  bank: "Banks",
  program: "Programs",
  internal: "Internal product"
};

export function ClientReportingPanel({ reports }: { reports: ClientReportSlice[] }) {
  const [active, setActive] = useState<ClientReportAudience>("program");
  const slice = reports.find((r) => r.audience === active) ?? reports[0];
  if (!slice) return null;

  return (
    <div className={`${opsPanel} border-sky-500/15`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/80">
        Client reporting
      </p>
      <p className="mt-1 text-[12px] text-white/50">
        Audience-specific summaries for partner decks and compliance reviews.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {reports.map((r) => (
          <button
            key={r.audience}
            type="button"
            onClick={() => setActive(r.audience)}
            className={[
              "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold touch-manipulation transition-colors",
              active === r.audience
                ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                : "bg-white/5 text-white/55 hover:bg-white/10"
            ].join(" ")}
          >
            {AUDIENCE_LABELS[r.audience]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <h4 className="text-[15px] font-bold text-white">{slice.title}</h4>
        <p className="text-[13px] leading-relaxed text-white/65">{slice.summary}</p>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
            Highlights
          </p>
          <ul className="mt-1.5 space-y-1 text-[12px] text-white/60">
            {slice.highlights.map((h) => (
              <li key={h}>• {h}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">
            Recommended actions
          </p>
          <ul className="mt-1.5 space-y-1 text-[12px] text-white/60">
            {slice.recommendedActions.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
