"use client";

/**
 * Legends of Learning–style adventure landmarks — vibrant educational game art.
 */

import { motion } from "framer-motion";
import { polarPoint } from "@/lib/schools/svgCoords";

function IslandRock({ w = 220, color = "#78716c" }: { w?: number; color?: string }) {
  return (
    <g>
      <ellipse cx={w / 2} cy={8} rx={w * 0.38} ry={w * 0.06} fill="#000" opacity="0.2" />
      <path
        d={`M${w * 0.12} 8 Q${w * 0.08} 28 ${w * 0.18} 42 L${w * 0.82} 42 Q${w * 0.92} 28 ${w * 0.88} 8 Z`}
        fill={color}
        stroke="#57534e"
        strokeWidth="2"
      />
    </g>
  );
}

/** Corporate city district on a floating campus. */
export function LegendsBusinessCity() {
  return (
    <g className="iq-legends-landmark iq-legends-landmark--business">
      <g transform="translate(0, 148)">
        <IslandRock w={260} color="#a8a29e" />
      </g>
      <ellipse cx="130" cy="142" rx="118" ry="22" fill="#fde68a" stroke="#d97706" strokeWidth="3" />
      {/* Campus road */}
      <rect x="24" y="128" width="212" height="12" rx="4" fill="#94a3b8" opacity="0.85" />
      {/* Glass towers */}
      <rect x="48" y="52" width="44" height="76" rx="4" fill="#38bdf8" stroke="#1d4ed8" strokeWidth="2.5" />
      <rect x="54" y="58" width="32" height="64" fill="#7dd3fc" opacity="0.9" />
      {[58, 70, 82].map((y) => (
        <rect key={y} x="58" y={y} width="24" height="6" rx="1" fill="#e0f2fe" opacity="0.85" />
      ))}
      <rect x="108" y="32" width="52" height="96" rx="5" fill="#0ea5e9" stroke="#0369a1" strokeWidth="3" />
      <rect x="116" y="40" width="36" height="80" fill="#bae6fd" />
      <rect x="168" y="64" width="40" height="64" rx="4" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
      <polygon points="134,24 156,32 112,32" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      {/* Small office */}
      <rect x="196" y="88" width="36" height="40" rx="3" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
    </g>
  );
}

/** Radar station with storm and warning beacon. */
export function LegendsRiskStation() {
  return (
    <g className="iq-legends-landmark iq-legends-landmark--risks">
      <g transform="translate(0, 145)">
        <IslandRock w={250} color="#78716c" />
      </g>
      <ellipse cx="125" cy="138" rx="108" ry="20" fill="#fda4af" stroke="#e11d48" strokeWidth="3" />
      <rect x="118" y="72" width="14" height="66" fill="#64748b" stroke="#334155" strokeWidth="2" />
      <path
        d="M36 78 A88 88 0 0 1 214 78 L196 78 A70 70 0 0 0 54 78 Z"
        fill="#f1f5f9"
        stroke="#e11d48"
        strokeWidth="3"
      />
      <line x1="125" y1="78" x2="178" y2="42" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <circle cx="178" cy="42" r="7" fill="#fef08a" stroke="#ef4444" strokeWidth="2" />
      {/* Beacon */}
      <rect x="42" y="92" width="22" height="36" fill="#475569" stroke="#1e293b" strokeWidth="2" rx="2" />
      <circle cx="53" cy="84" r="16" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" className="iq-legends-landmark__beacon" />
      {/* Storm */}
      <ellipse cx="190" cy="38" rx="38" ry="20" fill="#64748b" stroke="#334155" strokeWidth="2" className="iq-legends-landmark__storm" />
      <path d="M182 52 L176 68 L190 58 L184 76" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" className="iq-legends-landmark__bolt" />
    </g>
  );
}

