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
  ROBLOX_LANDMARK_PLACEMENTS,
  ROBLOX_MAP_HUB,
  ROBLOX_MAP_ISLANDS,
  ROBLOX_MAP_NATURAL,
  ROBLOX_MAP_ROADS,
  ROBLOX_MAP_TITLE,
  type RobloxIslandMeta
} from "@/lib/schools/schoolsRobloxMapConfig";
import {
  robloxFinalChallengeHref,
  robloxPillarHref,
  resolveRobloxHubState,
  resolveRobloxPillarState,
  type RobloxNodeVisualState
} from "@/lib/schools/schoolsRobloxMapHelpers";
import {
  RobloxBusinessDistrict,
  RobloxFinancialVault,
  RobloxHubPlaza,
  RobloxManagementCastle,
  RobloxRiskZone
} from "@/components/schools/robloxMap/RobloxMapLandmarks";

const EASE_BOUNCE = [0.34, 1.45, 0.64, 1] as const;
const { width: MAP_W, height: MAP_H } = ROBLOX_MAP_NATURAL;

const STUD_POSITIONS: readonly [number, number][] = [
  [0.12, 0.35],
  [0.22, 0.42],
  [0.35, 0.38],
  [0.48, 0.44],
  [0.55, 0.36],
  [0.62, 0.48],
  [0.72, 0.4],
  [0.85, 0.45],
  [0.18, 0.55],
  [0.42, 0.58],
  [0.58, 0.62],
  [0.78, 0.56]
];

