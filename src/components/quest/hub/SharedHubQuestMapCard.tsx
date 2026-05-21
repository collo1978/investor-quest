"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { HubMapCardTheme } from "@/components/quest/hub/hubMapCardTheme";
import type { HubMapQuestCardData } from "@/lib/quests/hubMapQuestCardTypes";
import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import type { Company } from "@/data/companies";

function pulseShadow(theme: HubMapCardTheme, peak = false): string {
  const g = theme.glow;
  const hi = theme.hi;
  if (peak) {
    return [
      "0 8px 32px rgba(0,0,0,0.48)",
      `0 0 48px ${g}`,
      `0 0 72px color-mix(in srgb, ${hi} 42%, transparent)`
    ].join(", ");
  }
  return [
    "0 4px 24px rgba(0,0,0,0.42)",
    `0 0 36px ${g}`,
    `0 0 56px color-mix(in srgb, ${hi} 28%, transparent)`
  ].join(", ");
}

function QuestLinkPendingOverlay() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className="pointer-events-none absolute inset-0 z-[4] rounded-xl bg-[rgba(245,197,71,0.08)] ring-2 ring-[rgba(245,197,71,0.35)] animate-pulse"
      aria-hidden
    />
  );
}

function lockedHintFor(card: HubMapQuestCardData): string {
  const prior = card.unlockSource?.title?.trim();
  if (prior) return `Complete “${prior}” to unlock`;
  return "Complete the previous quest to unlock";
}

const GOLD_SHINY_BORDER = [
  "relative overflow-hidden",
  "border-2 border-[rgba(255,215,90,0.88)]",
  "shadow-[inset_0_1px_0_rgba(255,244,180,0.58),0_0_20px_rgba(245,197,71,0.48)]"
].join(" ");

/** Locked hub cards — muted edge only (no bright GOLD_SHINY_BORDER stack). */
const LOCKED_CARD_FRAME = [
  "relative overflow-hidden",
  "border border-[rgba(88,74,42,0.28)]",
  "shadow-[inset_0_1px_0_rgba(255,229,141,0.04),0_2px_12px_rgba(0,0,0,0.45)]"
].join(" ");

const GOLD_SHINY_BORDER_ACTIVE = [
  "border-[rgba(255,238,150,1)]",
  "shadow-[inset_0_1px_0_rgba(255,252,210,0.78),0_0_32px_rgba(245,197,71,0.62),0_8px_28px_rgba(0,0,0,0.45)]"
].join(" ");

const GOLD_SHINY_BORDER_COMPLETED = [
  "border-[rgba(255,229,141,0.92)]",
  "shadow-[inset_0_1px_0_rgba(255,248,220,0.65),0_0_28px_rgba(245,197,71,0.52),0_0_12px_rgba(52,211,153,0.18)]"
].join(" ");

type Props = {
  card: HubMapQuestCardData;
  position: CSSProperties;
  cardWidth: CSSProperties;
  theme: HubMapCardTheme;
  company: Company;
  partnerId?: string;
  userId?: string;
  staggerIndex?: number;
  /** Island badge % — used to force locked visuals at 0% on slots 2–5 (Business). */
  hubProgressPct?: number;
  /** When true, slot 1 shows category icon beside order badge (Forces). */
  showCategoryIcon?: boolean;
};

