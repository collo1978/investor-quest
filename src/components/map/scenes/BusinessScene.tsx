"use client";

/**
 * BusinessScene — premium corporate HQ standing on a large floating city
 * island.
 *
 * Composition (back → front):
 *   • distant city haze (above platform horizon, atmospheric perspective)
 *   • far skyline silhouette (heavily blurred, deep distance)
 *   • back-tower silhouettes (mid-distance, soft-blurred)
 *   • surface mini-buildings on the platform (NEW — frame the main tower
 *     as a city scape, not a lonely needle)
 *   • surface city lights — scattered glow points on the platform surface
 *   • main HQ tower — glassmorphism body with specular streak + edge rim
 *   • lit window grid with bloom dots
 *   • antenna + blinking beacon halo
 *   • spire volumetric light beam upward
 *   • drifting gold sparks (FX)
 *
 * Plant line: the platform-top sits at ~60% from the stage bottom (driven
 * by the IslandTerrain SVG in SceneShell). All buildings — main tower and
 * the surface mini-buildings — plant at the same `bottom-[58%]` line.
 */

import { motion } from "framer-motion";
import type { IslandPalette } from "@/components/map/islandTokens";

export type BusinessSceneProps = {
  palette: IslandPalette;
  motionOn: boolean;
  orderIndex: number;
};