function RobloxWorldArt() {
  return (
    <svg
      className="iq-roblox-map__art"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="rbx-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="rbx-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="url(#rbx-sky)" />

      {/* Fluffy clouds */}
      <ellipse cx={MAP_W * 0.15} cy={MAP_H * 0.1} rx={100} ry={36} fill="#fff" opacity="0.9" />
      <ellipse cx={MAP_W * 0.85} cy={MAP_H * 0.12} rx={120} ry={40} fill="#fff" opacity="0.88" />
      <ellipse cx={MAP_W * 0.5} cy={MAP_H * 0.08} rx={80} ry={28} fill="#fff" opacity="0.82" />

      {/* Main baseplate */}
      <path
        d={`M${MAP_W * 0.05} ${MAP_H * 0.55}
           Q${MAP_W * 0.2} ${MAP_H * 0.32} ${MAP_W * 0.5} ${MAP_H * 0.28}
           Q${MAP_W * 0.8} ${MAP_H * 0.32} ${MAP_W * 0.95} ${MAP_H * 0.55}
           Q${MAP_W * 0.9} ${MAP_H * 0.84} ${MAP_W * 0.5} ${MAP_H * 0.88}
           Q${MAP_W * 0.1} ${MAP_H * 0.84} ${MAP_W * 0.05} ${MAP_H * 0.55} Z`}
        fill="url(#rbx-grass)"
        stroke="#14532d"
        strokeWidth="6"
      />

      {/* Studs on open grass */}
      {STUD_POSITIONS.map(([px, py], i) => (
        <g key={i} transform={`translate(${MAP_W * px}, ${MAP_H * py})`}>
          <circle r="7" fill="#15803d" stroke="#1e1e1e" strokeWidth="2" />
          <circle r="3.5" cy="-1.5" fill="#86efac" opacity="0.75" />
        </g>
      ))}

      {/* Region pads — chunky colored zones */}
      <rect
        x={MAP_W * 0.04}
        y={MAP_H * 0.1}
        width={MAP_W * 0.34}
        height={MAP_H * 0.28}
        rx="18"
        className="iq-roblox-map__pad iq-roblox-map__pad--business"
        fill="#fde047"
        stroke="#ca8a04"
        strokeWidth="5"
      />
      <rect
        x={MAP_W * 0.62}
        y={MAP_H * 0.09}
        width={MAP_W * 0.34}
        height={MAP_H * 0.28}
        rx="18"
        className="iq-roblox-map__pad iq-roblox-map__pad--risks"
        fill="#fca5a5"
        stroke="#dc2626"
        strokeWidth="5"
      />
      <rect
        x={MAP_W * 0.04}
        y={MAP_H * 0.58}
        width={MAP_W * 0.34}
        height={MAP_H * 0.32}
        rx="18"
        className="iq-roblox-map__pad iq-roblox-map__pad--financial"
        fill="#86efac"
        stroke="#16a34a"
        strokeWidth="5"
      />
      <rect
        x={MAP_W * 0.62}
        y={MAP_H * 0.57}
        width={MAP_W * 0.34}
        height={MAP_H * 0.32}
        rx="18"
        className="iq-roblox-map__pad iq-roblox-map__pad--management"
        fill="#93c5fd"
        stroke="#2563eb"
        strokeWidth="5"
      />

      {/* Hub spawn circle */}
      <circle
        cx={MAP_W * 0.5}
        cy={MAP_H * 0.47}
        r={MAP_W * 0.1}
        className="iq-roblox-map__pad iq-roblox-map__pad--hub"
        fill="#ddd6fe"
        stroke="#7c3aed"
        strokeWidth="5"
      />

      {/* Roads / walkways */}
      <g className="iq-roblox-map__roads">
        {ROBLOX_MAP_ROADS.map((road) => {
          const island = ROBLOX_MAP_ISLANDS.find((i) => i.id === road.islandId)!;
          return (
            <g key={road.islandId}>
              <path
                d={road.d}
                className="iq-roblox-map__road-shadow"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke="#374151"
              />
              <path
                d={road.d}
                className="iq-roblox-map__road"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke="#9ca3af"
              />
              <path
                d={road.d}
                className="iq-roblox-map__road-stripe"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke={island.path}
              />
            </g>
          );
        })}
      </g>

      {/* Landmarks */}
      <g
        transform={`translate(${MAP_W * ROBLOX_LANDMARK_PLACEMENTS.business.x}, ${MAP_H * ROBLOX_LANDMARK_PLACEMENTS.business.y}) scale(${ROBLOX_LANDMARK_PLACEMENTS.business.scale})`}
      >
        <RobloxBusinessDistrict />
      </g>
      <g
        transform={`translate(${MAP_W * ROBLOX_LANDMARK_PLACEMENTS.forces.x}, ${MAP_H * ROBLOX_LANDMARK_PLACEMENTS.forces.y}) scale(${ROBLOX_LANDMARK_PLACEMENTS.forces.scale})`}
      >
        <RobloxRiskZone />
      </g>
      <g
        transform={`translate(${MAP_W * ROBLOX_LANDMARK_PLACEMENTS.financials.x}, ${MAP_H * ROBLOX_LANDMARK_PLACEMENTS.financials.y}) scale(${ROBLOX_LANDMARK_PLACEMENTS.financials.scale})`}
      >
        <RobloxFinancialVault />
      </g>
      <g
        transform={`translate(${MAP_W * ROBLOX_LANDMARK_PLACEMENTS.management.x}, ${MAP_H * ROBLOX_LANDMARK_PLACEMENTS.management.y}) scale(${ROBLOX_LANDMARK_PLACEMENTS.management.scale})`}
      >
        <RobloxManagementCastle />
      </g>
      <g
        transform={`translate(${MAP_W * (ROBLOX_LANDMARK_PLACEMENTS.hub.x - 0.054)}, ${MAP_H * (ROBLOX_LANDMARK_PLACEMENTS.hub.y - 0.085)}) scale(${ROBLOX_LANDMARK_PLACEMENTS.hub.scale})`}
      >
        <RobloxHubPlaza />
      </g>
    </svg>
  );
}

