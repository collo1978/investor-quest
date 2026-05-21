"use client";

import { motion } from "framer-motion";
import type { GrowthAnalyticsPayload } from "@/lib/analytics/growthTypes";
import type { AnalyticsFeatureFlags } from "@/lib/analytics/tiers";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";
import { useClientMounted } from "@/hooks/useClientMounted";
import { LockedFeatureGate } from "@/components/platform/analytics/LockedFeatureGate";
import {
  GrowthAreaChart,
  GrowthBarChart,
  GrowthLineChart
} from "@/components/platform/analytics/GrowthCharts";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function GrowthMetric({
  label,
  value,
  hint,
  mounted
}: {
  label: string;
  value: string | number;
  hint?: string;
  mounted: boolean;
}) {
  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 8 } : false}
      animate={mounted ? { opacity: 1, y: 0 } : undefined}
      className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.1] to-black/40 p-4 shadow-[0_0_28px_-12px_rgba(168,85,247,0.45)]"
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200/70">
        {label}
      </div>
      <div className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold tabular-nums text-white">
        {typeof value === "number" ? formatAnalyticsNumber(value) : value}
      </div>
      {hint ? (
        <p className="mt-1 text-[10px] text-white/45">{hint}</p>
      ) : null}
    </motion.div>
  );
}

type Props = {
  growth: GrowthAnalyticsPayload | null;
  loading: boolean;
  features: AnalyticsFeatureFlags;
  isClient: boolean;
};

