"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import { GeographicRevenueMap } from "@/components/geographic/GeographicRevenueMap";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { getDemoGeographicRevenueReport } from "@/lib/geographicRevenue/demoGeographicRevenue";
import type { GeographicRevenueReport } from "@/lib/geographicRevenue/types";

const NO_DISCLOSURE =
  "Regional revenue details were not disclosed in this filing.";

type Props = {
  ticker: string;
  theme: PillarQuestTheme;
  /** Filing text fallback — only when map data is unavailable. */
  supportBody: ReactNode | null;
  initialReport?: GeographicRevenueReport | null;
};

export function GeographicRevenueAnswer({
  ticker,
  theme,
  supportBody,
  initialReport
}: Props) {
  const placeholder = useMemo(
    () => getDemoGeographicRevenueReport(ticker),
    [ticker]
  );

  const [report, setReport] = useState<GeographicRevenueReport | null>(
    initialReport ?? placeholder ?? null
  );
  const [resolved, setResolved] = useState(
    initialReport !== undefined || placeholder !== null
  );

  useEffect(() => {
    if (initialReport !== undefined) {
      setReport(initialReport);
      setResolved(true);
      return;
    }

    let cancelled = false;
    fetch(`/api/companies/${encodeURIComponent(ticker)}/geographic-revenue`)
      .then((res) => (res.ok ? res.json() : { report: null }))
      .then((data: { report?: GeographicRevenueReport | null }) => {
        if (cancelled) return;
        const next =
          data.report?.segments?.length ? data.report : placeholder;
        setReport(next ?? null);
        setResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReport(placeholder ?? null);
        setResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, initialReport, placeholder]);

  if (!resolved) {
    return (
      <motion.div
        className="min-h-[280px] rounded-xl border border-white/[0.06] bg-black/20"
        aria-busy
        aria-label="Loading geographic revenue map"
      />
    );
  }

  if (!report) {
    if (supportBody) {
      return <motion.div className="space-y-3.5">{supportBody}</motion.div>;
    }
    return (
      <motion.div className="space-y-3.5">
        <p className="rounded-lg border border-white/[0.08] bg-black/25 px-3.5 py-3 text-[13px] leading-relaxed text-ink-0/88 sm:text-[13.5px]">
          {NO_DISCLOSURE}
        </p>
      </motion.div>
    );
  }

  return <GeographicRevenueMap report={report} theme={theme} />;
}
