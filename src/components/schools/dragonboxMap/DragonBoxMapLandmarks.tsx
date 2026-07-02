"use client";

/**
 * Minimal geometric landmarks — DragonBox / Monument Valley aesthetic.
 */

import { motion } from "framer-motion";
import { polarPoint } from "@/lib/schools/svgCoords";

/** Corporate tower — stacked rounded rectangles. */
export function DragonBoxBusinessTower() {
  return (
    <g className="iq-dragonbox-landmark iq-dragonbox-landmark--business">
      <ellipse cx="80" cy="118" rx="52" ry="8" fill="#0f172a" opacity="0.06" />
      <rect x="28" y="98" width="104" height="14" rx="7" fill="#fde68a" />
      <rect x="40" y="68" width="80" height="30" rx="6" fill="#fbbf24" />
      <rect x="52" y="36" width="56" height="32" rx="6" fill="#f59e0b" />
      <rect x="62" y="18" width="36" height="18" rx="4" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
      {[44, 58, 72, 86].map((x) => (
        <rect key={x} x={x} y="76" width="10" height="14" rx="2" fill="#fffbeb" opacity="0.85" />
      ))}
    </g>
  );
}

/** Radar — clean dish silhouette. */
export function DragonBoxRadarStation() {
  return (
    <g className="iq-dragonbox-landmark iq-dragonbox-landmark--risks">
      <ellipse cx="80" cy="112" rx="48" ry="7" fill="#0f172a" opacity="0.06" />
      <rect x="74" y="72" width="12" height="40" rx="6" fill="#fda4af" />
      <path
        d="M24 78 A56 56 0 0 1 136 78 L120 78 A40 40 0 0 0 40 78 Z"
        fill="#fecdd3"
        stroke="#f43f5e"
        strokeWidth="2.5"
      />
      <line x1="80" y1="78" x2="108" y2="52" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="108" cy="52" r="5" fill="#fff1f2" stroke="#f43f5e" strokeWidth="2" />
    </g>
  );
}