export function PlatformGrowthSection({
  growth,
  loading,
  features,
  isClient
}: Props) {
  const mounted = useClientMounted();

  if (loading) {
    return (
      <section className="rounded-3xl border border-violet-400/20 bg-black/30 p-8 text-center text-sm text-white/50">
        Loading platform growth intelligence…
      </section>
    );
  }

  if (!growth) {
    return (
      <section className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200/90">
        Could not load platform growth metrics.
      </section>
    );
  }

  const { summary, breakdown, charts } = growth;
  const chartLabels = charts.userGrowth.map((p) =>
    p.date.slice(5).replace("-", "/")
  );

  return (
    <section className="space-y-6 rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-600/10 via-[#070712]/80 to-black/60 p-6 shadow-[0_0_56px_-18px_rgba(168,85,247,0.5)]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300">
          Platform intelligence
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Growth & SaaS health
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Bloomberg-grade operator metrics — user velocity, retention, and
          engagement depth. Built for partner dashboards and future investor
          reporting.{" "}
          {/* TODO: ARR / NRR · Stripe billing sync · white-label investor portal */}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
          Source: {growth.source === "supabase" ? "Supabase live" : "Demo fallback"}
        </p>
      </div>

      <LockedFeatureGate
        feature="enable_basic_metrics"
        enabled={features.enable_basic_metrics}
        isClientView={isClient}
        title="Core growth metrics"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <GrowthMetric mounted={mounted} label="Total users" value={summary.totalUsers} />
          <GrowthMetric mounted={mounted} label="Active users" value={summary.activeUsers} />
          <GrowthMetric mounted={mounted} label="New users" value={summary.newUsers} />
          <GrowthMetric
            mounted={mounted}
            label="Returning users"
            value={summary.returningUsers}
          />
          <GrowthMetric
            mounted={mounted}
            label="Avg quests / user"
            value={summary.avgQuestsCompleted}
          />
          <GrowthMetric
            mounted={mounted}
            label="Avg XP / user"
            value={summary.avgXpEarned}
            hint="XP earned in range"
          />
        </div>
      </LockedFeatureGate>

      <LockedFeatureGate
        feature="enable_retention_tracking"
        enabled={features.enable_retention_tracking}
        isClientView={isClient}
        title="DAU / WAU / MAU & retention"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <GrowthMetric mounted={mounted} label="DAU" value={summary.dau} hint="Last day in range" />
          <GrowthMetric mounted={mounted} label="WAU" value={summary.wau} hint="Rolling 7 days" />
          <GrowthMetric mounted={mounted} label="MAU" value={summary.mau} hint="Rolling 30 days" />
          <GrowthMetric
            mounted={mounted}
            label="D1 retention"
            value={`${summary.retentionD1}%`}
          />
          <GrowthMetric
            mounted={mounted}
            label="D7 retention"
            value={`${summary.retentionD7}%`}
          />
          <GrowthMetric
            mounted={mounted}
            label="D30 retention"
            value={`${summary.retentionD30}%`}
          />
        </div>
      </LockedFeatureGate>

      <LockedFeatureGate
        feature="enable_time_tracking"
        enabled={features.enable_time_tracking}
        isClientView={isClient}
        title="Session duration"
      >
        <GrowthMetric
          mounted={mounted}
          label="Avg session duration"
          value={formatDuration(summary.avgSessionDurationSeconds)}
          hint="From session telemetry"
        />
      </LockedFeatureGate>

      <div className="grid gap-6 lg:grid-cols-2">
        <LockedFeatureGate
          feature="enable_basic_metrics"
          enabled={features.enable_basic_metrics}
          isClientView={isClient}
          title="User growth over time"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              User growth over time
            </h3>
            <p className="mt-1 text-xs text-white/50">
              Cumulative learners vs daily new sign-ups
            </p>
            <div className="mt-4">
              <GrowthLineChart
                labels={chartLabels}
                series={[
                  {
                    name: "Cumulative users",
                    values: charts.userGrowth.map((p) => p.cumulativeUsers),
                    color: "#c084fc"
                  },
                  {
                    name: "New users",
                    values: charts.userGrowth.map((p) => p.newUsers),
                    color: "#38bdf8"
                  }
                ]}
              />
            </div>
          </div>
        </LockedFeatureGate>

        <LockedFeatureGate
          feature="enable_retention_tracking"
          enabled={features.enable_retention_tracking}
          isClientView={isClient}
          title="Retention curves"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              Retention curve
            </h3>
            <p className="mt-1 text-xs text-white/50">
              % of cohort still active by day offset
            </p>
            <motion.div className="mt-4">
              <GrowthAreaChart
                labels={charts.retentionCurve.map((p) => `D${p.day}`)}
                values={charts.retentionCurve.map((p) => p.rate)}
              />
            </motion.div>
          </div>
        </LockedFeatureGate>

        <LockedFeatureGate
          feature="enable_retention_tracking"
          enabled={features.enable_retention_tracking}
          isClientView={isClient}
          title="Active user trends"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              Active user trends
            </h3>
            <p className="mt-1 text-xs text-white/50">DAU and rolling WAU</p>
            <div className="mt-4">
              <GrowthLineChart
                labels={charts.activeUserTrend.map((p) =>
                  p.date.slice(5).replace("-", "/")
                )}
                series={[
                  {
                    name: "DAU",
                    values: charts.activeUserTrend.map((p) => p.dau),
                    color: "#a855f7"
                  },
                  {
                    name: "WAU",
                    values: charts.activeUserTrend.map((p) => p.wau),
                    color: "#22d3ee"
                  }
                ]}
              />
            </div>
          </div>
        </LockedFeatureGate>

        <LockedFeatureGate
          feature="enable_behavior_funnels"
          enabled={features.enable_behavior_funnels}
          isClientView={isClient}
          title="Engagement trends"
        >
          <motion.div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              Engagement trends
            </h3>
            <p className="mt-1 text-xs text-white/50">
              Events, quest completions, and XP velocity
            </p>
            <div className="mt-4">
              <GrowthLineChart
                labels={charts.engagementTrend.map((p) =>
                  p.date.slice(5).replace("-", "/")
                )}
                series={[
                  {
                    name: "Events",
                    values: charts.engagementTrend.map((p) => p.events),
                    color: "#a855f7"
                  },
                  {
                    name: "Quests",
                    values: charts.engagementTrend.map((p) => p.questsCompleted),
                    color: "#4ade80"
                  },
                  {
                    name: "XP",
                    values: charts.engagementTrend.map((p) => p.xpEarned),
                    color: "#facc15"
                  }
                ]}
              />
            </div>
          </motion.div>
        </LockedFeatureGate>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <LockedFeatureGate
          feature="enable_basic_metrics"
          enabled={features.enable_basic_metrics}
          isClientView={isClient}
          title="Users per partner"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h3 className="text-sm font-semibold text-violet-200">
              Users per partner
            </h3>
            <div className="mt-4">
              <GrowthBarChart
                rows={breakdown.byPartner.map((r) => ({
                  label: r.label,
                  value: r.users
                }))}
              />
            </div>
          </div>
        </LockedFeatureGate>

        <LockedFeatureGate
          feature="enable_company_interest_tracking"
          enabled={features.enable_company_interest_tracking}
          isClientView={isClient}
          title="Users per company"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h3 className="text-sm font-semibold text-violet-200">
              Users per company
            </h3>
            <div className="mt-4">
              <GrowthBarChart
                rows={breakdown.byCompany.map((r) => ({
                  label: r.label,
                  value: r.users
                }))}
              />
            </div>
          </div>
        </LockedFeatureGate>

        <LockedFeatureGate
          feature="enable_sector_tracking"
          enabled={features.enable_sector_tracking}
          isClientView={isClient}
          title="Users per sector"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h3 className="text-sm font-semibold text-violet-200">
              Users per sector
            </h3>
            <div className="mt-4">
              <GrowthBarChart
                rows={breakdown.bySector.map((r) => ({
                  label: r.label,
                  value: r.users
                }))}
              />
            </div>
          </div>
        </LockedFeatureGate>
      </div>
    </section>
  );
}