export function BusinessScene({
  palette,
  motionOn,
  orderIndex
}: BusinessSceneProps) {
  const phase = orderIndex * 0.5;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* (a) Distant city haze — atmospheric backdrop sitting above the
          platform horizon. */}
      <div
        className="absolute left-[6%] bottom-[60%] h-[24%] w-[88%]"
        style={{
          background: `radial-gradient(60% 100% at 50% 80%, ${palette.halo} 0%, transparent 75%)`,
          filter: "blur(16px)",
          mixBlendMode: "screen",
          opacity: 0.7
        }}
      />

      {/* (b) Far skyline silhouette — atmospheric perspective behind the
          main tower, sitting on the platform horizon. */}
      <svg
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
        className="absolute left-[4%] bottom-[58%] h-[14%] w-[92%]"
        style={{ filter: "blur(2.5px)", opacity: 0.55 }}
      >
        <defs>
          <linearGradient id="bizSkyline" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mid} stopOpacity="0.65" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path
          d="M0 26 L0 19 L6 19 L6 14 L11 14 L11 17 L16 17 L16 10 L20 10 L20 16 L26 16 L26 8 L30 8 L30 13 L36 13 L36 6 L40 6 L40 11 L46 11 L46 14 L52 14 L52 7 L58 7 L58 11 L65 11 L65 16 L72 16 L72 8 L78 8 L78 14 L85 14 L85 18 L91 18 L91 12 L100 12 L100 26 Z"
          fill="url(#bizSkyline)"
        />
        {[
          [8, 17],
          [13, 16],
          [18, 13],
          [22, 13],
          [28, 11],
          [32, 11],
          [38, 9],
          [42, 13],
          [49, 12],
          [55, 10],
          [62, 13],
          [68, 14],
          [75, 11],
          [82, 16],
          [88, 16]
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="0.6"
            height="1"
            fill={palette.light}
            opacity={0.85}
          />
        ))}
      </svg>

      {/* (c) Back-tower silhouettes — mid-distance city skyline behind the
          main tower. Resized to h-[22%] so they're capped BELOW the main
          tower's height (matches the new STRUCTURE-tier sizing). */}
      <svg
        viewBox="0 0 40 90"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 bottom-[58%] h-[22%] w-[42%] -translate-x-1/2"
        style={{ filter: "blur(0.8px)" }}
      >
        <defs>
          <linearGradient id="bizBackTower" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={palette.deep} stopOpacity="0.92" />
            <stop offset="50%" stopColor={palette.mid} stopOpacity="0.88" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <rect x="1" y="46" width="8" height="44" fill="url(#bizBackTower)" rx="0.4" opacity="0.92" />
        <rect x="31" y="34" width="8" height="56" fill="url(#bizBackTower)" rx="0.4" opacity="0.92" />

        {/* Back-tower windows (subtle). */}
        {Array.from({ length: 9 }).map((_, row) =>
          [0, 1].map((col) => (
            <rect
              key={`BL${row}${col}`}
              x={2 + col * 2.6}
              y={50 + row * 4.5}
              width="0.9"
              height="1.8"
              fill={palette.light}
              opacity={(row + col) % 3 === 0 ? 0.75 : 0.28}
            />
          ))
        )}
        {Array.from({ length: 11 }).map((_, row) =>
          [0, 1].map((col) => (
            <rect
              key={`BR${row}${col}`}
              x={32 + col * 2.6}
              y={38 + row * 4.7}
              width="0.9"
              height="1.8"
              fill={palette.light}
              opacity={(row + col) % 4 === 0 ? 0.75 : 0.28}
            />
          ))
        )}
      </svg>

      {/* (d) City district — SURFACE_FX tier (h-[14%] w-[96%]).
          Twelve buildings spanning the platform from cliff to cliff. With
          the main tower reduced into the STRUCTURE tier, the district
          buildings are also brought down to ~58% the height of the tower
          so the tower remains the unambiguous centerpiece. */}
      <svg
        viewBox="0 0 200 44"
        preserveAspectRatio="none"
        className="absolute left-1/2 bottom-[58%] h-[14%] w-[96%] -translate-x-1/2"
      >
        <defs>
          <linearGradient id="bizMini" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.mid} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="bizMiniHi" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={palette.deep} stopOpacity="0.95" />
            <stop offset="50%" stopColor={palette.hi} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {/* Left district — six buildings stepping up to the main tower. */}
        <rect x="4" y="26" width="14" height="18" rx="0.6" fill="url(#bizMini)" />
        <rect x="20" y="18" width="14" height="26" rx="0.6" fill="url(#bizMiniHi)" />
        <rect x="36" y="12" width="14" height="32" rx="0.6" fill="url(#bizMini)" />
        <rect x="52" y="20" width="14" height="24" rx="0.6" fill="url(#bizMiniHi)" opacity="0.95" />
        <rect x="68" y="8" width="14" height="36" rx="0.6" fill="url(#bizMini)" />
        <rect x="84" y="22" width="6" height="22" rx="0.5" fill="url(#bizMiniHi)" opacity="0.9" />
        {/* (centre 90–110 reserved for the main tower) */}
        {/* Right district — six buildings stepping down from the main tower. */}
        <rect x="110" y="22" width="6" height="22" rx="0.5" fill="url(#bizMiniHi)" opacity="0.9" />
        <rect x="118" y="8" width="14" height="36" rx="0.6" fill="url(#bizMini)" />
        <rect x="134" y="20" width="14" height="24" rx="0.6" fill="url(#bizMiniHi)" opacity="0.95" />
        <rect x="150" y="12" width="14" height="32" rx="0.6" fill="url(#bizMini)" />
        <rect x="166" y="18" width="14" height="26" rx="0.6" fill="url(#bizMiniHi)" />
        <rect x="182" y="26" width="14" height="18" rx="0.6" fill="url(#bizMini)" />
        {/* Building rooftops — bright trim line on each. */}
        {[
          [4, 26, 14],
          [20, 18, 14],
          [36, 12, 14],
          [52, 20, 14],
          [68, 8, 14],
          [84, 22, 6],
          [110, 22, 6],
          [118, 8, 14],
          [134, 20, 14],
          [150, 12, 14],
          [166, 18, 14],
          [182, 26, 14]
        ].map(([x, y, w], i) => (
          <rect
            key={`top${i}`}
            x={x}
            y={y}
            width={w}
            height="0.7"
            fill={palette.light}
            opacity={0.65}
          />
        ))}
        {/* Lit windows scattered across every building. */}
        {WINDOW_GRID.map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="1.5"
            height="1.6"
            fill={palette.light}
            opacity={(i % 4 === 0) ? 0.95 : 0.55}
          />
        ))}
        {/* Roof beacons on the four tallest buildings. */}
        {[
          [43, 12],
          [75, 8],
          [125, 8],
          [157, 12]
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`bk${i}`}
            cx={cx}
            cy={cy}
            r="0.7"
            fill={palette.accent}
            initial={false}
            animate={
              motionOn
                ? { opacity: [0.4, 1, 0.4] }
                : { opacity: 0.5 }
            }
            transition={{
              duration: 1.8,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: `drop-shadow(0 0 2px ${palette.accent})` }}
          />
        ))}
      </svg>

      {/* (e) Surface city lights — scattered glow dots painted on the
          platform top, between the tower and mini-buildings. */}
      {SURFACE_LIGHTS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            bottom: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: palette.light,
            boxShadow: `0 0 ${s.size * 4}px ${palette.accent}`,
            mixBlendMode: "screen"
          }}
          initial={false}
          animate={
            motionOn
              ? { opacity: [0.55, 0.95, 0.55] }
              : { opacity: 0.5 }
          }
          transition={{
            duration: 2.8 + (i % 4) * 0.4,
            delay: (phase + i * 0.18) % 3,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        />
      ))}

      {/* (f) Main HQ tower — STRUCTURE tier (h-[22%]).
          Compressed to the lower end of the tier so the tower lives
          INSIDE the corporate-city world rather than dominating the
          vertical axis of the entire scene. */}
      <svg
        viewBox="0 0 40 100"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 bottom-[58%] h-[22%] w-[20%] -translate-x-1/2"
        style={{
          filter: `drop-shadow(0 6px 18px ${palette.halo})`
        }}
      >
        <defs>
          <linearGradient id="bizTowerGlass" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={palette.deep} stopOpacity="0.9" />
            <stop offset="20%" stopColor={palette.mid} stopOpacity="0.85" />
            <stop offset="48%" stopColor={palette.hi} stopOpacity="0.95" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="62%" stopColor={palette.hi} stopOpacity="0.95" />
            <stop offset="90%" stopColor={palette.mid} stopOpacity="0.85" />
            <stop offset="100%" stopColor={palette.deep} stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="bizTowerCrown" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.95" />
            <stop offset="100%" stopColor={palette.mid} stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Antenna spire. */}
        <line
          x1="20"
          y1="0"
          x2="20"
          y2="10"
          stroke={palette.hi}
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Tower body. */}
        <rect
          x="11"
          y="14"
          width="18"
          height="84"
          fill="url(#bizTowerGlass)"
          rx="1.2"
        />
        <rect
          x="13.5"
          y="16"
          width="1.5"
          height="78"
          fill="rgba(255,255,255,0.18)"
          rx="0.4"
        />
        <rect
          x="11"
          y="14"
          width="0.6"
          height="84"
          fill="rgba(255,255,255,0.32)"
          rx="0.3"
        />
        <rect
          x="28.4"
          y="14"
          width="0.6"
          height="84"
          fill="rgba(255,255,255,0.18)"
          rx="0.3"
        />

        {/* Top crown. */}
        <rect
          x="12.5"
          y="10"
          width="15"
          height="6"
          fill="url(#bizTowerCrown)"
          rx="0.6"
        />

        {/* Blinking beacon at top. */}
        <motion.circle
          cx="20"
          cy="0.6"
          r="1.2"
          fill={palette.accent}
          initial={false}
          animate={
            motionOn
              ? { opacity: [0.35, 1, 0.35], r: [0.9, 1.5, 0.9] }
              : { opacity: 0.7 }
          }
          transition={{
            duration: 2,
            delay: phase,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: `drop-shadow(0 0 8px ${palette.accent})` }}
        />

        {/* Window grid — denser deterministic lit pattern. */}
        {Array.from({ length: 16 }).map((_, row) =>
          [0, 1, 2, 3].map((col) => {
            const lit = (row * 3 + col * 2) % 5 < 3;
            return (
              <rect
                key={`MW${row}${col}`}
                x={13 + col * 3.6}
                y={18 + row * 5}
                width="2.2"
                height="3.4"
                fill={lit ? palette.light : palette.deep}
                opacity={lit ? 0.96 : 0.35}
                rx="0.2"
                style={
                  lit
                    ? {
                        filter: `drop-shadow(0 0 1.5px ${palette.accent})`
                      }
                    : undefined
                }
              />
            );
          })
        )}
      </svg>

      {/* (g) Window bloom dots — soft halos around the brightest windows. */}
      <div className="absolute inset-0">
        {WINDOW_BLOOM.map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              background: palette.light,
              filter: "blur(2.5px)",
              mixBlendMode: "screen",
              opacity: b.opacity
            }}
            initial={false}
            animate={
              motionOn
                ? { opacity: [b.opacity * 0.7, b.opacity, b.opacity * 0.7] }
                : { opacity: b.opacity * 0.6 }
            }
            transition={{
              duration: 3 + (i % 3) * 0.5,
              delay: (phase + i * 0.2) % 3,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ))}
      </div>

      {/* (h) Spire volumetric beam — gentle upward shaft from antenna. */}
      <motion.div
        className="absolute left-1/2 top-[2%] h-[18%] w-[6%] -translate-x-1/2 origin-bottom"
        style={{
          background: `linear-gradient(to top, ${palette.accent} 0%, transparent 100%)`,
          filter: "blur(5px)",
          mixBlendMode: "screen",
          clipPath: "polygon(38% 100%, 62% 100%, 100% 0%, 0% 0%)"
        }}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.35, 0.7, 0.35] }
            : { opacity: 0.2 }
        }
        transition={{
          duration: 3.4,
          delay: phase,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror"
        }}
      />

      {/* (i) Drifting gold sparks (FX) above the city platform. */}
      {motionOn
        ? SPARK_SEEDS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                background: palette.accent,
                boxShadow: `0 0 8px ${palette.accent}`
              }}
              initial={false}
              animate={{
                y: [-3, -22, -3],
                opacity: [0, 0.95, 0],
                scale: [0.6, 1, 0.6]
              }}
              transition={{
                duration: s.duration,
                delay: (i * 0.7 + phase) % s.duration,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))
        : null}
    </div>
  );
}

