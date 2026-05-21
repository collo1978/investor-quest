"use client";

import type { PromptQualityAnalysis } from "@/lib/ai/promptQualityAnalysis";
import { panelClass, scoreColor } from "./promptStudioTheme";

export function PromptQualityScorecard({
  quality,
  compact = false
}: {
  quality: PromptQualityAnalysis;
  compact?: boolean;
}) {
  const metrics = [
    {
      label: "Beginner readability",
      score: quality.readability.score,
      hint: `Grade ~${quality.readability.gradeLevel} · ${quality.readability.avgWordsPerSentence} words/sentence`
    },
    {
      label: "Low repetition",
      score: quality.repetition.score,
      hint: quality.repetition.openingRepeated
        ? "Opening echoes prior card"
        : "Distinct from prior cards"
    },
    {
      label: "Human-first flow",
      score: quality.teachingFlow.score,
      hint: quality.teachingFlow.humanFirstPass
        ? "Real life → pain → analogy → why investors care"
        : quality.teachingFlow.humanFirstFlags.join(", ") || "Structure needs work"
    }
  ];

  const allTips = [
    ...quality.readability.tips,
    ...quality.repetition.tips,
    ...quality.teachingFlow.tips
  ].slice(0, compact ? 3 : 6);

  return (
    <div className={compact ? "space-y-3" : `${panelClass} space-y-4`}>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`rounded-xl border border-white/10 bg-black/30 px-4 py-2 ${scoreColor(quality.compositeScore)}`}
        >
          <p className="text-[10px] uppercase text-white/45">Composite</p>
          <p className="text-2xl font-semibold tabular-nums">
            {quality.compositeScore}
          </p>
          {quality.productionReady ? (
            <p className="text-[10px] text-emerald-400/90">Ready to save</p>
          ) : (
            <p className="text-[10px] text-amber-300/80">Rewrite required</p>
          )}
        </div>
        {metrics.map((m) => (
          <div
            key={m.label}
            className="min-w-[120px] rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <p className="text-[10px] text-white/45">{m.label}</p>
            <p className={`text-lg font-semibold tabular-nums ${scoreColor(m.score)}`}>
              {m.score}
            </p>
            <p className="text-[10px] text-white/40">{m.hint}</p>
          </div>
        ))}
      </div>

      {quality.flags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {quality.flags.map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55"
            >
              {f.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      ) : null}

      {allTips.length > 0 ? (
        <ul className="space-y-1 text-xs text-white/60">
          {allTips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
