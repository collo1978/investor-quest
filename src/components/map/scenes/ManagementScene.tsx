"use client";

/**
 * ManagementScene — illuminated glass-walled boardroom command centre.
 *
 * Layers (back → front):
 *   • floating holographic display panels (back row)
 *   • volumetric ceiling-down beam behind the building
 *   • boardroom structure — premium glass walls with rim-lit roof slab
 *   • glowing interior: long conference table + executive figures
 *   • interior light bloom (cool white-blue)
 *   • front columns with metallic finish + edge light strips
 *   • ceiling spotlights pouring downward (volumetric cones)
 *   • drifting platinum motes
 */

import { motion } from "framer-motion";
import type { IslandPalette } from "@/components/map/islandTokens";

export type ManagementSceneProps = {
  palette: IslandPalette;
  motionOn: boolean;
  orderIndex: number;
};

export function ManagementScene({
  palette,
  motionOn,
  orderIndex
}: ManagementSceneProps) {
  const phase = orderIndex * 0.45;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* (a0) Premium white/blue ambient halo around the boardroom —
          repositioned to match the smaller h-[26%] boardroom living in the
          14–42% top range; halo sits ON the building, not above empty
          sky. */}
      <motion.div
        className="absolute left-1/2 top-[12%] h-[38%] w-[60%] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${palette.light} 0%, ${palette.accent}88 30%, ${palette.halo} 55%, transparent 80%)`,
          filter: "blur(28px)",
          mixBlendMode: "screen",
          opacity: 0.55
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.45, 0.78, 0.45], scale: [0.98, 1.04, 0.98] }
            : { opacity: 0.25, scale: 1 }
        }
        transition={{
          duration: 4.4,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (a) Floating holographic displays — STATUS_UI tier (h-[9%]).
          Reduced from h-[16%] so the top panels read as a small
          decorative HUD strip above the boardroom rather than the actual
          environment. The boardroom + exec deck below are the world. */}
      <motion.svg
        viewBox="0 0 100 30"
        className="absolute left-[18%] top-[2%] h-[9%] w-[64%]"
        initial={false}
        animate={motionOn ? { y: [-2, 1, -2] } : { y: 0 }}
        transition={{
          duration: 4.2,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <defs>
          <linearGradient id="mgmtHoloPanel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Left holo — data list. */}
        <g>
          <rect x="6" y="6" width="24" height="18" rx="0.8" fill="url(#mgmtHoloPanel)" stroke={palette.accent} strokeWidth="0.4" opacity="0.85" />
          <line x1="9" y1="10" x2="27" y2="10" stroke={palette.light} strokeWidth="0.35" opacity="0.85" />
          <line x1="9" y1="13" x2="22" y2="13" stroke={palette.light} strokeWidth="0.35" opacity="0.7" />
          <line x1="9" y1="16" x2="25" y2="16" stroke={palette.light} strokeWidth="0.35" opacity="0.55" />
          <line x1="9" y1="19" x2="20" y2="19" stroke={palette.light} strokeWidth="0.35" opacity="0.5" />
          {/* Title bar */}
          <rect x="6" y="6" width="24" height="2.2" rx="0.8" fill={palette.accent} opacity="0.45" />
        </g>

        {/* Centre holo — KPI badge. */}
        <g>
          <rect x="38" y="4" width="22" height="20" rx="0.8" fill="url(#mgmtHoloPanel)" stroke={palette.accent} strokeWidth="0.4" opacity="0.85" />
          <text
            x="49"
            y="14"
            textAnchor="middle"
            fontSize="4.5"
            fontFamily="monospace"
            fontWeight="700"
            fill={palette.light}
          >
            CEO
          </text>
          <text
            x="49"
            y="20"
            textAnchor="middle"
            fontSize="2.6"
            fontFamily="monospace"
            fill={palette.light}
            opacity="0.7"
          >
            COMMAND
          </text>
        </g>

        {/* Right holo — trend mini-chart. */}
        <g>
          <rect x="66" y="6" width="26" height="18" rx="0.8" fill="url(#mgmtHoloPanel)" stroke={palette.accent} strokeWidth="0.4" opacity="0.85" />
          <path
            d="M70 18 L74 14 L78 16 L82 10 L86 12 L90 8"
            fill="none"
            stroke={palette.light}
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <circle cx="90" cy="8" r="0.9" fill={palette.light} />
        </g>
      </motion.svg>

      {/* (a.5) Side holographic command panels — floating data screens
          flanking the boardroom, reinforcing the "command center" read. */}
      <SideCommandPanel
        position="left"
        palette={palette}
        motionOn={motionOn}
        phase={phase}
        title="OPS"
      />
      <SideCommandPanel
        position="right"
        palette={palette}
        motionOn={motionOn}
        phase={phase + 0.6}
        title="RISK"
      />

      {/* (b) Volumetric ceiling beam behind building — sized to the
          shorter h-[26%] boardroom; beam extends just above the building. */}
      <motion.div
        className="absolute left-1/2 bottom-[58%] h-[28%] w-[10%] -translate-x-1/2 origin-bottom"
        style={{
          background: `linear-gradient(to top, ${palette.accent} 0%, ${palette.light} 22%, transparent 100%)`,
          filter: "blur(8px)",
          mixBlendMode: "screen",
          opacity: 0.55,
          clipPath: "polygon(35% 100%, 65% 100%, 100% 0%, 0% 0%)"
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.45, 0.8, 0.45] }
            : { opacity: 0.3 }
        }
        transition={{
          duration: 3.4,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* (c.1) Premium executive platform — wide blue glass deck spanning
          the platform surface beneath the boardroom. LED light strips edge
          the deck so it reads as a luxury executive landing the boardroom
          rises from. Spans 92% width across the platform top. */}
      <svg
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        className="absolute left-1/2 bottom-[58%] h-[7%] w-[92%] -translate-x-1/2"
      >
        <defs>
          <linearGradient id="mgmtDeck" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.hi} stopOpacity="0.95" />
            <stop offset="60%" stopColor={palette.mid} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* Glass deck slab spanning the platform. */}
        <rect x="4" y="4" width="192" height="10" rx="1.4" fill="url(#mgmtDeck)" opacity="0.92" />
        {/* Top reflective surface (catchlight along the lit edge). */}
        <rect x="4" y="4" width="192" height="1.4" rx="0.7" fill={palette.light} opacity="0.6" />
        {/* Edge LED strip — accent-coloured light along the front of the deck. */}
        <rect x="4" y="13" width="192" height="0.8" fill={palette.accent} opacity="0.9" />
        {/* Segmented marker lights along the front edge. */}
        {[
          14, 28, 42, 56, 70, 84, 100, 116, 130, 144, 158, 172, 186
        ].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy="13.4"
            r="0.9"
            fill={palette.light}
            opacity={i % 2 === 0 ? 0.95 : 0.55}
            style={i % 2 === 0 ? { filter: `drop-shadow(0 0 1.5px ${palette.accent})` } : undefined}
          />
        ))}
      </svg>

      {/* (c.2) Boardroom — STRUCTURE tier (h-[26%]).
          Resized to match the unified composition system — every world
          ships with its hero at 22–28% of the stage. The "command centre"
          identity is carried by the surrounding holo panels and exec deck,
          not by oversizing the boardroom itself. */}
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 bottom-[58%] h-[26%] w-[44%] -translate-x-1/2"
        style={{
          filter: `drop-shadow(0 10px 24px ${palette.halo}) drop-shadow(0 0 14px ${palette.accent}55)`
        }}
      >
        <defs>
          <linearGradient id="mgmtRoof" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.hi} stopOpacity="0.98" />
            <stop offset="100%" stopColor={palette.mid} stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="mgmtGlass" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.78" />
            <stop offset="55%" stopColor={palette.hi} stopOpacity="0.6" />
            <stop offset="100%" stopColor={palette.mid} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="mgmtPillar" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={palette.deep} stopOpacity="0.85" />
            <stop offset="40%" stopColor={palette.hi} stopOpacity="0.95" />
            <stop offset="60%" stopColor={palette.light} stopOpacity="0.45" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="mgmtInteriorGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.light} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Roof slab. */}
        <rect x="5" y="9" width="90" height="6" fill="url(#mgmtRoof)" rx="1" />
        {/* Roof bevel highlight. */}
        <rect x="5" y="9" width="90" height="1.2" fill="rgba(255,255,255,0.6)" rx="0.5" />

        {/* Building body — glassy. */}
        <rect x="9" y="15" width="82" height="42" fill="url(#mgmtGlass)" rx="1" stroke={palette.hi} strokeWidth="0.5" />
        {/* Inner glass tint. */}
        <rect x="12" y="18" width="76" height="36" fill={palette.deep} opacity="0.35" rx="0.6" />

        {/* Interior glow — bright haze behind the table. */}
        <ellipse cx="50" cy="32" rx="38" ry="14" fill="url(#mgmtInteriorGlow)" opacity="0.7" />

        {/* Conference table silhouette. */}
        <rect x="22" y="36" width="56" height="3" rx="1.5" fill={palette.deep} opacity="0.85" />
        {/* Table top highlight. */}
        <rect x="22" y="36" width="56" height="0.6" rx="0.3" fill={palette.light} opacity="0.55" />

        {/* Executive silhouette (head + shoulders). */}
        <ellipse cx="50" cy="31" rx="2" ry="2.2" fill={palette.deep} opacity="0.95" />
        <path d="M46.5 36 L53.5 36 L52 32 L48 32 Z" fill={palette.deep} opacity="0.95" />

        {/* Side seats — alternating sides of the table. */}
        {[
          [28, 33.5],
          [36, 33.5],
          [44, 33.5],
          [56, 33.5],
          [64, 33.5],
          [72, 33.5]
        ].map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx="1.4" ry="1.5" fill={palette.deep} opacity="0.85" />
            <rect x={cx - 1.6} y={cy + 1.2} width="3.2" height="1.6" rx="0.5" fill={palette.deep} opacity="0.85" />
          </g>
        ))}

        {/* Side-screen panels on rear wall (glowing displays inside). */}
        <rect x="24" y="20" width="14" height="9" rx="0.6" fill={palette.deep} opacity="0.85" stroke={palette.accent} strokeWidth="0.3" />
        <line x1="26" y1="23" x2="36" y2="23" stroke={palette.light} strokeWidth="0.3" opacity="0.85" />
        <line x1="26" y1="26" x2="32" y2="26" stroke={palette.light} strokeWidth="0.3" opacity="0.6" />
        <rect x="62" y="20" width="14" height="9" rx="0.6" fill={palette.deep} opacity="0.85" stroke={palette.accent} strokeWidth="0.3" />
        <path d="M64 26 L67 23 L70 25 L73 21" fill="none" stroke={palette.light} strokeWidth="0.4" />

        {/* Four front columns (metallic). */}
        {[16, 38, 60, 82].map((x) => (
          <g key={x}>
            <rect x={x} y={15} width="3.5" height="42" rx="0.6" fill="url(#mgmtPillar)" opacity="0.9" />
            {/* Top capital. */}
            <rect x={x - 0.5} y={15} width="4.5" height="2" rx="0.5" fill={palette.light} opacity="0.85" />
            {/* Bottom base. */}
            <rect x={x - 0.5} y={55} width="4.5" height="2" rx="0.5" fill={palette.light} opacity="0.85" />
            {/* Light strip. */}
            <line x1={x + 1.75} y1="17" x2={x + 1.75} y2="55" stroke={palette.accent} strokeWidth="0.3" opacity="0.7" />
          </g>
        ))}

        {/* Centre crest above doorway. */}
        <polygon
          points="50,3 53.5,8 46.5,8"
          fill={palette.accent}
          opacity="0.95"
          style={{ filter: `drop-shadow(0 0 3px ${palette.accent})` }}
        />
      </svg>

      {/* (d) Ceiling spotlight cones — volumetric downward beams inside the room. */}
      {SPOTLIGHTS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2 origin-top"
          style={{
            left: `${s.x}%`,
            top: `${s.top}%`,
            height: `${s.h}%`,
            width: `${s.w}%`,
            background: `linear-gradient(to bottom, ${palette.light} 0%, ${palette.accent} 35%, transparent 100%)`,
            filter: "blur(3px)",
            mixBlendMode: "screen",
            clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)"
          }}
          initial={false}
          animate={
            motionOn
              ? { opacity: [0.4, 0.85, 0.4] }
              : { opacity: 0.25 }
          }
          transition={{
            duration: 2.6,
            delay: phase + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        />
      ))}

      {/* (e) Ground bloom — SceneShell owns the platform-surface wash now;
          local bloom removed to avoid duplication. */}

      {/* (f) Drifting platinum motes. */}
      {motionOn
        ? MOTE_SEEDS.map((m, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: m.size,
                height: m.size,
                background: palette.light,
                boxShadow: `0 0 6px ${palette.light}`,
                opacity: 0.85
              }}
              initial={false}
              animate={{
                y: [-2, -16, -2],
                opacity: [0, 0.92, 0]
              }}
              transition={{
                duration: m.duration,
                delay: (i * 0.6 + phase) % m.duration,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))
        : null}
    </div>
  );
}

