"use client";

/**
 * Chunky low-poly Roblox-style landmarks for the Schools map preview.
 */

import { motion } from "framer-motion";
import { polarPoint } from "@/lib/schools/svgCoords";

const RBX_STROKE = "#1e1e1e";

function RbxShadow({ w = 200 }: { w?: number }) {
  return (
    <ellipse cx={w / 2} cy={4} rx={w * 0.4} ry={w * 0.07} fill="#000" opacity="0.22" />
  );
}

function RbxStud({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="5" fill="#15803d" stroke={RBX_STROKE} strokeWidth="1.5" />
      <circle r="2.5" cy="-1" fill="#4ade80" opacity="0.7" />
    </g>
  );
}

/** Business district — office tower + small shops + road. */
export function RobloxBusinessDistrict() {
  return (
    <g className="iq-roblox-landmark iq-roblox-landmark--business">
      <g transform="translate(0, 155)">
        <RbxShadow w={250} />
      </g>
      {/* Road */}
      <rect x="8" y="142" width="244" height="18" rx="2" fill="#6b7280" stroke={RBX_STROKE} strokeWidth="2.5" />
      <rect x="20" y="148" width="220" height="4" fill="#fbbf24" opacity="0.9" />
      {/* Shop left */}
      <rect x="16" y="108" width="52" height="34" fill="#fb923c" stroke={RBX_STROKE} strokeWidth="2.5" />
      <rect x="22" y="114" width="18" height="14" fill="#fef08a" stroke={RBX_STROKE} strokeWidth="1.5" />
      <rect x="44" y="114" width="18" height="14" fill="#fef08a" stroke={RBX_STROKE} strokeWidth="1.5" />
      {/* Shop right */}
      <rect x="192" y="112" width="48" height="30" fill="#f472b6" stroke={RBX_STROKE} strokeWidth="2.5" />
      <rect x="200" y="118" width="32" height="18" fill="#fbcfe8" stroke={RBX_STROKE} strokeWidth="1.5" />
      {/* Main tower */}
      <rect x="88" y="36" width="72" height="106" fill="#38bdf8" stroke={RBX_STROKE} strokeWidth="3" />
      <rect x="94" y="42" width="60" height="94" fill="#7dd3fc" stroke={RBX_STROKE} strokeWidth="2" />
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 3 }).map((__, col) => (
          <rect
            key={`${row}-${col}`}
            x={100 + col * 18}
            y={50 + row * 14}
            width="12"
            height="10"
            fill="#e0f2fe"
            stroke={RBX_STROKE}
            strokeWidth="1"
          />
        ))
      )}
      <rect x="80" y="28" width="88" height="12" fill="#facc15" stroke={RBX_STROKE} strokeWidth="2.5" />
      <polygon points="124,12 156,28 92,28" fill="#fde047" stroke={RBX_STROKE} strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  );
}

/** Risk zone — radar + warning beacon + storm. */
export function RobloxRiskZone() {
  return (
    <g className="iq-roblox-landmark iq-roblox-landmark--risks">
      <g transform="translate(0, 150)">
        <RbxShadow w={230} />
      </g>
      {/* Danger platform */}
      <rect x="20" y="118" width="200" height="28" rx="4" fill="#ef4444" stroke={RBX_STROKE} strokeWidth="2.5" />
      {/* Radar pole */}
      <rect x="118" y="68" width="10" height="50" fill="#9ca3af" stroke={RBX_STROKE} strokeWidth="2" />
      {/* Dish */}
      <path
        d="M48 72 A72 72 0 0 1 198 72 L178 72 A52 52 0 0 0 68 72 Z"
        fill="#f3f4f6"
        stroke={RBX_STROKE}
        strokeWidth="2.5"
      />
      <line x1="123" y1="72" x2="168" y2="38" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
      {/* Warning beacon */}
      <rect x="36" y="88" width="20" height="30" fill="#374151" stroke={RBX_STROKE} strokeWidth="2" />
      <circle cx="46" cy="82" r="14" fill="#ef4444" stroke={RBX_STROKE} strokeWidth="2.5" className="iq-roblox-landmark__beacon" />
      {/* Storm cloud */}
      <ellipse cx="180" cy="42" rx="34" ry="18" fill="#6b7280" stroke={RBX_STROKE} strokeWidth="2" className="iq-roblox-landmark__storm" />
      <ellipse cx="162" cy="48" rx="22" ry="14" fill="#9ca3af" stroke={RBX_STROKE} strokeWidth="1.5" />
      <path d="M172 58 L168 72 L180 64 L176 78" fill="#fbbf24" stroke={RBX_STROKE} strokeWidth="1.5" className="iq-roblox-landmark__lightning" />
    </g>
  );
}

