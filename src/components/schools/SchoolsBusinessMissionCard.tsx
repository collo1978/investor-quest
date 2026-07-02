"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { resolveBusinessMapCardWidth } from "@/app/business/businessQuestMapPositions";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { Company } from "@/data/companies";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import {
  clearHubCardTitleRevealed,
  isHubCardTitleRevealed,
  markHubCardTitleRevealed
} from "@/lib/quests/hubCardRevealStorage";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import { resolveSchoolsHubQuestHref } from "@/lib/schools/schoolsDemoHref";

const MISSION_ACCENT = {
  path: "#fbbf24",
  edge: "#ca8a04",
  glow: "rgba(251, 191, 36, 0.45)"
} as const;

type Props = {
  card: BusinessHubQuestCard;
  company: Company;
  partnerId?: string;
  userId?: string;
  staggerIndex?: number;
  cardLayout?: "orbit" | "grid";
  journeyRole?: "current" | "next" | "previous";
  onBeforeQuestNavigate?: (href: string) => void;
};

function ProdigyLockBadge({
  scale = 0.78,
  unlocked = false
}: {
  scale?: number;
  unlocked?: boolean;
}) {
  return (
    <span
      className={[
        "iq-prodigy-map__lock-badge iq-prodigy-map__lock-badge--island",
        unlocked ? "iq-prodigy-map__lock-badge--unlocked" : ""
      ].join(" ")}
      style={scale !== 0.78 ? { transform: `scale(${scale})` } : undefined}
      aria-hidden
    >
      <span className="iq-prodigy-map__lock-shackle" />
      <span className="iq-prodigy-map__lock-body">
        <span className="iq-prodigy-map__lock-keyhole" />
      </span>
    </span>
  );
}

