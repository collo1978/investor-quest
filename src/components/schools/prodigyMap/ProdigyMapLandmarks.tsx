"use client";

/** Fantasy overworld landmarks — Prodigy / Wizard101 inspired game art. */

import { motion } from "framer-motion";
import { polarPoint } from "@/lib/schools/svgCoords";

function SoftShadow({ w = 220 }: { w?: number }) {
  return (
    <ellipse cx={w / 2} cy={0} rx={w * 0.4} ry={w * 0.07} fill="#312e81" opacity="0.22" />
  );
}

/**
 * Shared world props — keep every Prodigy landmark in the same visual
 * language (rounded premium foliage, warm lamps, soft bushes).
 */
function ProdigyTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="17" ry="5" fill="#1e1b4b" opacity="0.18" />
      <rect x="-4.5" y="-16" width="9" height="20" rx="3.5" fill="#a16207" stroke="#5c3310" strokeWidth="1.8" />
      <circle cx="0" cy="-30" r="19" fill="#15803d" stroke="#14532d" strokeWidth="2.5" />
      <circle cx="-10" cy="-24" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      <circle cx="10" cy="-26" r="12" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      <circle cx="-5" cy="-35" r="8" fill="#4ade80" opacity="0.9" />
    </g>
  );
}

function ProdigyBush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="15" ry="4" fill="#1e1b4b" opacity="0.16" />
      <circle cx="-8" cy="-4" r="9" fill="#16a34a" stroke="#15803d" strokeWidth="2" />
      <circle cx="8" cy="-4" r="9" fill="#16a34a" stroke="#15803d" strokeWidth="2" />
      <circle cx="0" cy="-9" r="11" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      <circle cx="-3" cy="-12" r="5" fill="#4ade80" opacity="0.85" />
    </g>
  );
}

function ProdigyLamp({
  x,
  y,
  s = 1,
  glow = "#fde68a"
}: {
  x: number;
  y: number;
  s?: number;
  glow?: string;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="7" ry="2.5" fill="#1e1b4b" opacity="0.2" />
      <rect x="-2.5" y="-34" width="5" height="36" rx="2.5" fill="#475569" stroke="#1e293b" strokeWidth="1.6" />
      <circle cx="0" cy="-40" r="13" fill={glow} opacity="0.22" />
      <circle cx="0" cy="-40" r="6" fill={glow} stroke="#a16207" strokeWidth="1.6" className="iq-prodigy-landmark__sparkle" />
    </g>
  );
}