function StatusChip({ state }: { state: RobloxNodeVisualState }) {
  if (state === "completed") {
    return <span className="iq-roblox-map__chip iq-roblox-map__chip--done">✓ Done!</span>;
  }
  if (state === "locked") return <span className="iq-roblox-map__chip iq-roblox-map__chip--lock">🔒 Locked</span>;
  if (state === "in-progress") {
    return <span className="iq-roblox-map__chip iq-roblox-map__chip--active">▶ In progress</span>;
  }
  return <span className="iq-roblox-map__chip iq-roblox-map__chip--go">▶ Play</span>;
}

function RegionHotspot({
  island,
  state,
  href,
  pillarView
}: {
  island: RobloxIslandMeta;
  state: RobloxNodeVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-roblox-map__zone",
    `iq-roblox-map__zone--${island.id}`,
    `iq-roblox-map__zone--sign-${island.signPlacement}`,
    locked ? "iq-roblox-map__zone--locked" : "",
    state === "completed" ? "iq-roblox-map__zone--done" : "",
    state === "in-progress" ? "iq-roblox-map__zone--active" : "",
    interactive && hovered ? "iq-roblox-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const sign = (
    <div
      className="iq-roblox-map__sign"
      style={{
        ["--zone-accent" as string]: island.path,
        ["--zone-edge" as string]: island.landEdge,
        ["--zone-glow" as string]: island.glow
      }}
    >
      <span className="iq-roblox-map__sign-emoji" aria-hidden>
        {island.emoji}
      </span>
      <span className="iq-roblox-map__sign-title">{island.label}</span>
      <span className="iq-roblox-map__sign-sub">{island.subtitle}</span>
      <div className="iq-roblox-map__sign-row">
        <StatusChip state={state} />
        {pillarView && state === "in-progress" ? (
          <span className="iq-roblox-map__sign-count">
            {pillarView.completedCount}/{pillarView.totalCount}
          </span>
        ) : null}
      </div>
    </div>
  );

  const body = (
    <>
      <div
        className="iq-roblox-map__hit-area"
        style={{ ["--zone-glow" as string]: island.glow }}
        aria-hidden
      />
      <span className="iq-roblox-map__sign-stem" aria-hidden />
      {sign}
    </>
  );

  const style = { left: `${island.x}%`, top: `${island.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-roblox-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.05 : 1, y: hovered ? -4 : 0 }}
          transition={{ duration: 0.18, ease: EASE_BOUNCE }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-roblox-map__hit"
            aria-label={`${island.label} — ${island.subtitle}`}
          >
            {body}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={zoneClass} style={style} aria-disabled={locked}>
      <div className="iq-roblox-map__hit iq-roblox-map__hit--static">{body}</div>
    </div>
  );
}

function HubHotspot({ state, href }: { state: RobloxNodeVisualState; href?: string }) {
  const hub = ROBLOX_MAP_HUB;
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-roblox-map__zone iq-roblox-map__zone--hub",
    "iq-roblox-map__zone--sign-below",
    locked ? "iq-roblox-map__zone--locked" : "",
    state === "completed" ? "iq-roblox-map__zone--done" : "",
    interactive && hovered ? "iq-roblox-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div
        className="iq-roblox-map__hit-area iq-roblox-map__hit-area--hub"
        style={{ ["--zone-glow" as string]: hub.glow }}
        aria-hidden
      />
      <span className="iq-roblox-map__sign-stem iq-roblox-map__sign-stem--hub" aria-hidden />
      <div
        className="iq-roblox-map__sign iq-roblox-map__sign--hub"
        style={{
          ["--zone-accent" as string]: hub.accentEdge,
          ["--zone-edge" as string]: hub.accentEdge,
          ["--zone-glow" as string]: hub.glow
        }}
      >
        <span className="iq-roblox-map__sign-emoji" aria-hidden>
          {hub.emoji}
        </span>
        <span className="iq-roblox-map__sign-title">{hub.label}</span>
        <span className="iq-roblox-map__sign-sub">{hub.subtitle}</span>
        <StatusChip state={state} />
      </div>
    </>
  );

  const style = { left: `${hub.x}%`, top: `${hub.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-roblox-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.06 : 1, y: hovered ? -5 : 0 }}
          transition={{ duration: 0.18, ease: EASE_BOUNCE }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-roblox-map__hit"
            aria-label={`${hub.label} — ${hub.subtitle}`}
          >
            {body}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={zoneClass} style={style} aria-disabled={locked}>
      <div className="iq-roblox-map__hit iq-roblox-map__hit--static">{body}</div>
    </div>
  );
}

