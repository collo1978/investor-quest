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
  DRAGONBOX_LANDMARK_PLACEMENTS,
  DRAGONBOX_MAP_HUB,
  DRAGONBOX_MAP_ISLANDS,
  DRAGONBOX_MAP_NATURAL,
  DRAGONBOX_MAP_PATHS,
  DRAGONBOX_MAP_TITLE,
  type DragonBoxIslandMeta
} from "@/lib/schools/schoolsDragonBoxMapConfig";
import {
  dragonBoxFinalChallengeHref,
  dragonBoxPillarHref,
  resolveDragonBoxHubState,
  resolveDragonBoxPillarState,
  type DragonBoxNodeVisualState
} from "@/lib/schools/schoolsDragonBoxMapHelpers";
import {
  DragonBoxBusinessTower,
  DragonBoxCitadel,
  DragonBoxHubMonolith,
  DragonBoxRadarStation,
  DragonBoxVault
} from "@/components/schools/dragonboxMap/DragonBoxMapLandmarks";

const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const;
const { width: MAP_W, height: MAP_H } = DRAGONBOX_MAP_NATURAL;

function DragonBoxWorldArt() {
  return (
    <svg
      className="iq-dragonbox-map__art"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="dbx-sky" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="55%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="dbx-vignette" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.18" />
        </linearGradient>
        <filter id="dbx-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="url(#dbx-sky)" />
      <rect width={MAP_W} height={MAP_H} fill="url(#dbx-vignette)" />

      {/* Subtle dot grid */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 20 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={MAP_W * (0.05 + col * 0.047)}
            cy={MAP_H * (0.08 + row * 0.075)}
            r={1.2}
            fill="#94a3b8"
            opacity="0.14"
          />
        ))
      )}

      {/* Geometric island platforms */}
      <ellipse
        cx={MAP_W * 0.2}
        cy={MAP_H * 0.2}
        rx={MAP_W * 0.16}
        ry={MAP_H * 0.14}
        className="iq-dragonbox-map__plate iq-dragonbox-map__plate--business"
        fill="#fffbeb"
        stroke="#fde68a"
        strokeWidth="2"
      />
      <ellipse
        cx={MAP_W * 0.8}
        cy={MAP_H * 0.19}
        rx={MAP_W * 0.16}
        ry={MAP_H * 0.14}
        className="iq-dragonbox-map__plate iq-dragonbox-map__plate--risks"
        fill="#fff1f2"
        stroke="#fecdd3"
        strokeWidth="2"
      />
      <ellipse
        cx={MAP_W * 0.19}
        cy={MAP_H * 0.72}
        rx={MAP_W * 0.17}
        ry={MAP_H * 0.15}
        className="iq-dragonbox-map__plate iq-dragonbox-map__plate--financial"
        fill="#ecfdf5"
        stroke="#a7f3d0"
        strokeWidth="2"
      />
      <ellipse
        cx={MAP_W * 0.81}
        cy={MAP_H * 0.71}
        rx={MAP_W * 0.17}
        ry={MAP_H * 0.15}
        className="iq-dragonbox-map__plate iq-dragonbox-map__plate--management"
        fill="#eff6ff"
        stroke="#bfdbfe"
        strokeWidth="2"
      />

      {/* Hub platform */}
      <circle
        cx={MAP_W * 0.5}
        cy={MAP_H * 0.47}
        r={MAP_W * 0.09}
        className="iq-dragonbox-map__plate iq-dragonbox-map__plate--hub"
        fill="#f5f3ff"
        stroke="#ddd6fe"
        strokeWidth="2"
      />

      {/* Glowing pathways */}
      <g className="iq-dragonbox-map__paths" filter="url(#dbx-path-glow)">
        {DRAGONBOX_MAP_PATHS.map((path) => {
          const island = DRAGONBOX_MAP_ISLANDS.find((i) => i.id === path.islandId)!;
          return (
            <path
              key={path.islandId}
              d={path.d}
              className="iq-dragonbox-map__path"
              transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
              stroke={island.path}
              fill="none"
            />
          );
        })}
      </g>

      {/* Landmarks */}
      <g
        transform={`translate(${MAP_W * DRAGONBOX_LANDMARK_PLACEMENTS.business.x}, ${MAP_H * DRAGONBOX_LANDMARK_PLACEMENTS.business.y}) scale(${DRAGONBOX_LANDMARK_PLACEMENTS.business.scale})`}
      >
        <DragonBoxBusinessTower />
      </g>
      <g
        transform={`translate(${MAP_W * DRAGONBOX_LANDMARK_PLACEMENTS.forces.x}, ${MAP_H * DRAGONBOX_LANDMARK_PLACEMENTS.forces.y}) scale(${DRAGONBOX_LANDMARK_PLACEMENTS.forces.scale})`}
      >
        <DragonBoxRadarStation />
      </g>
      <g
        transform={`translate(${MAP_W * DRAGONBOX_LANDMARK_PLACEMENTS.financials.x}, ${MAP_H * DRAGONBOX_LANDMARK_PLACEMENTS.financials.y}) scale(${DRAGONBOX_LANDMARK_PLACEMENTS.financials.scale})`}
      >
        <DragonBoxVault />
      </g>
      <g
        transform={`translate(${MAP_W * DRAGONBOX_LANDMARK_PLACEMENTS.management.x}, ${MAP_H * DRAGONBOX_LANDMARK_PLACEMENTS.management.y}) scale(${DRAGONBOX_LANDMARK_PLACEMENTS.management.scale})`}
      >
        <DragonBoxCitadel />
      </g>
      <g
        transform={`translate(${MAP_W * (DRAGONBOX_LANDMARK_PLACEMENTS.hub.x - 0.043)}, ${MAP_H * (DRAGONBOX_LANDMARK_PLACEMENTS.hub.y - 0.08)}) scale(${DRAGONBOX_LANDMARK_PLACEMENTS.hub.scale})`}
      >
        <DragonBoxHubMonolith />
      </g>
    </svg>
  );
}