/** Financial vault — treasury + gold bars (premium 2D game object). */
export function RobloxFinancialVault() {
  const doorCx = 124;
  const doorCy = 96;
  const doorR = 42;
  const bolts = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <motion.g
      className="iq-roblox-landmark iq-roblox-landmark--financial"
      style={{ pointerEvents: "none" }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="rbx-fin-wall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <radialGradient id="rbx-fin-door" cx="0.38" cy="0.32" r="0.78">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="55%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1f2937" />
        </radialGradient>
        <linearGradient id="rbx-fin-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <radialGradient id="rbx-fin-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the vault */}
      <motion.ellipse
        cx={doorCx}
        cy="96"
        rx="146"
        ry="104"
        fill="url(#rbx-fin-glow)"
        animate={{ opacity: [0.5, 0.82, 0.5], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      <g transform="translate(0, 158)">
        <RbxShadow w={260} />
      </g>
      {/* Ground shadow */}
      <ellipse cx={doorCx} cy="160" rx="112" ry="15" fill="#000" opacity="0.26" />

      <g className="iq-vault-react">
        {/* Vault body — chunky rounded metal panels + thick outline */}
        <rect x="18" y="40" width="212" height="116" rx="16" fill="url(#rbx-fin-wall)" stroke={RBX_STROKE} strokeWidth="5" />
        <rect x="30" y="52" width="188" height="92" rx="10" fill="#9ca3af" stroke={RBX_STROKE} strokeWidth="3" />
        {/* Treasury roof */}
        <rect x="12" y="30" width="224" height="14" rx="3" fill="#22c55e" stroke={RBX_STROKE} strokeWidth="3" />
        {/* Metallic highlight streak */}
        <path d="M40 56 L86 56 L58 140 L34 140 Z" fill="#ffffff" opacity="0.16" />
        <path d="M98 54 L112 54 L84 142 L70 142 Z" fill="#ffffff" opacity="0.08" />

        {/* Gold corner plates */}
        {[
          [24, 46],
          [200, 46],
          [24, 130],
          [200, 130]
        ].map(([x, y]) => (
          <g key={`rbx-corner-${x}-${y}`}>
            <rect x={x} y={y} width="20" height="20" rx="4" fill="url(#rbx-fin-gold)" stroke={RBX_STROKE} strokeWidth="2.5" />
            <circle cx={x + 10} cy={y + 10} r="2.6" fill="#fffbeb" stroke={RBX_STROKE} strokeWidth="1" />
          </g>
        ))}

        {/* Side hinges */}
        {[64, 116].map((y) => (
          <g key={`rbx-hinge-${y}`}>
            <rect x="8" y={y} width="20" height="20" rx="4" fill="#4b5563" stroke={RBX_STROKE} strokeWidth="2.5" />
            <circle cx="18" cy={y + 6} r="2.4" fill="#d1d5db" />
            <circle cx="18" cy={y + 14} r="2.4" fill="#d1d5db" />
          </g>
        ))}

        {/* Bolts around the door */}
        {bolts.map((deg) => {
          const pt = polarPoint(doorCx, doorCy, doorR + 6, deg);
          return (
            <circle
              key={`rbx-bolt-${deg}`}
              cx={pt.x}
              cy={pt.y}
              r="3.4"
              fill="#d1d5db"
              stroke={RBX_STROKE}
              strokeWidth="1.8"
            />
          );
        })}

        {/* Circular vault door + inner rings */}
        <circle cx={doorCx} cy={doorCy} r={doorR} fill="url(#rbx-fin-door)" stroke={RBX_STROKE} strokeWidth="4" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 8} fill="none" stroke="#e5e7eb" strokeWidth="2.5" opacity="0.6" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 16} fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.85" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 24} fill="#374151" stroke={RBX_STROKE} strokeWidth="2" />

        {/* Wheel spokes */}
        {spokes.map((deg) => {
          const inner = polarPoint(doorCx, doorCy, 8, deg);
          const outer = polarPoint(doorCx, doorCy, doorR - 12, deg);
          return (
            <line
              key={`rbx-spoke-${deg}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#d1d5db"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Central handle hub */}
        <circle cx={doorCx} cy={doorCy} r="10" fill="#1f2937" stroke="url(#rbx-fin-gold)" strokeWidth="3.5" />
        <circle cx={doorCx} cy={doorCy} r="3" fill="#fde047" />

        {/* Gold bar stacks near the base */}
        {[
          { x: 42, y: 144, n: 3 },
          { x: 186, y: 142, n: 3 },
          { x: 68, y: 154, n: 2 }
        ].map((s) =>
          Array.from({ length: s.n }).map((_, i) => (
            <g key={`rbx-bar-${s.x}-${i}`}>
              <rect
                x={s.x}
                y={s.y - i * 8}
                width="30"
                height="12"
                rx="2"
                fill="url(#rbx-fin-gold)"
                stroke={RBX_STROKE}
                strokeWidth="2"
              />
              <rect x={s.x + 3} y={s.y - i * 8 + 2.5} width="24" height="3" rx="1" fill="#fffbeb" opacity="0.75" />
            </g>
          ))
        )}

        {/* Coin piles near the base */}
        <ellipse cx="208" cy="158" rx="19" ry="7" fill="url(#rbx-fin-gold)" stroke={RBX_STROKE} strokeWidth="2" />
        <ellipse cx="201" cy="151" rx="14" ry="6" fill="url(#rbx-fin-gold)" stroke={RBX_STROKE} strokeWidth="1.8" />
        <circle cx="198" cy="143" r="6.5" fill="#fde047" stroke={RBX_STROKE} strokeWidth="1.8" />
        <circle cx="198" cy="143" r="2.6" fill="#fffbeb" opacity="0.85" />
      </g>
    </motion.g>
  );
}

/** Management castle — blocky castle + crown monument. */
export function RobloxManagementCastle() {
  return (
    <g className="iq-roblox-landmark iq-roblox-landmark--management">
      <g transform="translate(0, 158)">
        <RbxShadow w={250} />
      </g>
      {/* Base wall */}
      <rect x="28" y="100" width="196" height="48" fill="#94a3b8" stroke={RBX_STROKE} strokeWidth="2.5" />
      {/* Towers */}
      <rect x="36" y="56" width="44" height="44" fill="#60a5fa" stroke={RBX_STROKE} strokeWidth="2.5" />
      <rect x="172" y="56" width="44" height="44" fill="#60a5fa" stroke={RBX_STROKE} strokeWidth="2.5" />
      <rect x="96" y="40" width="60" height="60" fill="#3b82f6" stroke={RBX_STROKE} strokeWidth="3" />
      {/* Battlements */}
      {[36, 52, 68, 172, 188, 204, 96, 112, 128, 144].map((x, i) => (
        <rect key={i} x={x} y={i < 6 ? 48 : 32} width="12" height="12" fill="#bfdbfe" stroke={RBX_STROKE} strokeWidth="1.5" />
      ))}
      {/* Crown monument */}
      <polygon
        points="124,18 132,34 148,34 136,44 140,60 124,50 108,60 112,44 100,34 116,34"
        fill="#facc15"
        stroke={RBX_STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="iq-roblox-landmark__crown"
      />
      {/* Door */}
      <rect x="112" y="116" width="28" height="32" fill="#1e3a8a" stroke={RBX_STROKE} strokeWidth="2" />
    </g>
  );
}

/** Central spawn plaza + IQ shield. */
export function RobloxHubPlaza() {
  return (
    <g className="iq-roblox-landmark iq-roblox-landmark--hub">
      <g transform="translate(0, 128)">
        <RbxShadow w={200} />
      </g>
      {/* Plaza tiles */}
      <rect x="20" y="88" width="144" height="36" rx="4" fill="#a78bfa" stroke={RBX_STROKE} strokeWidth="2.5" />
      <RbxStud x={36} y={96} />
      <RbxStud x={68} y={96} />
      <RbxStud x={100} y={96} />
      <RbxStud x={132} y={96} />
      {/* Shield pedestal */}
      <rect x="68" y="72" width="48" height="18" fill="#7c3aed" stroke={RBX_STROKE} strokeWidth="2" />
      <path
        d="M92 16 L124 30 V62 C124 82 108 96 92 102 C76 96 60 82 60 62 V30 Z"
        fill="#8b5cf6"
        stroke={RBX_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        className="iq-roblox-landmark__hub-shield"
      />
      <path
        d="M92 28 L112 38 V60 C112 74 102 84 92 88 C82 84 72 74 72 60 V38 Z"
        fill="#c4b5fd"
        stroke={RBX_STROKE}
        strokeWidth="2"
      />
      <text x="92" y="62" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fef08a" stroke={RBX_STROKE} strokeWidth="0.8">
        10K
      </text>
      {/* Spawn arrows */}
      <polygon points="92,108 84,120 100,120" fill="#fde047" stroke={RBX_STROKE} strokeWidth="1.5" />
    </g>
  );
}
