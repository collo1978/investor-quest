"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { resolveBusinessMapCardWidth } from "@/app/business/businessQuestMapPositions";
import {
  BusinessQuestDiscoveryMark,
  BusinessQuestXpChip
} from "@/components/business/BusinessQuestDiscoveryMark";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { businessQuestDiscoveryAriaLabel } from "@/lib/business/businessQuestDiscovery";
import type { Company } from "@/data/companies";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
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
  const dataLocked = card.locked;
  const [navigating, setNavigating] = useState(false);

  const isPrimary = card.isPrimaryActive && !card.completed && !dataLocked;

  const floatDuration = 4.2 + staggerIndex * 0.35;
  const floatY = dataLocked ? 2 : isPrimary ? 3.5 : 2.5;
  const slotClass = [
    "iq-schools-hub-mission-slot",
    "business-hub-orbit-slot",
    `business-hub-orbit-slot-${card.orderNumber}`,
    dataLocked
      ? "z-[10]"
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
          scale: dataLocked ? 0.96 : isPrimary ? 1.04 : 1
        }
      }
    : {
        animate: {
          opacity: 1,
          y: [0, -floatY, 0],
          scale: dataLocked ? 0.96 : isPrimary ? 1.04 : 1
        },
        transition: {
          y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut" as const },
          scale: { delay: 0.07 * staggerIndex, duration: 0.45 },
          opacity: { delay: 0.07 * staggerIndex, duration: 0.45 }
        }
      };

  if (dataLocked) {
    return (
      <div
        className={wrapperClass}
        style={wrapperStyle}
        title="Complete the previous lesson to unlock"
        aria-label={businessQuestDiscoveryAriaLabel(card.orderNumber, "locked")}
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

  const ariaState = card.completed
    ? "completed"
    : isPrimary
      ? "active"
      : "available";

  return (
    <div className={wrapperClass} style={wrapperStyle}>
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
          aria-label={businessQuestDiscoveryAriaLabel(card.orderNumber, ariaState)}
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
            rewardXp={card.completed ? undefined : card.rewardXp}
          />
          <div className="iq-schools-hub-mission-card__discovery">
            {card.completed ? (
              <span
                className="iq-schools-hub-mission-card__discovery-complete"
                aria-hidden
              >
                ✓
              </span>
            ) : (
              <BusinessQuestDiscoveryMark variant="card" />
            )}
          </div>
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
  completed = false,
  rewardXp
}: {
  orderNumber: number;
  completed?: boolean;
  rewardXp?: number;
}) {
  return (
    <header className="iq-schools-hub-mission-card__header">
      <span className="iq-schools-hub-mission-card__num">{orderNumber}</span>
      {completed ? (
        <span className="iq-schools-hub-mission-card__done-chip" aria-label="Quest complete">
          Complete
        </span>
      ) : rewardXp != null && rewardXp > 0 ? (
        <BusinessQuestXpChip rewardXp={rewardXp} />
      ) : null}
    </header>
  );
}
