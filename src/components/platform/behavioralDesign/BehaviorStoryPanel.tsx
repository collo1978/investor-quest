"use client";

import { useState } from "react";

import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import type { BehavioralIntelligenceReport } from "@/platform/gamification/behavioralDesign/analytics/types";
import { BehaviorStorySummaryPanel } from "@/components/platform/behavioralDesign/BehaviorStorySummaryPanel";
import { opsPanel } from "@/components/operations/opsTheme";

const TONE_STYLES: Record<
  "insight" | "risk" | "opportunity" | "strength",
  { border: string; label: string }
> = {
  strength: { border: "border-emerald-500/20", label: "Going well" },
  insight: { border: "border-violet-500/20", label: "Worth noting" },
  opportunity: { border: "border-sky-500/20", label: "Opportunity" },
  risk: { border: "border-amber-500/25", label: "Needs care" }
};

export function BehaviorStoryPanel({
  intelligence
}: {
  intelligence: BehavioralIntelligenceReport;
}) {
  const { behaviorStory, intelligenceScore, dataMaturity } = intelligence;
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const tier = tierFromScoreOrLabel(intelligenceScore, null);
  const maturityLabel =
    dataMaturity === "live_analytics"
      ? "Using live user data"
      : dataMaturity === "placeholder_analytics"
        ? "Preview with sample cohort data"
        : "Based on product review scores";

  return (
    <div className="space-y-4">
      <BehaviorStorySummaryPanel summary={behaviorStory.summary} />

      <div className={`${opsPanel} flex flex-wrap items-center justify-between gap-3 !py-3`}>
        <p className="text-[12px] text-white/55">
          Overall behavioral health (for ops reference)
        </p>
        <div className="text-right">
          <p
            className="font-[var(--font-grotesk)] text-2xl font-bold tabular-nums"
            style={{ color: tier.color }}
          >
            {intelligenceScore}%
          </p>
          <p className="text-[10px] text-white/40">{maturityLabel}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/20">
        <button
          type="button"
          className="flex w-full min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-left touch-manipulation"
          onClick={() => setDeepDiveOpen((v) => !v)}
        >
          <div>
            <p className="text-[13px] font-semibold text-white/85">More detail (optional)</p>
            <p className="text-[11px] text-white/45">
              Fuller stories — framework jargon kept minimal
            </p>
          </div>
          <span className="text-white/40">{deepDiveOpen ? "▲" : "▼"}</span>
        </button>

        {deepDiveOpen ? (
          <div className="space-y-3 border-t border-white/8 px-4 py-4">
            {behaviorStory.blocks.map((block) => {
              const style = TONE_STYLES[block.tone];
              return (
                <article
                  key={block.id}
                  className={`rounded-xl border bg-black/25 p-4 ${style.border}`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                    {style.label}
                  </span>
                  <h4 className="mt-2 text-[14px] font-semibold text-white/90">{block.title}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                    {block.narrative}
                  </p>
                </article>
              );
            })}

            {behaviorStory.clientTakeaways.length > 0 ? (
              <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                  Quick lines for partner decks
                </p>
                <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-white/60">
                  {behaviorStory.clientTakeaways.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
