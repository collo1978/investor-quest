"use client";

/**
 * ForcesScene — cinematic launch pad mid-ignition.
 *
 * Layers (back → front):
 *   • storm cloud band (rim-lit underside)
 *   • lightning flashes through fog
 *   • smoke plume rising past the rocket
 *   • launch scaffolding (left + right struts)
 *   • rocket — metallic gradient body, specular streak, window halo
 *   • volumetric engine plume (white core → orange mid → red outer)
 *   • heat shimmer / bloom on plateau
 *   • drifting embers + heat sparks
 */

import { motion } from "framer-motion";
import type { IslandPalette } from "@/components/map/islandTokens";

export type ForcesSceneProps = {
  palette: IslandPalette;
  motionOn: boolean;
  orderIndex: number;
};

export function ForcesScene({
  palette,
  motionOn,
  orderIndex
}: ForcesSceneProps) {
  const phase = orderIndex * 0.4;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* (a) Storm cloud band — pulled UP so it sits above the rocket
          and never covers the nose cone. */}
      <div
        className="absolute left-[4%] top-[-8%] h-[20%] w-[92%] rounded-full"
        style={{
          background: `radial-gradient(50% 100% at 50% 60%, ${palette.deep} 0%, transparent 75%)`,
          filter: "blur(14px)",
          opacity: 0.85
        }}
      />
      {/* (a.2) Cloud underside rim-light — orange/red glow from below the
          storm, still above the rocket. */}
      <div
        className="absolute left-[12%] top-[6%] h-[10%] w-[76%] rounded-full"
        style={{
          background: `radial-gradient(60% 90% at 50% 50%, ${palette.accent} 0%, transparent 75%)`,
          filter: "blur(16px)",
          mixBlendMode: "screen",
          opacity: 0.55
        }}
      />

      {/* (a.3) Sky flash — periodic brightening from lightning, kept in
          the upper area only so it doesn't wash out the rocket. */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-[28%]"
        style={{
          background: `radial-gradient(60% 60% at 30% 20%, ${palette.light} 0%, transparent 70%)`,
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0, 0.35, 0, 0.18, 0] }
            : { opacity: 0 }
        }
        transition={{
          duration: 6.4,
          delay: phase + 1.2,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.04, 0.1, 0.16, 0.2, 1]
        }}
      />

      {/* (b) Rising smoke plume — billowing from the engine. */}
      {motionOn
        ? SMOKE_SEEDS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`,
                bottom: `${s.y}%`,
                width: s.size,
                height: s.size,
                background: `radial-gradient(circle at 35% 30%, rgba(245,197,71,0.55), rgba(110,60,40,0.4) 50%, rgba(30,18,30,0) 100%)`,
                filter: "blur(6px)",
                mixBlendMode: "screen"
              }}
              initial={false}
              animate={{
                y: [0, -36, -60],
                x: [0, s.drift, s.drift * 1.5],
                opacity: [0.7, 0.5, 0],
                scale: [0.9, 1.2, 1.6]
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

      {/* (c.1) Launch deck — a layered launch platform with target ring,
          radial pad markings, edge warning lights, and tall support gantries
          flanking the rocket. Sells "rocket on launch pad" hard. */}
      <svg
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute left-1/2 bottom-[58%] h-[16%] w-[96%] -translate-x-1/2"
      >
        <defs>
          <linearGradient id="forcesPadDeck" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mid} stopOpacity="0.85" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="forcesPadRing" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={palette.deep} stopOpacity="0.9" />
            <stop offset="50%" stopColor={palette.mid} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="forcesPadGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deck slab — wide thick platform spanning the lit top. */}
        <rect x="4" y="22" width="192" height="14" rx="2" fill="url(#forcesPadDeck)" />
        {/* Bright top edge of the deck slab. */}
        <rect x="4" y="22" width="192" height="1.4" rx="0.6" fill={palette.light} opacity="0.6" />

        {/* Centre launch target — concentric rings under the rocket. */}
        <ellipse cx="100" cy="30" rx="40" ry="5" fill="url(#forcesPadRing)" />
        <ellipse cx="100" cy="29.4" rx="36" ry="3.6" fill="none" stroke={palette.accent} strokeWidth="0.6" opacity="0.95" />
        <ellipse cx="100" cy="29.4" rx="22" ry="2.2" fill="none" stroke={palette.accent} strokeWidth="0.55" opacity="0.85" />
        {/* Cross-hair lines through the target. */}
        <line x1="60" y1="29.6" x2="140" y2="29.6" stroke={palette.accent} strokeWidth="0.3" opacity="0.6" />
        <line x1="100" y1="26" x2="100" y2="33.5" stroke={palette.accent} strokeWidth="0.3" opacity="0.6" />

        {/* Deck edge LED strip — front facing. */}
        <rect x="6" y="35.2" width="188" height="0.9" fill={palette.accent} opacity="0.95" />
        {/* Marker lights along the front edge. */}
        {[
          12, 26, 40, 54, 68, 82, 118, 132, 146, 160, 174, 188
        ].map((x, i) => (
          <circle
            key={`mk${i}`}
            cx={x}
            cy="35.6"
            r="1.1"
            fill={palette.light}
            opacity={i % 2 === 0 ? 0.95 : 0.55}
            style={
              i % 2 === 0
                ? { filter: `drop-shadow(0 0 1.5px ${palette.accent})` }
                : undefined
            }
          />
        ))}

        {/* Hazard chevrons on either side of the launch ring. */}
        {[
          [14, 24],
          [22, 24],
          [170, 24],
          [178, 24]
        ].map(([x, y], i) => (
          <path
            key={`ch${i}`}
            d={`M${x - 2.5} ${y} L${x + 2.5} ${y} L${x} ${y + 3.2} Z`}
            fill={palette.accent}
            opacity={i % 2 === 0 ? 0.9 : 0.7}
          />
        ))}

        {/* Tall launch gantries — left + right structural towers flanking
            the rocket. Rises above the deck slab to brace the rocket. */}
        {[16, 184].map((x, i) => (
          <g key={`gantry${i}`}>
            {/* Tower legs. */}
            <line x1={x} y1="2" x2={x} y2="22" stroke={palette.deep} strokeWidth="1.6" opacity="0.95" />
            <line x1={x - 4} y1="22" x2={x + 4} y2="22" stroke={palette.deep} strokeWidth="0.8" opacity="0.95" />
            {/* Crossbars. */}
            {[6, 10, 14, 18].map((y) => (
              <line
                key={`cb${i}${y}`}
                x1={x - 2.4}
                x2={x + 2.4}
                y1={y}
                y2={y}
                stroke={palette.deep}
                strokeWidth="0.5"
                opacity="0.85"
              />
            ))}
            {/* Light strip on each gantry. */}
            <line x1={x} y1="3" x2={x} y2="20" stroke={palette.accent} strokeWidth="0.4" opacity="0.65" />
            {/* Top warning beacon. */}
            <circle
              cx={x}
              cy="2.4"
              r="1.2"
              fill={palette.accent}
              style={{ filter: `drop-shadow(0 0 2.5px ${palette.accent})` }}
            />
          </g>
        ))}

        {/* Underneath glow — heat wash spreading from beneath the deck. */}
        <rect x="20" y="36.5" width="160" height="3" fill="url(#forcesPadGlow)" />
      </svg>

      {/* (c.1.b) Thruster wash — radial blast painted on the platform deck
          centered under the rocket bell. Reads as "engines actively firing
          into the launch surface" → sells the danger of the scene. */}
      <motion.div
        className="absolute left-1/2 bottom-[56%] h-[10%] w-[34%] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(60% 80% at 50% 35%, ${palette.light} 0%, ${palette.accent} 30%, ${palette.halo} 65%, transparent 100%)`,
          filter: "blur(8px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.75, 1, 0.75], scale: [0.94, 1.06, 0.94] }
            : { opacity: 0.4 }
        }
        transition={{
          duration: 0.85,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* (c.2) Rocket + scaffolding — STRUCTURE tier (h-[26%]).
          Reduced from h-[42%] so the rocket sits cleanly inside the
          launch-pad world rather than dominating the vertical axis.
          The launch deck around it (Tier 3) carries the world identity. */}
      <svg
        viewBox="0 0 40 110"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 bottom-[58%] h-[26%] w-[28%] -translate-x-1/2"
        style={{ filter: `drop-shadow(0 8px 22px ${palette.halo})` }}
      >
        <defs>
          <linearGradient id="forcesRocketBody" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#5b6373" />
            <stop offset="22%" stopColor="#cbd5e1" />
            <stop offset="45%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="82%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="forcesRocketNose" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.light} />
            <stop offset="100%" stopColor={palette.hi} />
          </linearGradient>
          <radialGradient id="forcesFireCore" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="rgba(255,255,250,1)" />
            <stop offset="22%" stopColor="rgba(255,229,141,0.95)" />
            <stop offset="55%" stopColor={palette.accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="forcesFireOuter" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.95" />
            <stop offset="55%" stopColor={palette.mid} stopOpacity="0.55" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Left scaffolding. */}
        <g opacity="0.85">
          <line x1="6" y1="24" x2="6" y2="98" stroke={palette.deep} strokeWidth="1.2" />
          <line x1="4" y1="24" x2="8" y2="24" stroke={palette.deep} strokeWidth="0.6" />
          {[40, 56, 72, 88].map((y) => (
            <line key={`Lcb${y}`} x1="6" y1={y} x2="14" y2={y} stroke={palette.deep} strokeWidth="0.6" />
          ))}
          {/* light strip */}
          <line x1="6" y1="26" x2="6" y2="96" stroke={palette.accent} strokeWidth="0.3" opacity="0.55" />
        </g>

        {/* Right scaffolding. */}
        <g opacity="0.85">
          <line x1="34" y1="24" x2="34" y2="98" stroke={palette.deep} strokeWidth="1.2" />
          <line x1="32" y1="24" x2="36" y2="24" stroke={palette.deep} strokeWidth="0.6" />
          {[40, 56, 72, 88].map((y) => (
            <line key={`Rcb${y}`} x1="26" y1={y} x2="34" y2={y} stroke={palette.deep} strokeWidth="0.6" />
          ))}
          <line x1="34" y1="26" x2="34" y2="96" stroke={palette.accent} strokeWidth="0.3" opacity="0.55" />
        </g>

        {/* Rocket — gentle launch-vibration bob. */}
        <motion.g
          initial={false}
          animate={motionOn ? { y: [0, -1.5, 0] } : { y: 0 }}
          transition={{
            duration: 3.4,
            delay: phase,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Nose cone */}
          <path
            d="M20 6 L24 22 L16 22 Z"
            fill="url(#forcesRocketNose)"
            stroke={palette.light}
            strokeWidth="0.3"
          />
          {/* Body. */}
          <rect
            x="16"
            y="22"
            width="8"
            height="62"
            fill="url(#forcesRocketBody)"
            rx="1.2"
          />
          {/* Specular streak (vertical highlight). */}
          <rect
            x="17.5"
            y="23"
            width="0.7"
            height="60"
            fill="rgba(255,255,255,0.65)"
            rx="0.3"
          />
          {/* Accent stripe. */}
          <rect x="16" y="33" width="8" height="0.8" fill={palette.accent} opacity="0.85" />
          <rect x="16" y="62" width="8" height="0.6" fill={palette.mid} opacity="0.7" />
          {/* Round window (porthole). */}
          <circle
            cx="20"
            cy="42"
            r="2.2"
            fill={palette.light}
            stroke={palette.accent}
            strokeWidth="0.5"
            style={{
              filter: `drop-shadow(0 0 2px ${palette.accent})`
            }}
          />
          <circle cx="19.4" cy="41.5" r="0.7" fill="rgba(255,255,255,0.95)" />
          <circle cx="20" cy="42" r="1.2" fill="#0c0c1f" opacity="0.55" />
          {/* Fins. */}
          <path d="M16 78 L11 86 L16 86 Z" fill={palette.mid} stroke={palette.deep} strokeWidth="0.2" />
          <path d="M24 78 L29 86 L24 86 Z" fill={palette.mid} stroke={palette.deep} strokeWidth="0.2" />
          {/* Engine bell. */}
          <path
            d="M16 84 L24 84 L25 90 L15 90 Z"
            fill={palette.deep}
            stroke={palette.mid}
            strokeWidth="0.3"
          />
        </motion.g>

        {/* Engine plume — outer cone (red/orange wash). */}
        <motion.path
          d="M12 90 L28 90 L31 104 L26 108 L20 110 L14 108 L9 104 Z"
          fill="url(#forcesFireOuter)"
          initial={false}
          animate={
            motionOn
              ? { scaleY: [0.92, 1.18, 0.92], opacity: [0.75, 1, 0.75] }
              : { scaleY: 1, opacity: 0.55 }
          }
          style={{ transformOrigin: "50% 0%", mixBlendMode: "screen" }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Engine plume — bright core. */}
        <motion.path
          d="M15 90 L25 90 L26 100 L23 104 L20 106 L17 104 L14 100 Z"
          fill="url(#forcesFireCore)"
          initial={false}
          animate={
            motionOn
              ? { scaleY: [0.95, 1.12, 0.95], opacity: [0.95, 1, 0.95] }
              : { scaleY: 1, opacity: 0.75 }
          }
          style={{ transformOrigin: "50% 0%", mixBlendMode: "screen" }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* (d) Lightning bolts — periodic flash. */}
      <motion.svg
        viewBox="0 0 100 60"
        className="absolute left-[6%] top-[2%] h-[40%] w-[38%]"
        initial={false}
        animate={
          motionOn
            ? { opacity: [0, 0.95, 0, 0.7, 0] }
            : { opacity: 0 }
        }
        transition={{
          duration: 5.4,
          delay: phase + 1.4,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.05, 0.12, 0.16, 0.22, 1]
        }}
      >
        <path
          d="M22 4 L18 22 L26 22 L20 42 L34 18 L26 18 L30 4 Z"
          fill={palette.light}
          style={{ filter: `drop-shadow(0 0 8px ${palette.light})` }}
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 100 60"
        className="absolute right-[6%] top-[4%] h-[40%] w-[38%]"
        initial={false}
        animate={
          motionOn
            ? { opacity: [0, 0, 0.9, 0, 0.55, 0] }
            : { opacity: 0 }
        }
        transition={{
          duration: 5.4,
          delay: phase + 3.0,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.1, 0.14, 0.22, 0.26, 1]
        }}
      >
        <path
          d="M68 6 L62 26 L70 26 L66 44 L80 22 L72 22 L76 6 Z"
          fill={palette.light}
          style={{ filter: `drop-shadow(0 0 8px ${palette.light})` }}
        />
      </motion.svg>

      {/* (e) Heat / engine wash on plateau — concentrated under the
          rocket bell, on the new platform surface. */}
      <motion.div
        className="absolute left-1/2 bottom-[56%] h-[10%] w-[42%] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(60% 80% at 50% 50%, ${palette.accent} 0%, ${palette.halo} 40%, transparent 80%)`,
          filter: "blur(10px)",
          mixBlendMode: "screen"
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.6, 0.95, 0.6], scale: [0.96, 1.04, 0.96] }
            : { opacity: 0.3 }
        }
        transition={{
          duration: 0.85,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* (f) Embers rising. */}
      {motionOn
        ? EMBER_SEEDS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`,
                bottom: `${s.y}%`,
                width: s.size,
                height: s.size,
                background: palette.accent,
                boxShadow: `0 0 8px ${palette.accent}`
              }}
              initial={false}
              animate={{
                y: [0, -34, -52],
                opacity: [0, 0.95, 0],
                scale: [0.6, 1, 0.4]
              }}
              transition={{
                duration: s.duration,
                delay: (i * 0.4 + phase) % s.duration,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))
        : null}
    </div>
  );
}

const SMOKE_SEEDS = [
  { x: 44, y: 54, size: 16, drift: 5, duration: 3.6 },
  { x: 52, y: 52, size: 14, drift: -3, duration: 3.2 },
  { x: 48, y: 56, size: 18, drift: 4, duration: 4.0 },
  { x: 54, y: 54, size: 12, drift: -5, duration: 3.4 },
  { x: 46, y: 53, size: 14, drift: 2, duration: 3.8 }
] as const;

const EMBER_SEEDS = [
  { x: 42, y: 56, size: 1.4, duration: 2.6 },
  { x: 52, y: 53, size: 1.0, duration: 2.2 },
  { x: 48, y: 57, size: 1.2, duration: 3.0 },
  { x: 55, y: 55, size: 1.0, duration: 2.4 },
  { x: 45, y: 54, size: 1.6, duration: 3.2 },
  { x: 50, y: 58, size: 1.3, duration: 2.8 }
] as const;