/** Premium modern corporate headquarters — how the company makes money. */
export function ProdigyBusinessCityLandmark() {
  return (
    <g className="iq-prodigy-landmark iq-prodigy-landmark--business" style={{ pointerEvents: "none" }}>
      <defs>
        <linearGradient id="prod-biz-glass" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="prod-biz-glass-dk" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="prod-biz-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="prod-biz-steel" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="prod-biz-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="prod-biz-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="prod-biz-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      {/* Soft glow */}
      <motion.ellipse
        cx="128"
        cy="98"
        rx="150"
        ry="104"
        fill="url(#prod-biz-glow)"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.97, 1.04, 0.97] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Ground shadow */}
      <ellipse cx="128" cy="176" rx="128" ry="16" fill="#1e1b4b" opacity="0.26" />

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <g className="iq-vault-react">
          {/* Entrance plaza */}
          <rect x="6" y="148" width="244" height="30" rx="13" fill="url(#prod-biz-stone)" stroke="#475569" strokeWidth="4" />
          <rect x="16" y="152" width="228" height="6" rx="3" fill="#fde68a" opacity="0.55" />
          {/* Plaza steps to entrance */}
          <rect x="104" y="150" width="48" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.4" />
          <rect x="110" y="156" width="36" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.4" />

          {/* Podium connecting all buildings */}
          <rect x="28" y="116" width="200" height="38" rx="9" fill="url(#prod-biz-steel)" stroke="#1e293b" strokeWidth="4" />
          <rect x="28" y="116" width="200" height="5" rx="2.5" fill="url(#prod-biz-gold)" opacity="0.85" />

          {/* Left building */}
          <rect x="34" y="82" width="54" height="72" rx="8" fill="url(#prod-biz-glass-dk)" stroke="#1e3a8a" strokeWidth="3.5" />
          <rect x="34" y="100" width="54" height="3" fill="url(#prod-biz-gold)" opacity="0.8" />
          {/* Digital display panel — financial graph integrated */}
          <rect x="40" y="88" width="42" height="26" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <polyline
            points="44,108 51,101 57,104 64,95 71,98 78,90"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M74 90 L80 89 L78 95 Z" fill="#4ade80" />
          {[120, 136].map((wy) =>
            [42, 58, 74].map((wx) => (
              <rect key={`bizL-${wx}-${wy}`} x={wx} y={wy} width="12" height="9" rx="1.5" fill="#bae6fd" opacity="0.92" />
            ))
          )}

          {/* Right building */}
          <rect x="168" y="58" width="56" height="96" rx="8" fill="url(#prod-biz-glass-dk)" stroke="#1e3a8a" strokeWidth="3.5" />
          <rect x="168" y="76" width="56" height="3" fill="url(#prod-biz-gold)" opacity="0.8" />
          {[68, 84, 100, 116, 132].map((wy) =>
            [176, 192, 208].map((wx) => (
              <rect
                key={`bizR-${wx}-${wy}`}
                x={wx}
                y={wy}
                width="12"
                height="10"
                rx="1.5"
                fill={(wy + wx) % 2 ? "#fef9c3" : "#bae6fd"}
                className="iq-prodigy-landmark__window"
              />
            ))
          )}

          {/* Main glass tower */}
          <rect x="94" y="22" width="66" height="132" rx="9" fill="url(#prod-biz-glass)" stroke="#1e40af" strokeWidth="4" />
          {/* Glass facade highlight streak */}
          <path d="M100 28 L114 28 L104 150 L96 150 Z" fill="#ffffff" opacity="0.18" />
          {/* Mullions */}
          {[116, 138].map((mx) => (
            <line key={`mull-${mx}`} x1={mx} y1="28" x2={mx} y2="150" stroke="#ffffff" strokeWidth="1.4" opacity="0.28" />
          ))}
          {[48, 64, 80, 96, 112].map((wy) =>
            [104, 122, 140].map((wx) => (
              <rect
                key={`bizM-${wx}-${wy}`}
                x={wx}
                y={wy}
                width="12"
                height="10"
                rx="1.5"
                fill={(wy + wx) % 2 ? "#bae6fd" : "#fef9c3"}
                className="iq-prodigy-landmark__window"
              />
            ))
          )}
          {/* Rooftop + beacon */}
          <rect x="88" y="12" width="78" height="12" rx="4" fill="url(#prod-biz-steel)" stroke="#1e293b" strokeWidth="3" />
          <rect x="94" y="40" width="66" height="3.5" fill="url(#prod-biz-gold)" />
          <rect x="120" y="2" width="14" height="12" rx="3" fill="url(#prod-biz-steel)" stroke="#1e293b" strokeWidth="2" />
          <circle cx="127" cy="3" r="4" fill="#ef4444" className="iq-prodigy-landmark__beacon" />
          {/* Rooftop corporate flag */}
          <line x1="150" y1="14" x2="150" y2="-12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M150 -12 L170 -7 L150 -1 Z" fill="url(#prod-biz-gold)" stroke="#92400e" strokeWidth="1.4" strokeLinejoin="round" className="iq-prodigy-prop-flag" />
          <path d="M150 -12 L162 -8.5 L150 -5 Z" fill="#fffbeb" opacity="0.5" />

          {/* Company logo plate over entrance */}
          <circle cx="128" cy="110" r="13" fill="url(#prod-biz-steel)" stroke="#1e293b" strokeWidth="3" />
          <circle cx="128" cy="110" r="9" fill="#0f172a" />
          <polyline
            points="122,114 127,108 131,111 136,104"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M133 104 L137 103 L136 108 Z" fill="#4ade80" />

          {/* Entrance archway */}
          <ellipse
            cx="128"
            cy="148"
            rx="22"
            ry="14"
            fill="rgba(56,189,248,0.22)"
            className="iq-prodigy-landmark__entrance-glow pointer-events-none"
          />
          <path
            d="M116 154 V136 a12 12 0 0 1 24 0 V154 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="2"
            className="iq-prodigy-landmark__entrance-door"
          />
          <line x1="128" y1="136" x2="128" y2="154" stroke="#334155" strokeWidth="1.6" />

          {/* Small fountain */}
          <g className="iq-prodigy-prop iq-prodigy-prop--fountain iq-prodigy-prop-fountain">
            <ellipse cx="64" cy="166" rx="20" ry="8" fill="url(#prod-biz-water)" stroke="#0e7490" strokeWidth="3" />
            <ellipse cx="64" cy="164" rx="12" ry="4.5" fill="#cffafe" opacity="0.8" />
            <path
              d="M64 161 C60 153 60 150 64 146 C68 150 68 153 64 161"
              fill="#a5f3fc"
              opacity="0.85"
              className="iq-prodigy-prop-fountain__jet"
            />
            <circle cx="64" cy="146" r="2.6" fill="#e0f7ff" className="iq-prodigy-landmark__sparkle" />
          </g>

          {/* Landscaping + lighting */}
          <g className="iq-prodigy-landmark__tree">
            <ProdigyTree x={20} y={158} s={0.78} />
          </g>
          <g className="iq-prodigy-landmark__tree">
            <ProdigyTree x={240} y={160} s={0.82} />
          </g>
          <g className="iq-prodigy-landmark__bush">
            <ProdigyBush x={186} y={166} s={0.7} />
          </g>
          <g className="iq-prodigy-landmark__lamp">
            <ProdigyLamp x={100} y={158} s={0.62} />
          </g>
          <g className="iq-prodigy-landmark__lamp">
            <ProdigyLamp x={156} y={158} s={0.62} />
          </g>

          {/* Sparkles */}
          <circle cx="150" cy="14" r="4" fill="#fef08a" className="iq-prodigy-landmark__sparkle" />
          <circle cx="44" cy="74" r="3.2" fill="#fef08a" className="iq-prodigy-landmark__sparkle iq-prodigy-landmark__sparkle--delay" />
        </g>
      </motion.g>
    </g>
  );
}

