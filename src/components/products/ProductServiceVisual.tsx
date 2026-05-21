"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { ProductIcon } from "@/lib/productService/productIcons";
import type {
  ProductCategoryGroup,
  ProductLineItem,
  ProductServiceReport
} from "@/lib/productService/types";

type Props = {
  report: ProductServiceReport;
  theme: PillarQuestTheme;
};

const CATEGORY_ORDER = ["hardware", "services", "ecosystem"] as const;

function mixSegments(
  report: ProductServiceReport
): { label: string; percent: number }[] {
  if (report.revenueMix?.length) {
    return [...report.revenueMix].sort((a, b) => b.percent - a.percent);
  }
  const withPercent: { label: string; percent: number }[] = [];
  for (const cat of report.categories) {
    for (const item of cat.items) {
      if (item.percent != null && item.percent > 0) {
        withPercent.push({ label: item.label, percent: item.percent });
      }
    }
  }
  return withPercent.sort((a, b) => b.percent - a.percent);
}

function ProductCard({
  item,
  theme,
  index
}: {
  item: ProductLineItem;
  theme: PillarQuestTheme;
  index: number;
}) {
  const isPrimary = item.isPrimary === true;
  const hasImage = Boolean(item.imageUrl?.trim());

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative flex flex-col gap-2.5 rounded-xl border px-3 py-3",
        "bg-[rgba(8,10,18,0.72)] backdrop-blur-sm",
        isPrimary
          ? "border-amber-400/35 shadow-[0_0_20px_rgba(245,197,71,0.12)]"
          : "border-white/[0.08]"
      ].join(" ")}
    >
      {item.percent != null && item.percent > 0 ? (
        <span
          className="absolute right-2.5 top-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
          style={{
            color: theme.hi,
            background: "rgba(0,0,0,0.45)",
            boxShadow: `0 0 8px ${theme.glowSoft}`
          }}
        >
          {Math.round(item.percent)}%
        </span>
      ) : null}

      <motion.div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-xl",
          isPrimary ? "ring-1 ring-amber-400/25" : ""
        ].join(" ")}
        style={{
          background: `linear-gradient(145deg, ${theme.glowSoft}, rgba(0,0,0,0.35))`,
          color: theme.hi
        }}
      >
        {hasImage ? (
          <Image
            src={item.imageUrl!}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            unoptimized
          />
        ) : (
          <ProductIcon productKey={item.productKey} className="h-6 w-6" />
        )}
      </motion.div>

      <motion.div className="min-w-0 space-y-1">
        <h4 className="text-[13px] font-semibold leading-tight text-ink-0/95">
          {item.label}
        </h4>
        {item.recurring ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200/90">
            Recurring
          </span>
        ) : null}
        {item.tag ? (
          <p className="text-[10.5px] leading-snug text-ink-2/85">{item.tag}</p>
        ) : null}
      </motion.div>
    </motion.article>
  );
}

function CategorySection({
  group,
  theme,
  startIndex
}: {
  group: ProductCategoryGroup;
  theme: PillarQuestTheme;
  startIndex: number;
}) {
  const isEcosystem = group.categoryKey === "ecosystem";

  return (
    <section className="space-y-2.5" aria-labelledby={`cat-${group.categoryKey}`}>
      <h3
        id={`cat-${group.categoryKey}`}
        className="text-[9px] font-bold uppercase tracking-[0.2em]"
        style={{ color: theme.hi }}
      >
        {group.label}
      </h3>
      <div
        className={
          isEcosystem
            ? "grid grid-cols-1"
            : "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5"
        }
      >
        {group.items.map((item, i) => (
          <ProductCard
            key={item.productKey}
            item={item}
            theme={theme}
            index={startIndex + i}
          />
        ))}
      </div>
    </section>
  );
}

export function ProductServiceVisual({ report, theme }: Props) {
  const mix = useMemo(() => mixSegments(report), [report]);
  const maxPercent = useMemo(
    () => Math.max(...mix.map((m) => m.percent), 1),
    [mix]
  );

  const orderedCategories = useMemo(() => {
    const byKey = new Map(report.categories.map((c) => [c.categoryKey, c]));
    return CATEGORY_ORDER.map((key) => byKey.get(key)).filter(
      (g): g is ProductCategoryGroup => g != null && g.items.length > 0
    );
  }, [report.categories]);

  let cardIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(4,6,14,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="region"
      aria-label="Products and services the company sells"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${theme.glowSoft}, transparent 70%)`
        }}
      />

      <div className="relative z-[1] space-y-4 px-3.5 py-4 sm:px-4 sm:py-4">
        {report.headline ? (
          <p className="text-center text-[12.5px] font-medium leading-snug text-ink-0/90 sm:text-[13px]">
            {report.headline}
          </p>
        ) : null}

        {mix.length > 0 ? (
          <motion.div
            className="space-y-2 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5"
            aria-label="Revenue mix highlights"
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-2/80"
            >
              Revenue mix
            </p>
            <motion.div className="flex flex-wrap gap-2">
              {mix.slice(0, 4).map((seg) => {
                const t = seg.percent / maxPercent;
                return (
                  <motion.div
                    key={seg.label}
                    className="flex min-w-[72px] flex-1 flex-col gap-1"
                  >
                    <motion.div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="truncate font-medium text-ink-0/88">
                        {seg.label}
                      </span>
                      <span
                        className="shrink-0 font-bold tabular-nums"
                        style={{ color: theme.hi }}
                      >
                        {Math.round(seg.percent)}%
                      </span>
                    </motion.div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(t * 100, 8)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                          background: `linear-gradient(90deg, ${theme.hi}, ${theme.glow})`
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ) : null}

        {orderedCategories.map((group) => {
          const start = cardIndex;
          cardIndex += group.items.length;
          return (
            <CategorySection
              key={group.categoryKey}
              group={group}
              theme={theme}
              startIndex={start}
            />
          );
        })}
      </div>

      {report.investorInsight ? (
        <p
          className="relative z-[1] border-t border-white/[0.06] px-4 py-3 text-[12.5px] leading-[1.65] text-ink-0/90 sm:text-[13px]"
          style={{ borderLeftColor: theme.border, borderLeftWidth: 3 }}
        >
          <span
            className="mb-1 block text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: theme.hi }}
          >
            Investor insight
          </span>
          {report.investorInsight}
        </p>
      ) : null}

      {report.sourceSectionLabel ? (
        <p className="relative z-[1] px-4 pb-3 text-[9px] uppercase tracking-[0.14em] text-ink-2/70">
          Source: {report.sourceForm} — {report.sourceSectionLabel}
          {report.fiscalYear ? ` · FY${report.fiscalYear}` : ""}
        </p>
      ) : null}
    </motion.div>
  );
}