function QuestLinkPendingOverlay({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  if (!active && !pending) return null;
  return (
    <span
      className="pointer-events-none absolute inset-0 z-[4] rounded-[18px] bg-[rgba(251,191,36,0.14)] ring-2 ring-[rgba(251,191,36,0.55)]"
      aria-hidden
    />
  );
}

function resolveCtaLabel(card: BusinessHubQuestCard): string {
  if (card.completed) return "Review Quest";
  if (card.progressPct > 0) return "Continue Quest";
  return "Enter Quest";
}

export function SchoolsBusinessMissionCard({
  card,
  company,
  partnerId,
  userId,
  staggerIndex = 0,
  cardLayout = "orbit",
  journeyRole,
  onBeforeQuestNavigate
}: Props) {
  const pathname = usePathname();
  const questHref =
    resolveSchoolsHubQuestHref(card.route, pathname) ?? card.route;
  const reduceMotion = useReducedMotion();
  const cardWidth = resolveBusinessMapCardWidth(card.orderNumber);
  const slotStyle = cardWidth;
  const unlockEpoch = card.unlockEpoch ?? null;
  const dataLocked = card.locked;

  const [titleRevealed, setTitleRevealed] = useState(() => {
    if (card.orderNumber <= 1 || card.completed) return true;
    if (dataLocked || unlockEpoch == null) return false;
    return isHubCardTitleRevealed(
      company.id,
      "business",
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
    if (card.orderNumber <= 1 || card.completed) {
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
        "business",
        card.slug,
        card.orderNumber,
        card.completed,
        unlockEpoch
      )
    );
  }, [
    dataLocked,
    company.id,
    card.slug,
    card.orderNumber,
    card.completed,
    unlockEpoch
  ]);

  const wasDataLockedRef = useRef(dataLocked);
  const [unlockBeacon, setUnlockBeacon] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const awaitingDiscovery = !dataLocked && !titleRevealed;
  const showLockedChrome = dataLocked || awaitingDiscovery;
  const isPrimary = card.isPrimaryActive && !card.completed && !showLockedChrome;

  useEffect(() => {
    if (dataLocked) {
      clearHubCardTitleRevealed(company.id, "business", card.slug);
      setUnlockBeacon(false);
      return;
    }
    if (awaitingDiscovery) {
      setUnlockBeacon(true);
    }
  }, [dataLocked, awaitingDiscovery, company.id, card.slug]);

  useEffect(() => {
    if (dataLocked) return;
    if (wasDataLockedRef.current && !dataLocked && card.orderNumber > 1) {
      if (awaitingDiscovery) {
        setUnlockBeacon(true);
      }
      trackUserEvent({
        eventType: "user_unlocked_quest",
        pillar: "Business",
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
          discoveryPending: awaitingDiscovery
        }
      });
    }
    wasDataLockedRef.current = dataLocked;
  }, [
    dataLocked,
    awaitingDiscovery,
    card.orderNumber,
    card.questId,
    card.route,
    card.unlockSource,
    company.name,
    company.ticker,
    partnerId,
    userId
  ]);

  const handleReveal = useCallback(() => {
    if (!awaitingDiscovery) return;
    markHubCardTitleRevealed(
      company.id,
      "business",
      card.slug,
      unlockEpoch
    );
    setTitleRevealed(true);
    setUnlockBeacon(false);
  }, [awaitingDiscovery, company.id, card.slug, unlockEpoch]);

  const floatDuration = 4.2 + staggerIndex * 0.35;
  const floatY = awaitingDiscovery ? 5 : showLockedChrome ? 2 : isPrimary ? 3.5 : 2.5;
  const slotClass = [
    "iq-schools-hub-mission-slot",
    "business-hub-orbit-slot",
    `business-hub-orbit-slot-${card.orderNumber}`,
    awaitingDiscovery ? "iq-schools-hub-mission-slot--awaiting" : "",
    showLockedChrome && !awaitingDiscovery
      ? "z-[10]"
      : awaitingDiscovery
        ? "z-[28]"
        : isPrimary
          ? "z-[22]"
          : card.completed
            ? "z-[21]"
            : "z-[20]"
  ].join(" ");

  const isGridLayout = cardLayout === "grid";
  const journeyClass = journeyRole
    ? `iq-schools-hub-journey-card iq-schools-hub-journey-card--${journeyRole}`
    : "";
  const wrapperClass = isGridLayout
    ? `relative w-full pointer-events-auto ${journeyClass}`.trim()
    : `absolute pointer-events-auto ${slotClass} ${journeyClass}`.trim();
  const wrapperStyle = isGridLayout ? undefined : slotStyle;

  const cardStyle = {
    ["--mission-accent" as string]: MISSION_ACCENT.path,
    ["--mission-edge" as string]: MISSION_ACCENT.edge,
    ["--mission-glow" as string]: MISSION_ACCENT.glow
  };

  const motionProps = reduceMotion
    ? {
        animate: {
          opacity: 1,
          y: 0,
          scale: awaitingDiscovery ? 1.1 : showLockedChrome ? 0.96 : isPrimary ? 1.04 : 1
        }
      }
    : {
        animate: {
          opacity: 1,
          y: awaitingDiscovery ? [0, -floatY, 0] : [0, -floatY, 0],
          scale: awaitingDiscovery
            ? [1.06, 1.12, 1.06]
            : showLockedChrome
              ? 0.96
              : isPrimary
                ? 1.04
                : 1
        },
        transition: {
          y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut" as const },
          scale: awaitingDiscovery
            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" as const }
            : { delay: 0.07 * staggerIndex, duration: 0.45 },
          opacity: { delay: 0.07 * staggerIndex, duration: 0.45 }
        }
      };

  if (showLockedChrome) {
    const lockedHint = awaitingDiscovery
      ? "Quest unlocked — tap to reveal"
      : "Complete the previous lesson to unlock";

    if (awaitingDiscovery) {
      return (
        <div
          className={wrapperClass}
          style={wrapperStyle}
          title={lockedHint}
        >
          <motion.button
            type="button"
            className={[
              "iq-schools-hub-mission-card iq-schools-hub-mission-card--awaiting",
              "iq-schools-hub-mission-card--beacon"
            ].join(" ")}
            style={cardStyle}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            {...motionProps}
            aria-label={`Lesson ${card.orderNumber} unlocked — tap to reveal`}
            onClick={handleReveal}
          >
            <MissionCardHeader
              orderNumber={card.orderNumber}
              awaitingDiscovery
            />
            <div className="iq-schools-hub-mission-card__lock-wrap">
              <ProdigyLockBadge unlocked />
              <p className="iq-schools-hub-mission-card__tap-hint">
                Tap to reveal
              </p>
            </div>
          </motion.button>
        </div>
      );
    }

    return (
      <div
        className={`${wrapperClass}`}
        style={wrapperStyle}
        title={lockedHint}
        aria-label={`Lesson ${card.orderNumber} locked`}
      >
        <motion.div
          className="iq-schools-hub-mission-card iq-schools-hub-mission-card--locked"
          style={cardStyle}
          data-hub-locked="true"
          data-hub-slug={card.slug}
          data-hub-order={card.orderNumber}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          {...motionProps}
          aria-disabled
        >
          <MissionCardHeader orderNumber={card.orderNumber} />
          <div className="iq-schools-hub-mission-card__lock-wrap">
            <ProdigyLockBadge />
          </div>
        </motion.div>
      </div>
    );
  }

  const stateClass = card.completed
    ? "iq-schools-hub-mission-card--completed"
    : isPrimary
      ? "iq-schools-hub-mission-card--primary"
      : card.visualState === "active"
        ? "iq-schools-hub-mission-card--active"
        : "";

  return (
    <div
      className={wrapperClass}
      style={wrapperStyle}
    >
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        {...motionProps}
      >
        <Link
          href={questHref}
          prefetch
          scroll
          className={["iq-schools-hub-mission-card", stateClass].join(" ")}
          style={cardStyle}
          aria-label={
            card.completed
              ? `Review completed quest: ${card.title}`
              : `Open quest: ${card.title}`
          }
          onPointerEnter={() => preloadQuestDetailChunks()}
          onPointerDown={() => {
            preloadQuestDetailChunks();
            if (!onBeforeQuestNavigate) {
              setNavigating(true);
            }
          }}
          onClick={(event) => {
            if (onBeforeQuestNavigate) {
              event.preventDefault();
              onBeforeQuestNavigate(questHref);
            }
            trackUserEvent({
              eventType: "user_started_quest",
              pillar: "Business",
              questId: card.questId,
              companyTicker: company.ticker,
              companyName: company.name,
              partnerId,
              userId,
              metadata: {
                questTitle: card.title,
                orderNumber: card.orderNumber,
                route: card.route,
                visualState: card.visualState
              }
            });
          }}
        >
          <QuestLinkPendingOverlay active={navigating} />
          <MissionCardHeader
            orderNumber={card.orderNumber}
            completed={card.completed}
          />
          <h3 className="iq-schools-hub-mission-card__title">{card.title}</h3>
          {card.subtitle ? (
            <p className="iq-schools-hub-mission-card__desc">{card.subtitle}</p>
          ) : null}
          <div className="iq-schools-hub-mission-card__progress">
            <div
              className="iq-schools-hub-mission-card__progress-track"
              role="progressbar"
              aria-valuenow={card.progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Quest progress ${card.progressPct} percent`}
            >
              <div
                className="iq-schools-hub-mission-card__progress-fill"
                style={{ width: `${card.progressPct}%` }}
              />
            </div>
            <span className="iq-schools-hub-mission-card__progress-pct">
              {card.progressPct}%
            </span>
          </div>
          <span className="iq-schools-hub-mission-card__cta">
            {resolveCtaLabel(card)}
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

function MissionCardHeader({
  orderNumber,
  awaitingDiscovery = false,
  completed = false
}: {
  orderNumber: number;
  awaitingDiscovery?: boolean;
  completed?: boolean;
}) {
  return (
    <header className="iq-schools-hub-mission-card__header">
      <span className="iq-schools-hub-mission-card__num">{orderNumber}</span>
      {completed ? (
        <span className="iq-schools-hub-mission-card__done-chip" aria-label="Quest complete">
          Complete
        </span>
      ) : awaitingDiscovery ? (
        <span className="iq-schools-hub-mission-card__unlock-label">Unlocked</span>
      ) : null}
    </header>
  );
}
