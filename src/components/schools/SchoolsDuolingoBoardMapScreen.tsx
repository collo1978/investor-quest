"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useGame } from "@/components/GameProvider";
import { type PillarId } from "@/data/pillars";
import {
  getPillarViews,
  isTenKFinalChallengeUnlocked,
  type PillarView
} from "@/engine";
import { getActiveCompanyProgress } from "@/engine/progression/selectors";
import {
  DUOLINGO_BOARD_HUB_POSITION,
  DUOLINGO_BOARD_ZONE_LAYOUT,
  DUOLINGO_MAP_TITLE,
  type DuolingoBoardZoneLayout,
  type DuolingoMapPillarNode
} from "@/lib/schools/schoolsDuolingoMapConfig";
import {
  duolingoFinalChallengeHref,
  duolingoHubNode,
  duolingoPillarHref,
  duolingoPillarNode,
  resolveDuolingoHubState,
  resolveDuolingoPillarState,
  type DuolingoNodeVisualState
} from "@/lib/schools/schoolsDuolingoMapHelpers";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function BoardScenery() {
  const hub = DUOLINGO_BOARD_HUB_POSITION;
  return (
    <svg
      className="iq-duo-board__scenery"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="duo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="55%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="duo-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#duo-sky)" />
      <ellipse cx="18" cy="14" rx="11" ry="5" fill="#fff" opacity="0.75" />
      <ellipse cx="82" cy="18" rx="13" ry="5.5" fill="#fff" opacity="0.68" />
      <ellipse cx="52" cy="10" rx="9" ry="4" fill="#fff" opacity="0.6" />
      <path
        d="M0 62 Q25 58 50 62 T100 60 L100 100 L0 100 Z"
        fill="url(#duo-sea)"
        opacity="0.55"
      />
      {DUOLINGO_BOARD_ZONE_LAYOUT.map((zone) => (
        <path
          key={zone.id}
          d={`M ${hub.x} ${hub.y} Q ${(hub.x + zone.x) / 2} ${(hub.y + zone.y) / 2 - 5} ${zone.x} ${zone.y}`}
          className="iq-duo-board__path-line"
        />
      ))}
    </svg>
  );
}

