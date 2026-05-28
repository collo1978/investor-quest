"use client";

import Link from "next/link";

import { buildBehavioralIntelligence } from "@/platform/gamification/behavioralDesign/buildBehavioralIntelligence";
import { DEFAULT_BEHAVIORAL_AUDIT_SCORES } from "@/platform/gamification/behavioralDesign/defaultScores";
import { buildPlaceholderAnalyticsSnapshot } from "@/platform/gamification/behavioralDesign/analytics/placeholderAnalytics";
import { opsPanel } from "@/components/operations/opsTheme";

/** Mission Control teaser — full audits live under Gamification mechanics */
export function BehavioralIntelligenceTeaser() {
  const intelligence = buildBehavioralIntelligence({
    manualScores: DEFAULT_BEHAVIORAL_AUDIT_SCORES,
    analytics: buildPlaceholderAnalyticsSnapshot(28)
  });

  return (
    <section className={`${opsPanel} border-violet-500/20 bg-violet-500/[0.04]`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
            Behavioral Intelligence
          </p>
          <p className="mt-1 text-[14px] font-semibold leading-snug text-white/90">
            {intelligence.behaviorStory.summary.oneLine}
          </p>
          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/55">
            {intelligence.behaviorStory.summary.biggestOpportunity.title} —{" "}
            {intelligence.behaviorStory.summary.biggestOpportunity.description}
          </p>
        </div>
        <Link
          href="/admin/gamification"
          className="shrink-0 rounded-lg bg-violet-500/20 px-3 py-2 text-[12px] font-semibold text-violet-100 ring-1 ring-violet-400/35 hover:bg-violet-500/30 touch-manipulation"
        >
          Open audits →
        </Link>
      </div>
    </section>
  );
}
