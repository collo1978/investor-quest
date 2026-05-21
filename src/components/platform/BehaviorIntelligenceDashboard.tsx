"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EVENT_TYPE_ICONS,
  EVENT_TYPE_LABELS,
  USER_ACTIVITY_EVENT_TYPES,
  type UserActivityEventType
} from "@/lib/analytics/eventTypes";
import type { GrowthAnalyticsPayload } from "@/lib/analytics/growthTypes";
import type { AnalyticsDashboardPayload } from "@/lib/analytics/types";
import { PlatformGrowthSection } from "@/components/platform/analytics/PlatformGrowthSection";
import {
  formatAnalyticsDateTime,
  formatAnalyticsNumber
} from "@/lib/analytics/formatDisplay";
import { useClientMounted } from "@/hooks/useClientMounted";
import {
  TIER_LABELS,
  TIER_PRESETS,
  type AnalyticsFeatureKey
} from "@/lib/analytics/tiers";
import { listPartners } from "@/platform/partners/partnerRegistry";
import { LockedFeatureGate } from "@/components/platform/analytics/LockedFeatureGate";
import { PartnerFeatureAccessPanel } from "@/components/platform/analytics/PartnerFeatureAccessPanel";

type ViewMode = "admin" | "client";

const PILLARS = ["business", "forces", "financials", "management"] as const;
const COMPANIES = ["AAPL", "NVDA", "TSLA", "AMZN", "META"] as const;

function AnimatedMetric({
  label,
  value,
  suffix = "",
  mounted
}: {
  label: string;
  value: number | string;
  suffix?: string;
  mounted: boolean;
}) {
  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 12 } : false}
      animate={mounted ? { opacity: 1, y: 0 } : undefined}
      className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.12] to-black/40 p-4 shadow-[0_0_32px_-12px_rgba(168,85,247,0.55)] backdrop-blur-md"
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/70">
        {label}
      </div>
      <div className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold tabular-nums text-white">
        {typeof value === "number" ? formatAnalyticsNumber(value) : value}
        {suffix}
      </div>
    </motion.div>
  );
}

function InsightCard({
  title,
  body,
  mounted
}: {
  title: string;
  body: string;
  mounted: boolean;
}) {
  return (
    <motion.div
      whileHover={mounted ? { y: -2 } : undefined}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition hover:border-violet-400/35 hover:shadow-[0_0_28px_-10px_rgba(168,85,247,0.45)]"
    >
      <h3 className="text-sm font-semibold text-violet-200">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/72">{body}</p>
    </motion.div>
  );
}

