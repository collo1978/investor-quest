"use client";

/**
 * Stylized overworld landmarks for the cartoon Schools map preview.
 * Rich layered SVG — isometric game-art feel without raster assets.
 */

import { motion } from "framer-motion";
import { polarPoint } from "@/lib/schools/svgCoords";

function LandmarkShadow({ w = 200 }: { w?: number }) {
  return (
    <ellipse
      cx={w / 2}
      cy={0}
      rx={w * 0.42}
      ry={w * 0.08}
      fill="#000"
      opacity="0.18"
    />
  );
}

/** Corporate HQ + business district cluster. */
export function BusinessDistrictLandmark() {
  return (
    <g className="iq-cartoon-landmark iq-cartoon-landmark--business">
      <defs>
        <linearGradient id="biz-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="45%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="biz-glass-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="biz-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f4" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
        <linearGradient id="biz-gold-trim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 168)">
        <LandmarkShadow w={260} />
      </g>
      {/* Plaza */}
      <path d="M20 155 L240 155 L252 168 L8 168 Z" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="2" />
      {/* Wing building left */}
      <path d="M24 118 L24 92 L78 78 L78 118 Z" fill="url(#biz-stone)" stroke="#78716c" strokeWidth="2" />
      <path d="M30 118 L30 98 L72 88 L72 118 Z" fill="url(#biz-glass-dark)" opacity="0.85" />
      {[34, 46, 58].map((x) => (
        <rect key={x} x={x} y={102} width="8" height="10" rx="1" fill="#fef08a" opacity="0.9" />
      ))}
      {/* Main HQ tower */}
      <path d="M98 52 L98 118 L182 118 L182 52 Z" fill="url(#biz-glass-dark)" stroke="#1e3a8a" strokeWidth="2.5" />
      <path d="M104 58 L104 112 L176 112 L176 58 Z" fill="url(#biz-glass)" />
      {/* Window grid */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 4 }).map((__, col) => (
          <rect
            key={`${row}-${col}`}
            x={112 + col * 16}
            y={64 + row * 10}
            width="10"
            height="7"
            rx="1"
            fill={row % 2 === col % 2 ? "#eff6ff" : "#93c5fd"}
            opacity="0.95"
          />
        ))
      )}
      {/* Crown / HQ cap */}
      <path d="M92 52 L140 28 L188 52 Z" fill="url(#biz-gold-trim)" stroke="#b45309" strokeWidth="2" />
      <rect x="134" y="18" width="12" height="14" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
      {/* Right annex */}
      <path d="M188 108 L188 86 L232 74 L232 108 Z" fill="url(#biz-stone)" stroke="#78716c" strokeWidth="2" />
      <path d="M194 108 L194 92 L226 84 L226 108 Z" fill="#64748b" />
      {/* Entrance */}
      <path d="M128 118 L128 138 L152 138 L152 118 Z" fill="#292524" />
      <path d="M120 138 L160 138 L166 148 L114 148 Z" fill="url(#biz-gold-trim)" stroke="#b45309" strokeWidth="1.5" />
      {/* Flag */}
      <path d="M210 70 V38" stroke="#57534e" strokeWidth="3" />
      <path d="M210 38 L248 46 L210 54 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
      {/* Planters */}
      <ellipse cx="44" cy="152" rx="14" ry="6" fill="#65a30d" />
      <ellipse cx="216" cy="152" rx="14" ry="6" fill="#65a30d" />
    </g>
  );
}

