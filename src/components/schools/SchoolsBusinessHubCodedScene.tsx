"use client";

import { ProdigyBusinessCityLandmark } from "@/components/schools/prodigyMap/ProdigyMapLandmarks";

/** Fixed star field — hydration-safe (no render randomness). */
const SCENE_STARS = [
  { left: "7%", top: "5%", size: 3, delay: false },
  { left: "18%", top: "11%", size: 2, delay: true },
  { left: "31%", top: "7%", size: 2.5, delay: false },
  { left: "44%", top: "14%", size: 2, delay: true },
  { left: "58%", top: "6%", size: 3, delay: false },
  { left: "71%", top: "12%", size: 2, delay: true },
  { left: "84%", top: "8%", size: 2.5, delay: false },
  { left: "92%", top: "16%", size: 2, delay: true },
  { left: "12%", top: "22%", size: 2, delay: false },
  { left: "76%", top: "24%", size: 2.5, delay: true },
  { left: "50%", top: "18%", size: 2, delay: false }
] as const;

/**
 * Schools Business Island — full island backdrop (grass, path, trees, HQ).
 * UI overlays float above; decorative only.
 */
export function SchoolsBusinessHubCodedScene() {
  return (
    <div className="iq-schools-business-hub-scene" aria-hidden>
      <div className="iq-schools-business-hub-scene__ocean" />
      <div className="iq-schools-business-hub-scene__aurora" />
      <div className="iq-schools-business-hub-scene__ripple iq-schools-business-hub-scene__ripple--far" />
      <div className="iq-schools-business-hub-scene__ripple iq-schools-business-hub-scene__ripple--mid" />
      <div className="iq-schools-business-hub-scene__ripple iq-schools-business-hub-scene__ripple--near" />

      {SCENE_STARS.map((star) => (
        <span
          key={`${star.left}-${star.top}`}
          className={[
            "iq-schools-business-hub-scene__star",
            star.delay ? "iq-prodigy-landmark__sparkle--delay" : "",
            "iq-prodigy-map__star"
          ].join(" ")}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size
          }}
        />
      ))}

      <div className="iq-schools-business-hub-scene__island-glow" />
      <div className="iq-schools-business-hub-scene__island">
        <svg
          className="iq-schools-business-hub-scene__island-svg"
          viewBox="0 0 960 620"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="iq-biz-hub-grass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="55%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="iq-biz-hub-cliff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
            <linearGradient id="iq-biz-hub-shore-path" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(251, 191, 36, 0.15)" />
              <stop offset="45%" stopColor="rgba(251, 191, 36, 0.72)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0.35)" />
            </linearGradient>
          </defs>

          <ellipse cx="480" cy="592" rx="380" ry="42" fill="#0f172a" opacity="0.24" />
          <path
            d="M 40 548 Q 180 468 320 498 Q 460 448 480 458 Q 500 448 640 498 Q 780 468 920 548 L 900 608 Q 480 632 60 608 Z"
            fill="url(#iq-biz-hub-grass)"
            stroke="#15803d"
            strokeWidth="3"
          />
          <path
            d="M 80 548 Q 220 498 360 518 Q 440 488 480 494 Q 520 488 600 518 Q 740 498 880 548 L 860 582 Q 480 598 100 582 Z"
            fill="#86efac"
            opacity="0.42"
          />
          <path
            d="M 40 548 Q 180 468 320 498 Q 460 448 480 458 Q 500 448 640 498 Q 780 468 920 548"
            fill="none"
            stroke="#bbf7d0"
            strokeWidth="2.5"
            opacity="0.55"
          />
          <path
            d="M 60 608 Q 480 632 900 608 L 920 548 Q 780 568 480 558 Q 180 568 40 548 Z"
            fill="url(#iq-biz-hub-cliff)"
            opacity="0.88"
          />

          {/* Golden path from principle shore → HQ entrance */}
          <path
            d="M 72 556 Q 220 520 360 492 Q 420 478 480 472"
            fill="none"
            stroke="url(#iq-biz-hub-shore-path)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Shore trees & bushes */}
          <g opacity="0.92">
            <ellipse cx="118" cy="528" rx="28" ry="14" fill="#15803d" />
            <ellipse cx="118" cy="508" rx="22" ry="26" fill="#22c55e" />
            <ellipse cx="108" cy="502" rx="14" ry="18" fill="#4ade80" />
            <ellipse cx="128" cy="504" rx="16" ry="20" fill="#16a34a" />
            <rect x="114" y="528" width="8" height="18" rx="2" fill="#78350f" />
          </g>
          <g opacity="0.88">
            <ellipse cx="842" cy="534" rx="32" ry="15" fill="#15803d" />
            <ellipse cx="842" cy="512" rx="24" ry="28" fill="#22c55e" />
            <ellipse cx="830" cy="506" rx="15" ry="19" fill="#4ade80" />
            <ellipse cx="854" cy="508" rx="17" ry="21" fill="#16a34a" />
            <rect x="838" y="534" width="8" height="20" rx="2" fill="#78350f" />
          </g>
          <g opacity="0.75">
            <ellipse cx="680" cy="542" rx="20" ry="10" fill="#166534" />
            <ellipse cx="680" cy="530" rx="16" ry="18" fill="#22c55e" />
          </g>
          <g opacity="0.7">
            <ellipse cx="260" cy="548" rx="18" ry="9" fill="#166534" />
            <ellipse cx="260" cy="538" rx="14" ry="16" fill="#22c55e" />
          </g>

          <g className="iq-schools-business-hub-scene__hq" transform="translate(248, 72) scale(1.42)">
            <ProdigyBusinessCityLandmark />
          </g>
        </svg>
      </div>

      <div className="iq-schools-business-hub-scene__ambient-glow" />
      <div className="iq-schools-business-hub-scene__vignette" />
    </div>
  );
}
