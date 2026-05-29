"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { HubMapCardTheme } from "@/components/quest/hub/hubMapCardTheme";
import { resolveBusinessHubCardLocked } from "@/components/business/hub/resolveBusinessHubCardLocked";
import { resolveMapIslandHref } from "@/lib/schools/schoolsDemoHref";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import type { Company } from "@/data/companies";
import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

type Props = {
  card: BusinessHubQuestCard;
  company: Company;
  theme: HubMapCardTheme;
  hubProgressPct: number;
  focused: boolean;
  distance: number;
  partnerId?: string;
  userId?: string;
  variant?: "mobile" | "tablet";
};

function cardVisualState(
  card: BusinessHubQuestCard,
  hubProgressPct: number
): HubQuestVisualState {
  if (resolveBusinessHubCardLocked(card, hubProgressPct)) return "locked";
  return card.visualState;
}

export function BusinessHubQuestCarouselCard({
  card,
  company,
  theme,
  hubProgressPct,
  focused,
  distance,
  partnerId,
  userId,
  variant = "mobile"
}: Props) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const locked = resolveBusinessHubCardLocked(card, hubProgressPct);
  const state = cardVisualState(card, hubProgressPct);
  const isPrimary = !locked && card.isPrimaryActive;
  const href = resolveMapIslandHref(card.route, pathname);

  let scale = 0.82;
  if (distance === 1) scale = variant === "tablet" ? 0.9 : 0.88;
  if (focused && !locked) scale = variant === "tablet" ? 1 : 1.02;
  if (focused && locked) scale = 0.9;

  let opacity = 0.38;
  if (distance === 1) opacity = 0.58;
  if (focused) opacity = 1;

  const frameClass = locked
    ? "border border-[rgba(88,74,42,0.35)] bg-[rgba(10,8,6,0.94)] saturate-[0.8]"
    : state === "completed"
      ? "border border-[rgba(255,229,141,0.55)] bg-[rgba(14,11,7,0.96)]"
      : isPrimary
        ? "border border-[rgba(255,215,90,0.72)] bg-[rgba(18,14,8,0.97)] shadow-[0_8px_28px_rgba(0,0,0,0.5),0_0_20px_rgba(245,197,71,0.18)]"
        : "border border-[rgba(245,197,71,0.38)] bg-[rgba(12,10,7,0.94)] shadow-[0_6px_22px_rgba(0,0,0,0.48)]";

  const inner = (
  <article
    className={[
      "flex h-full min-h-[11.5rem] flex-col rounded-2xl px-4 py-3.5 sm:min-h-[12rem] sm:px-5 sm:py-4",
      frameClass
    ].join(" ")}
  >
    <header className="flex items-start justify-between gap-2">
      <span
        className="rounded-md border px-2 py-0.5 text-[11px] font-bold tabular-nums"
        style={{
          borderColor: locked ? theme.lockedBorder : theme.border,
          color: locked ? `${theme.hi}88` : theme.hi
        }}
      >
        {card.orderNumber}
      </span>
      {state === "completed" && !locked ? (
        <span
          className="grid h-7 w-7 place-items-center rounded-full border text-emerald-300"
          style={{ borderColor: `${theme.mastery}66` }}
          aria-label="Quest complete"
        >
          ✓
        </span>
      ) : null}
    </header>

    <div className="mt-2 min-h-0 flex-1">
      <h3
        className={[
          "line-clamp-2 font-[var(--font-grotesk)] text-lg font-semibold leading-snug sm:text-xl",
          locked ? "text-[rgba(255,248,230,0.62)]" : "text-[rgba(255,248,230,0.98)]"
        ].join(" ")}
      >
        {card.title}
      </h3>
      {card.subtitle ? (
        <p
          className={[
            "mt-1.5 line-clamp-2 text-[13px] leading-snug sm:text-sm",
            locked ? "text-[rgba(255,235,200,0.45)]" : "text-[rgba(255,235,200,0.78)]"
          ].join(" ")}
        >
          {card.subtitle}
        </p>
      ) : null}
    </div>

    <footer className="mt-3 shrink-0">
      {locked ? (
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,229,141,0.5)]">
          Complete the prior quest to unlock
        </p>
      ) : (
        <>
          {isPrimary && state === "active" ? (
            <p
              className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ color: theme.hi }}
            >
              Up next on your trail
            </p>
          ) : null}
          <div
            className="h-1 overflow-hidden rounded-full bg-black/45"
            role="progressbar"
            aria-valuenow={card.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-200"
              style={{ width: `${card.progressPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-[10px] font-semibold tabular-nums text-[rgba(255,229,141,0.65)]">
            {state === "completed" ? "100%" : `${card.progressPct}%`}
          </p>
        </>
      )}
    </footer>
  </article>
  );

  const shell = (
    <motion.div
      className="relative h-full w-full shrink-0 touch-pan-y"
      style={{ width: "100%" }}
      animate={{ scale, opacity }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      {focused && isPrimary && !locked && !reduceMotion ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.1rem] bg-[radial-gradient(ellipse_85%_65%_at_50%_40%,rgba(245,197,71,0.14),transparent_72%)]"
        />
      ) : null}
      {locked ? (
        <div className="relative h-full cursor-not-allowed">{inner}</div>
      ) : (
        <Link
          href={href}
          prefetch
          className="relative block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80"
          aria-label={`Open quest: ${card.title}`}
          onPointerEnter={() => preloadQuestDetailChunks()}
          onClick={() => {
            trackUserEvent({
              eventType: "user_started_quest",
              pillar: theme.pillarLabel,
              questId: card.questId,
              companyTicker: company.ticker,
              companyName: company.name,
              partnerId,
              userId,
              metadata: {
                questTitle: card.title,
                orderNumber: card.orderNumber,
                route: card.route,
                visualState: state,
                surface: variant === "tablet" ? "hub-tablet-carousel" : "hub-mobile-carousel"
              }
            });
          }}
        >
          {inner}
        </Link>
      )}
    </motion.div>
  );

  return shell;
}
