"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { useGame } from "@/components/GameProvider";
import {
  MissionEnvelopeBriefSequence,
  MissionEnvelopeTrigger
} from "@/components/schools/MissionEnvelopeBriefSequence";
import { type PillarId } from "@/data/pillars";
import {
  getPillarViews,
  isTenKFinalChallengeUnlocked,
  type PillarView
} from "@/engine";
import { getActiveCompanyProgress } from "@/engine/progression/selectors";
import {
  PRODIGY_MAP_HUB,
  PRODIGY_MAP_ISLANDS,
  PRODIGY_MAP_NATURAL,
  computeProdigyBusinessIslandCamera,
  computeProdigyBusinessHqCamera,
  prodigyBusinessIslandFocalPct,
  prodigyZoneAnchorStyle,
  type ProdigyIslandCameraFrame,
  type ProdigyIslandMeta
} from "@/lib/schools/schoolsProdigyMapConfig";
import {
  SCHOOLS_BUSINESS_HQ_ZOOM_MS,
  SCHOOLS_BUSINESS_ISLAND_ZOOM_MS
} from "@/lib/schools/schoolsBusinessIslandZoomEnter";
import {
  prodigyFinalChallengeHref,
  prodigyPillarHref,
  resolveProdigyHubState,
  resolveProdigyPillarState,
  type ProdigyNodeVisualState
} from "@/lib/schools/schoolsProdigyMapHelpers";
import { ProdigyWorldArt } from "@/components/schools/prodigyMap/ProdigyMapWorld";

function StatusChip({ state }: { state: ProdigyNodeVisualState }) {
  if (state === "completed") return <span className="iq-prodigy-map__chip iq-prodigy-map__chip--done">Complete</span>;
  if (state === "locked") return null;
  if (state === "in-progress") return <span className="iq-prodigy-map__chip iq-prodigy-map__chip--active">In progress</span>;
  return <span className="iq-prodigy-map__chip iq-prodigy-map__chip--go">Enter</span>;
}

