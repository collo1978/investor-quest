"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { PILLAR_META, type PillarId } from "@/data/pillars";
import { SchoolsMapBusinessBridgePulse } from "@/components/schools/SchoolsMapBusinessBridgePulse";
import { SchoolsMapBusinessBuildingGlow } from "@/components/schools/SchoolsMapBusinessBuildingGlow";
import { SchoolsMapBusinessUnlockFx } from "@/components/schools/SchoolsMapBusinessUnlockFx";
import {
  SCHOOLS_MAP_DESCRIPTION_BOXES,
  SCHOOLS_MAP_IMAGE_SRC,
  SCHOOLS_MAP_ISLAND_HOTSPOTS,
  SCHOOLS_MAP_NATURAL,
  isSchoolsMapPillarUnlocked,
  type SchoolsMapDescriptionBox,
  type SchoolsMapIslandHotspot
} from "@/lib/schools/schoolsMapConfig";
import {
  SCHOOLS_BUSINESS_UNLOCK_LABEL,
  SCHOOLS_MAP_BUSINESS_TARGET
} from "@/lib/schools/schoolsMapUnlockAnimation";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

const { width: ART_W, height: ART_H } = SCHOOLS_MAP_NATURAL;

function schoolsPillarHref(id: PillarId, pathname: string): string {
  const route = PILLAR_META.find((p) => p.id === id)?.route ?? `/${id}`;
  const schoolsRoute = route.startsWith("/schools") ? route : `/schools${route}`;
  return resolveSchoolsLearnerHref(schoolsRoute, pathname);
}

function SchoolsMapLockGlyph({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "inline-flex rounded-xl border border-[rgba(196,181,253,0.42)] bg-[rgba(10,9,22,0.82)] px-2.5 py-2 backdrop-blur-[2px]",
        className
      ].join(" ")}
      style={{
        boxShadow:
          "0 0 20px rgba(139,92,246,0.34), 0 8px 24px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.12)"
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="block h-6 w-6 sm:h-7 sm:w-7"
        fill="none"
        stroke="rgba(236,233,252,0.95)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M7 11V8a5 5 0 0110 0v3" />
        <rect
          x="5"
          y="11"
          width="14"
          height="10"
          rx="2"
          stroke="rgba(210,195,255,0.98)"
        />
        <rect
          x="11"
          y="15.5"
          width="2"
          height="2.75"
          rx="0.35"
          fill="rgba(236,233,252,0.42)"
          stroke="none"
        />
      </svg>
    </div>
  );
}

function SchoolsMapLockedIslandVeil({ spot }: { spot: SchoolsMapIslandHotspot }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[12]"
      style={{
        left: `${spot.cx - spot.w / 2}%`,
        top: `${spot.cy - spot.h / 2}%`,
        width: `${spot.w}%`,
        height: `${spot.h}%`,
        borderRadius: "50%"
      }}
    >
      <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(185deg,rgba(8,10,22,0.18)_0%,rgba(6,8,18,0.48)_52%,rgba(5,7,16,0.62)_100%)] mix-blend-multiply" />
      <span className="absolute inset-x-0 bottom-0 top-[35%] rounded-[inherit] bg-[linear-gradient(to_top,rgba(4,6,16,0.5)_0%,transparent_100%)] opacity-80" />
      <span className="absolute inset-x-[8%] inset-y-[12%] rounded-2xl shadow-[inset_0_10px_40px_rgba(0,0,0,0.32),inset_0_-4px_20px_rgba(0,0,0,0.2)]" />
      <div className="absolute left-1/2 top-[42%] z-[1] -translate-x-1/2 -translate-y-1/2">
        <SchoolsMapLockGlyph />
      </div>
    </div>
  );
}

function SchoolsMapIslandPromptRing({ spot }: { spot: SchoolsMapIslandHotspot }) {
  return (
    <div
      aria-hidden
      className="iq-schools-map-island-prompt pointer-events-none absolute z-[17]"
      style={{
        left: `${spot.cx - spot.w / 2}%`,
        top: `${spot.cy - spot.h / 2}%`,
        width: `${spot.w}%`,
        height: `${spot.h}%`,
        borderRadius: "50%"
      }}
    />
  );
}