/** Premium risk monitoring centre — what are the threats? */
export function ProdigyRiskStormLandmark() {
  return (
    <g className="iq-prodigy-landmark iq-prodigy-landmark--risk" style={{ pointerEvents: "none" }}>
      <defs>
        <linearGradient id="prod-risk-steel" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="55%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="prod-risk-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="prod-risk-dish" cx="0.4" cy="0.32" r="0.75">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <radialGradient id="prod-risk-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#ef4444" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="prod-risk-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#3b0a0a" />
        </linearGradient>
        <linearGradient id="prod-risk-hazard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Red alert glow */}
      <motion.ellipse
        cx="128"
        cy="100"
        rx="150"
        ry="104"
        fill="url(#prod-risk-glow)"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.96, 1.05, 0.96] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Ground shadow */}
      <ellipse cx="128" cy="176" rx="126" ry="16" fill="#1e1b4b" opacity="0.28" />

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut" }}
      >
        <g className="iq-vault-react">
          {/* Base platform with hazard trim */}
          <rect x="8" y="148" width="240" height="30" rx="12" fill="url(#prod-risk-dark)" stroke="#0f172a" strokeWidth="4" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={`hz-${i}`}
              x={16 + i * 19}
              y="151"
              width="10"
              height="6"
              transform={`skewX(-20)`}
              fill={i % 2 ? "#0f172a" : "url(#prod-risk-hazard)"}
              opacity="0.9"
            />
          ))}

          {/* Command centre bunker */}
          <rect x="36" y="92" width="184" height="62" rx="12" fill="url(#prod-risk-steel)" stroke="#0f172a" strokeWidth="5" />
          <path d="M36 96 L48 80 L208 80 L220 96 Z" fill="#334155" stroke="#0f172a" strokeWidth="4" />
          {/* Red eave light strip */}
          <rect x="44" y="96" width="168" height="4" rx="2" fill="#ef4444" opacity="0.85" />

          {/* Digital monitoring screens */}
          {[48, 104, 160].map((sx, i) => (
            <g key={`screen-${sx}`}>
              <rect x={sx} y="108" width="46" height="30" rx="3" fill="url(#prod-risk-screen)" stroke="#0f172a" strokeWidth="2" />
              {i === 1 ? (
                <polyline
                  points={`${sx + 4},130 ${sx + 12},122 ${sx + 18},126 ${sx + 26},116 ${sx + 34},120 ${sx + 42},112`}
                  fill="none"
                  stroke="#fca5a5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  {[0, 1, 2].map((r) => (
                    <line
                      key={`sl-${sx}-${r}`}
                      x1={sx + 5}
                      y1={114 + r * 7}
                      x2={sx + 41}
                      y2={114 + r * 7}
                      stroke="#ef4444"
                      strokeWidth="1.6"
                      opacity={0.5 + r * 0.15}
                    />
                  ))}
                </>
              )}
            </g>
          ))}

          {/* Hazard symbol integrated on bunker */}
          <g transform="translate(128, 86)">
            <path d="M0 -12 L12 9 L-12 9 Z" fill="url(#prod-risk-hazard)" stroke="#7c2d12" strokeWidth="2" strokeLinejoin="round" />
            <rect x="-1.6" y="-5" width="3.2" height="8" rx="1.4" fill="#7c2d12" />
            <circle cx="0" cy="6" r="1.8" fill="#7c2d12" />
          </g>

          {/* Radar mast + large dish */}
          <rect x="121" y="64" width="14" height="30" rx="3" fill="url(#prod-risk-steel)" stroke="#0f172a" strokeWidth="2.5" />
          <g transform="rotate(-18 128 46)">
            {/* Outer scanning sweep ring */}
            <ellipse cx="128" cy="46" rx="60" ry="30" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 11" opacity="0.5" className="iq-prodigy-landmark__hub-glow" />
            <ellipse cx="128" cy="46" rx="52" ry="26" fill="url(#prod-risk-dish)" stroke="#e11d48" strokeWidth="3.5" />
            <ellipse cx="128" cy="46" rx="36" ry="17" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.65" />
            <ellipse cx="128" cy="46" rx="20" ry="9" fill="none" stroke="#94a3b8" strokeWidth="1.6" opacity="0.6" />
            <line x1="128" y1="46" x2="128" y2="22" stroke="#475569" strokeWidth="3.5" />
            <circle cx="128" cy="20" r="5" fill="#ef4444" className="iq-prodigy-landmark__beacon" />
            <line x1="128" y1="46" x2="166" y2="30" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            <circle cx="128" cy="46" r="6" fill="#475569" stroke="#0f172a" strokeWidth="2" />
          </g>

          {/* Satellite dish on roof */}
          <g transform="translate(196, 74) rotate(28)">
            <ellipse cx="0" cy="0" rx="16" ry="9" fill="url(#prod-risk-dish)" stroke="#475569" strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#475569" strokeWidth="2" />
            <circle cx="0" cy="-12" r="2.4" fill="#ef4444" />
          </g>

          {/* Communication antennas */}
          {[52, 204].map((ax, i) => (
            <g key={`ant-${ax}`}>
              <line x1={ax} y1="80" x2={ax} y2="50" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <circle
                cx={ax}
                cy="48"
                r="4"
                fill="#ef4444"
                className={`iq-prodigy-landmark__beacon${i ? " iq-prodigy-landmark__beacon--delay" : ""}`}
              />
              <line x1={ax - 6} y1="60" x2={ax + 6} y2="60" stroke="#475569" strokeWidth="2" />
            </g>
          ))}

          {/* Corner warning beacons */}
          <g transform="translate(40, 138)">
            <rect x="-7" y="0" width="14" height="16" rx="3" fill="#1f2937" stroke="#0f172a" strokeWidth="2" />
            <circle cx="0" cy="-3" r="7" fill="#ef4444" className="iq-prodigy-landmark__beacon" />
          </g>
          <g transform="translate(216, 138)">
            <rect x="-7" y="0" width="14" height="16" rx="3" fill="#1f2937" stroke="#0f172a" strokeWidth="2" />
            <circle cx="0" cy="-3" r="7" fill="#ef4444" className="iq-prodigy-landmark__beacon iq-prodigy-landmark__beacon--delay" />
          </g>

          {/* Hazard cones + bush for environment */}
          <g transform="translate(70, 168)">
            <path d="M-7 8 L7 8 L4 -10 L-4 -10 Z" fill="#f97316" stroke="#9a3412" strokeWidth="1.8" strokeLinejoin="round" />
            <rect x="-8" y="8" width="16" height="4" rx="1.5" fill="#9a3412" />
            <rect x="-5" y="-2" width="10" height="3.5" fill="#fff7ed" opacity="0.9" />
          </g>
          <ProdigyBush x={188} y={170} s={0.66} />

          {/* Lightning accent above */}
          <path
            d="M150 38 L156 52 L150 50 L160 68"
            fill="none"
            stroke="#fde047"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="iq-prodigy-landmark__lightning"
          />
        </g>
      </motion.g>
    </g>
  );
}