export function SharedHubQuestMapCard({
  card,
  position,
  cardWidth,
  theme,
  company,
  partnerId,
  userId,
  staggerIndex = 0,
  hubProgressPct = 0,
  showCategoryIcon = false
}: Props) {
  const pulseLo = pulseShadow(theme, false);
  const pulsePeak = pulseShadow(theme, true);
  const reduceMotion = useReducedMotion();
  /**
   * Locked visuals must win over data bugs and scene FX bleed-through.
   * At 0% island progress only slot 1 may appear unlocked.
   */
  const isLocked =
    card.locked ||
    (hubProgressPct === 0 && card.orderNumber > 1);
  const state: HubQuestVisualState = isLocked ? "locked" : card.visualState;
  const isPrimaryActive = !isLocked && card.isPrimaryActive;
  const lockedHint = lockedHintFor(card);

  const wasLockedRef = useRef(state === "locked");
  const wasCompleteRef = useRef(state === "completed");
  const [celebrateUnlock, setCelebrateUnlock] = useState(false);
  const [celebrateComplete, setCelebrateComplete] = useState(false);

  useEffect(() => {
    if (isLocked) setCelebrateUnlock(false);
  }, [isLocked]);

  useEffect(() => {
    if (wasLockedRef.current && state !== "locked") {
      setCelebrateUnlock(true);
      const clear = window.setTimeout(() => setCelebrateUnlock(false), 2400);
      if (card.orderNumber > 1) {
        trackUserEvent({
          eventType: "user_unlocked_quest",
          pillar: theme.pillarLabel,
          questId: card.questId,
          companyTicker: company.ticker,
          companyName: company.name,
          partnerId,
          userId,
          metadata: {
            unlockedBy: card.unlockSource?.title ?? "previous quest",
            unlockedBySlug: card.unlockSource?.slug,
            orderNumber: card.orderNumber,
            route: card.route
          }
        });
      }
      wasLockedRef.current = false;
      return () => window.clearTimeout(clear);
    }
    wasLockedRef.current = state === "locked";
  }, [
    state,
    card.orderNumber,
    card.questId,
    card.route,
    card.unlockSource,
    company.name,
    company.ticker,
    partnerId,
    userId
  ]);

  useEffect(() => {
    if (!wasCompleteRef.current && state === "completed") {
      setCelebrateComplete(true);
      const clear = window.setTimeout(() => setCelebrateComplete(false), 2600);
      wasCompleteRef.current = true;
      return () => window.clearTimeout(clear);
    }
    wasCompleteRef.current = state === "completed";
  }, [state]);

  const floatDuration = 4.2 + staggerIndex * 0.35;
  const floatY =
    state === "locked" ? 2 : state === "completed" ? 2 : isPrimaryActive ? 3 : 2.5;

  const enter = { opacity: 0, y: 10, scale: 0.95 };
  const scale =
    state === "locked" ? 0.94 : state === "completed" ? 1 : isPrimaryActive ? 1.03 : 1;
  const shown = { opacity: 1, y: 0, scale };

  const baseTransition = {
    delay: 0.07 * staggerIndex,
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as const
  };

  const slotClass =
    isLocked || state === "locked"
      ? "group z-[10]"
      : isPrimaryActive
        ? "z-[22]"
        : state === "completed"
          ? "z-[21]"
          : undefined;

  return (
    <CardSlot
      position={position}
      cardWidth={cardWidth}
      className={slotClass}
      title={state === "locked" ? lockedHint : undefined}
      ariaLabel={
        state === "locked"
          ? `${card.title} locked`
          : state === "completed"
            ? `${card.title} completed`
            : undefined
      }
    >
      <HubQuestCardFrame
        state={state}
        isLocked={isLocked}
        card={card}
        company={company}
        enter={enter}
        shown={shown}
        scale={scale}
        floatY={floatY}
        floatDuration={floatDuration}
        reduceMotion={reduceMotion}
        baseTransition={baseTransition}
        lockedHint={lockedHint}
        celebrateUnlock={celebrateUnlock}
        celebrateComplete={celebrateComplete}
        isPrimaryActive={isPrimaryActive}
        partnerId={partnerId}
        userId={userId}
        theme={theme}
        pulseLo={pulseLo}
        pulsePeak={pulsePeak}
      >
        <HubCardBody
          card={card}
          state={state}
          isLocked={isLocked}
          isPrimaryActive={isPrimaryActive}
          theme={theme}
          showCategoryIcon={showCategoryIcon}
        />
      </HubQuestCardFrame>
    </CardSlot>
  );
}