/** Vault — rounded treasury block (premium minimal game object). */
export function DragonBoxVault() {
  const doorCx = 80;
  const doorCy = 74;
  const doorR = 28;
  const bolts = [0, 45, 90, 135, 180, 225, 270, 315];
  const spokes = [0, 60, 120, 180, 240, 300];
  return (
    <motion.g
      className="iq-dragonbox-landmark iq-dragonbox-landmark--financial"
      style={{ pointerEvents: "none" }}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="dbx-fin-wall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="60%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
        <radialGradient id="dbx-fin-door" cx="0.38" cy="0.32" r="0.78">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </radialGradient>
        <linearGradient id="dbx-fin-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id="dbx-fin-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the vault */}
      <motion.ellipse
        cx={doorCx}
        cy="74"
        rx="92"
        ry="70"
        fill="url(#dbx-fin-glow)"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.97, 1.04, 0.97] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Ground shadow */}
      <ellipse cx={doorCx} cy="118" rx="58" ry="8" fill="#0f172a" opacity="0.1" />

      <g className="iq-vault-react">
        {/* Vault body — rounded panels + clean outline */}
        <rect x="16" y="36" width="128" height="80" rx="18" fill="url(#dbx-fin-wall)" stroke="#10b981" strokeWidth="3.5" />
        <rect x="26" y="46" width="108" height="60" rx="12" fill="#ecfdf5" stroke="#34d399" strokeWidth="2" />
        {/* Highlight streak */}
        <path d="M34 48 L52 48 L38 104 L26 104 Z" fill="#ffffff" opacity="0.4" />

        {/* Gold corner plates */}
        {[
          [22, 42],
          [122, 42],
          [22, 98],
          [122, 98]
        ].map(([x, y]) => (
          <rect
            key={`dbx-corner-${x}-${y}`}
            x={x}
            y={y}
            width="16"
            height="16"
            rx="5"
            fill="url(#dbx-fin-gold)"
            stroke="#b45309"
            strokeWidth="1.8"
          />
        ))}

        {/* Side hinges */}
        {[58, 92].map((y) => (
          <rect
            key={`dbx-hinge-${y}`}
            x="8"
            y={y}
            width="14"
            height="14"
            rx="4"
            fill="#34d399"
            stroke="#10b981"
            strokeWidth="2"
          />
        ))}

        {/* Bolts around the door */}
        {bolts.map((deg) => {
          const pt = polarPoint(doorCx, doorCy, doorR + 4, deg);
          return (
            <circle
              key={`dbx-bolt-${deg}`}
              cx={pt.x}
              cy={pt.y}
              r="2.6"
              fill="#6ee7b7"
              stroke="#10b981"
              strokeWidth="1.4"
            />
          );
        })}

        {/* Circular vault door + inner rings */}
        <circle cx={doorCx} cy={doorCy} r={doorR} fill="url(#dbx-fin-door)" stroke="#10b981" strokeWidth="3" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 6} fill="none" stroke="#34d399" strokeWidth="2" opacity="0.7" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 13} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />

        {/* Wheel spokes */}
        {spokes.map((deg) => {
          const inner = polarPoint(doorCx, doorCy, 6, deg);
          const outer = polarPoint(doorCx, doorCy, doorR - 8, deg);
          return (
            <line
              key={`dbx-spoke-${deg}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#34d399"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        {/* Central handle hub */}
        <circle cx={doorCx} cy={doorCy} r="7" fill="#ecfdf5" stroke="url(#dbx-fin-gold)" strokeWidth="3" />
        <circle cx={doorCx} cy={doorCy} r="2.4" fill="#f59e0b" />

        {/* Gold bars + coins near the base */}
        {[
          { x: 30, y: 104, n: 2 },
          { x: 110, y: 104, n: 2 }
        ].map((s) =>
          Array.from({ length: s.n }).map((_, i) => (
            <rect
              key={`dbx-bar-${s.x}-${i}`}
              x={s.x}
              y={s.y - i * 7}
              width="22"
              height="8"
              rx="2"
              fill="url(#dbx-fin-gold)"
              stroke="#b45309"
              strokeWidth="1.4"
            />
          ))
        )}
        <ellipse cx="124" cy="110" rx="13" ry="5" fill="url(#dbx-fin-gold)" stroke="#b45309" strokeWidth="1.4" />
        <circle cx="120" cy="104" r="5" fill="#fde68a" stroke="#b45309" strokeWidth="1.2" />
      </g>
    </motion.g>
  );
}

/** Leadership citadel — minimal towers. */
export function DragonBoxCitadel() {
  return (
    <g className="iq-dragonbox-landmark iq-dragonbox-landmark--management">
      <ellipse cx="80" cy="118" rx="56" ry="8" fill="#0f172a" opacity="0.06" />
      <rect x="24" y="88" width="112" height="22" rx="6" fill="#bfdbfe" />
      <rect x="34" y="52" width="28" height="36" rx="4" fill="#93c5fd" />
      <rect x="66" y="36" width="28" height="52" rx="4" fill="#60a5fa" />
      <rect x="98" y="52" width="28" height="36" rx="4" fill="#93c5fd" />
      <polygon points="48,52 48,44 54,36 60,44 60,52" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
      <polygon points="80,36 80,26 86,18 92,26 92,36" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
      <polygon points="112,52 112,44 118,36 124,44 124,52" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
    </g>
  );
}

/** Central hub — elegant hex pedestal. */
export function DragonBoxHubMonolith() {
  return (
    <g className="iq-dragonbox-landmark iq-dragonbox-landmark--hub">
      <ellipse cx="72" cy="108" rx="44" ry="7" fill="#0f172a" opacity="0.07" />
      <polygon
        points="72,14 108,34 108,74 72,94 36,74 36,34"
        fill="#ede9fe"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon
        points="72,28 94,40 94,68 72,80 50,68 50,40"
        fill="#f5f3ff"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text
        x="72"
        y="62"
        textAnchor="middle"
        fontSize="18"
        fontWeight="600"
        fill="#6d28d9"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        10K
      </text>
    </g>
  );
}