function FunnelStep({
  label,
  count,
  delay,
  mounted
}: {
  label: string;
  count: number;
  delay: number;
  mounted: boolean;
}) {
  return (
    <motion.div
      initial={mounted ? { opacity: 0, scale: 0.96 } : false}
      animate={mounted ? { opacity: 1, scale: 1 } : undefined}
      transition={{ delay }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/40 bg-violet-500/15 text-lg font-bold text-violet-100 shadow-[0_0_24px_-8px_rgba(168,85,247,0.6)]"
        animate={
          mounted
            ? {
                boxShadow: [
                  "0 0 20px -8px rgba(168,85,247,0.35)",
                  "0 0 28px -6px rgba(168,85,247,0.55)",
                  "0 0 20px -8px rgba(168,85,247,0.35)"
                ]
              }
            : undefined
        }
        transition={{ duration: 3, repeat: Infinity }}
      >
        {formatAnalyticsNumber(count)}
      </motion.div>
      <span className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
        {label}
      </span>
    </motion.div>
  );
}

function Gated({
  feature,
  title,
  enabled,
  isClient,
  children
}: {
  feature: AnalyticsFeatureKey;
  title: string;
  enabled: boolean;
  isClient: boolean;
  children: React.ReactNode;
}) {
  return (
    <LockedFeatureGate
      feature={feature}
      enabled={enabled}
      isClientView={isClient}
      title={title}
    >
      {children}
    </LockedFeatureGate>
  );
}

export function BehaviorIntelligenceDashboard() {
  const mounted = useClientMounted();
  const partners = useMemo(() => listPartners(), []);
  const [viewMode, setViewMode] = useState<ViewMode>("client");
  const [loading, setLoading] = useState(true);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [data, setData] = useState<AnalyticsDashboardPayload | null>(null);
  const [growth, setGrowth] = useState<GrowthAnalyticsPayload | null>(null);

  const [partnerId, setPartnerId] = useState("all");
  const [companyTicker, setCompanyTicker] = useState("all");
  const [pillar, setPillar] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const load = useCallback(async () => {
    setLoading(true);
    setGrowthLoading(true);
    try {
      const qs = new URLSearchParams({
        partnerId,
        companyTicker,
        pillar,
        eventType,
        dateRange,
        viewMode
      });
      const growthQs = new URLSearchParams({
        partnerId,
        companyTicker,
        pillar,
        eventType,
        dateRange
      });
      const [res, growthRes] = await Promise.all([
        fetch(`/api/admin/analytics?${qs}`, { cache: "no-store" }),
        fetch(`/api/admin/analytics/growth?${growthQs}`, { cache: "no-store" })
      ]);
      const body = (await res.json()) as AnalyticsDashboardPayload & {
        error?: string;
      };
      const growthBody = (await growthRes.json()) as GrowthAnalyticsPayload & {
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Failed to load analytics");
      setData(body);
      if (growthRes.ok) setGrowth(growthBody);
      else setGrowth(null);
    } catch {
      setData(null);
      setGrowth(null);
    } finally {
      setLoading(false);
      setGrowthLoading(false);
    }
  }, [partnerId, companyTicker, pillar, eventType, dateRange, viewMode]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxTime = useMemo(() => {
    if (!data) return 1;
    return Math.max(
      1,
      data.timeOfDay.morning,
      data.timeOfDay.afternoon,
      data.timeOfDay.evening,
      data.timeOfDay.lateNight
    );
  }, [data]);

  const isClient = viewMode === "client";

  return (
    <motion.div
      initial={mounted ? { opacity: 0 } : false}
      animate={mounted ? { opacity: 1 } : undefined}
      className="space-y-8 pb-16"
    >
      <header className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/20 via-[#070712] to-black/60 p-6 shadow-[0_0_60px_-20px_rgba(168,85,247,0.55)] md:p-8"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
        animate={mounted ? { opacity: [0.4, 0.7, 0.4] } : undefined}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300">
            Investor Behavior Intelligence
          </p>
          <h1 className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold text-white md:text-3xl">
            {isClient
              ? "How your learners build real research habits"
              : "Investor Behavior Intelligence Dashboard"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            {isClient
              ? "Engagement, learning depth, and confidence signals — presentation-ready for brokers, banks, and schools."
              : "Raw events + story layers. Wire auth, cohort ids, and AI scoring in later tiers."}
          </p>
          {data ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Source: {data.source === "supabase" ? "Supabase live" : "Demo fallback"}
              </p>
              {partnerId !== "all" && data.partnerTier ? (
                <span className="rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                  {data.partnerName ?? partnerId} · {TIER_LABELS[data.partnerTier]}{" "}
                  tier
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <motion.div className="flex rounded-full border border-white/15 bg-black/40 p-1">
          {(["admin", "client"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode === "admin" ? "admin" : "client")}
              className={[
                "rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
                viewMode === mode
                  ? "bg-violet-500/35 text-white shadow-[0_0_20px_-6px_rgba(168,85,247,0.8)]"
                  : "text-white/50 hover:text-white/80"
              ].join(" ")}
            >
              {mode === "admin" ? "Internal Admin" : "Client View"}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="relative mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        <label className="grid gap-1 text-[10px] text-white/50">
          Partner
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
          >
            <option value="all">All partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.branding.partnerName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] text-white/50">
          Company
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"
            value={companyTicker}
            onChange={(e) => setCompanyTicker(e.target.value)}
          >
            <option value="all">All</option>
            {COMPANIES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] text-white/50">
          Pillar
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
          >
            <option value="all">All</option>
            {PILLARS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] text-white/50">
          Event type
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="all">All</option>
            {USER_ACTIVITY_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] text-white/50">
          Date range
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value as "7d" | "30d" | "90d")
            }
          >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>
        </label>
      </div>
    </header>

    {!isClient ? <PartnerFeatureAccessPanel /> : null}

    <PlatformGrowthSection
      growth={growth}
      loading={growthLoading}
      features={data?.features ?? TIER_PRESETS.basic}
      isClient={isClient}
    />

    {loading ? (
      <p className="text-sm text-white/50">Loading behavior intelligence…</p>
    ) : !data ? (
      <p className="text-sm text-red-300/90">Could not load analytics.</p>
    ) : (
      <>
        <Gated
          feature="enable_basic_metrics"
          title="Basic metrics & activity"
          enabled={data.features.enable_basic_metrics}
          isClient={isClient}
        >
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Client story summary</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-violet-100/90">
            Users are not just clicking around — they are building real stock
            research habits.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard
              mounted={mounted}
              title="Engagement quality"
              body="Users are completing quests, marking cards as read, and earning XP."
            />
            <InsightCard
              mounted={mounted}
              title="Learning depth"
              body="We can see which pillars users spend the most time in — Business, Forces, Financials, or Management."
            />
            <InsightCard
              mounted={mounted}
              title="Investor identity"
              body="Badges, XP, and streaks show users building confidence over time."
            />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <AnimatedMetric mounted={mounted} label="Users tracked" value={data.metrics.totalUsers} />
          <AnimatedMetric mounted={mounted} label="Quest events" value={data.metrics.totalEvents} />
          <AnimatedMetric mounted={mounted} label="Cards read" value={data.metrics.cardsRead} />
          <AnimatedMetric
            mounted={mounted}
            label="XP earned"
            value={data.metrics.xpTotal}
            suffix=" XP"
          />
          <AnimatedMetric mounted={mounted} label="Badges earned" value={data.metrics.badgesEarned} />
          <AnimatedMetric
            mounted={mounted}
            label="Top company"
            value={data.metrics.mostActiveCompany}
          />
          <AnimatedMetric
            mounted={mounted}
            label="Top pillar"
            value={data.metrics.mostActivePillar}
          />
        </section>
        </Gated>

        <section className="grid gap-6 lg:grid-cols-2">
          <Gated
            feature="enable_time_tracking"
            title="Session time & time-of-day"
            enabled={data.features.enable_time_tracking}
            isClient={isClient}
          >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
              Most active time of day
            </h2>
            <p className="mt-2 text-sm text-white/70">{data.timeOfDay.peakLabel}</p>
            <div className="mt-6 flex items-end justify-between gap-3 h-36">
              {(
                [
                  ["Morning", data.timeOfDay.morning],
                  ["Afternoon", data.timeOfDay.afternoon],
                  ["Evening", data.timeOfDay.evening],
                  ["Late night", data.timeOfDay.lateNight]
                ] as const
              ).map(([label, count]) => (
                <div key={label} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    className="w-full max-w-[52px] rounded-t-lg bg-gradient-to-t from-violet-600/80 to-violet-300/90 shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)]"
                    initial={mounted ? { height: 0 } : false}
                    animate={
                      mounted
                        ? { height: `${Math.max(8, (count / maxTime) * 100)}%` }
                        : undefined
                    }
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ minHeight: 8 }}
                  />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/45">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </Gated>

          <Gated
            feature="enable_behavior_funnels"
            title="Behavior funnels"
            enabled={data.features.enable_behavior_funnels}
            isClient={isClient}
          >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
              Learning progression funnel
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Investor Quest creates structured learning behavior.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <FunnelStep mounted={mounted} label="Quest started" count={data.funnel.questStarted} delay={0} />
              <span className="text-violet-400/60">↓</span>
              <FunnelStep mounted={mounted} label="Cards read" count={data.funnel.cardsRead} delay={0.08} />
              <span className="text-violet-400/60">↓</span>
              <FunnelStep mounted={mounted} label="Quiz done" count={data.funnel.quizCompleted} delay={0.16} />
              <span className="text-violet-400/60">↓</span>
              <FunnelStep mounted={mounted} label="Badge earned" count={data.funnel.badgeEarned} delay={0.24} />
              <span className="text-violet-400/60">↓</span>
              <FunnelStep mounted={mounted} label="Return signal" count={data.funnel.returnVisit} delay={0.32} />
            </div>
          </div>
          </Gated>
        </section>

        <Gated
          feature="enable_retention_tracking"
          title="Retention & streak analytics"
          enabled={data.features.enable_retention_tracking}
          isClient={isClient}
        >
        <section className="grid gap-3 sm:grid-cols-3">
          <AnimatedMetric
            mounted={mounted}
            label="Return visits (signal)"
            value={data.funnel.returnVisit}
          />
          <AnimatedMetric mounted={mounted} label="Badge earners" value={data.metrics.badgesEarned} />
          <AnimatedMetric
            mounted={mounted}
            label="Habit strength"
            value={
              data.funnel.returnVisit > 0
                ? `${Math.round((data.funnel.returnVisit / Math.max(1, data.metrics.totalUsers)) * 100)}%`
                : "—"
            }
          />
        </section>
        </Gated>

        <Gated
          feature="enable_heatmaps"
          title="Engagement heatmaps"
          enabled={data.features.enable_heatmaps}
          isClient={isClient}
        >
        <section className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
            Company × pillar heatmap
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Intensity grid — where learners concentrate research energy.
          </p>
          <div className="mt-4 grid grid-cols-5 gap-1">
            {COMPANIES.flatMap((ticker) =>
              PILLARS.map((p) => (
                <div
                  key={`${ticker}-${p}`}
                  title={`${ticker} · ${p}`}
                  className="aspect-square rounded-md border border-violet-400/20 bg-violet-500/20"
                  style={{
                    opacity: 0.25 + ((ticker.charCodeAt(0) + p.length) % 6) * 0.12
                  }}
                />
              ))
            )}
          </div>
        </section>
        </Gated>

        <Gated
          feature="enable_conviction_tracking"
          title="Conviction & depth analytics"
          enabled={data.features.enable_conviction_tracking}
          isClient={isClient}
        >
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Investor behavior story</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <InsightCard
              mounted={mounted}
              title="Financials → Quarterly Reports"
              body="Users who complete Financials quests are 3× more likely to continue into Quarterly Reports."
            />
            <InsightCard
              mounted={mounted}
              title="After-hours learning"
              body="Most engagement happens during evening hours after market close."
            />
            <InsightCard
              mounted={mounted}
              title="Badge retention"
              body="Users earning badges return more consistently than users who do not."
            />
            <InsightCard
              mounted={mounted}
              title="Beginner pillars"
              body="Business and Forces are the most completed beginner pillars."
            />
            <InsightCard
              mounted={mounted}
              title="Conviction depth"
              body="Users who build conviction tend to explore multiple filings over time."
            />
          </div>
        </section>
        </Gated>

        {!isClient ? (
          <Gated
            feature="enable_basic_metrics"
            title="Recent activity feed"
            enabled={data.features.enable_basic_metrics}
            isClient={isClient}
          >
          <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Recent activity
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/45">
                    <th className="pb-2 pr-3">Time</th>
                    <th className="pb-2 pr-3">Event</th>
                    <th className="pb-2 pr-3">Company</th>
                    <th className="pb-2 pr-3">Pillar</th>
                    <th className="pb-2 pr-3">Quest / card</th>
                    <th className="pb-2">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 text-white/75"
                    >
                      <td className="py-2 pr-3 tabular-nums text-white/50">
                        {formatAnalyticsDateTime(row.createdAt)}
                      </td>
                      <td className="py-2 pr-3">
                        <span className="mr-1.5">
                          {EVENT_TYPE_ICONS[row.eventType]}
                        </span>
                        {EVENT_TYPE_LABELS[row.eventType]}
                      </td>
                      <td className="py-2 pr-3">{row.companyTicker ?? "—"}</td>
                      <td className="py-2 pr-3">{row.pillar ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {row.questId ?? "—"}
                        {row.cardId ? ` · ${row.cardId}` : ""}
                      </td>
                      <td className="py-2 tabular-nums">
                        {row.xpAmount > 0 ? `+${row.xpAmount}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </Gated>
        ) : (
          <Gated
            feature="enable_retention_tracking"
            title="Client engagement narrative"
            enabled={data.features.enable_retention_tracking}
            isClient={isClient}
          >
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Engagement",
                body: "Learners open quests, read cards, and finish quizzes — not idle browsing."
              },
              {
                title: "Learning habits",
                body: "Evening and repeat sessions show deliberate research routines forming."
              },
              {
                title: "Retention signals",
                body: "XP, badges, and streaks give users a reason to return after the first win."
              },
              {
                title: "Investor confidence",
                body: "Conviction updates show users synthesizing what they learned."
              },
              {
                title: "Partner opportunities",
                body: "High-engagement cohorts are prime for education, onboarding, and loyalty programs."
              }
            ].map((c) => (
              <InsightCard
                key={c.title}
                mounted={mounted}
                title={c.title}
                body={c.body}
              />
            ))}
          </section>
          </Gated>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            What this tells partners
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InsightCard
              mounted={mounted}
              title="Better user quality"
              body="Users are learning before acting, not just reacting to hype."
            />
            <InsightCard
              mounted={mounted}
              title="Stronger retention"
              body="XP, badges, streaks, and company progress give users a reason to return."
            />
            <InsightCard
              mounted={mounted}
              title="Education proof"
              body="Partners can see which topics users actually understand."
            />
            <InsightCard
              mounted={mounted}
              title="Commercial signal"
              body="High-engagement users can become better long-term brokerage or education customers."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Why this matters for partners
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InsightCard
              mounted={mounted}
              title="Brokers"
              body="Higher-quality investors with deeper engagement."
            />
            <InsightCard
              mounted={mounted}
              title="Banks"
              body="Educational onboarding that builds confidence."
            />
            <InsightCard
              mounted={mounted}
              title="Schools"
              body="Trackable financial learning progression."
            />
            <InsightCard
              mounted={mounted}
              title="Platforms"
              body="Gamified retention and recurring engagement."
            />
          </div>
        </section>

        <Gated
          feature="enable_ai_insights"
          title="AI insights engine"
          enabled={data.features.enable_ai_insights}
          isClient={isClient}
        >
        <section className="rounded-2xl border border-dashed border-violet-400/35 bg-violet-500/[0.06] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
            AI insights engine
          </h2>
          <p className="mt-2 text-xs text-white/45">
            {/* TODO: AI behavioral insight engine · predictive scoring · Stripe metered AI tier */}
            Placeholder insights for future ML scoring (Investor Quality Score,
            Retention Probability, Sector Mastery).
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>“Users losing conviction in AI stocks”</li>
            <li>“Most users struggle with valuation concepts”</li>
            <li>“Financials pillar predicts retention”</li>
            <li>“Users strongest in Tech sector”</li>
          </ul>
        </section>
        </Gated>

        <section className="grid gap-4 md:grid-cols-2">
          <Gated
            feature="enable_cohort_tracking"
            title="Behavior cohort analysis"
            enabled={data.features.enable_cohort_tracking}
            isClient={isClient}
          >
            <div />
          </Gated>
          <Gated
            feature="enable_sector_tracking"
            title="Sector mastery tracking"
            enabled={data.features.enable_sector_tracking}
            isClient={isClient}
          >
            <div />
          </Gated>
          <Gated
            feature="enable_school_dashboard"
            title="School intelligence dashboard"
            enabled={data.features.enable_school_dashboard}
            isClient={isClient}
          >
            <div />
          </Gated>
          <Gated
            feature="enable_broker_dashboard"
            title="Broker intelligence dashboard"
            enabled={data.features.enable_broker_dashboard}
            isClient={isClient}
          >
            <div />
          </Gated>
          <Gated
            feature="enable_api_exports"
            title="API export & data warehouse"
            enabled={data.features.enable_api_exports}
            isClient={isClient}
          >
            <div />
          </Gated>
          <Gated
            feature="enable_custom_reports"
            title="Custom branded reports"
            enabled={data.features.enable_custom_reports}
            isClient={isClient}
          >
            <div />
          </Gated>
        </section>
      </>
    )}
  </motion.div>
  );
}