/** Stable mount per quest — state changes morph in place (no unmount on complete). */
function HubQuestCardFrame({
  state,
  isLocked,
  card,
  company,
  children,
  enter,
  shown,
  scale,
  floatY,
  floatDuration,
  reduceMotion,
  baseTransition,
  lockedHint,
  celebrateUnlock,
  celebrateComplete,
  isPrimaryActive,
  partnerId,
  userId,
  theme,
  pulseLo,
  pulsePeak
}: {
  state: HubQuestVisualState;
  isLocked: boolean;
  card: HubMapQuestCardData;
  company: Company;
  children: ReactNode;
  enter: { opacity: number; y: number; scale: number };
  shown: { opacity: number; y: number; scale: number };
  scale: number;
  floatY: number;
  floatDuration: number;
  reduceMotion: boolean | null;
  baseTransition: {
    delay: number;
    duration: number;
    ease: readonly [number, number, number, number];
  };
  lockedHint: string;
  celebrateUnlock: boolean;
  celebrateComplete: boolean;
  isPrimaryActive: boolean;
  partnerId?: string;
  userId?: string;
  theme: HubMapCardTheme;
  pulseLo: string;
  pulsePeak: string;
}) {
  const floatAnim = reduceMotion ? shown : { ...shown, scale, y: [0, -floatY, 0] };
  const floatTransition = reduceMotion
    ? baseTransition
    : {
        y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut" as const },
        opacity: baseTransition,
        scale: baseTransition
      };

  if (isLocked || state === "locked") {
    return (
      <motion.div
        key={`${card.slug}-locked`}
        data-hub-locked="true"
        data-hub-slug={card.slug}
        data-hub-order={card.orderNumber}
        className={[
          "isolate z-[10] rounded-xl text-left backdrop-blur-sm",
          "px-3 py-2.5 sm:px-3.5 sm:py-2.5",
          LOCKED_CARD_FRAME,
          "bg-[rgba(10,8,6,0.94)] scale-[0.95]",
          "saturate-[0.72] brightness-[0.9]",
          "cursor-not-allowed select-none"
        ].join(" ")}
        initial={enter}
        animate={reduceMotion ? shown : { ...shown, scale: 0.95, y: [0, -2, 0] }}
        transition={floatTransition}
        aria-disabled
      >
        <span
          className="pointer-events-none absolute inset-0 z-[1] rounded-xl bg-[rgba(0,0,0,0.22)]"
          aria-hidden
        />
        <LockedCardSheen />
        <span
          className="pointer-events-none absolute -top-9 left-1/2 z-40 hidden w-max max-w-[13rem] -translate-x-1/2 rounded-lg border border-[rgba(245,197,71,0.28)] bg-[rgba(8,7,4,0.96)] px-2.5 py-1.5 text-center text-[10px] leading-snug text-[rgba(255,229,141,0.82)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block"
          role="tooltip"
        >
          {lockedHint}
        </span>
        <span className="relative z-[2]">{children}</span>
      </motion.div>
    );
  }

  const linkClass =
    state === "completed"
      ? [
          "relative block overflow-hidden rounded-xl",
          "px-3 py-2.5 sm:px-3.5 sm:py-2.5",
          GOLD_SHINY_BORDER,
          GOLD_SHINY_BORDER_COMPLETED,
          "bg-[rgba(16,12,7,0.96)] brightness-[0.96] saturate-[0.92]",
          "cursor-pointer transition-[box-shadow,filter] duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
        ].join(" ")
      : [
          "relative block overflow-hidden rounded-xl",
          "px-3 py-2.5 sm:px-3.5 sm:py-2.5",
          GOLD_SHINY_BORDER,
          GOLD_SHINY_BORDER_ACTIVE,
          isPrimaryActive
            ? "bg-[rgba(24,18,9,0.97)] brightness-[1.1] saturate-[1.08]"
            : "bg-[rgba(14,11,7,0.92)]",
          "cursor-pointer transition-[box-shadow,filter] duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90",
          isPrimaryActive ? "scale-[1.03]" : ""
        ].join(" ");

  const boxShadowAnim =
    state === "completed"
      ? undefined
      : isPrimaryActive
        ? [pulseLo, pulsePeak, pulseLo]
        : celebrateUnlock
          ? [pulseLo, pulsePeak, pulseLo]
          : undefined;

  return (
    <motion.div
      key={`${card.slug}-${state}`}
      className="relative"
      initial={
        celebrateComplete && state === "completed" && !reduceMotion
          ? { opacity: 0.85, scale: 0.94 }
          : celebrateUnlock && !reduceMotion
            ? { opacity: 0.55, scale: 0.9 }
            : enter
      }
      animate={
        reduceMotion
          ? { ...shown, scale }
          : {
              ...shown,
              scale,
              y: [0, -floatY, 0],
              filter: "brightness(1) saturate(1)",
              boxShadow: boxShadowAnim
            }
      }
      transition={
        reduceMotion
          ? baseTransition
          : {
              y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut" as const },
              filter: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              boxShadow:
                state === "completed"
                  ? undefined
                  : isPrimaryActive
                    ? { duration: 4.4, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }
                    : celebrateUnlock
                      ? { duration: 2.2, ease: "easeOut" }
                      : undefined,
              default:
                celebrateComplete || celebrateUnlock
                  ? { type: "spring", stiffness: 380, damping: 28, mass: 0.9 }
                  : undefined,
              ...baseTransition
            }
      }
    >
      {celebrateComplete && state === "completed" && !reduceMotion ? (
        <motion.span
          className="pointer-events-none absolute -inset-4 rounded-2xl bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,229,141,0.38)_0%,rgba(52,211,153,0.12)_48%,transparent_72%)] blur-md"
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.85, 0], scale: [0.9, 1.08, 1.12] }}
          transition={{ duration: 2.4, ease: "easeOut" }}
        />
      ) : null}
      {celebrateUnlock && state === "active" && !reduceMotion ? (
        <motion.span
          className="pointer-events-none absolute -inset-4 rounded-2xl bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,229,141,0.42)_0%,rgba(245,197,71,0.16)_45%,transparent_72%)] blur-md"
          aria-hidden
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.88, 1.1, 1.14] }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />
      ) : null}
      {isPrimaryActive && state === "active" && !reduceMotion ? (
        <motion.span
          className="pointer-events-none absolute -inset-3 rounded-2xl bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,229,141,0.36)_0%,rgba(245,197,71,0.14)_42%,transparent_72%)] blur-md"
          aria-hidden
          animate={{ opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        />
      ) : null}
      <motion.div
        whileHover={
          reduceMotion
            ? undefined
            : state === "completed"
              ? { y: -3, scale: 1.02 }
              : isPrimaryActive
                ? { y: -6, scale: 1.034 }
                : { y: -7, scale: 1.04 }
        }
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      >
        <Link
          href={card.route}
          prefetch
          scroll
          className={linkClass}
          aria-label={
            state === "completed"
              ? `Review completed quest: ${card.title}`
              : `Open quest: ${card.title}`
          }
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
                visualState: state
              }
            });
          }}
        >
          <QuestLinkPendingOverlay />
          {state === "completed" ? (
            <CompletedCardSheen />
          ) : (
            <>
              <ActiveBorderShimmer intense={isPrimaryActive} />
              <GoldBorderSheen />
            </>
          )}
          <span className="relative z-[1]">{children}</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function HubCardBody({
  card,
  state,
  isLocked,
  isPrimaryActive,
  theme,
  showCategoryIcon
}: {
  card: HubMapQuestCardData;
  state: HubQuestVisualState;
  isLocked: boolean;
  isPrimaryActive: boolean;
  theme: HubMapCardTheme;
  showCategoryIcon?: boolean;
}) {
  const dimmed = isLocked || state === "locked";
  return (
    <article className="flex flex-col">
      <header
        className={[
          "flex items-start gap-2",
          showCategoryIcon && card.icon ? "justify-between" : "justify-end"
        ].join(" ")}
      >
        {showCategoryIcon && card.icon ? (
          <span
            className={[
              "text-[22px] leading-none sm:text-[24px]",
              dimmed ? "opacity-45 grayscale" : ""
            ].join(" ")}
            style={
              dimmed ? undefined : { filter: `drop-shadow(0 0 8px ${theme.glow})` }
            }
            aria-hidden
          >
            {card.icon}
          </span>
        ) : null}
        {state === "completed" && !dimmed ? (
          <CompletionMark
            aria-label="Quest complete"
            prominent={card.orderNumber === 1 || isPrimaryActive}
            theme={theme}
          />
        ) : (
          <span
            className="min-w-[1.75rem] rounded border px-2 py-0.5 text-center text-[14px] font-bold tabular-nums leading-none sm:text-[15px]"
            style={
              dimmed
                ? {
                    borderColor: theme.lockedBorder,
                    color: `${theme.hi}99`
                  }
                : {
                    borderColor: theme.border,
                    color: theme.hi
                  }
            }
          >
            {card.orderNumber}
          </span>
        )}
      </header>

      <motion.div className="-mt-1 space-y-1.5">
        <h3
          className={[
            "line-clamp-2 font-[var(--font-grotesk)] font-semibold leading-snug",
            dimmed
              ? "text-[19px] text-[rgba(255,248,230,0.68)] sm:text-[20px]"
              : state === "completed"
                ? "text-[19px] text-[rgba(255,252,240,0.92)] sm:text-[21px]"
                : "text-[19px] text-[rgba(255,248,230,0.98)] sm:text-[21px]",
            isPrimaryActive ? "text-[rgba(255,252,235,1)]" : ""
          ].join(" ")}
        >
          {card.title}
        </h3>
        <p
          className={[
            "line-clamp-2 text-[14.5px] leading-snug sm:text-[15.5px]",
            dimmed
              ? "text-[rgba(255,235,200,0.52)]"
              : state === "completed"
                ? "text-[rgba(255,242,215,0.72)]"
                : isPrimaryActive
                  ? "text-[rgba(255,242,215,0.92)]"
                  : "text-[rgba(255,235,200,0.78)]"
          ].join(" ")}
        >
          {card.subtitle}
        </p>
      </motion.div>

      <footer className="mt-2.5 space-y-2">
        {isPrimaryActive && !dimmed && state === "active" ? (
          <p
            className="text-center text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ color: theme.hi, textShadow: `0 0 12px ${theme.glow}` }}
          >
            Up next on your trail
          </p>
        ) : null}
        {state === "completed" && !dimmed ? (
          <p
            className="text-center font-[var(--font-grotesk)] text-[22px] font-bold tabular-nums leading-none tracking-tight text-[rgba(167,243,208,0.95)] sm:text-[24px]"
            aria-label="Quest progress 100 percent"
          >
            100%
          </p>
        ) : !dimmed ? (
          <div className="flex items-center justify-end gap-2 text-[9px] uppercase tracking-[0.14em] text-[rgba(255,229,141,0.65)]">
            <span className="tabular-nums font-semibold">{card.progressPct}%</span>
          </div>
        ) : null}

        {isLocked || state === "locked" ? (
          <div
            className="flex items-center justify-center py-1.5 text-[rgba(255,229,141,0.58)]"
            aria-hidden
          >
            <LockIcon large />
          </div>
        ) : (
          <div
            className={[
              "h-1 overflow-hidden rounded-full",
              state === "completed"
                ? "bg-black/55 ring-1 ring-emerald-400/25"
                : "bg-black/45"
            ].join(" ")}
            role="progressbar"
            aria-valuenow={card.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Quest progress ${card.progressPct} percent`}
          >
            <div
              className={[
                "h-full rounded-full transition-[width] duration-500",
                state === "completed"
                  ? "bg-gradient-to-r from-emerald-800 via-amber-300 to-amber-100 shadow-[0_0_12px_rgba(245,197,71,0.55)]"
                  : "bg-gradient-to-r from-amber-700 via-amber-300 to-amber-200"
              ].join(" ")}
              style={{ width: `${card.progressPct}%` }}
            />
          </div>
        )}

        <CardFutureChrome state={state} />
      </footer>
    </article>
  );
}

/** Single completion affordance — top-right on mastered cards. */
function CompletionMark({
  "aria-label": ariaLabel = "Quest complete",
  prominent = false,
  theme
}: {
  "aria-label"?: string;
  prominent?: boolean;
  theme: HubMapCardTheme;
}) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full border bg-[rgba(12,10,6,0.88)]",
        prominent ? "h-9 w-9" : "h-7 w-7"
      ].join(" ")}
      style={{
        borderColor: `${theme.hi}99`,
        boxShadow: prominent
          ? `0 0 24px color-mix(in srgb, ${theme.mastery} 55%, transparent), 0 0 12px ${theme.glow}`
          : `0 0 16px ${theme.glowSoft}`
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 0 16 16"
        className={prominent ? "h-5 w-5" : "h-3.5 w-3.5"}
        style={{ color: theme.mastery }}
        fill="none"
        stroke="currentColor"
        strokeWidth={prominent ? 2.6 : 2.35}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3.25 8.25l2.75 2.75 6.75-7" />
      </svg>
    </span>
  );
}

function CardSlot({
  position,
  cardWidth,
  children,
  className,
  title,
  ariaLabel
}: {
  position: CSSProperties;
  cardWidth: CSSProperties;
  children: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className={`absolute z-20 pointer-events-auto ${className ?? ""}`}
      style={{ ...position, ...cardWidth }}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

/** Reserved slots for XP, streaks, badges — visible scaffold when mastered. */
function CardFutureChrome({ state }: { state: HubQuestVisualState }) {
  if (state !== "completed") {
    return (
      <motion.div
        className="hidden flex-col gap-1.5"
        aria-hidden
        data-business-card-chrome="future"
      />
    );
  }

  return (
    <motion.div
      className="mt-1 flex items-center justify-end gap-1.5 opacity-40"
      aria-hidden
      data-business-card-chrome="future"
      data-chrome-ready="true"
    >
      <span
        className="inline-flex h-4 min-w-[2.5rem] items-center justify-center rounded-full border border-amber-400/20 px-1 text-[7px] uppercase tracking-wider text-amber-200/60"
        data-slot="xp-badge"
      />
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-violet-400/20 text-[7px] text-violet-200/50"
        data-slot="streak-badge"
      />
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/20 text-[7px] text-emerald-200/50"
        data-slot="mastery-badge"
      />
    </motion.div>
  );
}

function ActiveBorderShimmer({ intense }: { intense: boolean }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  const smoothEase = [0.42, 0, 0.58, 1] as const;

  return (
    <span className="pointer-events-none absolute inset-0 z-[3] rounded-xl" aria-hidden>
      <motion.span
        className={[
          "absolute inset-[-1px] rounded-xl p-[1.5px]",
          "[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]",
          "[mask-composite:exclude]",
          intense
            ? "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(245,197,71,0.32)_48deg,rgba(255,229,141,0.18)_88deg,transparent_145deg)]"
            : "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(245,197,71,0.22)_48deg,transparent_145deg)]"
        ].join(" ")}
        animate={intense ? { rotate: 360, scale: [1, 1.006, 1] } : { rotate: 360 }}
        transition={{
          rotate: { duration: intense ? 14 : 9, repeat: Infinity, ease: "linear" },
          scale: intense ? { duration: 5.5, repeat: Infinity, ease: smoothEase } : undefined
        }}
      />
    </span>
  );
}

function LockedCardSheen() {
  return (
    <span
      className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-br from-[rgba(255,229,141,0.03)] via-transparent to-transparent"
      aria-hidden
    />
  );
}

function GoldBorderSheen() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-br from-[rgba(255,229,141,0.16)] via-transparent to-[rgba(245,197,71,0.05)]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,236,160,0.65)] to-transparent"
        aria-hidden
      />
    </>
  );
}

function CompletedCardSheen() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-br from-[rgba(255,229,141,0.14)] via-[rgba(12,18,10,0.35)] to-[rgba(6,12,8,0.5)]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,236,160,0.5)] to-transparent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(52,211,153,0.22)] to-transparent"
        aria-hidden
      />
    </>
  );
}

function LockIcon({ large = false }: { large?: boolean }) {
  if (!large) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path d="M7 11V8a5 5 0 0110 0v3" />
        <rect x="5" y="11" width="14" height="10" rx="2" />
      </svg>
    );
  }

  return (
    <span className="relative inline-flex items-center justify-center text-[rgba(255,229,141,0.68)]">
      <span
        className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(245,197,71,0.22)_0%,transparent_72%)] blur-[2px]"
        aria-hidden
      />
      <svg
        viewBox="0 0 24 24"
        className="relative h-6 w-6 shrink-0 drop-shadow-[0_0_5px_rgba(245,197,71,0.45)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        aria-hidden
      >
        <path d="M7 11V8a5 5 0 0110 0v3" />
        <rect x="5" y="11" width="14" height="10" rx="2" />
      </svg>
    </span>
  );
}
