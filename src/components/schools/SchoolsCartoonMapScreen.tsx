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
  CARTOON_MAP_HUB,
  CARTOON_MAP_ISLANDS,
  CARTOON_MAP_NATURAL,
  CARTOON_MAP_ROADS,
  CARTOON_MAP_TITLE,
  type CartoonIslandMeta
} from "@/lib/schools/schoolsCartoonMapConfig";
import {
  cartoonFinalChallengeHref,
  cartoonPillarHref,
  resolveCartoonHubState,
  resolveCartoonPillarState,
  type CartoonNodeVisualState
} from "@/lib/schools/schoolsCartoonMapHelpers";
import {
  BusinessDistrictLandmark,
  CARTOON_LANDMARK_PLACEMENTS,
  FinancialVaultLandmark,
  ManagementCitadelLandmark,
  RiskRadarLandmark,
  TenKHubFortressLandmark
} from "@/components/schools/cartoonMap/CartoonMapLandmarks";

const EASE_BOUNCE = [0.34, 1.45, 0.64, 1] as const;
const { width: MAP_W, height: MAP_H } = CARTOON_MAP_NATURAL;

function CartoonWorldArt() {
  return (
    <svg
      className="iq-cartoon-map__art"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="cartoon-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="cartoon-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="cartoon-grass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="url(#cartoon-sky)" />

      {/* Clouds */}
      <ellipse cx="220" cy="90" rx="120" ry="42" fill="#fff" opacity="0.82" />
      <ellipse cx="1380" cy="110" rx="140" ry="48" fill="#fff" opacity="0.76" />
      <ellipse cx="820" cy="70" rx="90" ry="34" fill="#fff" opacity="0.68" />

      {/* Ocean ring */}
      <path
        d={`M0 ${MAP_H * 0.58} Q${MAP_W * 0.25} ${MAP_H * 0.54} ${MAP_W * 0.5} ${MAP_H * 0.58} T${MAP_W} ${MAP_H * 0.56} L${MAP_W} ${MAP_H} L0 ${MAP_H} Z`}
        fill="url(#cartoon-ocean)"
      />

      {/* Main overworld continent */}
      <path
        d={`M${MAP_W * 0.08} ${MAP_H * 0.52}
           Q${MAP_W * 0.22} ${MAP_H * 0.34} ${MAP_W * 0.5} ${MAP_H * 0.3}
           Q${MAP_W * 0.78} ${MAP_H * 0.34} ${MAP_W * 0.92} ${MAP_H * 0.52}
           Q${MAP_W * 0.88} ${MAP_H * 0.78} ${MAP_W * 0.5} ${MAP_H * 0.82}
           Q${MAP_W * 0.12} ${MAP_H * 0.78} ${MAP_W * 0.08} ${MAP_H * 0.52} Z`}
        fill="url(#cartoon-grass)"
        stroke="#16a34a"
        strokeWidth="6"
      />

      {/* Region landmasses — irregular cartoon territories */}
      <path
        d={`M${MAP_W * 0.06} ${MAP_H * 0.14}
           Q${MAP_W * 0.18} ${MAP_H * 0.08} ${MAP_W * 0.34} ${MAP_H * 0.12}
           Q${MAP_W * 0.38} ${MAP_H * 0.28} ${MAP_W * 0.28} ${MAP_H * 0.36}
           Q${MAP_W * 0.12} ${MAP_H * 0.34} ${MAP_W * 0.06} ${MAP_H * 0.22} Z`}
        fill="#fde68a"
        stroke="#d97706"
        strokeWidth="5"
        className="iq-cartoon-map__region iq-cartoon-map__region--business"
      />
      <path
        d={`M${MAP_W * 0.66} ${MAP_H * 0.12}
           Q${MAP_W * 0.82} ${MAP_H * 0.08} ${MAP_W * 0.94} ${MAP_H * 0.18}
           Q${MAP_W * 0.92} ${MAP_H * 0.34} ${MAP_W * 0.76} ${MAP_H * 0.36}
           Q${MAP_W * 0.64} ${MAP_H * 0.3} ${MAP_W * 0.66} ${MAP_H * 0.12} Z`}
        fill="#fecaca"
        stroke="#dc2626"
        strokeWidth="5"
        className="iq-cartoon-map__region iq-cartoon-map__region--risks"
      />
      <path
        d={`M${MAP_W * 0.06} ${MAP_H * 0.64}
           Q${MAP_W * 0.14} ${MAP_H * 0.56} ${MAP_W * 0.28} ${MAP_H * 0.62}
           Q${MAP_W * 0.38} ${MAP_H * 0.76} ${MAP_W * 0.28} ${MAP_H * 0.9}
           Q${MAP_W * 0.1} ${MAP_H * 0.88} ${MAP_W * 0.06} ${MAP_H * 0.64} Z`}
        fill="#bbf7d0"
        stroke="#16a34a"
        strokeWidth="5"
        className="iq-cartoon-map__region iq-cartoon-map__region--financial"
      />
      <path
        d={`M${MAP_W * 0.72} ${MAP_H * 0.62}
           Q${MAP_W * 0.86} ${MAP_H * 0.56} ${MAP_W * 0.94} ${MAP_H * 0.7}
           Q${MAP_W * 0.9} ${MAP_H * 0.9} ${MAP_W * 0.74} ${MAP_H * 0.92}
           Q${MAP_W * 0.64} ${MAP_H * 0.8} ${MAP_W * 0.72} ${MAP_H * 0.62} Z`}
        fill="#bfdbfe"
        stroke="#2563eb"
        strokeWidth="5"
        className="iq-cartoon-map__region iq-cartoon-map__region--management"
      />

      {/* Central hub plateau */}
      <ellipse
        cx={MAP_W * 0.5}
        cy={MAP_H * 0.49}
        rx={MAP_W * 0.11}
        ry={MAP_H * 0.13}
        fill="#ddd6fe"
        stroke="#7c3aed"
        strokeWidth="5"
      />

      {/* Roads */}
      <g className="iq-cartoon-map__roads">
        {CARTOON_MAP_ROADS.map((road) => {
          const island = CARTOON_MAP_ISLANDS.find((i) => i.id === road.islandId)!;
          return (
            <g key={road.islandId}>
              <path
                d={road.d}
                className="iq-cartoon-map__road-shadow"
                vectorEffect="non-scaling-stroke"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke={island.landEdge}
              />
              <path
                d={road.d}
                className="iq-cartoon-map__road"
                vectorEffect="non-scaling-stroke"
                transform={`scale(${MAP_W / 100} ${MAP_H / 100})`}
                stroke={island.path}
              />
            </g>
          );
        })}
      </g>

      {/* Stylized game landmarks */}
      <g
        transform={`translate(${MAP_W * CARTOON_LANDMARK_PLACEMENTS.business.x}, ${MAP_H * CARTOON_LANDMARK_PLACEMENTS.business.y}) scale(${CARTOON_LANDMARK_PLACEMENTS.business.scale})`}
      >
        <BusinessDistrictLandmark />
      </g>
      <g
        transform={`translate(${MAP_W * CARTOON_LANDMARK_PLACEMENTS.forces.x}, ${MAP_H * CARTOON_LANDMARK_PLACEMENTS.forces.y}) scale(${CARTOON_LANDMARK_PLACEMENTS.forces.scale})`}
      >
        <RiskRadarLandmark />
      </g>
      <g
        transform={`translate(${MAP_W * CARTOON_LANDMARK_PLACEMENTS.financials.x}, ${MAP_H * CARTOON_LANDMARK_PLACEMENTS.financials.y}) scale(${CARTOON_LANDMARK_PLACEMENTS.financials.scale})`}
      >
        <FinancialVaultLandmark />
      </g>
      <g
        transform={`translate(${MAP_W * CARTOON_LANDMARK_PLACEMENTS.management.x}, ${MAP_H * CARTOON_LANDMARK_PLACEMENTS.management.y}) scale(${CARTOON_LANDMARK_PLACEMENTS.management.scale})`}
      >
        <ManagementCitadelLandmark />
      </g>
      <g
        transform={`translate(${MAP_W * (CARTOON_LANDMARK_PLACEMENTS.hub.x - 0.054)}, ${MAP_H * (CARTOON_LANDMARK_PLACEMENTS.hub.y - 0.085)}) scale(${CARTOON_LANDMARK_PLACEMENTS.hub.scale})`}
      >
        <TenKHubFortressLandmark />
      </g>

      {/* Decorative trees */}
      {[
        [MAP_W * 0.42, MAP_H * 0.38],
        [MAP_W * 0.58, MAP_H * 0.38],
        [MAP_W * 0.4, MAP_H * 0.6],
        [MAP_W * 0.6, MAP_H * 0.62]
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx}, ${cy})`}>
          <rect x="-4" y="8" width="8" height="16" rx="2" fill="#854d0e" />
          <circle r="14" fill="#22c55e" />
        </g>
      ))}
    </svg>
  );
}

function StatusChip({ state }: { state: CartoonNodeVisualState }) {
  if (state === "completed") return <span className="iq-cartoon-map__chip iq-cartoon-map__chip--done">✓ Complete</span>;
  if (state === "locked") return <span className="iq-cartoon-map__chip iq-cartoon-map__chip--lock">Locked</span>;
  if (state === "in-progress") return <span className="iq-cartoon-map__chip iq-cartoon-map__chip--active">In progress</span>;
  return <span className="iq-cartoon-map__chip iq-cartoon-map__chip--go">Explore</span>;
}

function RegionHotspot({
  island,
  state,
  href,
  pillarView
}: {
  island: CartoonIslandMeta;
  state: CartoonNodeVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-cartoon-map__zone",
    `iq-cartoon-map__zone--${island.id}`,
    `iq-cartoon-map__zone--sign-${island.signPlacement}`,
    locked ? "iq-cartoon-map__zone--locked" : "",
    state === "completed" ? "iq-cartoon-map__zone--done" : "",
    state === "in-progress" ? "iq-cartoon-map__zone--active" : "",
    interactive && hovered ? "iq-cartoon-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const hitArea = (
    <div
      className="iq-cartoon-map__hit-area"
      style={{ ["--zone-glow" as string]: island.path }}
      aria-hidden
    />
  );

  const sign = (
      <div
        className="iq-cartoon-map__sign"
        style={{
          ["--zone-accent" as string]: island.path,
          ["--zone-edge" as string]: island.landEdge
        }}
      >
        <span className="iq-cartoon-map__sign-title">{island.label}</span>
      <span className="iq-cartoon-map__sign-sub">{island.subtitle}</span>
      <div className="iq-cartoon-map__sign-row">
        <StatusChip state={state} />
        {pillarView && state === "in-progress" ? (
          <span className="iq-cartoon-map__sign-count">
            {pillarView.completedCount}/{pillarView.totalCount}
          </span>
        ) : null}
      </div>
    </div>
  );

  const body = (
    <>
      {hitArea}
      <span className="iq-cartoon-map__sign-stem" aria-hidden />
      {sign}
    </>
  );

  const style = { left: `${island.x}%`, top: `${island.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-cartoon-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.18, ease: EASE_BOUNCE }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link
            href={href}
            prefetch
            className="iq-cartoon-map__hit"
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
      <div className="iq-cartoon-map__hit iq-cartoon-map__hit--static">{body}</div>
    </div>
  );
}

function HubHotspot({
  state,
  href
}: {
  state: CartoonNodeVisualState;
  href?: string;
}) {
  const hub = CARTOON_MAP_HUB;
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-cartoon-map__zone iq-cartoon-map__zone--hub",
    "iq-cartoon-map__zone--sign-below",
    locked ? "iq-cartoon-map__zone--locked" : "",
    state === "completed" ? "iq-cartoon-map__zone--done" : "",
    interactive && hovered ? "iq-cartoon-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div
        className="iq-cartoon-map__hit-area iq-cartoon-map__hit-area--hub"
        style={{ ["--zone-glow" as string]: hub.accentEdge }}
        aria-hidden
      />
      <span className="iq-cartoon-map__sign-stem iq-cartoon-map__sign-stem--hub" aria-hidden />
      <div
        className="iq-cartoon-map__sign iq-cartoon-map__sign--hub"
        style={{
          ["--zone-accent" as string]: hub.accentEdge,
          ["--zone-edge" as string]: hub.accentEdge
        }}
      >
        <span className="iq-cartoon-map__sign-title">{hub.label}</span>
        <span className="iq-cartoon-map__sign-sub">{hub.subtitle}</span>
        <StatusChip state={state} />
      </div>
    </>
  );

  const style = { left: `${hub.x}%`, top: `${hub.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <motion.div
          className="iq-cartoon-map__zone-motion"
          initial={false}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.18, ease: EASE_BOUNCE }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Link href={href} prefetch className="iq-cartoon-map__hit" aria-label={`${hub.label} — ${hub.subtitle}`}>
            {body}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={zoneClass} style={style} aria-disabled={locked}>
      <div className="iq-cartoon-map__hit iq-cartoon-map__hit--static">{body}</div>
    </div>
  );
}

function CartoonMapHud({ progressPct }: { progressPct: number }) {
  return (
    <header className="iq-cartoon-map__hud" aria-label="Map progress">
      <div className="iq-cartoon-map__hud-brand">
        <Image
          src="/logos/investor-quest-logo.png"
          alt="Investor Quest"
          width={160}
          height={40}
          className="iq-cartoon-map__hud-logo"
          priority
        />
        <span className="iq-cartoon-map__hud-tag">Cartoon preview</span>
      </div>
      <div className="iq-cartoon-map__hud-row">
        <Image
          src="/logos/companies/nvda.svg"
          alt=""
          width={28}
          height={28}
          className="iq-cartoon-map__hud-nvda"
          aria-hidden
        />
        <h1 className="iq-cartoon-map__hud-title">{CARTOON_MAP_TITLE}</h1>
        <div className="iq-cartoon-map__hud-progress" role="status">
          <span>{progressPct}%</span>
          <div className="iq-cartoon-map__hud-track">
            <motion.div
              className="iq-cartoon-map__hud-fill"
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

/**
 * Full-desktop cartoon overworld map — Mario / Pokémon region style.
 * Preview only; does not replace `/schools/map`.
 */
export function SchoolsCartoonMapScreen() {
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
  const hubState = resolveCartoonHubState(finalUnlocked, finalCompleted);

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) /
      pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, Math.round(pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const hubHref =
    hubState !== "locked" ? cartoonFinalChallengeHref(pathname) : undefined;

  return (
    <main className="iq-cartoon-map">
      <div className="iq-cartoon-map__stage" data-cartoon-map-stage>
        <div
          className="iq-cartoon-map__canvas"
          style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
          aria-label="NVIDIA 10-K adventure world"
        >
          <CartoonWorldArt />

          {CARTOON_MAP_ISLANDS.map((island) => {
            const state = resolveCartoonPillarState(island.id, pillarById);
            const href =
              state !== "locked" ? cartoonPillarHref(island.id, pathname) : undefined;
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

      <CartoonMapHud progressPct={overallProgressPct} />

      <footer className="iq-cartoon-map__footer">
        <Link href="/schools/map" className="iq-cartoon-map__footer-link">
          Cinematic (A)
        </Link>
        <span aria-hidden>·</span>
        <span className="iq-cartoon-map__footer-here">Cartoon (B)</span>
        <span aria-hidden>·</span>
        <Link href="/schools/preview/map-prodigy" className="iq-cartoon-map__footer-link">
          Prodigy (C)
        </Link>
      </footer>
    </main>
  );
}