function IslandHotspot({
  spot,
  href,
  promptActive,
  onPromptClick
}: {
  spot: SchoolsMapIslandHotspot;
  href?: string;
  promptActive?: boolean;
  onPromptClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const box = SCHOOLS_MAP_DESCRIPTION_BOXES.find((b) => b.id === spot.id);
  if (!box) return null;

  const unlocked = box.unlocked;

  const positionStyle = {
    left: `${spot.cx - spot.w / 2}%`,
    top: `${spot.cy - spot.h / 2}%`,
    width: `${spot.w}%`,
    height: `${spot.h}%`,
    borderRadius: "50%",
    transform: unlocked && hovered ? "scale(1.02)" : "scale(1)",
    transition: "transform 200ms ease-out",
    cursor: unlocked ? "pointer" : "not-allowed"
  } as const;

  const hitClass = [
    "absolute z-[18] m-0 border-0 bg-transparent p-0",
    promptActive ? "iq-schools-map-island-prompt-hit cursor-pointer" : "",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400/70"
  ].join(" ");

  const hitProps = {
    className: hitClass,
    style: positionStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false)
  };

  if (promptActive && onPromptClick) {
    return (
      <>
        <SchoolsMapIslandPromptRing spot={spot} />
        <button
          type="button"
          aria-label={`${box.title} — tap to unlock your first quest`}
          {...hitProps}
          onClick={onPromptClick}
        />
      </>
    );
  }

  if (unlocked && href) {
    return (
      <Link
        href={href}
        prefetch
        scroll
        aria-label={`${box.title} — ${box.description}`}
        {...hitProps}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${box.title} — ${box.description} (locked)`}
      aria-disabled
      {...hitProps}
      onClick={(e) => e.preventDefault()}
    />
  );
}

function SchoolsMapPillarCardContent({
  box,
  active
}: {
  box: SchoolsMapDescriptionBox;
  active: boolean;
}) {
  return (
    <div
      className={[
        "iq-schools-map-pillar-card pointer-events-none relative flex h-full w-full flex-col justify-center gap-0.5 px-2.5 py-2 sm:gap-1 sm:px-3.5 sm:py-2.5",
        active ? "iq-schools-map-pillar-card--active" : "",
        !box.unlocked ? "iq-schools-map-pillar-card--locked" : ""
      ].join(" ")}
      style={
        {
          ["--schools-map-accent" as string]: box.accent
        } as CSSProperties
      }
    >
      <span className="iq-schools-map-pillar-card__title">{box.title}</span>
      <span className="iq-schools-map-pillar-card__description">{box.description}</span>
      {!box.unlocked ? (
        <span className="iq-schools-map-pillar-card__lock" aria-hidden>
          <SchoolsMapLockGlyph className="!px-1.5 !py-1" />
        </span>
      ) : null}
    </div>
  );
}

function DescriptionBoxHit({
  box,
  href,
  highlight,
  landed,
  promptActive,
  onPromptClick
}: {
  box: SchoolsMapDescriptionBox;
  href?: string;
  highlight?: boolean;
  landed?: boolean;
  promptActive?: boolean;
  onPromptClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = box.unlocked && (hovered || Boolean(highlight) || Boolean(landed));

  const positionStyle = {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
    transform: highlight || landed ? undefined : box.unlocked && hovered ? "scale(1.02)" : "scale(1)",
    transition: highlight || landed
      ? undefined
      : "transform 200ms ease-out, box-shadow 200ms ease-out",
    cursor: box.unlocked ? "pointer" : "not-allowed"
  } as const;

  const hitClass = [
    "iq-schools-map-pillar-card-hit absolute z-20 m-0 rounded-xl border-0 bg-transparent p-0",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400/70",
    !box.unlocked ? "iq-schools-map-box-locked" : "",
    promptActive
      ? "iq-schools-map-box-highlight cursor-pointer"
      : landed
        ? "iq-schools-map-box-landed"
        : highlight
          ? "iq-schools-map-box-highlight"
          : box.unlocked && hovered
            ? "iq-schools-map-box-glow"
            : ""
  ].join(" ");

  const hitProps = {
    className: hitClass,
    style: positionStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false)
  };

  const card = <SchoolsMapPillarCardContent box={box} active={active} />;

  if (promptActive && onPromptClick) {
    return (
      <button
        type="button"
        aria-label={`${box.title} — tap to unlock your first quest`}
        {...hitProps}
        onClick={onPromptClick}
      >
        {card}
      </button>
    );
  }

  if (box.unlocked && href) {
    return (
      <Link
        href={href}
        prefetch
        scroll
        aria-label={`${box.title} — ${box.description}`}
        {...hitProps}
      >
        {card}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${box.title} — ${box.description} (locked)`}
      aria-disabled
      {...hitProps}
      onClick={(e) => e.preventDefault()}
    >
      {card}
    </button>
  );
}