/**
 * Side hologram panel — floats beside the boardroom and reinforces the
 * command-center identity with a glowing data panel: title bar, trend
 * sparkline, mini stats grid, and a soft drop-shadow.
 */
function SideCommandPanel({
  position,
  palette,
  motionOn,
  phase,
  title
}: {
  position: "left" | "right";
  palette: IslandPalette;
  motionOn: boolean;
  phase: number;
  title: string;
}) {
  const horizontalStyle =
    position === "left" ? { left: "2%" } : { right: "2%" };
  return (
    <motion.svg
      viewBox="0 0 60 80"
      preserveAspectRatio="xMidYMid meet"
      className="absolute top-[44%] h-[14%] w-[13%]"
      style={{
        ...horizontalStyle,
        filter: `drop-shadow(0 0 12px ${palette.halo})`
      }}
      initial={false}
      animate={motionOn ? { y: [-2, 3, -2] } : { y: 0 }}
      transition={{
        duration: 4.6,
        delay: phase,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <defs>
        <linearGradient
          id={`mgmtSideBg-${position}`}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0%" stopColor={palette.accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={palette.deep} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Panel frame. */}
      <rect
        x="2"
        y="2"
        width="56"
        height="76"
        rx="2"
        fill={`url(#mgmtSideBg-${position})`}
        stroke={palette.accent}
        strokeWidth="0.5"
        opacity="0.9"
      />
      {/* Title bar. */}
      <rect
        x="2"
        y="2"
        width="56"
        height="9"
        rx="2"
        fill={palette.accent}
        opacity="0.45"
      />
      <text
        x="30"
        y="8.4"
        textAnchor="middle"
        fontSize="5"
        fontFamily="monospace"
        fontWeight="700"
        fill={palette.light}
      >
        {title}
      </text>

      {/* Sparkline. */}
      <path
        d="M6 32 L12 24 L18 28 L24 18 L30 22 L36 14 L42 18 L48 12 L54 16"
        fill="none"
        stroke={palette.light}
        strokeWidth="0.9"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 1.5px ${palette.accent})` }}
      />
      <circle cx="54" cy="16" r="1.2" fill={palette.light} />

      {/* Data rows. */}
      {[42, 50, 58, 66].map((y, i) => (
        <g key={y}>
          <rect
            x="6"
            y={y}
            width="3"
            height="3"
            fill={palette.accent}
            opacity={i % 2 === 0 ? 0.95 : 0.65}
          />
          <line
            x1="11"
            x2={36 + (i % 2) * 12}
            y1={y + 1.5}
            y2={y + 1.5}
            stroke={palette.light}
            strokeWidth="0.4"
            opacity="0.8"
          />
          <text
            x="56"
            y={y + 2.4}
            textAnchor="end"
            fontSize="2.6"
            fontFamily="monospace"
            fill={palette.light}
            opacity="0.85"
          >
            {["+12%", "+8%", "—", "+4%"][i]}
          </text>
        </g>
      ))}

      {/* Live pulse dot in the title bar. */}
      <motion.circle
        cx="6"
        cy="6.5"
        r="1.2"
        fill={palette.light}
        initial={false}
        animate={
          motionOn ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }
        }
        transition={{
          duration: 1.6,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ filter: `drop-shadow(0 0 2px ${palette.light})` }}
      />
    </motion.svg>
  );
}

// Three spotlight cones across the boardroom (left / centre / right).
// Positioned so each cone begins at the boardroom roof (~16% from stage
// top) and pours downward into the interior (down to ~36%). Matches the
// new h-[26%] STRUCTURE-tier boardroom.
const SPOTLIGHTS = [
  { x: 40, top: 16, h: 18, w: 9 },
  { x: 50, top: 16, h: 20, w: 11 },
  { x: 60, top: 16, h: 18, w: 9 }
] as const;

const MOTE_SEEDS = [
  { x: 34, y: 16, size: 1.3, duration: 3.8 },
  { x: 66, y: 18, size: 1.0, duration: 3.2 },
  { x: 50, y: 10, size: 1.6, duration: 4.4 },
  { x: 42, y: 22, size: 1.2, duration: 3.4 },
  { x: 58, y: 20, size: 1.4, duration: 4.0 }
] as const;
