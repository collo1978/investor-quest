"use client";

import type {
  BehaviorStorySummary,
  BehaviorStorySummaryItem,
  PlayerJourneyMood,
  PlayerJourneyStage
} from "@/platform/gamification/behavioralDesign/analytics/types";
import { opsPanel } from "@/components/operations/opsTheme";

const VISUAL_ACCENT: Record<BehaviorStorySummaryItem["visual"], string> = {
  progress: "from-violet-500/30 to-violet-600/10",
  onboarding: "from-sky-500/30 to-sky-600/10",
  learning: "from-emerald-500/30 to-emerald-600/10",
  curiosity: "from-fuchsia-500/30 to-fuchsia-600/10",
  retention: "from-amber-500/30 to-amber-600/10",
  social: "from-rose-500/30 to-rose-600/10",
  rewards: "from-orange-500/30 to-orange-600/10",
  friction: "from-amber-600/35 to-red-600/10",
  habit: "from-violet-400/25 to-indigo-600/10",
  trust: "from-slate-400/25 to-violet-600/10"
};

const MOOD_HEIGHT: Record<PlayerJourneyMood, string> = {
  high: "h-[72%]",
  medium: "h-[48%]",
  low: "h-[28%]",
  rising: "h-[58%]"
};

const MOOD_COLOR: Record<PlayerJourneyMood, string> = {
  high: "bg-violet-400",
  medium: "bg-violet-400/55",
  low: "bg-amber-400/80",
  rising: "bg-gradient-to-t from-sky-500/80 to-violet-400"
};

function SummaryCard({
  item,
  variant
}: {
  item: BehaviorStorySummaryItem;
  variant: "working" | "attention";
}) {
  const accent = VISUAL_ACCENT[item.visual];
  const ring =
    variant === "working"
      ? "ring-emerald-500/20 hover:ring-emerald-400/35"
      : "ring-amber-500/25 hover:ring-amber-400/40";

  return (
    <li
      className={`rounded-xl border border-white/8 bg-gradient-to-br ${accent} p-3.5 ring-1 transition-shadow ${ring}`}
    >
      <p className="text-[13px] font-bold text-white">{item.label}</p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">{item.description}</p>
    </li>
  );
}

function JourneyTimeline({ stages }: { stages: PlayerJourneyStage[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        Player journey (how motivation tends to shift)
      </p>
      <div className="mt-4 flex items-end justify-between gap-1 sm:gap-2">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="relative flex h-24 w-full max-w-[4.5rem] items-end justify-center rounded-lg bg-white/[0.04] px-1">
              <div
                className={`w-full max-w-[2rem] rounded-t-md transition-all ${MOOD_HEIGHT[stage.mood]} ${MOOD_COLOR[stage.mood]}`}
                title={stage.caption}
              />
              {i < stages.length - 1 ? (
                <span
                  className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-white/15 sm:block"
                  aria-hidden
                />
              ) : null}
            </div>
            <p className="text-center text-[10px] font-semibold text-white/80">{stage.label}</p>
            <p className="text-center text-[9px] leading-snug text-white/45">{stage.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BehaviorStorySummaryPanel({ summary }: { summary: BehaviorStorySummary }) {
  return (
    <section
      className={`${opsPanel} relative overflow-hidden border-violet-500/25 bg-gradient-to-br from-violet-500/[0.1] via-[#0a0814] to-sky-500/[0.06]`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(139,92,246,0.18),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-5">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Behavior Story Summary
          </p>
          <p className="mt-2 text-[17px] font-bold leading-snug text-white sm:text-lg">
            {summary.oneLine}
          </p>
          <p className="mt-2 text-[12px] text-white/45">
            What real users are likely experiencing — in plain language
          </p>
        </header>

        <JourneyTimeline stages={summary.playerJourney} />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-emerald-200/90">
                What&apos;s working
              </h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {summary.whatsWorking.map((item) => (
                <SummaryCard key={item.id} item={item} variant="working" />
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-amber-200/90">
                What needs attention
              </h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {summary.needsAttention.map((item) => (
                <SummaryCard key={item.id} item={item} variant="attention" />
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/[0.12] via-violet-500/[0.08] to-transparent p-4 ring-1 ring-sky-400/20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/80">
            Biggest opportunity
          </p>
          <h3 className="mt-2 text-[16px] font-bold text-white">
            {summary.biggestOpportunity.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/75">
            {summary.biggestOpportunity.description}
          </p>
          <p className="mt-3 rounded-lg bg-black/25 px-3 py-2 text-[12px] text-sky-200/80 ring-1 ring-white/10">
            <span className="font-semibold text-sky-100/90">Suggested focus: </span>
            {summary.biggestOpportunity.actionHint}
          </p>
        </div>
      </div>
    </section>
  );
}