function StatusDot({ state }: { state: DragonBoxNodeVisualState }) {
  const className = [
    "iq-dragonbox-map__status",
    state === "completed"
      ? "iq-dragonbox-map__status--done"
      : state === "locked"
        ? "iq-dragonbox-map__status--lock"
        : state === "in-progress"
          ? "iq-dragonbox-map__status--active"
          : "iq-dragonbox-map__status--go"
  ].join(" ");
  const label =
    state === "completed"
      ? "Complete"
      : state === "locked"
        ? "Locked"
        : state === "in-progress"
          ? "In progress"
          : "Open";
  return <span className={className}>{label}</span>;
}

function RegionHotspot({
  island,
  state,
  href,
  pillarView
}: {
  island: DragonBoxIslandMeta;
  state: DragonBoxNodeVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-dragonbox-map__zone",
    `iq-dragonbox-map__zone--${island.id}`,
    `iq-dragonbox-map__zone--sign-${island.signPlacement}`,
    locked ? "iq-dragonbox-map__zone--locked" : "",
    state === "completed" ? "iq-dragonbox-map__zone--done" : "",
    state === "in-progress" ? "iq-dragonbox-map__zone--active" : "",
    interactive && hovered ? "iq-dragonbox-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const sign = (
    <div
      className="iq-dragonbox-map__sign"
      style={{
        ["--zone-accent" as string]: island.path,
        ["--zone-edge" as string]: island.landEdge,
        ["--zone-glow" as string]: island.glow
      }}
    >
      <span className="iq-dragonbox-map__sign-title">{island.label}</span>
      <span className="iq-dragonbox-map__sign-sub">{island.subtitle}</span>
      <div className="iq-dragonbox-map__sign-row">
        <StatusDot state={state} />
        {pillarView && state === "in-progress" ? (
          <span className="iq-dragonbox-map__sign-count">
            {pillarView.completedCount}/{pillarView.totalCount}
          </span>
        ) : null}
      </div>
      {pillarView && state === "in-progress" ? (
        <div className="iq-dragonbox-map__sign-track" aria-hidden>
          <div
            className="iq-dragonbox-map__sign-fill"
            style={{ width: `${pillarView.progressPct}%` }}
          />
        </div>
      ) : null}
    </div>
  );

  const body = (
    <>
      <div
        className="iq-dragonbox-map__hit-area"
        style={{ ["--zone-glow" as string]: island.glow }}
        aria-hidden
      />
      <span className="iq-dragonbox-map__sign-stem" aria-hidden />
      {sign}
    </>
  );

  const style = { left: `${island.x}%`, top: `${island.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-dragonbox-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.02 : 1, y: hovered ? -2 : 0 }}
          transition={{ duration: 0.22, ease: EASE_SMOOTH }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-dragonbox-map__hit"
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
      <div className="iq-dragonbox-map__hit iq-dragonbox-map__hit--static">{body}</div>
    </div>
  );
}

function HubHotspot({ state, href }: { state: DragonBoxNodeVisualState; href?: string }) {
  const hub = DRAGONBOX_MAP_HUB;
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-dragonbox-map__zone iq-dragonbox-map__zone--hub",
    "iq-dragonbox-map__zone--sign-below",
    locked ? "iq-dragonbox-map__zone--locked" : "",
    state === "completed" ? "iq-dragonbox-map__zone--done" : "",
    interactive && hovered ? "iq-dragonbox-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div
        className="iq-dragonbox-map__hit-area iq-dragonbox-map__hit-area--hub"
        style={{ ["--zone-glow" as string]: hub.glow }}
        aria-hidden
      />
      <span className="iq-dragonbox-map__sign-stem iq-dragonbox-map__sign-stem--hub" aria-hidden />
      <div
        className="iq-dragonbox-map__sign iq-dragonbox-map__sign--hub"
        style={{
          ["--zone-accent" as string]: hub.accentEdge,
          ["--zone-edge" as string]: hub.accentEdge,
          ["--zone-glow" as string]: hub.glow
        }}
      >
        <span className="iq-dragonbox-map__sign-title">{hub.label}</span>
        <span className="iq-dragonbox-map__sign-sub">{hub.subtitle}</span>
        <StatusDot state={state} />
      </div>
    </>
  );

  const style = { left: `${hub.x}%`, top: `${hub.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-dragonbox-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.02 : 1, y: hovered ? -2 : 0 }}
          transition={{ duration: 0.22, ease: EASE_SMOOTH }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-dragonbox-map__hit"
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
      <div className="iq-dragonbox-map__hit iq-dragonbox-map__hit--static">{body}</div>
    </div>
  );
}

