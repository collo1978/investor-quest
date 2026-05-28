"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import { ProductServiceVisual } from "@/components/products/ProductServiceVisual";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { normalizeProductServiceReport } from "@/lib/productService/normalizeProductServiceReport";
import type { ProductServiceReport } from "@/lib/productService/types";

const NO_DISCLOSURE =
  "Product and service details were not disclosed in this filing.";

type Props = {
  ticker: string;
  theme: PillarQuestTheme;
  /** Filing text fallback — only shown when structured product data is unavailable. */
  supportBody: ReactNode | null;
  initialReport?: ProductServiceReport | null;
};

function hasProductData(report: ProductServiceReport | null): boolean {
  if (!report) return false;
  return report.categories.some((c) => c.items.length > 0);
}

export function ProductServiceAnswer({
  ticker,
  theme,
  supportBody,
  initialReport
}: Props) {
  const [report, setReport] = useState<ProductServiceReport | null>(
    initialReport ? normalizeProductServiceReport(initialReport) : null
  );
  const [resolved, setResolved] = useState(initialReport !== undefined);

  useEffect(() => {
    if (initialReport !== undefined) {
      setReport(
        initialReport
          ? normalizeProductServiceReport(initialReport)
          : null
      );
      setResolved(true);
      return;
    }

    let cancelled = false;
    fetch(`/api/companies/${encodeURIComponent(ticker)}/product-service`, {
      cache: "no-store"
    })
      .then((res) => (res.ok ? res.json() : { report: null }))
      .then((data: { report?: ProductServiceReport | null }) => {
        if (cancelled) return;
        const raw = data.report ?? null;
        setReport(
          hasProductData(raw) ? normalizeProductServiceReport(raw!) : null
        );
        setResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReport(null);
        setResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, initialReport]);

  if (!resolved) {
    return (
      <motion.div
        className="min-h-[280px] rounded-xl border border-white/[0.06] bg-black/20"
        aria-busy
        aria-label="Loading products and services"
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

  return <ProductServiceVisual report={report} theme={theme} />;
}