export function ProdigyFinancialTreasuryLandmark() {
  const doorCx = 128;
  const doorCy = 100;
  const doorR = 42;
  const bolts = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g
      className="iq-prodigy-landmark iq-prodigy-landmark--financial"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="prod-vault" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="prod-vault-door" cx="0.38" cy="0.32" r="0.78">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="55%" stopColor="#5b6678" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
        <linearGradient id="prod-bullion" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <radialGradient id="prod-fin-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="prod-fin-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="prod-fin-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
      </defs>

      {/* Soft glow behind the vault */}
      <motion.ellipse
        cx={doorCx}
        cy="98"
        rx="152"
        ry="106"
        fill="url(#prod-fin-glow)"
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.97, 1.04, 0.97] }}
        transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      <g transform="translate(0, 178)">
        <SoftShadow w={290} />
      </g>
      {/* Ground shadow */}
      <ellipse cx={doorCx} cy="166" rx="118" ry="16" fill="#1e1b4b" opacity="0.26" />

      {/* ---- Grounded environment (drawn behind the floating vault) ---- */}
      {/* Landscaped plaza */}
      <ellipse cx={doorCx} cy="168" rx="124" ry="22" fill="url(#prod-fin-grass)" stroke="#15803d" strokeWidth="4" />
      <ellipse cx={doorCx} cy="166" rx="100" ry="17" fill="#dcfce7" opacity="0.55" />
      {/* Stone pathway leading to the vault */}
      {[
        { y: 182, w: 46 },
        { y: 174, w: 40 },
        { y: 166, w: 34 }
      ].map((s) => (
        <rect
          key={`fin-path-${s.y}`}
          x={doorCx - s.w / 2}
          y={s.y}
          width={s.w}
          height="9"
          rx="4"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="1.6"
        />
      ))}
      {/* Ground gold bars + scattered coins */}
      {[
        { x: 18, y: 176 },
        { x: 214, y: 178 }
      ].map((b) => (
        <g key={`fin-ground-bar-${b.x}`}>
          <rect x={b.x} y={b.y} width="28" height="10" rx="2.5" fill="url(#prod-bullion)" stroke="#854d0e" strokeWidth="1.8" />
          <rect x={b.x + 3} y={b.y + 2} width="22" height="2.4" rx="1.2" fill="#fffbeb" opacity="0.7" />
        </g>
      ))}
      {[
        [52, 182],
        [60, 178],
        [198, 184],
        [206, 180]
      ].map(([cx, cy]) => (
        <g key={`fin-coin-${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="6" fill="url(#prod-bullion)" stroke="#854d0e" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="2.4" fill="#fffbeb" opacity="0.8" />
        </g>
      ))}
      {/* Small financial display on a post */}
      <g transform="translate(40, 150)">
        <rect x="-2.5" y="6" width="5" height="22" rx="2.5" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="-20" y="-16" width="40" height="24" rx="4" fill="url(#prod-fin-screen)" stroke="#064e3b" strokeWidth="2" />
        <polyline
          points="-15,2 -8,-4 -2,-1 5,-9 13,-5"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="-15" y="-7" fontSize="9" fontWeight="800" fill="#bbf7d0">
          $
        </text>
      </g>
      {/* Landscaping + decorative lighting */}
      <ProdigyTree x={14} y={160} s={0.74} />
      <ProdigyTree x={242} y={162} s={0.78} />
      <ProdigyBush x={206} y={166} s={0.62} />
      <ProdigyLamp x={86} y={160} s={0.56} />
      <ProdigyLamp x={170} y={160} s={0.56} />

      <motion.g
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      >
      <g className="iq-vault-react">
        {/* Vault body — rounded metal panels + thick cartoon outline */}
        <rect x="20" y="42" width="216" height="120" rx="20" fill="url(#prod-vault)" stroke="#1e293b" strokeWidth="6" />
        <rect x="34" y="56" width="188" height="92" rx="13" fill="#94a3b8" stroke="#475569" strokeWidth="3.5" />
        {/* Crown cornice */}
        <path d="M40 42 L40 24 L216 18 L216 42 Z" fill="#64748b" stroke="#334155" strokeWidth="3" />
        {/* Metallic highlight streak */}
        <path d="M46 60 L92 60 L62 144 L38 144 Z" fill="#ffffff" opacity="0.16" />
        <path d="M104 58 L118 58 L90 146 L76 146 Z" fill="#ffffff" opacity="0.08" />

        {/* Gold corner plates */}
        {[
          [26, 48],
          [206, 48],
          [26, 136],
          [206, 136]
        ].map(([x, y]) => (
          <g key={`prod-corner-${x}-${y}`}>
            <rect x={x} y={y} width="20" height="20" rx="5" fill="url(#prod-bullion)" stroke="#854d0e" strokeWidth="2.5" />
            <circle cx={x + 10} cy={y + 10} r="2.6" fill="#fffbeb" stroke="#854d0e" strokeWidth="1" />
          </g>
        ))}

        {/* Side hinges */}
        {[68, 122].map((y) => (
          <g key={`prod-hinge-${y}`}>
            <rect x="10" y={y} width="22" height="20" rx="5" fill="#475569" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="21" cy={y + 6} r="2.4" fill="#e2e8f0" />
            <circle cx="21" cy={y + 14} r="2.4" fill="#e2e8f0" />
          </g>
        ))}

        {/* Bolts around the door */}
        {bolts.map((deg) => {
          const pt = polarPoint(doorCx, doorCy, doorR + 6, deg);
          return (
            <circle
              key={`prod-bolt-${deg}`}
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
        <circle cx={doorCx} cy={doorCy} r={doorR} fill="url(#prod-vault-door)" stroke="#0f172a" strokeWidth="5" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 8} fill="none" stroke="#e2e8f0" strokeWidth="2.5" opacity="0.55" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 16} fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.8" />
        <circle cx={doorCx} cy={doorCy} r={doorR - 24} fill="#334155" stroke="#0f172a" strokeWidth="2" />

        {/* Wheel spokes */}
        {spokes.map((deg) => {
          const inner = polarPoint(doorCx, doorCy, 8, deg);
          const outer = polarPoint(doorCx, doorCy, doorR - 11, deg);
          return (
            <line
              key={`prod-spoke-${deg}`}
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
        <circle cx={doorCx} cy={doorCy} r="10" fill="#1e293b" stroke="url(#prod-bullion)" strokeWidth="3.5" />
        <circle cx={doorCx} cy={doorCy} r="3" fill="#fef08a" />

        {/* Gold bar stacks near the base */}
        {[
          { x: 44, y: 144, n: 4 },
          { x: 184, y: 142, n: 3 },
          { x: 70, y: 156, n: 2 }
        ].map((s) =>
          Array.from({ length: s.n }).map((_, i) => (
            <g key={`prod-bar-${s.x}-${i}`}>
              <rect
                x={s.x}
                y={s.y - i * 8}
                width="30"
                height="11"
                rx="2.5"
                fill="url(#prod-bullion)"
                stroke="#854d0e"
                strokeWidth="1.8"
              />
              <rect x={s.x + 3} y={s.y - i * 8 + 2} width="24" height="2.5" rx="1.2" fill="#fffbeb" opacity="0.7" />
            </g>
          ))
        )}

        {/* Coin piles near the base */}
        <ellipse cx="206" cy="158" rx="19" ry="7" fill="url(#prod-bullion)" stroke="#854d0e" strokeWidth="1.8" />
        <ellipse cx="199" cy="151" rx="14" ry="6" fill="url(#prod-bullion)" stroke="#854d0e" strokeWidth="1.5" />
        <circle cx="196" cy="143" r="6.5" fill="#fef08a" stroke="#854d0e" strokeWidth="1.5" />
        <circle cx="196" cy="143" r="2.6" fill="#fffbeb" opacity="0.85" />

        {/* Fantasy sparkles */}
        <circle cx="214" cy="56" r="5" fill="#fef08a" className="iq-prodigy-landmark__sparkle" />
        <circle cx="40" cy="64" r="3.5" fill="#fef08a" className="iq-prodigy-landmark__sparkle iq-prodigy-landmark__sparkle--delay" />
      </g>
      </motion.g>
    </g>
  );
}

/** Premium executive boardroom HQ — leadership, governance & trust. */
export function ProdigyManagementCitadelLandmark() {
  return (
    <g className="iq-prodigy-landmark iq-prodigy-landmark--management" style={{ pointerEvents: "none" }}>
      <defs>
        <linearGradient id="prod-mgmt-glass" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="45%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="prod-mgmt-glass-dk" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
        <linearGradient id="prod-mgmt-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="prod-mgmt-steel" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="prod-mgmt-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="prod-mgmt-wood" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="55%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#5c2d0c" />
        </linearGradient>
        <radialGradient id="prod-mgmt-glow" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.38" />
          <stop offset="45%" stopColor="#818cf8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="prod-mgmt-room" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>

      {/* Warm executive glow */}
      <motion.ellipse
        cx="128"
        cy="96"
        rx="150"
        ry="104"
        fill="url(#prod-mgmt-glow)"
        animate={{ opacity: [0.42, 0.76, 0.42], scale: [0.97, 1.04, 0.97] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      <ellipse cx="128" cy="176" rx="128" ry="16" fill="#1e1b4b" opacity="0.26" />

      <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}>
        <g className="iq-vault-react">
          {/* Executive plaza */}
          <rect x="6" y="148" width="244" height="30" rx="13" fill="url(#prod-mgmt-stone)" stroke="#4338ca" strokeWidth="4" />
          <rect x="16" y="152" width="228" height="6" rx="3" fill="url(#prod-mgmt-gold)" opacity="0.65" />
          <rect x="98" y="150" width="60" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.4" />
          <rect x="104" y="156" width="48" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.4" />

          {/* Side corporate wings — shorter so boardroom reads first */}
          <rect x="28" y="102" width="40" height="50" rx="7" fill="url(#prod-mgmt-glass-dk)" stroke="#312e81" strokeWidth="3" />
          <rect x="188" y="102" width="40" height="50" rx="7" fill="url(#prod-mgmt-glass-dk)" stroke="#312e81" strokeWidth="3" />

          {/* Main glass HQ — boardroom pavilion dominates the facade */}
          <rect x="68" y="28" width="120" height="124" rx="10" fill="url(#prod-mgmt-glass)" stroke="#312e81" strokeWidth="4.5" />
          <path d="M74 34 L88 34 L80 148 L72 148 Z" fill="#ffffff" opacity="0.16" />
          <rect x="68" y="118" width="120" height="5" fill="url(#prod-mgmt-gold)" opacity="0.9" />

          {/* Boardroom glass wall — hero cutaway (most of the tower) */}
          <rect x="74" y="34" width="108" height="82" rx="6" fill="#0f172a" stroke="#4338ca" strokeWidth="3.5" />
          <rect x="78" y="38" width="100" height="74" rx="5" fill="url(#prod-mgmt-room)" />
          <rect x="78" y="38" width="100" height="74" rx="5" fill="#fde68a" opacity="0.14" />

          {/* Chandelier — compact */}
          <ellipse cx="128" cy="46" rx="12" ry="4.5" fill="#fde047" opacity="0.95" />

          {/* Chairman seat — oversized gold cue */}
          <rect x="112" y="52" width="32" height="16" rx="4" fill="#1e1b4b" stroke="#fde047" strokeWidth="3" />
          <rect x="116" y="46" width="24" height="8" rx="3" fill="#312e81" stroke="#fde047" strokeWidth="2.2" />

          {/* Conference table — dominates the room */}
          <path
            d="M80 78 L176 78 L168 98 L88 98 Z"
            fill="url(#prod-mgmt-wood)"
            stroke="#451a03"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M88 82 L168 82 L164 92 L92 92 Z" fill="#fbbf24" opacity="0.42" />

          {/* Executive chairs — bold left row */}
          {[56, 68].map((cy) => (
            <g key={`mgmt-chair-l-${cy}`}>
              <rect x="82" y={cy} width="16" height="14" rx="3.5" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
              <rect x="84" y={cy - 6} width="12" height="7" rx="3" fill="#4338ca" stroke="#c7d2fe" strokeWidth="1.6" />
            </g>
          ))}

          {/* Executive chairs — bold right row */}
          {[56, 68].map((cy) => (
            <g key={`mgmt-chair-r-${cy}`}>
              <rect x="158" y={cy} width="16" height="14" rx="3.5" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
              <rect x="160" y={cy - 6} width="12" height="7" rx="3" fill="#4338ca" stroke="#c7d2fe" strokeWidth="1.6" />
            </g>
          ))}

          {/* End chairs — near table head */}
          <rect x="98" y="72" width="12" height="10" rx="2.5" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.6" />
          <rect x="146" y="72" width="12" height="10" rx="2.5" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.6" />

          {/* Governance scales on table */}
          <g transform="translate(128, 86)">
            <line x1="-10" y1="3" x2="10" y2="3" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#fde047" strokeWidth="2.2" />
            <path d="M-10 3 L-14 9 L-6 9 Z" fill="#fde047" />
            <path d="M10 3 L6 9 L14 9 Z" fill="#fde047" />
          </g>

          {/* Window mullions */}
          <line x1="128" y1="34" x2="128" y2="116" stroke="#4338ca" strokeWidth="2.4" opacity="0.7" />

          {/* Narrow lobby band below boardroom */}
          <rect x="78" y="116" width="100" height="14" rx="3" fill="#312e81" opacity="0.35" />
          {[120, 132].map((wx) => (
            <rect key={`mgmt-lobby-${wx}`} x={wx} y="118" width="12" height="10" rx="2" fill="#c7d2fe" opacity="0.85" />
          ))}

          {/* Rooftop executive crown + flag */}
          <rect x="62" y="16" width="132" height="14" rx="4" fill="url(#prod-mgmt-steel)" stroke="#1e293b" strokeWidth="3" />
          <rect x="82" y="8" width="92" height="10" rx="3" fill="url(#prod-mgmt-glass-dk)" stroke="#4338ca" strokeWidth="2.5" />
          <rect x="68" y="28" width="120" height="3" fill="url(#prod-mgmt-gold)" />
          <line x1="156" y1="18" x2="156" y2="-8" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M156 -8 L178 -2 L156 4 Z" fill="url(#prod-mgmt-gold)" stroke="#92400e" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="128" cy="4" r="4.5" fill="#fde047" className="iq-prodigy-landmark__sparkle" />

          {/* Grand double-door entrance */}
          <path d="M106 152 V128 a22 22 0 0 1 44 0 V152 Z" fill="#0f172a" stroke="#4338ca" strokeWidth="2.5" />
          <line x1="128" y1="128" x2="128" y2="152" stroke="#6366f1" strokeWidth="2.2" />
          <rect x="112" y="134" width="7" height="12" rx="1" fill="#fde047" />
          <rect x="137" y="134" width="7" height="12" rx="1" fill="#fde047" />

          {/* Trust shield crest above doors */}
          <g transform="translate(128, 118)">
            <path
              d="M0 -11 C7 -11 11 -6 11 0 C11 9 0 15 0 15 C0 15 -11 9 -11 0 C-11 -6 -7 -11 0 -11 Z"
              fill="url(#prod-mgmt-steel)"
              stroke="#4338ca"
              strokeWidth="2.2"
            />
            <path d="M-5 1.5 L0 -3.5 L5 1.5" fill="none" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="-6" y1="3" x2="6" y2="3" stroke="#fde047" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Org chart screen in wing */}
          <rect x="34" y="108" width="28" height="18" rx="3" fill="#0f172a" stroke="#4338ca" strokeWidth="1.8" />
          <rect x="38" y="112" width="8" height="5" rx="1" fill="#818cf8" />
          <rect x="48" y="116" width="6" height="4" rx="1" fill="#a5b4fc" />
          <rect x="56" y="116" width="6" height="4" rx="1" fill="#a5b4fc" />

          {/* Landscaping + warm executive lighting */}
          <ProdigyTree x={20} y={158} s={0.78} />
          <ProdigyTree x={240} y={160} s={0.82} />
          <ProdigyBush x={64} y={166} s={0.68} />
          <ProdigyBush x={186} y={166} s={0.68} />
          <ProdigyLamp x={96} y={158} s={0.62} glow="#fde68a" />
          <ProdigyLamp x={160} y={158} s={0.62} glow="#fde68a" />

          <circle cx="178" cy="34" r="4" fill="#fef08a" className="iq-prodigy-landmark__sparkle" />
          <circle cx="54" cy="78" r="3.2" fill="#fef08a" className="iq-prodigy-landmark__sparkle iq-prodigy-landmark__sparkle--delay" />
        </g>
      </motion.g>
    </g>
  );
}

export function ProdigyHubFortressLandmark() {
  return (
    <g className="iq-prodigy-landmark iq-prodigy-landmark--hub">
      <defs>
        <radialGradient id="prod-trophy-glow" cx="50%" cy="42%" r="68%">
          <stop offset="0%" stopColor="#fffef0" stopOpacity="1" />
          <stop offset="42%" stopColor="#fde047" stopOpacity="0.72" />
          <stop offset="72%" stopColor="#f59e0b" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prod-trophy-aura" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.82" />
          <stop offset="38%" stopColor="#fde047" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="prod-trophy-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffef5" />
          <stop offset="22%" stopColor="#fef08a" />
          <stop offset="48%" stopColor="#fde047" />
          <stop offset="72%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="prod-trophy-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="44%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="56%" stopColor="#fffbeb" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="prod-trophy-plaque" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>

      {/* Outer prize halo — reads as the map's ultimate goal */}
      <ellipse
        cx="95"
        cy="96"
        rx="118"
        ry="88"
        fill="none"
        stroke="#fde047"
        strokeWidth="2.5"
        opacity="0.42"
        className="iq-prodigy-landmark__trophy-halo iq-prodigy-landmark__trophy-halo--outer"
      />
      <ellipse
        cx="95"
        cy="96"
        rx="108"
        ry="80"
        fill="url(#prod-trophy-aura)"
        className="iq-prodigy-landmark__trophy-halo iq-prodigy-landmark__trophy-halo--mid"
      />

      <g transform="translate(-18, 158)">
        <SoftShadow w={226} />
      </g>

      <ellipse cx="95" cy="96" rx="96" ry="72" fill="url(#prod-trophy-glow)" className="iq-prodigy-landmark__hub-glow" />

      {/* Trophy handles */}
      <path d="M50 46 C18 48 20 94 58 96" fill="none" stroke="url(#prod-trophy-gold)" strokeWidth="16" strokeLinecap="round" />
      <path d="M140 46 C172 48 170 94 132 96" fill="none" stroke="url(#prod-trophy-gold)" strokeWidth="16" strokeLinecap="round" />
      <path d="M54 52 C34 56 36 78 58 82" fill="none" stroke="#fff7ad" strokeWidth="4.5" strokeLinecap="round" opacity="0.92" />
      <path d="M136 52 C156 56 154 78 132 82" fill="none" stroke="#fff7ad" strokeWidth="4.5" strokeLinecap="round" opacity="0.92" />

      {/* Trophy cup */}
      <path
        d="M46 28 H144 L136 82 C132 112 116 130 95 136 C74 130 58 112 54 82 Z"
        fill="url(#prod-trophy-gold)"
        stroke="#b45309"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M58 38 H132 L126 78 C122 101 111 116 95 122 C79 116 68 101 64 78 Z" fill="#fff7ad" opacity="0.34" />
      <path
        d="M58 38 H132 L126 78 C122 101 111 116 95 122 C79 116 68 101 64 78 Z"
        fill="url(#prod-trophy-shine)"
        className="iq-prodigy-landmark__trophy-shine"
        opacity="0.55"
      />
      <path d="M68 42 C76 56 112 56 124 42" fill="none" stroke="#fffbeb" strokeWidth="5" strokeLinecap="round" opacity="0.95" />

      {/* Crown star — prize at the peak */}
      <g className="iq-prodigy-landmark__trophy-crown" transform="translate(95, 10)">
        <path
          d="M0 -11 L3.5 1 L12 -3 L7 5 L9 14 L0 10 L-9 14 L-7 5 L-12 -3 L-3.5 1 Z"
          fill="#fde047"
          stroke="#b45309"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="-4" r="3.2" fill="#fffbeb" />
      </g>

      {/* Stem and base */}
      <rect x="84" y="130" width="22" height="24" rx="6" fill="url(#prod-trophy-gold)" stroke="#b45309" strokeWidth="4" />
      <rect x="58" y="150" width="74" height="18" rx="7" fill="url(#prod-trophy-plaque)" stroke="#fde047" strokeWidth="4.5" />
      <rect x="44" y="166" width="102" height="18" rx="8" fill="#451a03" stroke="#fde047" strokeWidth="4.5" />
      <rect x="52" y="152" width="86" height="4" rx="2" fill="#fef08a" opacity="0.55" />

      <text
        x="95"
        y="77"
        textAnchor="middle"
        fontSize="25"
        fontWeight="950"
        fill="#451a03"
        stroke="#fffbeb"
        strokeWidth="1.6"
        paintOrder="stroke"
      >
        10K
      </text>
      <text
        x="95"
        y="101"
        textAnchor="middle"
        fontSize="15"
        fontWeight="950"
        letterSpacing="1.2"
        fill="#451a03"
        stroke="#fffbeb"
        strokeWidth="1.4"
        paintOrder="stroke"
      >
        ROOKIE
      </text>

      <circle cx="95" cy="20" r="7" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2.5" className="iq-prodigy-landmark__sparkle" />
      <circle cx="54" cy="120" r="5.5" fill="#fef08a" className="iq-prodigy-landmark__sparkle iq-prodigy-landmark__sparkle--delay" />
      <circle cx="136" cy="120" r="5.5" fill="#fef08a" className="iq-prodigy-landmark__sparkle" />
      <circle cx="28" cy="68" r="4" fill="#fde047" className="iq-prodigy-landmark__sparkle iq-prodigy-landmark__sparkle--delay" />
      <circle cx="162" cy="68" r="4" fill="#fde047" className="iq-prodigy-landmark__sparkle" />
      <circle cx="95" cy="148" r="3.5" fill="#fffbeb" className="iq-prodigy-landmark__sparkle iq-prodigy-landmark__sparkle--delay" />
    </g>
  );
}
