"use client";

import { useState } from "react";

import type { FrameworkAnalyticsLayer } from "@/platform/gamification/behavioralDesign/analytics/types";
import { opsPanel } from "@/components/operations/opsTheme";

export function FrameworkAnalyticsPanel({ layer }: { layer: FrameworkAnalyticsLayer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${opsPanel} !p-0 overflow-hidden !shadow-none border-white/8`}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left touch-manipulation"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="text-[12px] font-semibold text-violet-200/90">{layer.label}</p>
          <p className="text-[10px] text-white/40">
            Future analytics · {layer.status === "placeholder" ? "simulated" : layer.status}
          </p>
        </div>
        <span className="text-white/35 text-[11px]">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-white/8 px-3 py-3">
          {layer.metricHighlights.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {layer.metricHighlights.map((h) => (
                <span
                  key={h.metricId}
                  className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white/65 ring-1 ring-white/10"
                >
                  {h.label}: <strong className="text-white/90">{h.value}</strong>
                  {h.trend === "up" ? " ↑" : h.trend === "down" ? " ↓" : ""}
                </span>
              ))}
            </div>
          ) : null}

          <ul className="space-y-2">
            {layer.questions.map((q) => (
              <li
                key={q.id}
                className="rounded-lg border border-dashed border-violet-500/20 bg-violet-500/[0.04] px-2.5 py-2"
              >
                <p className="text-[12px] text-white/70">{q.question}</p>
                {q.insightPreview ? (
                  <p className="mt-1 text-[10px] text-violet-300/70">{q.insightPreview}</p>
                ) : (
                  <p className="mt-1 text-[10px] italic text-white/35">
                    Awaiting live cohort data
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
