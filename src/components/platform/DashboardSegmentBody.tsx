"use client";

import { useMemo, useState } from "react";
import { usePartnerRegistryHydration } from "@/hooks/usePartnerRegistryHydration";
import type { Dispatch, SetStateAction } from "react";
import {
  buildDemoAnalyticsSlice,
  defaultAnalyticsFilters,
  demoPartnerSnapshots
} from "@/platform/analytics/demoAnalyticsStore";
import type {
  AnalyticsFilterState,
  DashboardSegment,
  PartnerType
} from "@/platform/types";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";
import { listPartners } from "@/platform/partners/partnerRegistry";
import { PACKAGE_TIER_ORDER } from "@/platform/packages/packageDefinitions";

export function DashboardSegmentBody(props: {
  segment: DashboardSegment;
  title: string;
  subtitle: string;
  defaultPartnerType: PartnerType;
}) {
  const { segment, title, subtitle, defaultPartnerType } = props;
  const [filters, setFilters] = useState<AnalyticsFilterState>(() =>
    defaultAnalyticsFilters(defaultPartnerType)
  );
  const slice = useMemo(
    () => buildDemoAnalyticsSlice(segment, filters),
    [filters, segment]
  );
  const { version: registryVersion } = usePartnerRegistryHydration();
  const partners = useMemo(() => listPartners(), [registryVersion]);
  const cohort = useMemo(() => demoPartnerSnapshots(), []);

  return (
    <DashboardBody
      title={title}
      subtitle={subtitle}
      filters={filters}
      setFilters={setFilters}
      partners={partners}
      slice={slice}
      cohort={cohort}
    />
  );
}

function DashboardBody(props: {
  title: string;
  subtitle: string;
  filters: AnalyticsFilterState;
  setFilters: Dispatch<SetStateAction<AnalyticsFilterState>>;
  partners: ReturnType<typeof listPartners>;
  slice: ReturnType<typeof buildDemoAnalyticsSlice>;
  cohort: ReturnType<typeof demoPartnerSnapshots>;
}) {
  const { title, subtitle, filters, setFilters, partners, slice, cohort } =
    props;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/65">{subtitle}</p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3 lg:grid-cols-4">
        <label className="grid gap-1 text-[11px] text-white/55">
          Partner
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.partnerId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, partnerId: e.target.value }))
            }
          >
            <option value="all">All</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.branding.partnerName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-white/55">
          User type
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.userType}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                userType: e.target.value as AnalyticsFilterState["userType"]
              }))
            }
          >
            <option value="all">All</option>
            <option value="learner">learner</option>
            <option value="instructor">instructor</option>
            <option value="partner_admin">partner_admin</option>
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-white/55">
          Date range
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.dateRange}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                dateRange: e.target.value as AnalyticsFilterState["dateRange"]
              }))
            }
          >
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="90d">90d</option>
            <option value="ytd">YTD</option>
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-white/55">
          Package tier
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.packageTier}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                packageTier: e.target.value as AnalyticsFilterState["packageTier"]
              }))
            }
          >
            <option value="all">All</option>
            {PACKAGE_TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-white/55">
          Company
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.companyId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, companyId: e.target.value }))
            }
          >
            <option value="all">All</option>
            <option value="demo-aapl">AAPL (demo)</option>
            <option value="demo-msft">MSFT (demo)</option>
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-white/55">
          Module
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.moduleId}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                moduleId: e.target.value as AnalyticsFilterState["moduleId"]
              }))
            }
          >
            <option value="all">All</option>
            <option value="core_quests">core_quests</option>
            <option value="pillar_map">pillar_map</option>
            <option value="sec_filings_lab">sec_filings_lab</option>
            <option value="conviction_tracker">conviction_tracker</option>
          </select>
        </label>
        <label className="grid gap-1 text-[11px] text-white/55">
          Sector
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
            value={filters.sector}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sector: e.target.value }))
            }
          >
            <option value="all">All</option>
            <option value="technology">Technology</option>
            <option value="financials">Financials</option>
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <div className="text-sm font-semibold text-white">{slice.headline}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {slice.rows.slice(0, 6).map((r) => (
            <div
              key={r.event}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75"
            >
              <div className="font-semibold text-white">{r.event}</div>
              <div className="mt-1 text-white/60">
                {formatAnalyticsNumber(r.count)} events
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white">
          Partner engagement snapshot
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[640px] w-full border-collapse text-left text-xs">
            <thead className="text-[10px] uppercase tracking-[0.16em] text-white/45">
              <tr>
                <th className="py-2">Partner</th>
                <th className="py-2">DAU</th>
                <th className="py-2">MAU</th>
                <th className="py-2">Quest completion</th>
                <th className="py-2">Avg quiz</th>
                <th className="py-2">XP / active</th>
              </tr>
            </thead>
            <tbody>
              {cohort.map((row) => (
                <tr key={row.partnerId} className="border-t border-white/10">
                  <td className="py-2 text-white/80">{row.partnerId}</td>
                  <td className="py-2">{row.dau}</td>
                  <td className="py-2">{row.mau}</td>
                  <td className="py-2">
                    {(row.questCompletionRate * 100).toFixed(1)}%
                  </td>
                  <td className="py-2">
                    {(row.avgQuizScore * 100).toFixed(1)}%
                  </td>
                  <td className="py-2">{row.xpPerActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