function RobloxMapHud({ progressPct }: { progressPct: number }) {
  return (
    <header className="iq-roblox-map__hud" aria-label="World progress">
      <div className="iq-roblox-map__hud-brand">
        <Image
          src="/logos/investor-quest-logo.png"
          alt="Investor Quest"
          width={160}
          height={40}
          className="iq-roblox-map__hud-logo"
          priority
        />
        <span className="iq-roblox-map__hud-tag">Roblox preview</span>
      </div>
      <div className="iq-roblox-map__hud-row">
        <Image
          src="/logos/companies/nvda.svg"
          alt=""
          width={28}
          height={28}
          className="iq-roblox-map__hud-nvda"
          aria-hidden
        />
        <h1 className="iq-roblox-map__hud-title">{ROBLOX_MAP_TITLE}</h1>
        <div className="iq-roblox-map__hud-progress" role="status">
          <span>{progressPct}%</span>
          <div className="iq-roblox-map__hud-track">
            <motion.div
              className="iq-roblox-map__hud-fill"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.45, ease: EASE_BOUNCE }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/** Roblox-style adventure world map — preview only. */
export function SchoolsRobloxMapScreen() {
  const pathname = usePathname();
  const { raw } = useGame();
  const pillarViews = useMemo(() => getPillarViews(raw), [raw]);
  const pillarById = useMemo(
    () =>
      Object.fromEntries(pillarViews.map((p) => [p.id, p])) as Record<PillarId, PillarView>,
    [pillarViews]
  );

  const companyProgress = getActiveCompanyProgress(raw);
  const finalUnlocked = isTenKFinalChallengeUnlocked(raw);
  const finalCompleted = companyProgress.tenKRookieChallenge != null;
  const hubState = resolveRobloxHubState(finalUnlocked, finalCompleted);

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) / pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, Math.round(pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const hubHref = hubState !== "locked" ? robloxFinalChallengeHref(pathname) : undefined;

  return (
    <main className="iq-roblox-map">
      <div className="iq-roblox-map__stage" data-roblox-map-stage>
        <div
          className="iq-roblox-map__canvas"
          style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
          aria-label="NVIDIA 10-K Roblox adventure world"
        >
          <RobloxWorldArt />

          {ROBLOX_MAP_ISLANDS.map((island) => {
            const state = resolveRobloxPillarState(island.id, pillarById);
            const href =
              state !== "locked" ? robloxPillarHref(island.id, pathname) : undefined;
            return (
              <RegionHotspot
                key={island.id}
                island={island}
                state={state}
                href={href}
                pillarView={pillarById[island.id]}
              />
            );
          })}

          <HubHotspot state={hubState} href={hubHref} />
        </div>
      </div>

      <RobloxMapHud progressPct={overallProgressPct} />

      <footer className="iq-roblox-map__footer">
        <Link href="/schools/map" className="iq-roblox-map__footer-link">
          Cinematic (A)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-cartoon" className="iq-roblox-map__footer-link">
          Cartoon (B)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-prodigy" className="iq-roblox-map__footer-link">
          Prodigy (C)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-dragonbox" className="iq-roblox-map__footer-link">
          DragonBox (D)
        </Link>
        <span aria-hidden>·</span>
        <span className="iq-roblox-map__footer-here">Roblox (E)</span>
      </footer>
    </main>
  );
}