/** Treasury vault with gold reserves — premium 2D game object. */
export function LegendsFinancialVault() {
  const doorCx = 135;
  const doorCy = 92;
  const doorR = 44;
  const bolts = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <motion.g
      className="iq-legends-landmark iq-legends-landmark--financial"
      style={{ pointerEvents: "none" }}
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="leg-fin-wall" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#7c8aa0" />
          <stop offset="100%" stopColor="#3f4a5c" />
        </linearGradient>
        <radialGradient id="leg-fin-door" cx="0.38" cy="0.32" r="0.78">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="55%" stopColor="#5b6678" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
        <linearGradient id="leg-fin-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <radialGradient id="leg-fin-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the vault */}
      <motion.ellipse
        cx={doorCx}
        cy="92"
        rx="150"
        ry="104"
        fill="url(#leg-fin-glow)"
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.97, 1.04, 0.97] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      <g transform="translate(0, 152)">
        <IslandRock w={270} color="#6b7280" />
      </g>
      <ellipse cx={doorCx} cy="148" rx="124" ry="22" fill="#86efac" stroke="#059669" strokeWidth="4" />
      {/* Ground shadow */}
      <ellipse cx={doorCx} cy="150" rx="98" ry="13" fill="#064e3b" opacity="0.28" />

      <g className="iq-vault-react">
        {/* Vault body — rounded metal panels + thick cartoon outline */}
        <rect x="24" y="36" width="222" height="112" rx="20" fill="url(#leg-fin-wall)" stroke="#1e293b" strokeWidth="6" />
        <rect x="38" y="50" width="194" height="84" rx="13" fill="#94a3b8" stroke="#475569" strokeWidth="3.5" />
        {/* Metallic highlight streak */}
        <path d="M48 54 L96 54 L66 130 L40 130 Z" fill="#ffffff" opacity="0.16" />
        <path d="M110 52 L124 52 L96 132 L82 132 Z" fill="#ffffff" opacity="0.08" />
        {/* Emerald treasury cornice */}
        <rect x="20" y="28" width="230" height="14" rx="5" fill="#22c55e" stroke="#15803d" strokeWidth="3" />

        {/* Gold corner plates */}
        {[
          [30, 42],
          [216, 42],
          [30, 122],
          [216, 122]
        ].map(([x, y]) => (
          <g key={`leg-corner-${x}-${y}`}>
            <rect x={x} y={y} width="20" height="20" rx="5" fill="url(#leg-fin-gold)" stroke="#854d0e" strokeWidth="2.5" />
            <circle cx={x + 10} cy={y + 10} r="2.6" fill="#fffbeb" stroke="#854d0e" strokeWidth="1" />
          </g>
        ))}

        {/* Side hinges */}
        {[62, 116].map((y) => (
          <g key={`leg-hinge-${y}`}>
            <rect x="14" y={y} width="22" height="20" rx="5" fill="#475569" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="25" cy={y + 6} r="2.4" fill="#e2e8f0" />
            <circle cx="25" cy={y + 14} r="2.4" fill="#e2e8f0" />
          </g>
        ))}

        {/* Bolts around the door */}
        {bolts.map((deg) => {
          const pt = polarPoint(doorCx, doorCy, doorR + 6, deg);
          return (
            <circle
              key={`leg-bolt-${deg}`}
              cx={pt.x}
              cy={pt.y}
              r="3.3"
              fill="#e2e8f0"
              stroke="#1e293b"
              strokeWidth="1.6"
            />
          );
        })}

        {/* Circular vault door + inner rings */}
        <circle cx={doorCx} cy={doorCy} r={doorR} fill="url(#leg-fin-door)" stroke="#0f172a" strokeWidth="5" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 8} fill="none" stroke="#e2e8f0" strokeWidth="2.5" opacity="0.55" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 16} fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.85" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 24} fill="#334155" stroke="#0f172a" strokeWidth="2" />

        {/* Wheel spokes */}
        {spokes.map((deg) => {
          const inner = polarPoint(doorCx, doorCy, 8, deg);
          const outer = polarPoint(doorCx, doorCy, doorR - 12, deg);
          return (
            <line
              key={`leg-spoke-${deg}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#cbd5e1"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Central handle hub */}
        <circle cx={doorCx} cy={doorCy} r="10" fill="#1e293b" stroke="url(#leg-fin-gold)" strokeWidth="3.5" />
        <circle cx={doorCx} cy={doorCy} r="3" fill="#fde047" />

        {/* Gold bar stacks near the base */}
        {[
          { x: 44, y: 132, n: 3 },
          { x: 190, y: 130, n: 3 },
          { x: 70, y: 142, n: 2 }
        ].map((stack) =>
          Array.from({ length: stack.n }).map((_, i) => (
            <g key={`leg-bar-${stack.x}-${i}`}>
              <rect
                x={stack.x}
                y={stack.y - i * 8}
                width="30"
                height="11"
                rx="2.5"
                fill="url(#leg-fin-gold)"
                stroke="#854d0e"
                strokeWidth="1.8"
              />
              <rect x={stack.x + 3} y={stack.y - i * 8 + 2} width="24" height="2.5" rx="1.2" fill="#fffbeb" opacity="0.7" />
            </g>
          ))
        )}

        {/* Coin piles near the base */}
        <ellipse cx="214" cy="146" rx="19" ry="7" fill="url(#leg-fin-gold)" stroke="#854d0e" strokeWidth="1.8" />
        <ellipse cx="207" cy="139" rx="14" ry="6" fill="url(#leg-fin-gold)" stroke="#854d0e" strokeWidth="1.5" />
        <circle cx="204" cy="131" r="6.5" fill="#fde047" stroke="#854d0e" strokeWidth="1.5" />
        <circle cx="204" cy="131" r="2.6" fill="#fffbeb" opacity="0.85" />
      </g>
    </motion.g>
  );
}

/** Leadership citadel with crown monument. */
export function LegendsManagementCitadel() {
  return (
    <g className="iq-legends-landmark iq-legends-landmark--management">
      <g transform="translate(0, 152)">
        <IslandRock w={265} color="#7c6f9a" />
      </g>
      <ellipse cx="132" cy="145" rx="115" ry="22" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="3" />
      <rect x="32" y="108" width="200" height="36" fill="#94a3b8" stroke="#475569" strokeWidth="2.5" rx="4" />
      <rect x="44" y="64" width="48" height="44" fill="#818cf8" stroke="#4338ca" strokeWidth="2.5" rx="3" />
      <rect x="108" y="44" width="56" height="64" fill="#6366f1" stroke="#3730a3" strokeWidth="3" rx="4" />
      <rect x="172" y="64" width="48" height="44" fill="#818cf8" stroke="#4338ca" strokeWidth="2.5" rx="3" />
      <polygon points="60,64 68,48 76,64" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
      <polygon points="136,44 136,26 148,36 124,36" fill="#fde047" stroke="#ca8a04" strokeWidth="2" className="iq-legends-landmark__crown" />
      <polygon points="196,64 204,48 212,64" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
      <rect x="120" y="118" width="24" height="26" fill="#312e81" stroke="#1e1b4b" strokeWidth="2" rx="2" />
    </g>
  );
}

/** Central command hub — spawn shield plaza. */
export function LegendsHubCommand() {
  return (
    <g className="iq-legends-landmark iq-legends-landmark--hub">
      <g transform="translate(0, 132)">
        <IslandRock w={210} color="#8b5cf6" />
      </g>
      <ellipse cx="105" cy="124" rx="88" ry="18" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="105" cy="118" r="6" fill="#fde047" className="iq-legends-landmark__spawn-ring" />
      <path
        d="M105 18 L148 38 V78 C148 100 128 118 105 126 C82 118 62 100 62 78 V38 Z"
        fill="#8b5cf6"
        stroke="#5b21b6"
        strokeWidth="3"
        strokeLinejoin="round"
        className="iq-legends-landmark__shield"
      />
      <path
        d="M105 32 L132 46 V72 C132 88 120 100 105 106 C90 100 78 88 78 72 V46 Z"
        fill="#c4b5fd"
        stroke="#6d28d9"
        strokeWidth="2"
      />
      <text x="105" y="78" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fef08a" stroke="#713f12" strokeWidth="0.6">
        10K
      </text>
      {/* Command pillars */}
      <rect x="38" y="96" width="12" height="28" rx="2" fill="#a78bfa" stroke="#5b21b6" strokeWidth="1.5" />
      <rect x="160" y="96" width="12" height="28" rx="2" fill="#a78bfa" stroke="#5b21b6" strokeWidth="1.5" />
    </g>
  );
}