function DragonBoxMapHud({ progressPct }: { progressPct: number }) {
  return (
    <header className="iq-dragonbox-map__hud" aria-label="Map progress">
      <div className="iq-dragonbox-map__hud-brand">
        <Image
          src="/logos/investor-quest-logo.png"
          alt="Investor Quest"
          width={140}
          height={36}
          className="iq-dragonbox-map__hud-logo"
          priority
        />
        <span className="iq-dragonbox-map__hud-tag">DragonBox preview</span>
      </div>
      <div className="iq-dragonbox-map__hud-row">
        <Image
          src="/logos/companies/nvda.svg"
          alt=""
          width={24}
          height={24}
          className="iq-dragonbox-map__hud-nvda"
          aria-hidden
        />
        <h1 className="iq-dragonbox-map__hud-title">{DRAGONBOX_MAP_TITLE}</h1>
        <div className="iq-dragonbox-map__hud-progress" role="status">
          <span>{progressPct}%</span>
          <div className="iq-dragonbox-map__hud-track">
            <motion.div
              className="iq-dragonbox-map__hud-fill"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: EASE_SMOOTH }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/** DragonBox-style minimalist educational map — preview only. */
export function SchoolsDragonBoxMapScreen() {
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
  const hubState = resolveDragonBoxHubState(finalUnlocked, finalCompleted);

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) / pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, Math.round(pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const hubHref = hubState !== "locked" ? dragonBoxFinalChallengeHref(pathname) : undefined;

  return (
    <main className="iq-dragonbox-map">
      <div className="iq-dragonbox-map__stage" data-dragonbox-map-stage>
        <div
          className="iq-dragonbox-map__canvas"
          style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
          aria-label="NVIDIA 10-K learning map"
        >
          <DragonBoxWorldArt />

          {DRAGONBOX_MAP_ISLANDS.map((island) => {
            const state = resolveDragonBoxPillarState(island.id, pillarById);
            const href =
              state !== "locked" ? dragonBoxPillarHref(island.id, pathname) : undefined;
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

      <DragonBoxMapHud progressPct={overallProgressPct} />

      <footer className="iq-dragonbox-map__footer">
        <Link href="/schools/map" className="iq-dragonbox-map__footer-link">
          Cinematic (A)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-cartoon" className="iq-dragonbox-map__footer-link">
          Cartoon (B)
        </Link>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-prodigy" className="iq-dragonbox-map__footer-link">
          Prodigy (C)
        </Link>
        <span aria-hidden>·</span>
        <span className="iq-dragonbox-map__footer-here">DragonBox (D)</span>
      </footer>
    </main>
  );
}