const WINDOW_BLOOM: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
}> = [
  { x: 47, y: 14, size: 5, opacity: 0.7 },
  { x: 53, y: 18, size: 4, opacity: 0.65 },
  { x: 50, y: 22, size: 6, opacity: 0.8 },
  { x: 46, y: 27, size: 4, opacity: 0.6 },
  { x: 54, y: 31, size: 5, opacity: 0.75 },
  { x: 49, y: 36, size: 4, opacity: 0.7 }
];

const SURFACE_LIGHTS: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
}> = [
  { x: 14, y: 56, size: 1.6 },
  { x: 22, y: 57, size: 1.2 },
  { x: 30, y: 56, size: 1.4 },
  { x: 38, y: 57, size: 1.1 },
  { x: 46, y: 56, size: 1.3 },
  { x: 54, y: 57, size: 1.2 },
  { x: 62, y: 56, size: 1.3 },
  { x: 70, y: 57, size: 1.5 },
  { x: 78, y: 56, size: 1.2 },
  { x: 86, y: 57, size: 1.4 }
];

// Lit window coordinates (in the 200×44 mini-buildings viewBox).
// Deterministic constellation that runs across every building.
const WINDOW_GRID: ReadonlyArray<readonly [number, number]> = [
  // Far-left short building (4–18, 26–44)
  [6, 30], [9, 32], [12, 34], [15, 30], [6, 36], [12, 38],
  // Tall building 20–34
  [22, 22], [25, 24], [28, 26], [31, 28], [22, 32], [28, 34], [22, 38],
  // Tallest 36–50
  [38, 16], [41, 18], [44, 20], [47, 22], [38, 26], [44, 28], [38, 34],
  // Mid 52–66
  [54, 24], [57, 26], [60, 28], [63, 30], [54, 36], [60, 38],
  // Very tall 68–82
  [70, 12], [73, 14], [76, 16], [79, 18], [70, 24], [76, 26], [70, 34],
  // Thin building 84–90
  [85.5, 26], [85.5, 30], [85.5, 34], [85.5, 38],
  // Mirror to the right (110–196)
  [111.5, 26], [111.5, 30], [111.5, 34], [111.5, 38],
  [120, 12], [123, 14], [126, 16], [129, 18], [120, 24], [126, 26], [120, 34],
  [136, 24], [139, 26], [142, 28], [145, 30], [136, 36], [142, 38],
  [152, 16], [155, 18], [158, 20], [161, 22], [152, 26], [158, 28], [152, 34],
  [168, 22], [171, 24], [174, 26], [177, 28], [168, 32], [174, 34], [168, 38],
  [184, 30], [187, 32], [190, 34], [184, 36], [184, 40]
];

const SPARK_SEEDS = [
  { x: 36, y: 18, size: 1.6, duration: 3.4 },
  { x: 48, y: 12, size: 1.2, duration: 3.0 },
  { x: 60, y: 20, size: 1.8, duration: 4.0 },
  { x: 44, y: 24, size: 1.0, duration: 2.6 },
  { x: 54, y: 10, size: 1.4, duration: 3.6 },
  { x: 40, y: 16, size: 1.1, duration: 3.2 }
] as const;
