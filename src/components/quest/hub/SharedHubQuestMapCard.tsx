"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { toDemoHref } from "@/lib/demo/demoHref";
import { resolveSchoolsHubQuestHref } from "@/lib/schools/schoolsDemoHref";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { HubMapCardTheme } from "@/components/quest/hub/hubMapCardTheme";
import type { HubMapQuestCardData } from "@/lib/quests/hubMapQuestCardTypes";
import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import type { Company } from "@/data/companies";
import {
  isHubCardTitleRevealed,
  markHubCardTitleRevealed,
  clearHubCardTitleRevealed
} from "@/lib/quests/hubCardRevealStorage";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

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

function QuestLinkPendingOverlay({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  if (!active && !pending) return null;
  return (
    <span
      className="pointer-events-none absolute inset-0 z-[4] rounded-xl bg-[rgba(245,197,71,0.12)] ring-2 ring-[rgba(245,197,71,0.45)]"
      aria-hidden
    />
  );
}

function lockedHintFor(
  card: HubMapQuestCardData,
  mysteryLockedCards = false,
  awaitingDiscovery = false
): string {
  if (awaitingDiscovery) return "Quest unlocked — tap to reveal";
  if (mysteryLockedCards) return "Complete the previous lesson to unlock";
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

/** Schools mystery locked — premium future-reward frame. */
const MYSTERY_LOCKED_CARD_FRAME = [
  "relative overflow-hidden",
  "border-2 border-[rgba(255,220,100,0.8)]",
  "shadow-[inset_0_1px_0_rgba(255,236,170,0.38),inset_0_0_22px_rgba(139,92,246,0.14),0_0_0_1px_rgba(167,139,250,0.36),0_4px_22px_rgba(0,0,0,0.48)]"
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
  cardSlotClassName?: string;
  /** Schools demo — hide lesson titles on locked cards until unlocked. */
  mysteryLockedCards?: boolean;
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
  hubProgressPct: _hubProgressPct = 0,
  showCategoryIcon = false,
  cardSlotClassName,
  mysteryLockedCards = false
}: Props) {
  const pathname = usePathname();
  const questHref =
    resolveSchoolsHubQuestHref(card.route, pathname) ?? toDemoHref(card.route);
  const pulseLo = pulseShadow(theme, false);
  const pulsePeak = pulseShadow(theme, true);
  const reduceMotion = useReducedMotion();
  const dataLocked = card.locked;
  const unlockEpoch = card.unlockEpoch ?? null;

  const [titleRevealed, setTitleRevealed] = useState(() => {
    if (!mysteryLockedCards || card.orderNumber <= 1 || card.completed) {
      return true;
    }
    if (dataLocked || unlockEpoch == null) return false;
    return isHubCardTitleRevealed(
      company.id,
      theme.pillarId,
      card.slug,
      card.orderNumber,
      card.completed,
      unlockEpoch
    );
  });
  useEffect(() => {
    if (dataLocked) {
      setTitleRevealed(false);
      return;
    }
    if (!mysteryLockedCards || card.orderNumber <= 1 || card.completed) {
      setTitleRevealed(true);
      return;
    }
    if (unlockEpoch == null) {
      setTitleRevealed(false);
      return;
    }
    setTitleRevealed(
      isHubCardTitleRevealed(
        company.id,
        theme.pillarId,
        card.slug,
        card.orderNumber,
        card.completed,
        unlockEpoch
      )
    );
  }, [
    dataLocked,
    mysteryLockedCards,
    company.id,
    theme.pillarId,
    card.slug,
    card.orderNumber,
    card.completed,
    unlockEpoch
  ]);

  const wasDataLockedRef = useRef(dataLocked);
  const [celebrateUnlock, setCelebrateUnlock] = useState(false);
  const [celebrateComplete, setCelebrateComplete] = useState(false);
  const [unlockBeacon, setUnlockBeacon] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const awaitingDiscovery =
    mysteryLockedCards && !dataLocked && !titleRevealed;
  const showLockedChrome = dataLocked || awaitingDiscovery;
  const isLocked = showLockedChrome;

  const state: HubQuestVisualState = dataLocked
    ? "locked"
    : card.visualState;
  const isActiveCard =
    !isLocked && titleRevealed && state === "active";
  const wasCompleteRef = useRef(state === "completed");
  const lockedHint = lockedHintFor(
    card,
    mysteryLockedCards,
    awaitingDiscovery
  );
  const showMysteryLocked =
    mysteryLockedCards && (dataLocked || awaitingDiscovery);

  useEffect(() => {
    if (dataLocked) {
      clearHubCardTitleRevealed(company.id, theme.pillarId, card.slug);
      setCelebrateUnlock(false);
      setUnlockBeacon(false);
      return;
    }
    if (awaitingDiscovery) {
      setUnlockBeacon(true);
    }
  }, [dataLocked, awaitingDiscovery, company.id, theme.pillarId, card.slug]);

  useEffect(() => {
    if (dataLocked) {
      return;
    }
    if (wasDataLockedRef.current && !dataLocked) {
      if (mysteryLockedCards && !titleRevealed) {
        setUnlockBeacon(true);
      } else if (!mysteryLockedCards) {
        setCelebrateUnlock(true);
        const clear = window.setTimeout(() => setCelebrateUnlock(false), 2400);
        wasDataLockedRef.current = dataLocked;
        return () => window.clearTimeout(clear);
      }
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
            route: card.route,
            discoveryPending: mysteryLockedCards && !titleRevealed
          }
        });
      }
    }
    wasDataLockedRef.current = dataLocked;
  }, [
    dataLocked,
    mysteryLockedCards,
    titleRevealed,
    card.orderNumber,
    card.questId,
    card.route,
    card.unlockSource,
    company.name,
    company.ticker,
    partnerId,
    userId,
    theme.pillarLabel
  ]);

  const handleFlipRequest = useCallback(() => {
    if (!awaitingDiscovery || isFlipping) return;
    if (reduceMotion) {
      markHubCardTitleRevealed(
        company.id,
        theme.pillarId,
        card.slug,
        unlockEpoch
      );
      setTitleRevealed(true);
      setUnlockBeacon(false);
      setCelebrateUnlock(true);
      window.setTimeout(() => setCelebrateUnlock(false), 2000);
      return;
    }
    setIsFlipping(true);
  }, [
    awaitingDiscovery,
    isFlipping,
    reduceMotion,
    company.id,
    theme.pillarId,
    card.slug,
    unlockEpoch
  ]);

  const handleFlipComplete = useCallback(() => {
    if (!isFlipping) return;
    markHubCardTitleRevealed(
      company.id,
      theme.pillarId,
      card.slug,
      unlockEpoch
    );
    setTitleRevealed(true);
    setIsFlipping(false);
    setUnlockBeacon(false);
    setCelebrateUnlock(true);
    window.setTimeout(() => setCelebrateUnlock(false), 2200);
  }, [isFlipping, company.id, theme.pillarId, card.slug, unlockEpoch]);

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
    state === "locked" ? 2 : state === "completed" ? 2 : isActiveCard ? 3 : 2.5;

  const enter = { opacity: 0, y: 10, scale: 0.95 };
  const scale =
    state === "locked" ? 0.94 : state === "completed" ? 1 : isActiveCard ? 1.03 : 1;
  const shown = { opacity: 1, y: 0, scale };

  const baseTransition = {
    delay: 0.07 * staggerIndex,
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as const
  };

  const slotClass =
    isLocked
      ? unlockBeacon
        ? "group z-[20]"
        : "group z-[10]"
      : isActiveCard
        ? "z-[22]"
        : state === "completed"
          ? "z-[21]"
          : undefined;

  return (
    <CardSlot
      position={position}
      cardWidth={cardWidth}
      className={[slotClass, cardSlotClassName].filter(Boolean).join(" ")}
      title={isLocked ? lockedHint : undefined}
      ariaLabel={
        awaitingDiscovery
          ? `Lesson ${card.orderNumber} unlocked — tap to reveal`
          : dataLocked
            ? showMysteryLocked
              ? `Lesson ${card.orderNumber} locked`
              : `${card.title} locked`
            : state === "completed"
              ? `${card.title} completed`
              : undefined
      }
    >
      <HubQuestCardFrame
        state={state}
        isLocked={isLocked}
        awaitingDiscovery={awaitingDiscovery}
        unlockBeacon={unlockBeacon}
        isFlipping={isFlipping}
        onFlipRequest={handleFlipRequest}
        onFlipComplete={handleFlipComplete}
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
        mysteryLockedCards={mysteryLockedCards}
        isActiveCard={isActiveCard}
        partnerId={partnerId}
        userId={userId}
        theme={theme}
        pulseLo={pulseLo}
        pulsePeak={pulsePeak}
        navigating={navigating}
        questHref={questHref}
        onNavigateStart={() => {
          preloadQuestDetailChunks();
          setNavigating(true);
        }}
      >
        <HubCardBody
          card={card}
          state={state}
          isLocked={isLocked}
          isActiveCard={isActiveCard}
          theme={theme}
          showCategoryIcon={showCategoryIcon}
          mysteryLockedCards={mysteryLockedCards}
          awaitingDiscovery={awaitingDiscovery}
          celebrateUnlock={celebrateUnlock}
        />
      </HubQuestCardFrame>
    </CardSlot>
  );
}