/** Radar station with warning lights. */
export function RiskRadarLandmark() {
  return (
    <g className="iq-cartoon-landmark iq-cartoon-landmark--risk">
      <defs>
        <linearGradient id="risk-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <radialGradient id="risk-dish" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <linearGradient id="risk-bunker" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#78716c" />
          <stop offset="100%" stopColor="#44403c" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 168)">
        <LandmarkShadow w={250} />
      </g>
      {/* Perimeter fence */}
      <path d="M12 148 L248 148" stroke="#57534e" strokeWidth="3" />
      {[20, 60, 100, 140, 180, 220].map((x) => (
        <g key={x}>
          <rect x={x} y={132} width="4" height="18" fill="#78716c" />
          <path d={`M${x - 4} 136 H${x + 8}`} stroke="#ef4444" strokeWidth="2" />
        </g>
      ))}
      {/* Bunker base */}
      <path d="M68 118 L68 96 L188 88 L188 118 Z" fill="url(#risk-bunker)" stroke="#292524" strokeWidth="2" />
      <rect x="78" y="102" width="18" height="12" rx="2" fill="#fbbf24" opacity="0.85" />
      <rect x="160" y="100" width="14" height="10" rx="2" fill="#1e293b" />
      {/* Mast */}
      <path d="M128 88 V42" stroke="url(#risk-metal)" strokeWidth="7" strokeLinecap="round" />
      {/* Radar dish */}
      <ellipse cx="128" cy="38" rx="58" ry="30" fill="url(#risk-dish)" stroke="#dc2626" strokeWidth="3" />
      <ellipse cx="128" cy="38" rx="42" ry="20" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.7" />
      <path d="M128 38 L178 18" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
      <circle cx="128" cy="38" r="7" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
      {/* Warning beacons */}
      <g className="iq-cartoon-landmark__beacon">
        <rect x="46" y="108" width="16" height="22" rx="3" fill="#44403c" />
        <circle cx="54" cy="104" r="8" fill="#ef4444" className="iq-cartoon-landmark__warning-light" />
      </g>
      <g className="iq-cartoon-landmark__beacon">
        <rect x="194" y="108" width="16" height="22" rx="3" fill="#44403c" />
        <circle cx="202" cy="104" r="8" fill="#ef4444" className="iq-cartoon-landmark__warning-light iq-cartoon-landmark__warning-light--delay" />
      </g>
      {/* Caution stripes */}
      <path d="M98 128 H158" stroke="#fbbf24" strokeWidth="8" strokeDasharray="10 8" />
    </g>
  );
}

