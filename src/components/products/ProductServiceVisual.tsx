"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { ProductIcon } from "@/lib/productService/productIcons";
import { normalizeProductServiceReport } from "@/lib/productService/normalizeProductServiceReport";
import type {
  ProductCategoryGroup,
  ProductLineItem,
  ProductServiceReport
} from "@/lib/productService/types";

type Props = {
  report: ProductServiceReport;
  theme: PillarQuestTheme;
};

function mixSegments(
  report: ProductServiceReport
): { label: string; percent: number }[] {
  if (report.revenueMix?.length) {
    return [...report.revenueMix].sort((a, b) => b.percent - a.percent);
  }
  return [];
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
  const showPercent = item.percent != null && item.percent > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "flex flex-col gap-2 rounded-lg px-3 py-3",
        isPrimary ? "bg-white/[0.04] ring-1 ring-amber-400/20" : "bg-white/[0.02]"
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(145deg, ${theme.glowSoft}, rgba(0,0,0,0.35))`,
            color: theme.hi
          }}
        >
          {hasImage ? (
            <Image
              src={item.imageUrl!}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              unoptimized
            />
          ) : (
            <ProductIcon productKey={item.productKey} className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-[13px] font-semibold leading-tight text-ink-0/95">
              {item.label}
            </h4>
            {showPercent ? (
              <span
                className="shrink-0 text-[11px] font-bold tabular-nums"
                style={{ color: theme.hi }}
              >
                {Math.round(item.percent!)}%
              </span>
            ) : null}
          </div>
          {item.tag ? (
            <p className="text-[10.5px] leading-snug text-ink-2/80">{item.tag}</p>
          ) : null}
          {item.recurring ? (
            <span className="inline-block text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300/75">
              Recurring
            </span>
          ) : null}
        </div>
      </div>
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
  return (
    <section className="space-y-2" aria-labelledby={`cat-${group.categoryKey}`}>
      <h3
        id={`cat-${group.categoryKey}`}
        className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-2/75"
      >
        {group.label}
      </h3>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
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

export function ProductServiceVisual({ report: rawReport, theme }: Props) {
  const report = useMemo(
    () => normalizeProductServiceReport(rawReport),
    [rawReport]
  );

  const mix = useMemo(() => mixSegments(report), [report]);
  const maxPercent = useMemo(
    () => Math.max(...mix.map((m) => m.percent), 1),
    [mix]
  );

  const categories = useMemo(
    () => report.categories.filter((g) => g.items.length > 0),
    [report.categories]
  );

  let cardIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[rgba(6,8,16,0.92)]"
      role="region"
      aria-label="Products and services the company sells"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 80% 45% at 50% -10%, ${theme.glowSoft}, transparent 65%)`
        }}
      />

      <div className="relative z-[1] space-y-5 px-4 py-5 sm:px-5 sm:py-5">
        {report.headline ? (
          <p className="text-center text-[13px] font-medium leading-snug text-ink-0/92 sm:text-[13.5px]">
            {report.headline}
          </p>
        ) : null}

        {mix.length > 0 ? (
          <div className="space-y-2.5" aria-label="Revenue mix">
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.18em] text-ink-2/70">
              Revenue mix
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {mix.map((seg) => (
                <div key={seg.label} className="flex min-w-[64px] flex-col items-center gap-1">
                  <span
                    className="text-[12px] font-bold tabular-nums"
                    style={{ color: theme.hi }}
                  >
                    {Math.round(seg.percent)}%
                  </span>
                  <span className="text-[10px] text-ink-2/80">{seg.label}</span>
                  <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max((seg.percent / maxPercent) * 100, 12)}%`
                      }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      style={{
                        background: `linear-gradient(90deg, ${theme.hi}, ${theme.glow})`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {categories.map((group) => {
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
      </div>
    </motion.div>
  );
}
