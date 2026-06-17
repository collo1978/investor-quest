"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { SchoolsMapBusinessBuildingGlow } from "@/components/schools/SchoolsMapBusinessBuildingGlow";
import {
  SCHOOLS_BRIDGE_ENERGY,
  SCHOOLS_MAP_BUSINESS_BUILDING,
  SCHOOLS_MAP_BUSINESS_UNLOCK_PATH,
  SCHOOLS_MAP_PORTAL_CENTER,
  SCHOOLS_UNLOCK_BURST_MS,
  SCHOOLS_UNLOCK_LAND_MS,
  SCHOOLS_UNLOCK_TRAVEL_MS
} from "@/lib/schools/schoolsMapUnlockAnimation";

const EASE_TRAVEL = "linear" as const;

type Props = {
  active: boolean;
  onComplete: () => void;
};

type Point = { x: number; y: number };

function samplePath(pathEl: SVGPathElement, t: number): Point {
  const length = pathEl.getTotalLength();
  const pt = pathEl.getPointAtLength(length * Math.max(0, Math.min(1, t)));
  return { x: pt.x, y: pt.y };
}

/**
 * One-shot energy pulse through the bridge conduit (mission brief dismiss).
 */
export function SchoolsMapBusinessUnlockFx({ active, onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const onCompleteRef = useRef(onComplete);
  const progress = useMotionValue(0);
  const [pulsePos, setPulsePos] = useState<Point>(SCHOOLS_MAP_PORTAL_CENTER);
  const [phase, setPhase] = useState<"idle" | "burst" | "travel" | "land">("idle");
  const completedRef = useRef(false);
  const { core, mid } = SCHOOLS_BRIDGE_ENERGY;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      setPhase("idle");
      progress.set(0);
      setPulsePos(SCHOOLS_MAP_PORTAL_CENTER);
      return;
    }

    completedRef.current = false;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    };

    if (reduceMotion) {
      setPhase("land");
      setPulsePos(SCHOOLS_MAP_BUSINESS_BUILDING);
      const t = window.setTimeout(finish, SCHOOLS_UNLOCK_LAND_MS);
      return () => window.clearTimeout(t);
    }

    setPhase("burst");
    let travelControl: { stop: () => void } | null = null;
    let cancelled = false;

    const burstTimer = window.setTimeout(() => {
      if (cancelled) return;
      setPhase("travel");
      travelControl = animate(progress, 1, {
        duration: SCHOOLS_UNLOCK_TRAVEL_MS / 1000,
        ease: EASE_TRAVEL,
        onComplete: () => {
          if (!cancelled) setPhase("land");
        }
      });
    }, SCHOOLS_UNLOCK_BURST_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(burstTimer);
      travelControl?.stop();
    };
  }, [active, progress, reduceMotion]);

  useEffect(() => {
    if (!active || reduceMotion) return;
    return progress.on("change", (v) => {
      const path = pathRef.current;
      if (!path) return;
      setPulsePos(samplePath(path, v));
    });
  }, [active, progress, reduceMotion]);

  useEffect(() => {
    if (!active || phase !== "land") return;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    };

    const t = window.setTimeout(finish, SCHOOLS_UNLOCK_LAND_MS);
    return () => window.clearTimeout(t);
  }, [active, phase]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] overflow-hidden"
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ mixBlendMode: "screen", overflow: "visible" }}
      >
        <defs>
          <path
            ref={pathRef}
            id="schools-biz-unlock-path"
            d={SCHOOLS_MAP_BUSINESS_UNLOCK_PATH}
            fill="none"
          />
        </defs>

        {(phase === "travel" || phase === "land") && (
          <motion.path
            d={SCHOOLS_MAP_BUSINESS_UNLOCK_PATH}
            fill="none"
            stroke={mid}
            strokeWidth={0.44}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0.32] }}
            transition={{ duration: SCHOOLS_UNLOCK_TRAVEL_MS / 1000, ease: EASE_TRAVEL }}
          />
        )}

        {phase === "burst" && (
          <motion.circle
            cx={SCHOOLS_MAP_PORTAL_CENTER.x}
            cy={SCHOOLS_MAP_PORTAL_CENTER.y}
            r={0.4}
            fill={core}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0.4] }}
            transition={{ duration: SCHOOLS_UNLOCK_BURST_MS / 1000, ease: "easeOut" }}
          />
        )}

        {(phase === "travel" || phase === "land") && (
          <circle cx={pulsePos.x} cy={pulsePos.y} r={0.28} fill={core} opacity={0.95} />
        )}

        {phase === "land" && (
          <motion.circle
            cx={SCHOOLS_MAP_BUSINESS_BUILDING.x}
            cy={SCHOOLS_MAP_BUSINESS_BUILDING.y}
            r={0.34}
            fill={core}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.45] }}
            transition={{ duration: SCHOOLS_UNLOCK_LAND_MS / 1000, ease: "easeOut" }}
          />
        )}
      </svg>

      {phase === "land" ? <SchoolsMapBusinessBuildingGlow phase="impact" /> : null}
    </div>
  );
}
