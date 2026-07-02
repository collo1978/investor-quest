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
  LEGENDS_FLOATING_ISLANDS,
  LEGENDS_LANDMARK_PLACEMENTS,
  LEGENDS_MAP_BRIDGES,
  LEGENDS_MAP_HUB,
  LEGENDS_MAP_ISLANDS,
  LEGENDS_MAP_NATURAL,
  LEGENDS_MAP_TITLE,
  type LegendsIslandMeta
} from "@/lib/schools/schoolsLegendsMapConfig";
import {
  legendsFinalChallengeHref,
  legendsPillarHref,
  resolveLegendsHubState,
  resolveLegendsPillarState,
  type LegendsNodeVisualState
} from "@/lib/schools/schoolsLegendsMapHelpers";
import {
  LegendsBusinessCity,
  LegendsFinancialVault,
  LegendsHubCommand,
  LegendsManagementCitadel,
  LegendsRiskStation
} from "@/components/schools/legendsMap/LegendsMapLandmarks";

const EASE_BOUNCE = [0.34, 1.45, 0.64, 1] as const;
const { width: MAP_W, height: MAP_H } = LEGENDS_MAP_NATURAL;

const STAR_POSITIONS: readonly [number, number][] = [
  [0.08, 0.06],
  [0.22, 0.04],
  [0.45, 0.07],
  [0.68, 0.05],
  [0.88, 0.08],
  [0.15, 0.45],
  [0.85, 0.42]
];

function FloatingIslandBase({
  cx,
  cy,
  rx,
  ry,
  fill,
  stroke,
  className
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  stroke: string;
  className?: string;
}) {
  const x = MAP_W * cx;
  const y = MAP_H * cy;
  const wrx = MAP_W * rx;
  const hry = MAP_H * ry;
  return (
    <g className={className}>
      <ellipse cx={x} cy={y + hry * 0.55} rx={wrx * 0.85} ry={hry * 0.35} fill="#000" opacity="0.12" />
      <ellipse cx={x} cy={y} rx={wrx} ry={hry} fill={fill} stroke={stroke} strokeWidth="4" />
      <ellipse cx={x} cy={y - hry * 0.15} rx={wrx * 0.72} ry={hry * 0.45} fill="#fff" opacity="0.12" />
    </g>
  );
}