function LandmarkOffice() {
  return (
    <svg viewBox="0 0 64 64" className="iq-duo-board__landmark-svg" aria-hidden>
      <rect x="14" y="18" width="36" height="38" rx="6" fill="#fff" opacity="0.95" />
      <rect x="20" y="26" width="8" height="8" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="36" y="26" width="8" height="8" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="20" y="40" width="8" height="8" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="36" y="40" width="8" height="8" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="27" y="46" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function LandmarkWarning() {
  return (
    <svg viewBox="0 0 64 64" className="iq-duo-board__landmark-svg" aria-hidden>
      <path d="M32 10L56 52H8L32 10z" fill="#fff" opacity="0.95" />
      <path d="M32 22v18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="46" r="3" fill="currentColor" />
    </svg>
  );
}

function LandmarkCoins() {
  return (
    <svg viewBox="0 0 64 64" className="iq-duo-board__landmark-svg" aria-hidden>
      <ellipse cx="28" cy="40" rx="16" ry="8" fill="currentColor" opacity="0.25" />
      <circle cx="24" cy="34" r="14" fill="#fff" opacity="0.95" />
      <circle cx="38" cy="30" r="12" fill="#fff" opacity="0.88" />
      <text x="24" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor">
        $
      </text>
    </svg>
  );
}

function LandmarkCrown() {
  return (
    <svg viewBox="0 0 64 64" className="iq-duo-board__landmark-svg" aria-hidden>
      <path
        d="M12 44h40l-4-24-10 12-8-16-8 16-10-12-4 24z"
        fill="#fff"
        opacity="0.95"
      />
      <circle cx="20" cy="22" r="4" fill="currentColor" opacity="0.45" />
      <circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.45" />
      <circle cx="44" cy="22" r="4" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function IslandLandmark({ kind }: { kind: DuolingoBoardZoneLayout["landmark"] }) {
  switch (kind) {
    case "office":
      return <LandmarkOffice />;
    case "warning":
      return <LandmarkWarning />;
    case "coins":
      return <LandmarkCoins />;
    case "crown":
      return <LandmarkCrown />;
  }
}

function IslandZone({
  layout,
  node,
  state,
  href,
  pillarView
}: {
  layout: DuolingoBoardZoneLayout;
  node: DuolingoMapPillarNode;
  state: DuolingoNodeVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const completed = state === "completed";
  const inProgress = state === "in-progress";
  const interactive = !locked && Boolean(href);

  const islandClass = [
    "iq-duo-board__island-mass",
    locked ? "iq-duo-board__island-mass--locked" : "",
    completed ? "iq-duo-board__island-mass--done" : "",
    inProgress ? "iq-duo-board__island-mass--progress" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = [
    "iq-duo-board__label-card",
    hovered && interactive ? "iq-duo-board__label-card--hover" : "",
    locked ? "iq-duo-board__label-card--locked" : "",
    completed ? "iq-duo-board__label-card--done" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const zoneStyle = {
    left: `${layout.x}%`,
    top: `${layout.y}%`,
    ["--duo-accent" as string]: node.accent,
    ["--duo-accent-soft" as string]: node.accentSoft
  };

  const body = (
    <>
      <div className={islandClass} style={{ color: node.accent }}>
        <IslandLandmark kind={layout.landmark} />
        {completed ? (
          <span className="iq-duo-board__badge iq-duo-board__badge--done" aria-hidden>
            ✓
          </span>
        ) : locked ? (
          <span className="iq-duo-board__badge iq-duo-board__badge--lock" aria-hidden>
            🔒
          </span>
        ) : null}
      </div>
      <div className={labelClass}>
        <span className="iq-duo-board__label-emoji" aria-hidden>
          {node.emoji}
        </span>
        <span className="iq-duo-board__label-title">{node.label}</span>
        <span className="iq-duo-board__label-sub">{node.subtitle}</span>
        <div className="iq-duo-board__label-meta">
          <span className="iq-duo-board__status">
            {completed
              ? "Done"
              : locked
                ? "Locked"
                : inProgress
                  ? `${pillarView?.completedCount ?? 0}/${pillarView?.totalCount ?? 0}`
                  : "Go"}
          </span>
          <span className="iq-duo-board__xp">+{node.xpReward} XP</span>
        </div>
      </div>
    </>
  );

  if (interactive && href) {
    return (
      <motion.div
        className="iq-duo-board__zone"
        style={zoneStyle}
        initial={false}
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.16, ease: EASE_OUT }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <Link
          href={href}
          prefetch
          className="iq-duo-board__zone-hit"
          aria-label={`${node.label} — ${node.subtitle}`}
        >
          {body}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="iq-duo-board__zone" style={zoneStyle} aria-disabled={locked}>
      <div className="iq-duo-board__zone-hit iq-duo-board__zone-hit--static">{body}</div>
    </div>
  );
}

function HubZone({
  state,
  href
}: {
  state: DuolingoNodeVisualState;
  href?: string;
}) {
  const hub = duolingoHubNode();
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const completed = state === "completed";
  const interactive = !locked && Boolean(href);

  const discClass = [
    "iq-duo-board__hub-disc",
    locked ? "iq-duo-board__hub-disc--locked" : "",
    completed ? "iq-duo-board__hub-disc--done" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const zoneStyle = {
    left: `${DUOLINGO_BOARD_HUB_POSITION.x}%`,
    top: `${DUOLINGO_BOARD_HUB_POSITION.y}%`,
    ["--duo-accent" as string]: hub.accent,
    ["--duo-accent-soft" as string]: hub.accentSoft
  };

  const inner = (
    <>
      <div className={discClass}>
        <span className="iq-duo-board__hub-emoji" aria-hidden>
          {hub.emoji}
        </span>
        <span className="iq-duo-board__hub-kicker">10K</span>
        {completed ? (
          <span className="iq-duo-board__badge iq-duo-board__badge--done iq-duo-board__badge--hub" aria-hidden>
            ✓
          </span>
        ) : locked ? (
          <span className="iq-duo-board__badge iq-duo-board__badge--lock iq-duo-board__badge--hub" aria-hidden>
            🔒
          </span>
        ) : null}
      </div>
      <div
        className={[
          "iq-duo-board__label-card iq-duo-board__label-card--hub",
          hovered && interactive ? "iq-duo-board__label-card--hover" : "",
          locked ? "iq-duo-board__label-card--locked" : "",
          completed ? "iq-duo-board__label-card--done" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="iq-duo-board__label-title">{hub.label}</span>
        <span className="iq-duo-board__label-sub">{hub.subtitle}</span>
        <div className="iq-duo-board__label-meta">
          <span className="iq-duo-board__status">
            {completed ? "Done" : locked ? "Locked" : "Go"}
          </span>
          <span className="iq-duo-board__xp">+{hub.xpReward} XP</span>
        </div>
      </div>
    </>
  );

  if (interactive && href) {
    return (
      <motion.div
        className="iq-duo-board__zone iq-duo-board__zone--hub"
        style={zoneStyle}
        initial={false}
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.16, ease: EASE_OUT }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <Link
          href={href}
          prefetch
          className="iq-duo-board__zone-hit"
          aria-label={`${hub.label} — ${hub.subtitle}`}
        >
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <div
      className="iq-duo-board__zone iq-duo-board__zone--hub"
      style={zoneStyle}
      aria-disabled={locked}
    >
      <div className="iq-duo-board__zone-hit iq-duo-board__zone-hit--static">{inner}</div>
    </div>
  );
}

/**
 * Flat 2D Duolingo-style board map — four cartoon islands + center 10K hub.
 * Preview only; does not replace `/schools/map`.
 */
export function SchoolsDuolingoBoardMapScreen() {
  const pathname = usePathname();
  const { raw } = useGame();
  const pillarViews = useMemo(() => getPillarViews(raw), [raw]);
  const pillarById = useMemo(
    () =>
      Object.fromEntries(pillarViews.map((p) => [p.id, p])) as Record<
        PillarId,
        PillarView
      >,
    [pillarViews]
  );

  const companyProgress = getActiveCompanyProgress(raw);
  const finalUnlocked = isTenKFinalChallengeUnlocked(raw);
  const finalCompleted = companyProgress.tenKRookieChallenge != null;
  const hubState = resolveDuolingoHubState(finalUnlocked, finalCompleted);

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) /
      pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, pillarAvg * 0.85 + finalBonus * 0.15);
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const progressRounded = Math.round(overallProgressPct);
  const hubHref =
    hubState !== "locked" ? duolingoFinalChallengeHref(pathname) : undefined;

  return (
    <main className="iq-duo-board">
      <div className="iq-duo-board__frame">
        <header className="iq-duo-board__header">
          <div className="iq-duo-board__brand-row">
            <Image
              src="/logos/investor-quest-logo.png"
              alt="Investor Quest"
              width={180}
              height={44}
              className="iq-duo-board__logo"
              priority
            />
            <span className="iq-duo-board__preview-tag">Map preview</span>
          </div>

          <div className="iq-duo-board__title-row">
            <Image
              src="/logos/companies/nvda.svg"
              alt=""
              width={32}
              height={32}
              className="iq-duo-board__company-mark"
              aria-hidden
            />
            <h1 className="iq-duo-board__title">{DUOLINGO_MAP_TITLE}</h1>
          </div>

          <div
            className="iq-duo-board__progress"
            role="status"
            aria-label={`Overall quest progress ${progressRounded} percent`}
          >
            <div className="iq-duo-board__progress-labels">
              <span>Quest progress</span>
              <span>{progressRounded}%</span>
            </div>
            <div className="iq-duo-board__progress-track">
              <motion.div
                className="iq-duo-board__progress-fill"
                initial={false}
                animate={{ width: `${progressRounded}%` }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              />
            </div>
          </div>
        </header>

        <div className="iq-duo-board__stage-wrap">
          <div className="iq-duo-board__stage" aria-label="10-K learning map">
            <BoardScenery />

            {DUOLINGO_BOARD_ZONE_LAYOUT.map((layout) => {
              const node = duolingoPillarNode(layout.id);
              const state = resolveDuolingoPillarState(layout.id, pillarById);
              const href =
                state !== "locked" ? duolingoPillarHref(layout.id, pathname) : undefined;

              return (
                <IslandZone
                  key={layout.id}
                  layout={layout}
                  node={node}
                  state={state}
                  href={href}
                  pillarView={pillarById[layout.id]}
                />
              );
            })}

            <HubZone state={hubState} href={hubHref} />
          </div>
        </div>

        <footer className="iq-duo-board__compare">
          <Link href="/schools/map" className="iq-duo-board__compare-link">
            Island Adventure
          </Link>
          <span aria-hidden>·</span>
          <Link href="/schools/preview/map-duolingo" className="iq-duo-board__compare-link">
            Quest path
          </Link>
          <span aria-hidden>·</span>
          <span className="iq-duo-board__compare-current">Flat map</span>
        </footer>
      </div>
    </main>
  );
}