function RegionHotspot({
  island,
  state,
  href,
  pillarView,
  missionEnvelope,
  guidePulse = false,
  onPromptClick
}: {
  island: ProdigyIslandMeta;
  state: ProdigyNodeVisualState;
  href?: string;
  pillarView?: PillarView;
  missionEnvelope?: {
    onOpen: () => void;
  };
  guidePulse?: boolean;
  onPromptClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const hasMissionEnvelope = !locked && Boolean(missionEnvelope);
  const promptTap =
    Boolean(onPromptClick) && !hasMissionEnvelope && (guidePulse || !href);
  const interactive = !locked && Boolean(href) && !hasMissionEnvelope && !promptTap;

  const zoneClass = [
    "iq-prodigy-map__zone",
    `iq-prodigy-map__zone--${island.id}`,
    `iq-prodigy-map__zone--sign-${island.signPlacement}`,
    locked ? "iq-prodigy-map__zone--locked" : "",
    state === "available" ? "iq-prodigy-map__zone--available" : "",
    state === "completed" ? "iq-prodigy-map__zone--done" : "",
    state === "in-progress" ? "iq-prodigy-map__zone--active" : "",
    hasMissionEnvelope ? "iq-prodigy-map__zone--mission-envelope" : "",
    guidePulse ? "iq-prodigy-map__zone--guide-pulse" : "",
    (interactive || promptTap) && hovered ? "iq-prodigy-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const sign = (
    <div
      className="iq-prodigy-map__sign"
      style={{
        ["--zone-accent" as string]: island.path,
        ["--zone-edge" as string]: island.landEdge,
        ["--zone-glow" as string]: island.glow
      }}
    >
      <span className="iq-prodigy-map__sign-title">{island.label}</span>
      <span className="iq-prodigy-map__sign-sub">{island.subtitle}</span>
      {!locked ? (
        <div className="iq-prodigy-map__sign-row">
          <StatusChip state={state} />
          {pillarView && state === "in-progress" ? (
            <span className="iq-prodigy-map__sign-count">
              {pillarView.completedCount}/{pillarView.totalCount}
            </span>
          ) : null}
        </div>
      ) : null}
      {locked ? (
        <span className="iq-prodigy-map__lock-badge iq-prodigy-map__lock-badge--island" aria-hidden>
          <span className="iq-prodigy-map__lock-shackle" />
          <span className="iq-prodigy-map__lock-body">
            <span className="iq-prodigy-map__lock-keyhole" />
          </span>
        </span>
      ) : null}
    </div>
  );

  const decor = (
    <>
      <div
        className="iq-prodigy-map__hit-area"
        style={{ ["--zone-glow" as string]: island.glow }}
        aria-hidden
      />
      <span className="iq-prodigy-map__sign-stem" aria-hidden />
    </>
  );

  const style = prodigyZoneAnchorStyle(island);

  if (promptTap && onPromptClick) {
    return (
      <div className={zoneClass} style={style}>
        <div className="iq-prodigy-map__zone-motion">
          {decor}
          <button
            type="button"
            className="iq-prodigy-map__hit"
            aria-label={`${island.label} — tap to begin your journey`}
            onClick={onPromptClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {sign}
          </button>
        </div>
      </div>
    );
  }

  if (hasMissionEnvelope && missionEnvelope) {
    return (
      <div className={zoneClass} style={style}>
        <div className="iq-prodigy-map__zone-motion">
          {decor}
          <button
            type="button"
            className="iq-prodigy-map__hit"
            aria-label={`${island.label} — open mission brief`}
            onClick={missionEnvelope.onOpen}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {sign}
          </button>
        </div>
      </div>
    );
  }

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <div className="iq-prodigy-map__zone-motion">
          {decor}
          <Link
            href={href}
            prefetch
            className="iq-prodigy-map__hit"
            aria-label={`${island.label} — ${island.subtitle}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {sign}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={zoneClass} style={style} aria-disabled={locked}>
      <div className="iq-prodigy-map__zone-motion">
        {decor}
        <div className="iq-prodigy-map__hit iq-prodigy-map__hit--static">{sign}</div>
      </div>
    </div>
  );
}

function HubHotspot({ state, href }: { state: ProdigyNodeVisualState; href?: string }) {
  const hub = PRODIGY_MAP_HUB;
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);

  const zoneClass = [
    "iq-prodigy-map__zone iq-prodigy-map__zone--hub",
    "iq-prodigy-map__zone--sign-below",
    locked ? "iq-prodigy-map__zone--locked" : "",
    state === "completed" ? "iq-prodigy-map__zone--done" : "",
    interactive && hovered ? "iq-prodigy-map__zone--hover" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const decor = (
    <>
      <div
        className="iq-prodigy-map__hit-area iq-prodigy-map__hit-area--hub"
        style={{ ["--zone-glow" as string]: hub.glow }}
        aria-hidden
      />
      <span className="iq-prodigy-map__sign-stem iq-prodigy-map__sign-stem--hub" aria-hidden />
    </>
  );

  const sign = (
    <div
      className="iq-prodigy-map__sign iq-prodigy-map__sign--hub"
      style={{
        ["--zone-accent" as string]: hub.accentEdge,
        ["--zone-edge" as string]: hub.accentEdge,
        ["--zone-glow" as string]: hub.glow
      }}
    >
      {hub.label ? <span className="iq-prodigy-map__sign-title">{hub.label}</span> : null}
      <span className="iq-prodigy-map__sign-sub">{hub.subtitle}</span>
      <StatusChip state={state} />
      {locked ? (
        <span className="iq-prodigy-map__lock-badge iq-prodigy-map__lock-badge--hub" aria-hidden>
          <span className="iq-prodigy-map__lock-shackle" />
          <span className="iq-prodigy-map__lock-body">
            <span className="iq-prodigy-map__lock-keyhole" />
          </span>
        </span>
      ) : null}
    </div>
  );

  const style = { left: `${hub.x}%`, top: `${hub.y}%` };

  if (interactive && href) {
    return (
      <div className={zoneClass} style={style}>
        <div className="iq-prodigy-map__zone-motion">
          {decor}
          <Link
            href={href}
            prefetch
            className="iq-prodigy-map__hit"
            aria-label={hub.label ? `${hub.label} — ${hub.subtitle}` : hub.subtitle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {sign}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={zoneClass} style={style} aria-disabled={locked}>
      <div className="iq-prodigy-map__zone-motion">
        {decor}
        <div className="iq-prodigy-map__hit iq-prodigy-map__hit--static">{sign}</div>
      </div>
    </div>
  );
}

function ProdigyProgressHud({ progressPct }: { progressPct: number }) {
  return (
    <div className="iq-prodigy-map__progress-hud" role="status" aria-label={`Quest progress ${progressPct}%`}>
      <span className="iq-prodigy-map__progress-label">Quest Progress</span>
      <div className="iq-prodigy-map__progress-row">
        <div className="iq-prodigy-map__progress-track">
          <span
            className="iq-prodigy-map__progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="iq-prodigy-map__progress-value">{progressPct}%</span>
      </div>
    </div>
  );
}

function ProdigyCompanyLogoHud() {
  return (
    <div className="iq-prodigy-map__company-logo" aria-label="NVIDIA quest">
      <span>NVIDIA</span>
    </div>
  );
}

/** Prodigy-style fantasy educational overworld for Schools demo + live map. */
export function SchoolsProdigyMapScreen({
  missionBriefGateActive = true,
  envelopeHudReady = true,
  envelopeBriefOpen: envelopeBriefOpenProp,
  onEnvelopeBriefOpen,
  autoOpenMissionBrief = false,
  onMissionBriefStartQuest,
  businessIslandPromptActive = false,
  onBusinessIslandClick,
  businessIslandZoomActive = false,
  businessIslandHubActive = false,
  businessHqZoomActive = false,
  businessIslandProgressTier = 0,
  onBusinessIslandZoomComplete,
  onBusinessHqZoomComplete,
  onBusinessIslandEnter
}: {
  /** Dim map + show envelope HUD until START QUEST. */
  missionBriefGateActive?: boolean;
  /** Wait until session/story brief state is known before showing the HUD envelope. */
  envelopeHudReady?: boolean;
  /** Controlled overlay open state — parent renders {@link MissionEnvelopeBriefSequence}. */
  envelopeBriefOpen?: boolean;
  onEnvelopeBriefOpen?: () => void;
  /** Open the envelope brief overlay on first paint (uncontrolled preview maps). */
  autoOpenMissionBrief?: boolean;
  /** Fired when the learner taps START QUEST in the envelope brief. */
  onMissionBriefStartQuest?: () => void;
  /** Pulse Business Island until the learner taps to enter the hub. */
  businessIslandPromptActive?: boolean;
  onBusinessIslandClick?: () => void;
  /** Camera animates into Business Island on the same Prodigy map canvas. */
  businessIslandZoomActive?: boolean;
  /** Zoom complete — hold camera; gameplay UI overlays from parent. */
  businessIslandHubActive?: boolean;
  /** Second camera beat — zoom into HQ before quest navigation. */
  businessHqZoomActive?: boolean;
  businessIslandProgressTier?: number;
  onBusinessIslandZoomComplete?: () => void;
  onBusinessHqZoomComplete?: () => void;
  /** Always intercept Business Island taps (zoom enter) instead of direct link. */
  onBusinessIslandEnter?: () => void;
} = {}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { raw } = useGame();
  const isBriefControlled = envelopeBriefOpenProp !== undefined;
  const [internalBriefOpen, setInternalBriefOpen] = useState(false);
  const businessBriefOpen = isBriefControlled ? envelopeBriefOpenProp : internalBriefOpen;
  const [localAwaitingClick, setLocalAwaitingClick] = useState(false);
  const autoOpenedBriefRef = useRef(false);
  const pillarViews = useMemo(() => getPillarViews(raw), [raw]);
  const pillarById = useMemo(
    () =>
      Object.fromEntries(pillarViews.map((p) => [p.id, p])) as Record<PillarId, PillarView>,
    [pillarViews]
  );

  const companyProgress = getActiveCompanyProgress(raw);
  const finalUnlocked = isTenKFinalChallengeUnlocked(raw);
  const finalCompleted = companyProgress.tenKRookieChallenge != null;
  const hubState = finalCompleted ? resolveProdigyHubState(finalUnlocked, finalCompleted) : "locked";

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, pillar) => sum + pillar.progressPct, 0) /
      pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, Math.round(pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const questStarted =
    localAwaitingClick || !missionBriefGateActive || businessIslandPromptActive;
  const businessGuidePulse = businessIslandPromptActive || localAwaitingClick;
  const parentGuidesBusiness = Boolean(onBusinessIslandClick);
  const useZoomEnter = Boolean(onBusinessIslandEnter);
  const businessFocal = useMemo(() => prodigyBusinessIslandFocalPct(), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const zoomCompletedRef = useRef(false);
  const hqZoomCompletedRef = useRef(false);
  const [zoomHoldScale, setZoomHoldScale] = useState(false);
  const [cameraFrame, setCameraFrame] = useState<ProdigyIslandCameraFrame>({
    scale: 1,
    x: 0,
    y: 0
  });
  const cameraEngaged =
    businessIslandZoomActive ||
    businessIslandHubActive ||
    businessHqZoomActive ||
    zoomHoldScale;
  const activeCamera = cameraEngaged ? cameraFrame : { scale: 1, x: 0, y: 0 };
  const cameraMode = businessHqZoomActive ? "hq" : "island";

  const measureIslandCamera = () => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) {
      return { scale: 1, x: 0, y: 0 };
    }
    const canvasW = canvas.offsetWidth;
    const canvasH = canvas.offsetHeight;
    if (canvasW <= 0 || canvasH <= 0) {
      return { scale: 1, x: 0, y: 0 };
    }
    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;
    const stageRect = stage.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const offset = {
      left: canvasRect.left - stageRect.left,
      top: canvasRect.top - stageRect.top
    };
    const compute =
      cameraMode === "hq" ? computeProdigyBusinessHqCamera : computeProdigyBusinessIslandCamera;
    return compute({ width: stageW, height: stageH }, { width: canvasW, height: canvasH }, undefined, offset);
  };

  useLayoutEffect(() => {
    if (!cameraEngaged) {
      setCameraFrame({ scale: 1, x: 0, y: 0 });
      return;
    }
    setCameraFrame(measureIslandCamera());
  }, [cameraEngaged, cameraMode]);

  useEffect(() => {
    if (!cameraEngaged) return;
    const onResize = () => setCameraFrame(measureIslandCamera());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [cameraEngaged, cameraMode]);

  useEffect(() => {
    if (businessHqZoomActive) return;
    hqZoomCompletedRef.current = false;
  }, [businessHqZoomActive]);

  useEffect(() => {
    if (!cameraEngaged) {
      zoomCompletedRef.current = false;
    }
  }, [cameraEngaged]);

  useEffect(() => {
    if (businessIslandHubActive || businessIslandZoomActive || businessHqZoomActive) return;
    setZoomHoldScale(false);
    zoomCompletedRef.current = false;
    hqZoomCompletedRef.current = false;
  }, [businessIslandHubActive, businessIslandZoomActive, businessHqZoomActive]);

  useEffect(() => {
    if (isBriefControlled) return;
    if (autoOpenMissionBrief && missionBriefGateActive) {
      setInternalBriefOpen(true);
      autoOpenedBriefRef.current = true;
    }
  }, [isBriefControlled, autoOpenMissionBrief, missionBriefGateActive]);

  useEffect(() => {
    if (isBriefControlled) return;
    if (!missionBriefGateActive) {
      setInternalBriefOpen(false);
      autoOpenedBriefRef.current = false;
    }
  }, [isBriefControlled, missionBriefGateActive]);

  const handleOpenBrief = () => {
    if (!missionBriefGateActive) return;
    if (isBriefControlled) {
      onEnvelopeBriefOpen?.();
      return;
    }
    setInternalBriefOpen(true);
  };

  const handleStartQuest = () => {
    if (isBriefControlled) {
      onMissionBriefStartQuest?.();
      return;
    }
    setInternalBriefOpen(false);
    autoOpenedBriefRef.current = false;
    setLocalAwaitingClick(true);
    onMissionBriefStartQuest?.();
  };

  const mapClassName = [
    "iq-prodigy-map",
    cameraEngaged ? "iq-prodigy-map--zooming-business" : "",
    businessIslandHubActive ? "iq-prodigy-map--island-hub" : "",
    businessHqZoomActive ? "iq-prodigy-map--hq-zoom iq-prodigy-map--hq-enter" : "",
    businessIslandProgressTier > 0
      ? `iq-prodigy-map--island-tier-${businessIslandProgressTier}`
      : "",
    questStarted
      ? "iq-prodigy-map--mission-envelope-ready"
      : businessBriefOpen
        ? "iq-prodigy-map--mission-envelope-open"
        : "iq-prodigy-map--mission-envelope-pending"
  ].join(" ");

  const showEnvelopeHud =
    envelopeHudReady &&
    missionBriefGateActive &&
    !businessBriefOpen &&
    !questStarted;

  const hubHref = hubState !== "locked" ? prodigyFinalChallengeHref(pathname) : undefined;

  return (
    <main className={mapClassName}>
      <ProdigyCompanyLogoHud />
      {showEnvelopeHud ? (
        <div className="iq-prodigy-map__mission-envelope-hud">
          <MissionEnvelopeTrigger onOpen={handleOpenBrief} />
        </div>
      ) : null}
      <ProdigyProgressHud progressPct={overallProgressPct} />
      <div className="iq-prodigy-map__stage" data-prodigy-map-stage ref={stageRef}>
        <motion.div
          ref={canvasRef}
          className="iq-prodigy-map__canvas"
          style={
            {
              ["--prodigy-canvas-w" as string]: String(PRODIGY_MAP_NATURAL.width),
              ["--prodigy-canvas-h" as string]: String(PRODIGY_MAP_NATURAL.height),
              ["--prodigy-zoom-origin-x" as string]: `${businessFocal.x}%`,
              ["--prodigy-zoom-origin-y" as string]: `${businessFocal.y}%`,
              transformOrigin: "50% 50%"
            } as CSSProperties
          }
          initial={false}
          animate={
            cameraEngaged
              ? {
                  scale: activeCamera.scale,
                  x: activeCamera.x,
                  y: activeCamera.y,
                  opacity: 1
                }
              : { scale: 1, x: 0, y: 0, opacity: 1 }
          }
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : {
                  duration:
                    (businessHqZoomActive
                      ? SCHOOLS_BUSINESS_HQ_ZOOM_MS
                      : SCHOOLS_BUSINESS_ISLAND_ZOOM_MS) / 1000,
                  ease: [0.22, 1, 0.36, 1]
                }
          }
          onAnimationComplete={() => {
            if (businessHqZoomActive) {
              if (hqZoomCompletedRef.current) return;
              hqZoomCompletedRef.current = true;
              onBusinessHqZoomComplete?.();
              return;
            }
            if (zoomCompletedRef.current) return;
            if (!businessIslandZoomActive) return;
            zoomCompletedRef.current = true;
            setZoomHoldScale(true);
            onBusinessIslandZoomComplete?.();
          }}
        >
          <ProdigyWorldArt
            businessIslandProgressTier={businessIslandProgressTier}
            islandHubAmbient={businessIslandHubActive || businessHqZoomActive}
          />

          <div
            className="iq-prodigy-map__zoom-crossfade pointer-events-none"
            aria-hidden
          />

          {PRODIGY_MAP_ISLANDS.map((island) => {
            const state = resolveProdigyPillarState(island.id, pillarById);
            const visualState =
              island.id === "business"
                ? state === "completed" || state === "in-progress"
                  ? state
                  : "available"
                : state === "completed" || state === "in-progress"
                  ? state
                  : "locked";
            const requiresMissionBrief =
              missionBriefGateActive &&
              island.id === "business" &&
              visualState !== "locked" &&
              !questStarted;
            const blockBusinessLink =
              island.id === "business" &&
              (requiresMissionBrief ||
                (parentGuidesBusiness && businessGuidePulse) ||
                useZoomEnter);
            const href =
              visualState !== "locked" && !blockBusinessLink
                ? prodigyPillarHref(island.id, pathname)
                : undefined;
            const promptClick =
              island.id === "business" && !requiresMissionBrief
                ? businessGuidePulse && parentGuidesBusiness
                  ? onBusinessIslandClick
                  : useZoomEnter && questStarted
                    ? onBusinessIslandEnter
                    : undefined
                : undefined;
            return (
              <RegionHotspot
                key={island.id}
                island={island}
                state={visualState}
                href={href}
                pillarView={pillarById[island.id]}
                guidePulse={island.id === "business" && businessGuidePulse}
                onPromptClick={promptClick}
                missionEnvelope={
                  requiresMissionBrief
                    ? { onOpen: handleOpenBrief }
                    : undefined
                }
              />
            );
          })}

          <HubHotspot state={hubState} href={hubHref} />
        </motion.div>
      </div>
      {!isBriefControlled ? (
        <MissionEnvelopeBriefSequence
          open={businessBriefOpen}
          title="Business Island Mission Brief"
          onStartQuest={handleStartQuest}
        />
      ) : null}
    </main>
  );
}