function LegendsWorldArt() {
  return (
    <svg
      className="iq-legends-map__art"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="leg-sky" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="35%" stopColor="#7c3aed" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <radialGradient id="leg-sun-glow" cx="0.5" cy="0.2" r="0.5">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <filter id="leg-bridge-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="url(#leg-sky)" />
      <rect width={MAP_W} height={MAP_H} fill="url(#leg-sun-glow)" />

      {STAR_POSITIONS.map(([px, py], i) => (
        <circle
          key={i}
          cx={MAP_W * px}
          cy={MAP_H * py}
          r={i % 2 === 0 ? 3 : 2}
          fill="#fff"
          opacity="0.65"
          className="iq-legends-map__star"
        />
      ))}

      {/* Distant clouds */}
      <ellipse cx={MAP_W * 0.2} cy={MAP_H * 0.14} rx={90} ry={32} fill="#fff" opacity="0.2" />
      <ellipse cx={MAP_W * 0.78} cy={MAP_H * 0.16} rx={110} ry={36} fill="#fff" opacity="0.18" />

      {/* Energy bridges */}
      <g className="iq-legends-map__bridges" filter="url(#leg-bridge-glow)">
        {LEGENDS_MAP_BRIDGES.map((bridge) => {
          const island = LEGENDS_MAP_ISLANDS.find((i) => i.id === bridge.islandId)!;
          return (
            <g key={bridge.islandId}>
              <path
                d={bridge.d}
                className="iq-legends-map__bridge-shadow"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke="#312e81"
              />
              <path
                d={bridge.d}
                className="iq-legends-map__bridge"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke={island.path}
              />
            </g>
          );
        })}
      </g>

      {/* Floating island biomes */}
      {(Object.keys(LEGENDS_FLOATING_ISLANDS) as (keyof typeof LEGENDS_FLOATING_ISLANDS)[]).map(
        (key) => {
          const island = LEGENDS_FLOATING_ISLANDS[key];
          const meta =
            key === "hub"
              ? LEGENDS_MAP_HUB
              : LEGENDS_MAP_ISLANDS.find((i) => i.id === key)!;
          const fill = "land" in meta ? meta.land : meta.accent;
          const stroke = "landEdge" in meta ? meta.landEdge : meta.accentEdge;
          return (
            <FloatingIslandBase
              key={key}
              cx={island.cx}
              cy={island.cy}
              rx={island.rx}
              ry={island.ry}
              fill={fill}
              stroke={stroke}
              className={`iq-legends-map__island iq-legends-map__island--${key}`}
            />
          );
        }
      )}

      {/* Landmarks */}
      <g
        transform={`translate(${MAP_W * LEGENDS_LANDMARK_PLACEMENTS.business.x}, ${MAP_H * LEGENDS_LANDMARK_PLACEMENTS.business.y}) scale(${LEGENDS_LANDMARK_PLACEMENTS.business.scale})`}
      >
        <LegendsBusinessCity />
      </g>
      <g
        transform={`translate(${MAP_W * LEGENDS_LANDMARK_PLACEMENTS.forces.x}, ${MAP_H * LEGENDS_LANDMARK_PLACEMENTS.forces.y}) scale(${LEGENDS_LANDMARK_PLACEMENTS.forces.scale})`}
      >
        <LegendsRiskStation />
      </g>
      <g
        transform={`translate(${MAP_W * LEGENDS_LANDMARK_PLACEMENTS.financials.x}, ${MAP_H * LEGENDS_LANDMARK_PLACEMENTS.financials.y}) scale(${LEGENDS_LANDMARK_PLACEMENTS.financials.scale})`}
      >
        <LegendsFinancialVault />
      </g>
      <g
        transform={`translate(${MAP_W * LEGENDS_LANDMARK_PLACEMENTS.management.x}, ${MAP_H * LEGENDS_LANDMARK_PLACEMENTS.management.y}) scale(${LEGENDS_LANDMARK_PLACEMENTS.management.scale})`}
      >
        <LegendsManagementCitadel />
      </g>
      <g
        transform={`translate(${MAP_W * (LEGENDS_LANDMARK_PLACEMENTS.hub.x - 0.052)}, ${MAP_H * (LEGENDS_LANDMARK_PLACEMENTS.hub.y - 0.082)}) scale(${LEGENDS_LANDMARK_PLACEMENTS.hub.scale})`}
      >
        <LegendsHubCommand />
      </g>
    </svg>
  );
}

function StatusChip({ state }: { state: LegendsNodeVisualState }) {
  if (state === "completed") return <span className="iq-legends-map__chip iq-legends-map__chip--done">Zone cleared</span>;
  if (state === "locked") return <span className="iq-legends-map__chip iq-legends-map__chip--lock">Locked</span>;
  if (state === "in-progress") return <span className="iq-legends-map__chip iq-legends-map__chip--active">Exploring</span>;
  return <span className="iq-legends-map__chip iq-legends-map__chip--go">Enter zone</span>;
}

function RegionHotspot({
  island,
  state,
  href,
  pillarView
}: {
  island: LegendsIslandMeta;
  state: LegendsNodeVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-legends-map__zone",
    `iq-legends-map__zone--${island.id}`,
    `iq-legends-map__zone--sign-${island.signPlacement}`,
    locked ? "iq-legends-map__zone--locked" : "",
    state === "completed" ? "iq-legends-map__zone--done" : "",
    state === "in-progress" ? "iq-legends-map__zone--active" : "",
    interactive && hovered ? "iq-legends-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const sign = (
    <div
      className="iq-legends-map__sign"
      style={{
        ["--zone-accent" as string]: island.path,
        ["--zone-edge" as string]: island.landEdge,
        ["--zone-glow" as string]: island.glow
      }}
    >
      <span className="iq-legends-map__sign-zone">{island.zone}</span>
      <span className="iq-legends-map__sign-emoji" aria-hidden>
        {island.emoji}
      </span>
      <span className="iq-legends-map__sign-title">{island.label}</span>
      <span className="iq-legends-map__sign-sub">{island.subtitle}</span>
      <div className="iq-legends-map__sign-row">
        <StatusChip state={state} />
        <span className="iq-legends-map__sign-xp">+{island.xpReward} XP</span>
      </div>
      {pillarView ? (
        <div className="iq-legends-map__sign-progress">
          <div className="iq-legends-map__sign-track">
            <motion.div
              className="iq-legends-map__sign-fill"
              initial={false}
              animate={{ width: `${pillarView.progressPct}%` }}
              transition={{ duration: 0.4, ease: EASE_BOUNCE }}
            />
          </div>
          <span className="iq-legends-map__sign-count">
            {pillarView.completedCount}/{pillarView.totalCount}
          </span>
        </div>
      ) : null}
    </div>
  );

  const body = (
    <>
      <div
        className="iq-legends-map__hit-area"
        style={{ ["--zone-glow" as string]: island.glow }}
        aria-hidden
      />
      <span className="iq-legends-map__sign-stem" aria-hidden />
      {sign}
    </>
  );

  const style = { left: `${island.x}%`, top: `${island.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-legends-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.05 : 1, y: hovered ? -4 : 0 }}
          transition={{ duration: 0.2, ease: EASE_BOUNCE }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-legends-map__hit"
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
      <div className="iq-legends-map__hit iq-legends-map__hit--static">{body}</div>
    </div>
  );
}

function HubHotspot({ state, href }: { state: LegendsNodeVisualState; href?: string }) {
  const hub = LEGENDS_MAP_HUB;
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-legends-map__zone iq-legends-map__zone--hub",
    "iq-legends-map__zone--sign-below",
    locked ? "iq-legends-map__zone--locked" : "",
    state === "completed" ? "iq-legends-map__zone--done" : "",
    interactive && hovered ? "iq-legends-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div
        className="iq-legends-map__hit-area iq-legends-map__hit-area--hub"
        style={{ ["--zone-glow" as string]: hub.glow }}
        aria-hidden
      />
      <span className="iq-legends-map__sign-stem iq-legends-map__sign-stem--hub" aria-hidden />
      <div
        className="iq-legends-map__sign iq-legends-map__sign--hub"
        style={{
          ["--zone-accent" as string]: hub.accentEdge,
          ["--zone-edge" as string]: hub.accentEdge,
          ["--zone-glow" as string]: hub.glow
        }}
      >
        <span className="iq-legends-map__sign-zone">{hub.zone}</span>
        <span className="iq-legends-map__sign-emoji" aria-hidden>
          {hub.emoji}
        </span>
        <span className="iq-legends-map__sign-title">{hub.label}</span>
        <span className="iq-legends-map__sign-sub">{hub.subtitle}</span>
        <div className="iq-legends-map__sign-row">
          <StatusChip state={state} />
          <span className="iq-legends-map__sign-xp">+{hub.xpReward} XP</span>
        </div>
      </div>
    </>
  );

  const style = { left: `${hub.x}%`, top: `${hub.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-legends-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.06 : 1, y: hovered ? -5 : 0 }}
          transition={{ duration: 0.2, ease: EASE_BOUNCE }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-legends-map__hit"
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
      <div className="iq-legends-map__hit iq-legends-map__hit--static">{body}</div>
    </div>
  );
}

function LegendsMapHud({ progressPct }: { progressPct: number }) {
  return (
    <header className="iq-legends-map__hud" aria-label="Adventure progress">
      <div className="iq-legends-map__hud-brand">
        <Image
          src="/logos/investor-quest-logo.png"
          alt="Investor Quest"
          width={160}
          height={40}
          className="iq-legends-map__hud-logo"
          priority
        />
        <span className="iq-legends-map__hud-tag">Legends preview</span>
      </div>
      <div className="iq-legends-map__hud-row">
        <Image
          src="/logos/companies/nvda.svg"
          alt=""
          width={28}
          height={28}
          className="iq-legends-map__hud-nvda"
          aria-hidden
        />
        <h1 className="iq-legends-map__hud-title">{LEGENDS_MAP_TITLE}</h1>
        <div className="iq-legends-map__hud-progress" role="status">
          <span>{progressPct}%</span>
          <div className="iq-legends-map__hud-track">
            <motion.div
              className="iq-legends-map__hud-fill"
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

/** Legends of Learning–style adventure educational world — preview only. */
export function SchoolsLegendsMapScreen() {
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
  const hubState = resolveLegendsHubState(finalUnlocked, finalCompleted);

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) / pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, Math.round(pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const hubHref = hubState !== "locked" ? legendsFinalChallengeHref(pathname) : undefined;

  return (
    <main className="iq-legends-map">
      <div className="iq-legends-map__stage" data-legends-map-stage>
        <div
          className="iq-legends-map__canvas"
          style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
          aria-label="NVIDIA 10-K adventure world"
        >
          <LegendsWorldArt />

          {LEGENDS_MAP_ISLANDS.map((island) => {
            const state = resolveLegendsPillarState(island.id, pillarById);
            const href =
              state !== "locked" ? legendsPillarHref(island.id, pathname) : undefined;
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

      <LegendsMapHud progressPct={overallProgressPct} />

      <footer className="iq-legends-map__footer">
        <Link href="/schools/map" className="iq-legends-map__footer-link">
          Cinematic (A)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-cartoon" className="iq-legends-map__footer-link">
          Cartoon (B)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-prodigy" className="iq-legends-map__footer-link">
          Prodigy (C)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-dragonbox" className="iq-legends-map__footer-link">
          DragonBox (D)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-roblox" className="iq-legends-map__footer-link">
          Roblox (E)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-khan" className="iq-legends-map__footer-link">
          Khan (F)
        </Link>
        <span aria-hidden>·</span>
        <span className="iq-legends-map__footer-here">Legends (G)</span>
      </footer>
    </main>
  );
}
