"use client";

/**
 * FinancialsScene — cinematic financial-strength vault.
 *
 * Layers (back → front):
 *   • holographic chart bars + trend line floating behind the vault
 *   • data-stream particles flowing upward
 *   • vault body — brushed-metal panels, riveted seams, edge bevel light
 *   • vault door — circular plate with combination dial + spokes
 *   • door light-leak around the seam (suggesting active inside)
 *   • floating coins — glossy 3D look with specular highlights + bloom
 *   • mint-green ground bloom on plateau
 */

import { motion } from "framer-motion";
import type { IslandPalette } from "@/components/map/islandTokens";

export type FinancialsSceneProps = {
  palette: IslandPalette;
  motionOn: boolean;
  orderIndex: number;
};

export function FinancialsScene({
  palette,
  motionOn,
  orderIndex
}: FinancialsSceneProps) {
  const phase = orderIndex * 0.55;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* (a) Holographic chart panel — semi-transparent floating display
          above the vault, sitting on the upper portion of the stage. */}
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="absolute left-[10%] top-[1%] h-[34%] w-[80%]"
        style={{
          filter: "blur(0.4px)",
          opacity: 0.92
        }}
      >
        <defs>
          <linearGradient id="finPanel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="finHoloBar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Panel frame (faint). */}
        <rect x="6" y="4" width="88" height="52" rx="1.5" fill="url(#finPanel)" stroke={palette.accent} strokeWidth="0.25" opacity="0.55" />

        {/* Grid lines. */}
        {[14, 24, 34, 44].map((y) => (
          <line
            key={y}
            x1="8"
            x2="92"
            y1={y}
            y2={y}
            stroke={palette.accent}
            strokeWidth="0.25"
            opacity="0.22"
          />
        ))}

        {/* Bars — sustained growth narrative. */}
        {[
          { x: 14, h: 16 },
          { x: 26, h: 22 },
          { x: 38, h: 20 },
          { x: 50, h: 30 },
          { x: 62, h: 36 },
          { x: 74, h: 42 }
        ].map((b, i) => (
          <motion.rect
            key={b.x}
            x={b.x}
            width="6"
            y={50 - b.h}
            height={b.h}
            fill="url(#finHoloBar)"
            stroke={palette.accent}
            strokeWidth="0.3"
            initial={false}
            animate={
              motionOn
                ? { opacity: [0.55, 0.95, 0.55], scaleY: [0.96, 1, 0.96] }
                : { opacity: 0.55 }
            }
            transition={{
              duration: 2.8,
              delay: phase + i * 0.15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "50% 100%" }}
          />
        ))}

        {/* Trend line going up + arrow. */}
        <motion.path
          d="M17 36 L29 30 L41 32 L53 22 L65 14 L77 8"
          stroke={palette.light}
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
          initial={false}
          animate={
            motionOn
              ? { opacity: [0.65, 1, 0.65] }
              : { opacity: 0.6 }
          }
          transition={{
            duration: 3,
            delay: phase,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: `drop-shadow(0 0 2px ${palette.light})` }}
        />
        <path
          d="M77 8 L73 11 L75 14 Z"
          fill={palette.light}
          opacity="0.95"
        />

        {/* Floating "+%" label near the arrow tip. */}
        <g opacity="0.9">
          <rect x="79" y="4" width="13" height="7" rx="1" fill={palette.deep} opacity="0.7" stroke={palette.accent} strokeWidth="0.3" />
          <text
            x="85.5"
            y="9.2"
            textAnchor="middle"
            fontSize="4"
            fontFamily="monospace"
            fill={palette.light}
          >
            +24%
          </text>
        </g>
      </svg>

      {/* (b) Data-stream particles flowing upward beside the vault. */}
      {motionOn
        ? DATA_SEEDS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`,
                bottom: `${s.y}%`,
                width: s.size,
                height: s.size,
                background: palette.accent,
                boxShadow: `0 0 5px ${palette.accent}`
              }}
              initial={false}
              animate={{
                y: [0, -18, -28],
                opacity: [0, 0.95, 0],
                scale: [0.5, 1, 0.4]
              }}
              transition={{
                duration: s.duration,
                delay: (i * 0.5 + phase) % s.duration,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))
        : null}

      {/* (c.1) Finance-tech platform — a glowing data deck spanning the
          platform surface with grid lines, animated mini-bars on either
          side of the vault, and corner pulse markers. Reads as the
          fintech ops floor the vault rises from. */}
      <svg
        viewBox="0 0 200 32"
        preserveAspectRatio="none"
        className="absolute left-1/2 bottom-[58%] h-[14%] w-[96%] -translate-x-1/2"
        style={{ opacity: 0.92 }}
      >
        <defs>
          <linearGradient id="finGridFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="finGridDeck" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mid} stopOpacity="0.45" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="finBar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Deck plate behind the grid. */}
        <rect x="4" y="6" width="192" height="24" rx="1.6" fill="url(#finGridDeck)" />
        {/* Top reflective edge. */}
        <rect x="4" y="6" width="192" height="1.2" rx="0.6" fill={palette.light} opacity="0.55" />

        {/* Vertical grid lines, dense across the platform. */}
        {[
          10, 20, 30, 40, 50, 60, 70, 80, 90, 110, 120, 130, 140, 150, 160, 170, 180, 190
        ].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            x2={x}
            y1="6"
            y2="30"
            stroke="url(#finGridFade)"
            strokeWidth="0.5"
          />
        ))}
        {/* Horizontal grid lines. */}
        {[12, 18, 24].map((y) => (
          <line
            key={`h${y}`}
            x1="4"
            x2="196"
            y1={y}
            y2={y}
            stroke={palette.accent}
            strokeWidth="0.4"
            opacity={1 - (y - 6) / 28}
          />
        ))}

        {/* Mini-bar charts on the platform surface (left + right of vault). */}
        {[
          // Left side bars (x positions far left of vault)
          { x: 14, h: 14 },
          { x: 20, h: 8 },
          { x: 26, h: 11 },
          { x: 32, h: 6 },
          { x: 38, h: 13 },
          { x: 44, h: 9 },
          // Right side bars
          { x: 156, h: 9 },
          { x: 162, h: 13 },
          { x: 168, h: 6 },
          { x: 174, h: 11 },
          { x: 180, h: 8 },
          { x: 186, h: 14 }
        ].map((b, i) => (
          <motion.rect
            key={`bar${i}`}
            x={b.x}
            width="3"
            y={28 - b.h}
            height={b.h}
            fill="url(#finBar)"
            stroke={palette.accent}
            strokeWidth="0.2"
            initial={false}
            animate={
              motionOn
                ? { opacity: [0.5, 0.95, 0.5], scaleY: [0.92, 1.06, 0.92] }
                : { opacity: 0.55 }
            }
            transition={{
              duration: 2.6,
              delay: phase + i * 0.12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "50% 100%" }}
          />
        ))}

        {/* Floating "$" glyphs along the deck. */}
        {[26, 58, 142, 174].map((cx, i) => (
          <text
            key={`gly${i}`}
            x={cx}
            y="12"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="3.2"
            fontWeight="700"
            fill={palette.light}
            opacity="0.85"
            style={{ filter: `drop-shadow(0 0 1px ${palette.accent})` }}
          >
            $
          </text>
        ))}

        {/* Corner pulse markers + edge LED strip. */}
        <rect x="6" y="29.4" width="188" height="0.6" fill={palette.accent} opacity="0.9" />
        {[
          [8, 28],
          [60, 28],
          [140, 28],
          [192, 28]
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`pulse${i}`}
            cx={cx}
            cy={cy}
            r="1.1"
            fill={palette.light}
            initial={false}
            animate={
              motionOn
                ? { opacity: [0.55, 1, 0.55], r: [0.9, 1.4, 0.9] }
                : { opacity: 0.7 }
            }
            transition={{
              duration: 2,
              delay: phase + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: `drop-shadow(0 0 2px ${palette.accent})` }}
          />
        ))}
      </svg>

      {/* (c.2) Vault body — STRUCTURE tier (h-[24%]).
          Reduced from h-[40%] so the vault is a clearly recognizable hero
          object sitting INSIDE the finance-tech world, with the data deck
          (Tier 3) and chart panels carrying the rest of the world identity. */}
      <svg
        viewBox="0 0 80 60"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 bottom-[58%] h-[24%] w-[34%] -translate-x-1/2"
        style={{ filter: `drop-shadow(0 6px 20px ${palette.halo})` }}
      >
        <defs>
          <linearGradient id="vaultBody" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.hi} stopOpacity="0.9" />
            <stop offset="35%" stopColor={palette.mid} stopOpacity="0.98" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="vaultFace" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mid} stopOpacity="0.85" />
            <stop offset="45%" stopColor={palette.hi} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="vaultDoor" cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.95" />
            <stop offset="35%" stopColor={palette.hi} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.98" />
          </radialGradient>
        </defs>

        {/* Outer vault shell (with bevel). */}
        <rect x="8" y="6" width="64" height="52" rx="3" fill="url(#vaultBody)" />
        {/* Inner face (brushed). */}
        <rect x="11" y="9" width="58" height="46" rx="2.2" fill="url(#vaultFace)" opacity="0.85" />

        {/* Top bevel highlight. */}
        <rect x="11" y="9" width="58" height="1.2" rx="0.6" fill="rgba(255,255,255,0.4)" />
        {/* Left bevel. */}
        <rect x="11" y="9" width="1" height="46" rx="0.5" fill="rgba(255,255,255,0.25)" />
        {/* Right bevel. */}
        <rect x="68" y="9" width="1" height="46" rx="0.5" fill="rgba(0,0,0,0.35)" />

        {/* Riveted seams. */}
        {[14, 22, 30, 38, 46, 54].map((y) => (
          <g key={y}>
            <circle cx="14" cy={y} r="1" fill={palette.accent} opacity="0.92" />
            <circle cx="14" cy={y} r="0.3" fill="rgba(255,255,255,0.95)" />
            <circle cx="66" cy={y} r="1" fill={palette.accent} opacity="0.92" />
            <circle cx="66" cy={y} r="0.3" fill="rgba(255,255,255,0.95)" />
          </g>
        ))}

        {/* Vault door — circular plate. */}
        <circle cx="40" cy="32" r="16" fill="url(#vaultDoor)" stroke={palette.hi} strokeWidth="0.6" />
        {/* Door seam ring — bright leak. */}
        <motion.circle
          cx="40"
          cy="32"
          r="16"
          fill="none"
          stroke={palette.light}
          strokeWidth="0.5"
          initial={false}
          animate={
            motionOn
              ? { opacity: [0.55, 1, 0.55] }
              : { opacity: 0.5 }
          }
          transition={{
            duration: 2.4,
            delay: phase,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: `drop-shadow(0 0 2px ${palette.light})` }}
        />

        {/* Door spokes (4 radial bars). */}
        {[0, 90, 180, 270].map((deg) => (
          <rect
            key={deg}
            x="39"
            y="22"
            width="2"
            height="20"
            rx="0.6"
            fill={palette.hi}
            opacity="0.92"
            transform={`rotate(${deg} 40 32)`}
          />
        ))}

        {/* Combination dial — rotates slowly. */}
        <motion.g
          initial={false}
          animate={motionOn ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformOrigin: "40px 32px" }}
        >
          <circle cx="40" cy="32" r="6.5" fill={palette.deep} stroke={palette.accent} strokeWidth="0.6" />
          <circle cx="40" cy="32" r="6.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" />
          {/* Tick marks around dial. */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="39.6"
              y="26"
              width="0.8"
              height="1.4"
              fill={palette.accent}
              transform={`rotate(${deg} 40 32)`}
            />
          ))}
          {/* Pointer. */}
          <line x1="40" y1="32" x2="40" y2="27" stroke={palette.light} strokeWidth="0.7" strokeLinecap="round" />
        </motion.g>

        {/* Door handle. */}
        <rect x="56" y="30" width="6" height="3.5" rx="1.5" fill={palette.hi} opacity="0.95" />
        <rect x="56.5" y="30.5" width="5" height="0.8" rx="0.4" fill="rgba(255,255,255,0.5)" />

        {/* "$" wordmark above door. */}
        <text
          x="40"
          y="14"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="5"
          fontWeight="700"
          fill={palette.light}
          style={{ filter: `drop-shadow(0 0 1.5px ${palette.accent})` }}
        >
          VAULT
        </text>
      </svg>

      {/* (d) Door light-leak halo — centered on the vault door. */}
      <motion.div
        className="absolute left-1/2 bottom-[68%] h-[14%] w-[20%] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(50% 50% at 50% 50%, ${palette.light} 0%, ${palette.accent} 30%, transparent 70%)`,
          filter: "blur(8px)",
          mixBlendMode: "screen",
          opacity: 0.5
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.45, 0.78, 0.45], scale: [0.96, 1.04, 0.96] }
            : { opacity: 0.25 }
        }
        transition={{
          duration: 3.4,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (e) Floating coins — glossy, with bloom. */}
      {motionOn
        ? COIN_SEEDS.map((c, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${c.x}%`,
                bottom: `${c.y}%`,
                width: c.size,
                height: c.size
              }}
              initial={false}
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 180, 360],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: c.duration,
                delay: (i * 0.7 + phase) % c.duration,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Glow halo behind the coin. */}
              <span
                className="absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: `radial-gradient(50% 50% at 50% 50%, ${palette.accent} 0%, transparent 70%)`,
                  filter: "blur(4px)",
                  mixBlendMode: "screen",
                  opacity: 0.7
                }}
              />
              {/* Coin face. */}
              <div
                className="relative h-full w-full rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${palette.light} 0%, ${palette.accent} 45%, ${palette.deep} 100%)`,
                  boxShadow: `0 0 8px ${palette.accent}, inset 0 0 3px ${palette.light}, inset 0 -2px 4px rgba(0,0,0,0.4)`,
                  border: `0.5px solid ${palette.hi}`
                }}
              >
                {/* Highlight gloss. */}
                <span
                  className="absolute left-[18%] top-[15%] h-[35%] w-[35%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 0%, transparent 70%)"
                  }}
                />
              </div>
            </motion.div>
          ))
        : null}

      {/* (f) SceneShell now owns the ground bloom — removed local ground
          bloom to avoid duplication. */}
    </div>
  );
}

const COIN_SEEDS = [
  { x: 14, y: 64, size: 14, duration: 3.6 },
  { x: 82, y: 66, size: 12, duration: 3.0 },
  { x: 22, y: 58, size: 10, duration: 4.0 },
  { x: 74, y: 60, size: 13, duration: 3.4 },
  { x: 10, y: 72, size: 9, duration: 3.8 }
] as const;

const DATA_SEEDS = [
  { x: 26, y: 60, size: 1.2, duration: 2.8 },
  { x: 70, y: 58, size: 1.0, duration: 3.2 },
  { x: 32, y: 62, size: 0.9, duration: 2.4 },
  { x: 66, y: 60, size: 1.1, duration: 2.6 },
  { x: 38, y: 56, size: 0.8, duration: 3.0 },
  { x: 60, y: 64, size: 1.2, duration: 3.4 }
] as const;