/** Stable mount per quest — state changes morph in place (no unmount on complete). */
function HubQuestCardFrame({
  state,
  isLocked,
  awaitingDiscovery,
  unlockBeacon,
  isFlipping,
  onFlipRequest,
  onFlipComplete,
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
  mysteryLockedCards,
  isActiveCard,
  partnerId,
  userId,
  theme,
  pulseLo,
  pulsePeak,
  navigating,
  questHref,
  onNavigateStart
}: {
  state: HubQuestVisualState;
  isLocked: boolean;
  awaitingDiscovery: boolean;
  unlockBeacon: boolean;
  isFlipping: boolean;
  onFlipRequest: () => void;
  onFlipComplete: () => void;
  card: HubMapQuestCardData;
  company: Company;
  children: ReactNode;
  navigating: boolean;
  questHref: string;
  onNavigateStart: () => void;
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
  mysteryLockedCards: boolean;
  isActiveCard: boolean;
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

  if (isLocked) {
    const lockedFrameClass = [
      "isolate z-[10] rounded-xl text-left backdrop-blur-sm",
      "px-3 py-2.5 sm:px-3.5 sm:py-2.5",
      mysteryLockedCards ? MYSTERY_LOCKED_CARD_FRAME : LOCKED_CARD_FRAME,
      mysteryLockedCards
        ? "bg-[rgba(8,7,14,0.96)]"
        : "bg-[rgba(10,8,6,0.94)]",
      awaitingDiscovery
        ? [
            "scale-[0.98] cursor-pointer select-none transition-[box-shadow,filter] duration-300",
            unlockBeacon
              ? "brightness-[1.08] saturate-[1.06] shadow-[0_0_28px_rgba(245,197,71,0.42),0_0_48px_rgba(139,92,246,0.22)]"
              : "hover:brightness-[1.04]"
          ].join(" ")
        : "scale-[0.95] cursor-not-allowed select-none saturate-[0.72] brightness-[0.9]"
    ].join(" ");

    const lockedInner = (
      <>
        <span
          className={[
            "pointer-events-none absolute inset-0 z-[1] rounded-xl",
            awaitingDiscovery ? "bg-[rgba(0,0,0,0.12)]" : "bg-[rgba(0,0,0,0.22)]"
          ].join(" ")}
          aria-hidden
        />
        <LockedCardSheen />
        {unlockBeacon && awaitingDiscovery && !reduceMotion ? (
          <UnlockBeaconPulse theme={theme} />
        ) : null}
        {mysteryLockedCards ? (
          <>
            <span
              className="pointer-events-none absolute inset-[2px] z-[1] rounded-[10px] bg-[radial-gradient(ellipse_at_50%_62%,rgba(139,92,246,0.16)_0%,rgba(109,40,217,0.06)_38%,transparent_72%)]"
              aria-hidden
            />
            <MysteryLockedBorderShimmer orderNumber={card.orderNumber} />
            <MysteryLockedBorderSweep orderNumber={card.orderNumber} />
            {unlockBeacon ? (
              <MysteryUnlockBorderBrighten persistent />
            ) : null}
          </>
        ) : null}
        <span
          className="pointer-events-none absolute -top-9 left-1/2 z-40 hidden w-max max-w-[13rem] -translate-x-1/2 rounded-lg border border-[rgba(245,197,71,0.28)] bg-[rgba(8,7,4,0.96)] px-2.5 py-1.5 text-center text-[10px] leading-snug text-[rgba(255,229,141,0.82)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block"
          role="tooltip"
        >
          {lockedHint}
        </span>
        <span className="relative z-[2]">{children}</span>
      </>
    );

    if (awaitingDiscovery) {
      return (
        <MysteryFlipRevealCard
          card={card}
          theme={theme}
          unlockBeacon={unlockBeacon}
          isFlipping={isFlipping}
          reduceMotion={reduceMotion}
          lockedFrameClass={lockedFrameClass}
          pulseLo={pulseLo}
          pulsePeak={pulsePeak}
          shown={shown}
          enter={enter}
          baseTransition={baseTransition}
          onFlipRequest={onFlipRequest}
          onFlipComplete={onFlipComplete}
        >
          {children}
        </MysteryFlipRevealCard>
      );
    }

    return (
      <motion.div
        key={`${card.slug}-locked`}
        data-hub-locked="true"
        data-hub-slug={card.slug}
        data-hub-order={card.orderNumber}
        data-hub-mystery={mysteryLockedCards ? "true" : undefined}
        className={lockedFrameClass}
        initial={enter}
        animate={reduceMotion ? shown : { ...shown, scale: 0.95, y: [0, -2, 0] }}
        transition={floatTransition}
        aria-disabled
      >
        {lockedInner}
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
          "bg-[rgba(24,18,9,0.97)] brightness-[1.1] saturate-[1.08]",
          "scale-[1.03] cursor-pointer transition-[box-shadow,filter] duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90"
        ].join(" ");

  const boxShadowAnim =
    state === "completed"
      ? undefined
      : isActiveCard
        ? [pulseLo, pulsePeak, pulseLo]
        : celebrateUnlock && !mysteryLockedCards
          ? [pulseLo, pulsePeak, pulseLo]
          : undefined;

  const mysteryReveal = false;

  return (
    <motion.div
      key={`${card.slug}-${state}`}
      className="relative"
      style={mysteryReveal ? { perspective: 900 } : undefined}
      initial={
        celebrateComplete && state === "completed" && !reduceMotion
          ? { opacity: 0.85, scale: 0.94 }
          : mysteryReveal
            ? { opacity: 0, scale: 0.9, rotateY: -88 }
            : celebrateUnlock && !reduceMotion && !mysteryLockedCards
              ? { opacity: 0.55, scale: 0.9 }
              : enter
      }
      animate={
        reduceMotion
          ? { ...shown, scale }
          : {
              ...shown,
              scale,
              rotateY: 0,
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
                  : isActiveCard
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
      {celebrateUnlock && mysteryLockedCards && state === "active" && !reduceMotion ? (
        <motion.span
          className="-inset-2 pointer-events-none absolute rounded-2xl blur-sm bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,229,141,0.38)_0%,rgba(139,92,246,0.22)_40%,transparent_68%)]"
          aria-hidden
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: [0, 0.72, 0.28], scale: [0.92, 1.05, 1] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ) : null}
      {celebrateUnlock && state === "active" && !reduceMotion && !mysteryLockedCards ? (
        <motion.span
          className={[
            "pointer-events-none absolute rounded-2xl",
            mysteryLockedCards
              ? "-inset-2 blur-sm bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,229,141,0.38)_0%,rgba(139,92,246,0.22)_40%,transparent_68%)]"
              : "-inset-4 blur-md bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,229,141,0.42)_0%,rgba(245,197,71,0.16)_45%,transparent_72%)]"
          ].join(" ")}
          aria-hidden
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: mysteryLockedCards ? [0, 0.72, 0] : [0, 0.95, 0],
            scale: mysteryLockedCards ? [0.92, 1.05, 1.08] : [0.88, 1.14, 1.18]
          }}
          transition={{ duration: mysteryLockedCards ? 1.5 : 2.2, ease: "easeOut" }}
        />
      ) : null}
      {mysteryReveal ? (
        <>
          <MysteryUnlockBorderBrighten />
          <MysteryUnlockLockFade />
        </>
      ) : null}
      {isActiveCard && !reduceMotion ? (
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
              : isActiveCard
                ? { y: -6, scale: 1.034 }
                : { y: -7, scale: 1.04 }
        }
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      >
        <Link
          href={questHref}
          prefetch
          scroll
          className={linkClass}
          aria-label={
            state === "completed"
              ? `Review completed quest: ${card.title}`
              : `Open quest: ${card.title}`
          }
          onPointerEnter={() => preloadQuestDetailChunks()}
          onPointerDown={onNavigateStart}
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
          <QuestLinkPendingOverlay active={navigating} />
          {state === "completed" ? (
            <CompletedCardSheen />
          ) : (
            <>
              <ActiveBorderShimmer intense={isActiveCard} />
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
  isActiveCard,
  theme,
  showCategoryIcon,
  mysteryLockedCards = false,
  awaitingDiscovery = false,
  celebrateUnlock = false
}: {
  card: HubMapQuestCardData;
  state: HubQuestVisualState;
  isLocked: boolean;
  isActiveCard: boolean;
  theme: HubMapCardTheme;
  showCategoryIcon?: boolean;
  mysteryLockedCards?: boolean;
  awaitingDiscovery?: boolean;
  celebrateUnlock?: boolean;
}) {
  const dimmed = isLocked || state === "locked";

  if (dimmed && mysteryLockedCards) {
    return (
      <MysteryLockedCardBody
        card={card}
        theme={theme}
        awaitingDiscovery={awaitingDiscovery}
      />
    );
  }

  const subtitle = card.subtitle?.trim() ?? "";

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
            prominent={card.orderNumber === 1 || isActiveCard}
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
        <motion.h3
          className={[
            "line-clamp-2 font-[var(--font-grotesk)] font-semibold leading-snug",
            dimmed
              ? "text-[19px] text-[rgba(255,248,230,0.68)] sm:text-[20px]"
              : state === "completed"
                ? "text-[19px] text-[rgba(255,252,240,0.92)] sm:text-[21px]"
                : "text-[19px] text-[rgba(255,252,235,1)] sm:text-[21px]"
          ].join(" ")}
          initial={
            mysteryLockedCards && celebrateUnlock
              ? { opacity: 0, rotateX: -24, y: 6 }
              : false
          }
          animate={
            mysteryLockedCards && celebrateUnlock
              ? { opacity: 1, rotateX: 0, y: 0 }
              : undefined
          }
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {card.title}
        </motion.h3>
        {subtitle && !mysteryLockedCards ? (
          <p
            className={[
              "line-clamp-2 text-[14.5px] leading-snug sm:text-[15.5px]",
              dimmed
                ? "text-[rgba(255,235,200,0.52)]"
                : state === "completed"
                  ? "text-[rgba(255,242,215,0.72)]"
                  : "text-[rgba(255,242,215,0.92)]"
            ].join(" ")}
          >
            {subtitle}
          </p>
        ) : null}
      </motion.div>

      <footer className="mt-2.5 space-y-2">
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
            <LockIcon size="md" />
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

/** Schools — tap unlocked mystery card to flip and reveal the lesson title. */
function MysteryFlipRevealCard({
  card,
  theme,
  unlockBeacon,
  isFlipping,
  reduceMotion,
  lockedFrameClass,
  pulseLo,
  pulsePeak,
  shown,
  enter,
  baseTransition,
  onFlipRequest,
  onFlipComplete,
  children
}: {
  card: HubMapQuestCardData;
  theme: HubMapCardTheme;
  unlockBeacon: boolean;
  isFlipping: boolean;
  reduceMotion: boolean | null;
  lockedFrameClass: string;
  pulseLo: string;
  pulsePeak: string;
  shown: { opacity: number; y: number; scale: number };
  enter: { opacity: number; y: number; scale: number };
  baseTransition: {
    delay: number;
    duration: number;
    ease: readonly [number, number, number, number];
  };
  onFlipRequest: () => void;
  onFlipComplete: () => void;
  children: ReactNode;
}) {
  const subtitle = card.subtitle?.trim() ?? "";

  return (
    <motion.button
      type="button"
      key={`${card.slug}-awaiting`}
      data-hub-awaiting-reveal="true"
      data-hub-slug={card.slug}
      data-hub-order={card.orderNumber}
      className={[
        lockedFrameClass,
        unlockBeacon && !isFlipping
          ? "ring-2 ring-[rgba(255,229,141,0.72)] ring-offset-0 ring-offset-transparent"
          : ""
      ].join(" ")}
      initial={enter}
      animate={
        reduceMotion
          ? shown
          : {
              ...shown,
              scale: isFlipping ? 1.02 : unlockBeacon ? [0.98, 1.03, 0.98] : 0.98,
              y: isFlipping ? 0 : [0, -4, 0],
              boxShadow: unlockBeacon
                ? [pulseLo, pulsePeak, pulseLo]
                : undefined
            }
      }
      transition={
        reduceMotion
          ? baseTransition
          : {
              y: { duration: 3.2, repeat: isFlipping ? 0 : Infinity, ease: "easeInOut" },
              scale: isFlipping
                ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
                : unlockBeacon
                  ? { duration: 2.6, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }
                  : baseTransition,
              boxShadow: unlockBeacon
                ? { duration: 2.6, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }
                : undefined,
              default: baseTransition
            }
      }
      aria-label={`Lesson ${card.orderNumber} unlocked — tap to reveal`}
      onClick={onFlipRequest}
      disabled={isFlipping}
    >
      <span
        className={[
          "pointer-events-none absolute inset-0 z-[1] rounded-xl",
          unlockBeacon ? "bg-[rgba(0,0,0,0.08)]" : "bg-[rgba(0,0,0,0.22)]"
        ].join(" ")}
        aria-hidden
      />
      <LockedCardSheen />
      {unlockBeacon && !isFlipping && !reduceMotion ? (
        <UnlockBeaconPulse theme={theme} />
      ) : null}
      <span
        className="pointer-events-none absolute inset-[2px] z-[1] rounded-[10px] bg-[radial-gradient(ellipse_at_50%_62%,rgba(139,92,246,0.16)_0%,rgba(109,40,217,0.06)_38%,transparent_72%)]"
        aria-hidden
      />
      <MysteryLockedBorderShimmer orderNumber={card.orderNumber} />
      <MysteryLockedBorderSweep orderNumber={card.orderNumber} />
      {unlockBeacon ? <MysteryUnlockBorderBrighten persistent /> : null}
      {isFlipping && !reduceMotion ? <MysteryUnlockBorderBrighten /> : null}

      <div className="relative z-[2] min-h-[5.75rem]" style={{ perspective: 1000 }}>
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipping ? 180 : 0 }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => {
            if (isFlipping) onFlipComplete();
          }}
        >
          <div
            className="relative"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          >
            {children}
          </div>
          <div
            className="absolute inset-0 flex flex-col justify-center px-2 py-3"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2">
              Lesson {card.orderNumber}
            </p>
            <h3 className="mt-2 text-center font-[var(--font-grotesk)] text-[17px] font-semibold leading-snug text-[rgba(255,252,235,1)] sm:text-[19px]">
              {card.title}
            </h3>
            {subtitle ? (
              <p className="mt-1.5 line-clamp-2 text-center text-[12.5px] leading-snug text-[rgba(255,242,215,0.88)] sm:text-[13.5px]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}

/** Schools demo — locked card hides lesson title until unlocked. */
function MysteryLockedCardBody({
  card,
  theme,
  awaitingDiscovery = false
}: {
  card: HubMapQuestCardData;
  theme: HubMapCardTheme;
  awaitingDiscovery?: boolean;
}) {
  return (
    <article className="flex min-h-[5.75rem] flex-col">
      <header className="flex items-start justify-end">
        <span
          className="min-w-[2rem] rounded border px-2.5 py-0.5 text-center text-[17px] font-bold tabular-nums leading-none sm:min-w-[2.125rem] sm:text-[19px]"
          style={{
            borderColor: theme.lockedBorder,
            color: `${theme.hi}cc`
          }}
        >
          {card.orderNumber}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-2">
        <LockIcon size="hero" pulse={awaitingDiscovery} unlocked={awaitingDiscovery} />
        {awaitingDiscovery ? (
          <p
            className="text-center text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{
              color: theme.hi,
              textShadow: `0 0 14px ${theme.glow}, 0 0 24px rgba(245,197,71,0.35)`
            }}
          >
            Tap to reveal
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Soft full-border shimmer pulse every ~9s. */
function MysteryLockedBorderShimmer({ orderNumber }: { orderNumber: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  const shimmerDelay = (orderNumber - 1) * 1.15;

  return (
    <motion.span
      className="pointer-events-none absolute inset-0 z-[2] rounded-xl border-2 border-[rgba(255,236,175,0.55)]"
      aria-hidden
      animate={{ opacity: [0.22, 0.52, 0.22] }}
      transition={{
        duration: 2.2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 6.8,
        delay: shimmerDelay
      }}
    />
  );
}

/** Soft gold highlight travels the border every ~9s. */
function MysteryLockedBorderSweep({ orderNumber }: { orderNumber: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  const sweepDelay = (orderNumber - 1) * 1.15;

  return (
    <span
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-xl"
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-xl p-[2px]"
        style={{
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude"
        }}
      >
        <motion.span
          className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 302deg, rgba(255,229,141,0.42) 316deg, rgba(255,244,195,0.62) 328deg, transparent 342deg)"
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2.4,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 6.6,
            delay: sweepDelay
          }}
        />
      </span>
    </span>
  );
}

/** Border brightens when a mystery card is awaiting discovery or flipping open. */
function MysteryUnlockBorderBrighten({ persistent = false }: { persistent?: boolean }) {
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 z-[4] rounded-xl border-2 border-[rgba(255,238,150,0.92)]"
      aria-hidden
      initial={{ opacity: persistent ? 0.55 : 0.95 }}
      animate={{ opacity: persistent ? [0.42, 0.72, 0.42] : 0 }}
      transition={
        persistent
          ? { duration: 2.8, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }
          : { duration: 1.1, ease: "easeOut" }
      }
    />
  );
}

/** Soft radial glow while a card awaits player reveal. */
function UnlockBeaconPulse({ theme }: { theme: HubMapCardTheme }) {
  return (
    <motion.span
      className="pointer-events-none absolute -inset-4 z-[0] rounded-2xl blur-md bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,229,141,0.48)_0%,rgba(139,92,246,0.24)_42%,transparent_72%)]"
      aria-hidden
      animate={{ opacity: [0.42, 0.82, 0.42], scale: [0.96, 1.06, 0.96] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }}
      style={{ boxShadow: `0 0 32px ${theme.glowSoft}, 0 0 48px rgba(245,197,71,0.28)` }}
    />
  );
}

/** Lock gently shakes and fades when a mystery card flips open. */
function MysteryUnlockLockFade() {
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center rounded-xl"
      aria-hidden
      initial={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
      animate={{
        opacity: 0,
        scale: 1.06,
        x: [0, -2, 2, -2, 1, 0],
        rotate: [0, -3, 3, -2, 0]
      }}
      transition={{
        opacity: { duration: 0.55, ease: "easeOut" },
        scale: { duration: 0.55, ease: "easeOut" },
        x: { duration: 0.48, ease: "easeInOut" },
        rotate: { duration: 0.48, ease: "easeInOut" }
      }}
    >
      <LockIcon size="hero" />
    </motion.span>
  );
}

function LockIcon({
  size = "sm",
  pulse = false,
  unlocked = false
}: {
  size?: "sm" | "md" | "hero";
  pulse?: boolean;
  unlocked?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const closedPaths = (
    <>
      <path d="M7 11V8a5 5 0 0110 0v3" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </>
  );
  const openPaths = (
    <>
      <path
        d="M7 11V7.75a5 5 0 018.65-3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <circle cx="12" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
    </>
  );
  const iconPaths = unlocked ? openPaths : closedPaths;

  if (size === "sm") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        {iconPaths}
      </svg>
    );
  }

  if (size === "md") {
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
          {iconPaths}
        </svg>
      </span>
    );
  }

  const glowPulse =
    pulse && !reduceMotion
      ? {
          opacity: [0.72, 0.88, 0.72],
          scale: [1, 1.03, 1]
        }
      : undefined;
  const glowTransition =
    pulse && !reduceMotion
      ? { duration: 8.2, repeat: Infinity, ease: "easeInOut" as const }
      : undefined;

  return (
    <span
      className={[
        "relative inline-flex items-center justify-center",
        unlocked ? "text-[rgba(255,236,160,0.94)]" : "text-[rgba(255,229,141,0.82)]"
      ].join(" ")}
      role="img"
      aria-label={unlocked ? "Unlocked — tap to reveal" : "Locked"}
    >
      <motion.span
        className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(245,197,71,0.3)_0%,rgba(139,92,246,0.2)_48%,transparent_74%)] blur-md"
        aria-hidden
        animate={glowPulse}
        transition={glowTransition}
      />
      <motion.span
        className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.16)_0%,transparent_70%)] blur-sm"
        aria-hidden
        animate={glowPulse}
        transition={
          glowTransition
            ? { ...glowTransition, delay: 0.15 }
            : undefined
        }
      />
      <motion.svg
        viewBox="0 0 24 24"
        className="relative h-10 w-10 shrink-0 drop-shadow-[0_0_14px_rgba(245,197,71,0.55)] sm:h-11 sm:w-11"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.15}
        aria-hidden
        animate={
          pulse && !reduceMotion
            ? { opacity: [0.9, 0.98, 0.9] }
            : undefined
        }
        transition={
          pulse && !reduceMotion
            ? { duration: 8.2, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        {iconPaths}
      </motion.svg>
    </span>
  );
}