function BusinessIslandGuideLabel({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="iq-schools-map-guide-label pointer-events-none absolute z-[30]"
          style={{
            left: `${SCHOOLS_MAP_BUSINESS_TARGET.x}%`,
            top: `${Math.max(SCHOOLS_MAP_BUSINESS_TARGET.y - 9, 2)}%`,
            transform: "translate(-50%, -100%)"
          }}
        >
          {SCHOOLS_BUSINESS_UNLOCK_LABEL}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type Props = {
  /** Pulse Business Island + card until the learner taps to unlock. */
  businessIslandPromptActive?: boolean;
  onBusinessIslandClick?: () => void;
  /** Run center → Business Island unlock pulse. */
  unlockAnimationActive?: boolean;
  onUnlockAnimationComplete?: () => void;
  /** Persistent glow on Business Kingdom after unlock FX. */
  highlightIslandId?: PillarId | null;
  /** Brief floating label above Business Island. */
  showBusinessGuideLabel?: boolean;
  /** Continuous energy pulse along the portal → Business bridge. */
  bridgePulseActive?: boolean;
};

/**
 * Schools-only quest map — `new-map.png` with interactive pillar cards.
 */
export function SchoolsQuestMapScreen({
  businessIslandPromptActive = false,
  onBusinessIslandClick,
  unlockAnimationActive = false,
  onUnlockAnimationComplete,
  highlightIslandId = null,
  showBusinessGuideLabel = false,
  bridgePulseActive = false
}: Props) {
  const pathname = usePathname();
  const businessLanded = highlightIslandId === "business";
  const businessPrompt =
    businessIslandPromptActive && Boolean(onBusinessIslandClick);

  const handleUnlockComplete = useCallback(() => {
    onUnlockAnimationComplete?.();
  }, [onUnlockAnimationComplete]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl bg-[#05050F]"
      data-schools-quest-map
    >
      <div
        className="relative mx-auto h-full max-h-full w-auto max-w-full"
        style={{ aspectRatio: `${ART_W} / ${ART_H}` }}
      >
        <img
          src={SCHOOLS_MAP_IMAGE_SRC}
          alt="Investor Quest map"
          width={ART_W}
          height={ART_H}
          draggable={false}
          className="pointer-events-none block h-full w-full select-none object-contain"
        />

        <SchoolsMapBusinessBridgePulse active={bridgePulseActive} />

        {businessLanded ? (
          <SchoolsMapBusinessBuildingGlow
            phase="lit"
            pulseReactive={bridgePulseActive}
          />
        ) : null}

        <SchoolsMapBusinessUnlockFx
          active={unlockAnimationActive}
          onComplete={handleUnlockComplete}
        />

        <BusinessIslandGuideLabel visible={showBusinessGuideLabel} />

        {SCHOOLS_MAP_ISLAND_HOTSPOTS.filter(
          (spot) => !isSchoolsMapPillarUnlocked(spot.id)
        ).map((spot) => (
          <SchoolsMapLockedIslandVeil key={`veil-${spot.id}`} spot={spot} />
        ))}

        <div className="absolute inset-0">
          {SCHOOLS_MAP_ISLAND_HOTSPOTS.map((spot) => (
            <IslandHotspot
              key={`island-${spot.id}`}
              spot={spot}
              href={
                isSchoolsMapPillarUnlocked(spot.id)
                  ? schoolsPillarHref(spot.id, pathname)
                  : undefined
              }
              promptActive={businessPrompt && spot.id === "business"}
              onPromptClick={
                businessPrompt && spot.id === "business"
                  ? onBusinessIslandClick
                  : undefined
              }
            />
          ))}
          {SCHOOLS_MAP_DESCRIPTION_BOXES.map((box) => (
            <DescriptionBoxHit
              key={box.id}
              box={box}
              href={
                box.unlocked ? schoolsPillarHref(box.id, pathname) : undefined
              }
              highlight={highlightIslandId === box.id}
              landed={businessLanded && box.id === "business"}
              promptActive={businessPrompt && box.id === "business"}
              onPromptClick={
                businessPrompt && box.id === "business"
                  ? onBusinessIslandClick
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