/** Treasury vault with gold reserves — premium 2D game object. */
export function FinancialVaultLandmark() {
  const doorCx = 131;
  const doorCy = 104;
  const doorR = 46;
  const bolts = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <motion.g
      className="iq-cartoon-landmark iq-cartoon-landmark--financial"
      style={{ pointerEvents: "none" }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="fin-wall" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="fin-panel" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="fin-door-radial" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="55%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
        <linearGradient id="fin-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="fin-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the vault */}
      <motion.ellipse
        cx={doorCx}
        cy="100"
        rx="150"
        ry="104"
        fill="url(#fin-glow)"
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Ground shadow */}
      <ellipse cx={doorCx} cy="176" rx="124" ry="18" fill="#0f172a" opacity="0.26" />

      <g className="iq-vault-react">
        {/* Vault body — rounded metal panels + thick cartoon outline */}
        <rect x="16" y="40" width="230" height="126" rx="20" fill="url(#fin-wall)" stroke="#1f2937" strokeWidth="6" />
        <rect x="30" y="54" width="202" height="98" rx="13" fill="url(#fin-panel)" stroke="#334155" strokeWidth="3.5" />
        {/* Panel seams */}
        <line x1="131" y1="56" x2="131" y2="150" stroke="#475569" strokeWidth="1.5" opacity="0.5" />
        {/* Metallic highlight streak */}
        <path d="M40 60 L92 60 L60 150 L34 150 Z" fill="#ffffff" opacity="0.14" />
        <path d="M104 58 L120 58 L92 152 L78 152 Z" fill="#ffffff" opacity="0.08" />

        {/* Gold corner plates */}
        {[
          [22, 46],
          [212, 46],
          [22, 142],
          [212, 142]
        ].map(([x, y]) => (
          <g key={`corner-${x}-${y}`}>
            <rect x={x} y={y} width="20" height="20" rx="5" fill="url(#fin-gold)" stroke="#92400e" strokeWidth="2.5" />
            <circle cx={x + 10} cy={y + 10} r="2.6" fill="#fffbeb" stroke="#92400e" strokeWidth="1" />
          </g>
        ))}

        {/* Side hinges */}
        {[70, 138].map((y) => (
          <g key={`hinge-${y}`}>
            <rect x="8" y={y} width="22" height="20" rx="5" fill="#52525b" stroke="#1f2937" strokeWidth="2.5" />
            <circle cx="19" cy={y + 6} r="2.4" fill="#cbd5e1" />
            <circle cx="19" cy={y + 14} r="2.4" fill="#cbd5e1" />
          </g>
        ))}

        {/* Bolts around the door */}
        {bolts.map((deg) => {
          const pt = polarPoint(doorCx, doorCy, doorR + 6, deg);
          return (
            <circle
              key={`bolt-${deg}`}
              cx={pt.x}
              cy={pt.y}
              r="3.4"
              fill="#cbd5e1"
              stroke="#1e293b"
              strokeWidth="1.6"
            />
          );
        })}

        {/* Circular vault door + inner rings */}
        <circle cx={doorCx} cy={doorCy} r={doorR} fill="url(#fin-door-radial)" stroke="#0f172a" strokeWidth="5" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 8} fill="none" stroke="#e2e8f0" strokeWidth="2.5" opacity="0.55" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 17} fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 25} fill="#334155" stroke="#0f172a" strokeWidth="2" />

        {/* Wheel spokes */}
        {spokes.map((deg) => {
          const inner = polarPoint(doorCx, doorCy, 9, deg);
          const outer = polarPoint(doorCx, doorCy, doorR - 12, deg);
          return (
            <line
              key={`spoke-${deg}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#475569"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Central handle hub */}
        <circle cx={doorCx} cy={doorCy} r="10" fill="#1e293b" stroke="url(#fin-gold)" strokeWidth="3.5" />
        <circle cx={doorCx} cy={doorCy} r="3" fill="#fde68a" />

        {/* Gold bar stacks near the base */}
        {[
          { x: 40, y: 150, n: 3 },
          { x: 196, y: 148, n: 3 },
          { x: 64, y: 162, n: 2 }
        ].map((stack) =>
          Array.from({ length: stack.n }).map((_, i) => (
            <g key={`bar-${stack.x}-${i}`}>
              <rect
                x={stack.x}
                y={stack.y - i * 8}
                width="30"
                height="11"
                rx="2.5"
                fill="url(#fin-gold)"
                stroke="#92400e"
                strokeWidth="1.8"
              />
              <rect x={stack.x + 3} y={stack.y - i * 8 + 2} width="24" height="2.5" rx="1.2" fill="#fffbeb" opacity="0.7" />
            </g>
          ))
        )}

        {/* Coin piles near the base */}
        <ellipse cx="216" cy="166" rx="19" ry="7" fill="url(#fin-gold)" stroke="#92400e" strokeWidth="1.8" />
        <ellipse cx="209" cy="159" rx="14" ry="6" fill="url(#fin-gold)" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="206" cy="151" r="6.5" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="206" cy="151" r="2.6" fill="#fff7ed" opacity="0.8" />

        {/* Security light */}
        <rect x="210" y="48" width="12" height="10" rx="2" fill="#1e293b" />
        <circle cx="216" cy="44" r="5" fill="#38bdf8" className="iq-cartoon-landmark__security-light" />
      </g>
    </motion.g>
  );
}

/** Leadership citadel / castle. */
export function ManagementCitadelLandmark() {
  return (
    <g className="iq-cartoon-landmark iq-cartoon-landmark--management">
      <defs>
        <linearGradient id="mgmt-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="mgmt-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="mgmt-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 172)">
        <LandmarkShadow w={270} />
      </g>
      {/* Outer wall */}
      <path d="M20 128 L20 108 L240 100 L240 128 Z" fill="url(#mgmt-stone)" stroke="#475569" strokeWidth="2.5" />
      {/* Main keep */}
      <rect x="72" y="72" width="116" height="56" rx="4" fill="url(#mgmt-stone)" stroke="#334155" strokeWidth="2.5" />
      {/* Towers */}
      {[
        { x: 38, h: 48 },
        { x: 198, h: 48 }
      ].map((t) => (
        <g key={t.x}>
          <rect x={t.x} y={128 - t.h} width="34" height={t.h} rx="3" fill="url(#mgmt-stone)" stroke="#334155" strokeWidth="2" />
          <path d={`M${t.x - 4} ${128 - t.h} L${t.x + 17} ${128 - t.h - 18} L${t.x + 38} ${128 - t.h} Z`} fill="url(#mgmt-roof)" stroke="#1e3a8a" strokeWidth="2" />
          <rect x={t.x + 12} y={128 - t.h + 18} width="10" height="12" rx="1" fill="#1e293b" />
        </g>
      ))}
      {/* Central spire */}
      <rect x="108" y="38" width="44" height="34" rx="3" fill="url(#mgmt-stone)" stroke="#334155" strokeWidth="2" />
      <path d="M100 38 L130 8 L160 38 Z" fill="url(#mgmt-roof)" stroke="#1e3a8a" strokeWidth="2.5" />
      {/* Crown */}
      <path
        d="M114 14 L122 2 L130 10 L138 2 L146 14 L142 18 H118 Z"
        fill="url(#mgmt-gold)"
        stroke="#b45309"
        strokeWidth="1.5"
      />
      {/* Battlements */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={78 + i * 16} y={66} width="10" height="8" rx="1" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
      ))}
      {/* Gate */}
      <path d="M118 128 L118 108 L142 108 L142 128 Z" fill="#292524" stroke="#1c1917" strokeWidth="2" />
      <path d="M110 128 H150 L158 138 L102 138 Z" fill="url(#mgmt-gold)" stroke="#b45309" strokeWidth="1.5" />
      {/* Banners */}
      <path d="M72 78 V50" stroke="#57534e" strokeWidth="2.5" />
      <path d="M72 50 L96 58 L72 66 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
      <path d="M188 78 V50" stroke="#57534e" strokeWidth="2.5" />
      <path d="M188 50 L212 58 L188 66 Z" fill="#7c3aed" stroke="#5b21b6" strokeWidth="1.5" />
    </g>
  );
}

/** Central 10K shield fortress. */
export function TenKHubFortressLandmark() {
  return (
    <g className="iq-cartoon-landmark iq-cartoon-landmark--hub">
      <defs>
        <linearGradient id="hub-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="45%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="hub-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 148)">
        <LandmarkShadow w={180} />
      </g>
      <ellipse cx="90" cy="130" rx="72" ry="18" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="3" />
      <path
        d="M90 16 L138 34 V78 C138 104 118 126 90 136 C62 126 42 104 42 78 V34 Z"
        fill="url(#hub-shield)"
        stroke="#4c1d95"
        strokeWidth="4"
      />
      <path
        d="M90 30 L122 42 V74 C122 94 108 108 90 114 C72 108 58 94 58 74 V42 Z"
        fill="#8b5cf6"
        opacity="0.35"
      />
      <circle cx="90" cy="72" r="34" fill="none" stroke="url(#hub-ring)" strokeWidth="5" opacity="0.9" />
      <text x="90" y="82" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fef3c7" stroke="#92400e" strokeWidth="1">
        10K
      </text>
      {/* Corner turrets */}
      <circle cx="54" cy="118" r="8" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2" />
      <circle cx="126" cy="118" r="8" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2" />
    </g>
  );
}

export const CARTOON_LANDMARK_PLACEMENTS = {
  business: { x: 0.13, y: 0.1, scale: 1.05 },
  forces: { x: 0.68, y: 0.08, scale: 1.05 },
  financials: { x: 0.11, y: 0.58, scale: 1.08 },
  management: { x: 0.67, y: 0.56, scale: 1.08 },
  hub: { x: 0.5, y: 0.49, scale: 0.92 }
} as const;
