"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export type GalaxyNode = {
  id: string;
  label: string;
  icon: string;
  locked: boolean;
  doneCount: number;
  totalCount: number;
  x: number; // 0..100 (%)
  y: number; // 0..100 (%)
};

type IslandTheme = "business" | "forces" | "financials" | "management";

function themeAccent(theme: IslandTheme | undefined) {
  switch (theme) {
    case "business":
      return { a: "rgba(139,92,246,0.95)", b: "rgba(59,130,246,0.45)" };
    case "financials":
      return { a: "rgba(168,85,247,0.95)", b: "rgba(34,211,238,0.30)" };
    case "forces":
      return { a: "rgba(99,102,241,0.95)", b: "rgba(139,92,246,0.45)" };
    case "management":
      return { a: "rgba(139,92,246,0.95)", b: "rgba(236,72,153,0.25)" };
    default:
      return { a: "rgba(139,92,246,0.95)", b: "rgba(59,130,246,0.35)" };
  }
}

type Particle = {
  id: string;
  x: number;
  y: number;
  r: number;
  a: number;
  d: number;
  driftX: number;
  driftY: number;
  delay: number;
};

// Deterministic pseudo-random using 32-bit integer math (stable across server/client).
function rand01(seed: number) {
  // xorshift32
  let x = (seed | 0) || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // Convert to [0,1)
  return ((x >>> 0) / 4294967296) % 1;
}

function q(n: number, digits: number) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function makeParticles(n: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const s0 = 1703 + i * 173;
    const s1 = 9177 + i * 211;
    const s2 = 20431 + i * 307;
    const s3 = 1007 + i * 419;
    const s4 = 5519 + i * 523;
    const s5 = 8801 + i * 637;
    const s6 = 12390 + i * 741;
    const r = 1 + rand01(s0) * 2.2;
    out.push({
      id: `p_${i}`,
      x: q(rand01(s1) * 100, 4),
      y: q(rand01(s2) * 100, 4),
      r: q(r, 4),
      a: q(0.10 + rand01(s3) * 0.22, 4),
      d: q(7 + rand01(s4) * 10, 3),
      driftX: q((rand01(s5) - 0.5) * 16, 3),
      driftY: q((rand01(s6) - 0.5) * 18, 3),
      delay: q(rand01(3005 + i * 917) * 2, 3)
    });
  }
  return out;
}

export function GalaxyBackground({
  intensity = 1,
  animated = true
}: {
  intensity?: number;
  animated?: boolean;
}) {
  const particles = useMemo(() => makeParticles(42), []);
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[#05050F]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_30%,rgba(139,92,246,0.26),transparent_62%),radial-gradient(700px_420px_at_20%_22%,rgba(168,85,247,0.20),transparent_60%),radial-gradient(900px_520px_at_80%_22%,rgba(59,130,246,0.12),transparent_62%)]" />

      {/* star layers */}
      <div className="absolute inset-0 opacity-75">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1.2px)] [background-size:30px_30px]" />
      </div>
      <div className="absolute inset-0 opacity-35">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_1px,transparent_1.2px)] [background-size:58px_58px]" />
      </div>

      {/* drifting particles */}
      <div className="absolute inset-0 opacity-80">
        {particles.map((p) => (
          animated ? (
            <motion.div
              key={p.id}
              aria-hidden
              className="absolute rounded-full"
              initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: [0, p.a, 0],
                x: [0, p.driftX * intensity, 0],
                y: [0, p.driftY * intensity, 0],
                scale: [1, 1.25, 1]
              }}
              transition={{
                duration: p.d,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay
              }}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${q(p.r * 2, 4)}px`,
                height: `${q(p.r * 2, 4)}px`,
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.80), rgba(139,92,246,0.18), transparent 70%)",
                filter: "blur(0.2px)"
              }}
            />
          ) : (
            <div
              key={p.id}
              aria-hidden
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${q(p.r * 2, 4)}px`,
                height: `${q(p.r * 2, 4)}px`,
                opacity: p.a,
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.80), rgba(139,92,246,0.18), transparent 70%)",
                filter: "blur(0.2px)"
              }}
            />
          )
        ))}
      </div>

      {/* horizon glow */}
      <div className="absolute inset-x-0 bottom-[-140px] h-[360px] bg-[radial-gradient(760px_220px_at_50%_0%,rgba(139,92,246,0.34),transparent_65%)] blur-2xl opacity-75" />

      {/* fog + light rays */}
      {animated ? (
        <>
          <motion.div
            aria-hidden
            className="absolute inset-[-20%] opacity-45"
            initial={{ opacity: 0.28 }}
            animate={{ opacity: [0.22, 0.45, 0.22] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(600px_380px_at_55%_35%, rgba(139,92,246,0.22), transparent 62%), radial-gradient(700px_460px_at_35%_55%, rgba(59,130,246,0.12), transparent 60%)",
              filter: "blur(18px)"
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-[-30%] opacity-30"
            initial={{ rotate: -6, scale: 1.05 }}
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "repeating-linear-gradient(110deg, rgba(139,92,246,0.10) 0px, rgba(139,92,246,0.00) 120px, rgba(168,85,247,0.08) 240px)",
              maskImage:
                "radial-gradient(520px_360px_at_50%_42%, black 30%, transparent 70%)",
              filter: "blur(10px)"
            }}
          />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-[-20%] opacity-35"
            style={{
              background:
                "radial-gradient(600px_380px_at_55%_35%, rgba(139,92,246,0.18), transparent 62%), radial-gradient(700px_460px_at_35%_55%, rgba(59,130,246,0.10), transparent 60%)",
              filter: "blur(18px)"
            }}
          />
          <div
            aria-hidden
            className="absolute inset-[-30%] opacity-22"
            style={{
              background:
                "repeating-linear-gradient(110deg, rgba(139,92,246,0.08) 0px, rgba(139,92,246,0.00) 120px, rgba(168,85,247,0.06) 240px)",
              maskImage:
                "radial-gradient(520px_360px_at_50%_42%, black 30%, transparent 70%)",
              filter: "blur(10px)"
            }}
          />
        </>
      )}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_540px_at_50%_35%,transparent_40%,rgba(0,0,0,0.55)_78%)]" />
    </div>
  );
}

export function GalaxyRoutes({
  nodes,
  animated = true
}: {
  nodes: { x: number; y: number; locked: boolean }[];
  animated?: boolean;
}) {
  // Expect: [hub, n1, n2, n3, n4]
  const p = (i: number) => ({
    x: (nodes[i]?.x ?? 50) / 100,
    y: (nodes[i]?.y ?? 50) / 100
  });
  const hub = p(0);
  const n1 = p(1);
  const n2 = p(2);
  const n3 = p(3);
  const n4 = p(4);

  const opacityFor = (idx: number) => (nodes[idx]?.locked ? 0.22 : 0.78);

  const spoke = (a: { x: number; y: number }, b: { x: number; y: number }, bend: number) =>
    `M ${a.x * 1000} ${a.y * 700} C ${(a.x * 1000 + b.x * 1000) / 2} ${(a.y * 700 + b.y * 700) / 2 + bend}, ${(a.x * 1000 + b.x * 1000) / 2} ${(a.y * 700 + b.y * 700) / 2 + bend * 0.4}, ${b.x * 1000} ${b.y * 700}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10"
      viewBox="0 0 1000 700"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(139,92,246,0.18)" />
          <stop offset="0.5" stopColor="rgba(139,92,246,0.85)" />
          <stop offset="1" stopColor="rgba(168,85,247,0.30)" />
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* hub ring */}
      <path
        d="M 300 600 C 420 690, 580 690, 700 600"
        stroke="url(#routeGlow)"
        strokeWidth="3.4"
        fill="none"
        opacity="0.65"
        filter="url(#softGlow)"
      />
      {animated ? (
        <motion.path
          d="M 300 600 C 420 690, 580 690, 700 600"
          stroke="rgba(210,190,255,0.45)"
          strokeWidth="1.6"
          fill="none"
          opacity="0.35"
          strokeDasharray="10 18"
          filter="url(#softGlow)"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -260 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {/* spokes */}
      {[
        { d: spoke(hub, n1, -58), o: opacityFor(1) },
        { d: spoke(hub, n2, -58), o: opacityFor(2) },
        { d: spoke(hub, n3, 44), o: opacityFor(3) },
        { d: spoke(hub, n4, 44), o: opacityFor(4) }
      ].map((s, idx) => (
        <g key={idx} opacity={s.o}>
          <path
            d={s.d}
            stroke="url(#routeGlow)"
            strokeWidth="3.4"
            fill="none"
            filter="url(#softGlow)"
            strokeLinecap="round"
          />
          {animated ? (
            <motion.path
              d={s.d}
              stroke="rgba(230,220,255,0.55)"
              strokeWidth="1.6"
              fill="none"
              strokeDasharray="11 22"
              strokeLinecap="round"
              filter="url(#softGlow)"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -320 }}
              transition={{
                duration: 6.8,
                repeat: Infinity,
                ease: "linear",
                delay: idx * 0.15
              }}
              opacity={0.45}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function HubNode({
  x,
  y,
  onClick,
  animated = true
}: {
  x: number;
  y: number;
  onClick: () => void;
  animated?: boolean;
}) {
  if (!animated) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        {/* reactor corona */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18), rgba(139,92,246,0.06), transparent 62%)",
            filter: "blur(18px)"
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-240px] h-[420px] w-[10px] -translate-x-1/2 rounded-full opacity-35"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(139,92,246,0.90), rgba(168,85,247,0.55), transparent)",
            filter: "drop-shadow(0 0 18px rgba(139,92,246,0.55))"
          }}
        />
        <div className="relative h-[170px] w-[170px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-14px] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(139,92,246,0.00), rgba(139,92,246,0.28), rgba(59,130,246,0.00), rgba(168,85,247,0.22), rgba(139,92,246,0.00))",
              maskImage:
                "radial-gradient(circle, transparent 56%, black 66%, transparent 78%)",
              filter: "blur(0.6px)",
              opacity: 0.8
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[rgba(255,255,255,0.04)] shadow-[0_0_0_1px_rgba(139,92,246,0.16),0_0_55px_rgba(139,92,246,0.16)] backdrop-blur-xl" />
          <div className="pointer-events-none absolute inset-3 rounded-full bg-[rgba(0,0,0,0.26)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.30),transparent_56%)]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-10px] rounded-full"
            style={{
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.10), 0 0 42px rgba(139,92,246,0.12)"
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[rgba(139,92,246,0.14)]"
            style={{ boxShadow: "0 0 22px rgba(139,92,246,0.28)" }}
          />
        </div>
      </button>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
      style={{ left: `${x}%`, top: `${y}%` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* hub pulse ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0.22, scale: 0.92 }}
        animate={{ opacity: [0.10, 0.34, 0.10], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.30), rgba(139,92,246,0.06), transparent 64%)",
          filter: "blur(10px)"
        }}
      />

      {/* reactor corona + rotating energy ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        initial={{ opacity: 0.35, scale: 0.96 }}
        animate={{ opacity: [0.24, 0.55, 0.24], scale: [0.96, 1.06, 0.96] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.18), rgba(139,92,246,0.06), transparent 62%)",
          filter: "blur(18px)"
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ rotate: 0, opacity: 0.55 }}
        animate={{ rotate: 360, opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg, rgba(139,92,246,0.00), rgba(139,92,246,0.32), rgba(59,130,246,0.00), rgba(168,85,247,0.24), rgba(139,92,246,0.00))",
          maskImage:
            "radial-gradient(circle, transparent 58%, black 66%, transparent 78%)",
          filter: "blur(0.6px)"
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-240px] h-[420px] w-[10px] -translate-x-1/2 rounded-full"
        initial={{ opacity: 0.30 }}
        animate={{ opacity: [0.22, 0.50, 0.22] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(139,92,246,0.90), rgba(168,85,247,0.55), transparent)",
          filter: "drop-shadow(0 0 18px rgba(139,92,246,0.55))"
        }}
      />
      <div className="relative h-[170px] w-[170px]">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[rgba(255,255,255,0.04)] shadow-[0_0_0_1px_rgba(139,92,246,0.16),0_0_55px_rgba(139,92,246,0.16)] backdrop-blur-xl" />
        <div className="pointer-events-none absolute inset-3 rounded-full bg-[rgba(0,0,0,0.26)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.30),transparent_56%)]" />
        <motion.div
          aria-hidden
          className="absolute inset-[18px] rounded-full"
          initial={{ rotate: 0, opacity: 0.40 }}
          animate={{ rotate: 360, opacity: [0.22, 0.42, 0.22] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from 0deg, rgba(139,92,246,0.00), rgba(139,92,246,0.35), rgba(168,85,247,0.00), rgba(59,130,246,0.22), rgba(139,92,246,0.00))",
            maskImage:
              "radial-gradient(circle, transparent 50%, black 62%, transparent 74%)",
            filter: "blur(0.4px)"
          }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-[-10px] rounded-full"
          initial={{ opacity: 0.22 }}
          animate={{ opacity: [0.16, 0.32, 0.16] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow:
              "0 0 0 1px rgba(139,92,246,0.10), 0 0 42px rgba(139,92,246,0.12)"
          }}
        />
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[rgba(139,92,246,0.14)]"
          initial={{ boxShadow: "0 0 0 rgba(139,92,246,0)" }}
          animate={{
            boxShadow: [
              "0 0 12px rgba(139,92,246,0.18)",
              "0 0 26px rgba(139,92,246,0.35)",
              "0 0 12px rgba(139,92,246,0.18)"
            ]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 22px rgba(139,92,246,0.28)" }}
        />
      </div>
    </motion.button>
  );
}

export function OrbNode({
  node,
  onClick,
  animated = true,
  theme
}: {
  node: GalaxyNode;
  onClick: () => void;
  animated?: boolean;
  theme?: IslandTheme;
}) {
  const pct = node.totalCount === 0 ? 0 : Math.round((node.doneCount / node.totalCount) * 100);
  const [burst, setBurst] = useState(0);
  const accent = themeAccent(theme);
  const frame = 150;
  if (!animated) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
        style={{ left: `${node.x}%`, top: `${node.y}%` }}
        aria-label={`${node.label}. ${node.locked ? "Locked" : "Unlocked"}. ${pct}% complete.`}
      >
        {/* cinematic under-glow + shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: node.locked ? 0.22 : 0.55,
            background: node.locked
              ? "radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0.02), transparent 64%)"
              : `radial-gradient(circle, ${accent.a}, rgba(139,92,246,0.10), transparent 66%)`,
            filter: "blur(22px)"
          }}
        />

        {/* island frame */}
        <div
          className={[
            "relative grid place-items-center rounded-[52px] border backdrop-blur-xl",
            node.locked
              ? "border-panel-border bg-[rgba(255,255,255,0.03)] shadow-[0_24px_55px_rgba(0,0,0,0.75)]"
              : "border-[rgba(139,92,246,0.35)] bg-[rgba(255,255,255,0.04)] shadow-[0_28px_70px_rgba(0,0,0,0.78),0_0_80px_rgba(139,92,246,0.16)]"
          ].join(" ")}
          style={{ width: frame, height: frame }}
        >
          {/* holographic fill (CSS only) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[10px] overflow-hidden rounded-[44px]"
            style={{
              backgroundColor: "rgba(0,0,0,0.22)",
              backgroundImage: node.locked
                ? "radial-gradient(ellipse 85% 75% at 50% 40%, rgba(255,255,255,0.08), transparent 72%)"
                : `radial-gradient(ellipse 90% 80% at 42% 32%, ${accent.a}, transparent 62%), radial-gradient(ellipse 75% 65% at 72% 68%, ${accent.b}, transparent 58%)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: node.locked ? "grayscale(1) contrast(0.9) brightness(0.85) blur(0.2px)" : "contrast(1.05) saturate(1.12)"
            }}
          />

          {/* atmospheric lighting */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[10px] rounded-[44px]"
            style={{
              background: node.locked
                ? "radial-gradient(600px_320px_at_40%_25%,rgba(255,255,255,0.05),transparent_60%)"
                : `radial-gradient(600px_320px_at_40%_25%,${accent.b},transparent_60%), radial-gradient(520px_320px_at_70%_75%,rgba(139,92,246,0.20),transparent_62%)`,
              mixBlendMode: "screen",
              opacity: node.locked ? 0.55 : 0.9
            }}
          />

          {/* floating base glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 left-1/2 h-20 w-[92%] -translate-x-1/2 rounded-[999px]"
            style={{
              background: node.locked
                ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%)"
                : `radial-gradient(circle at 50% 50%, ${accent.a}, transparent 72%)`,
              filter: "blur(22px)",
              opacity: node.locked ? 0.22 : 0.55
            }}
          />

          {/* status + label */}
          <div className="relative flex w-full items-end justify-between px-4 pb-3">
            <div className="text-[11px] font-semibold tracking-wide text-ink-1">
              {node.label}
            </div>
            <div className="text-[11px] font-semibold text-ink-2">
              {node.locked ? "LOCKED" : `${pct}%`}
            </div>
          </div>

          {/* holographic rim */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[2px] rounded-[56px]"
            style={{
              background: node.locked
                ? "linear-gradient(135deg, rgba(255,255,255,0.06), transparent, rgba(255,255,255,0.03))"
                : `linear-gradient(135deg, rgba(139,92,246,0.55), rgba(59,130,246,0.22), rgba(168,85,247,0.35))`,
              filter: "blur(10px)",
              opacity: node.locked ? 0.35 : 0.55
            }}
          />
        </div>
      </button>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={() => {
        setBurst((b) => b + 1);
        onClick();
      }}
      className="group absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      animate={animated ? { y: node.locked ? [0, -2, 0] : [0, -7, 0] } : undefined}
      transition={
        animated
          ? {
              duration: node.locked ? 6.2 : 5.2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          : undefined
      }
      whileHover={{ scale: node.locked ? 1.0 : 1.06 }}
      whileTap={{ scale: node.locked ? 1.0 : 0.99 }}
      // spring only for hover/tap; float uses animate above
      layout
      aria-label={`${node.label}. ${node.locked ? "Locked" : "Unlocked"}. ${pct}% complete.`}
    >
      {/* click burst */}
      <motion.div
        key={burst}
        aria-hidden
        className="pointer-events-none absolute inset-[-30px] rounded-full"
        initial={{ opacity: 0.0, scale: 0.75 }}
        animate={{ opacity: [0.0, 0.28, 0.0], scale: [0.75, 1.22, 1.34] }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: node.locked
            ? "radial-gradient(circle, rgba(255,255,255,0.12), transparent 62%)"
            : `radial-gradient(circle, ${accent.a}, transparent 64%)`,
          filter: "blur(6px)"
        }}
      />

      {/* cinematic under-glow + shadow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0.26, scale: 0.96 }}
        animate={{
          opacity: node.locked ? [0.18, 0.26, 0.18] : [0.22, 0.62, 0.22],
          scale: node.locked ? [0.96, 1.02, 0.96] : [0.96, 1.08, 0.96]
        }}
        transition={{ duration: node.locked ? 4.8 : 3.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: node.locked
            ? "radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0.02), transparent 64%)"
            : `radial-gradient(circle, ${accent.a}, rgba(139,92,246,0.10), transparent 66%)`,
          filter: "blur(22px)"
        }}
      />

      {/* island frame */}
      <motion.div
        className={[
          "relative grid place-items-center rounded-[52px] border backdrop-blur-xl",
          node.locked
            ? "border-panel-border bg-[rgba(255,255,255,0.03)] shadow-[0_24px_55px_rgba(0,0,0,0.75)]"
            : "border-[rgba(139,92,246,0.35)] bg-[rgba(255,255,255,0.04)] shadow-[0_28px_70px_rgba(0,0,0,0.78),0_0_80px_rgba(139,92,246,0.16)]"
        ].join(" ")}
        whileHover={node.locked ? { y: -2 } : { y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={{ width: frame, height: frame }}
      >
        {/* holographic fill (CSS only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[10px] overflow-hidden rounded-[44px]"
          style={{
            backgroundColor: "rgba(0,0,0,0.22)",
            backgroundImage: node.locked
              ? "radial-gradient(ellipse 85% 75% at 50% 40%, rgba(255,255,255,0.08), transparent 72%)"
              : `radial-gradient(ellipse 90% 80% at 42% 32%, ${accent.a}, transparent 62%), radial-gradient(ellipse 75% 65% at 72% 68%, ${accent.b}, transparent 58%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: node.locked ? "grayscale(1) contrast(0.9) brightness(0.85) blur(0.2px)" : "contrast(1.05) saturate(1.12)"
          }}
        />

        {/* mysterious locked veil */}
        {node.locked ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-[10px] rounded-[44px]"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.28, 0.42, 0.28] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(600px_320px_at_50%_45%, rgba(7,7,18,0.00), rgba(7,7,18,0.55) 60%, rgba(7,7,18,0.78))"
            }}
          />
        ) : null}

        {/* atmospheric lighting */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[10px] rounded-[44px]"
          style={{
            background: node.locked
              ? "radial-gradient(600px_320px_at_40%_25%,rgba(255,255,255,0.05),transparent_60%)"
              : `radial-gradient(600px_320px_at_40%_25%,${accent.b},transparent_60%), radial-gradient(520px_280px_at_70%_75%,rgba(139,92,246,0.20),transparent_62%)`,
            mixBlendMode: "screen",
            opacity: node.locked ? 0.55 : 0.9
          }}
        />

        {/* floating base glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-1/2 h-20 w-[92%] -translate-x-1/2 rounded-[999px]"
          initial={{ opacity: node.locked ? 0.18 : 0.45, scale: 0.96 }}
          animate={{
            opacity: node.locked ? [0.16, 0.22, 0.16] : [0.35, 0.62, 0.35],
            scale: node.locked ? [0.96, 1.0, 0.96] : [0.96, 1.06, 0.96]
          }}
          transition={{ duration: node.locked ? 5.8 : 3.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: node.locked
              ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%)"
              : `radial-gradient(circle at 50% 50%, ${accent.a}, transparent 72%)`,
            filter: "blur(22px)"
          }}
        />

        {/* unlocked shimmer sweep (reward psychology) */}
        {!node.locked ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-[10px] overflow-hidden rounded-[44px]"
            initial={{ opacity: 0.0 }}
            animate={{ opacity: [0.0, 0.35, 0.0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.10) 45%, transparent 70%)",
              maskImage:
                "radial-gradient(600px_380px_at_50%_50%, black 30%, transparent 70%)"
            }}
          />
        ) : null}

        {/* status + label */}
        <div className="relative flex w-full items-end justify-between px-4 pb-3">
          <div className="text-[11px] font-semibold tracking-wide text-ink-1">
            {node.label}
          </div>
          <div className={["text-[11px] font-semibold", node.locked ? "text-ink-2" : "text-neon-300"].join(" ")}>
            {node.locked ? "LOCKED" : `${pct}%`}
          </div>
        </div>

        {/* holographic rim */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[2px] rounded-[56px]"
          initial={{ opacity: node.locked ? 0.22 : 0.35 }}
          animate={{ opacity: node.locked ? [0.18, 0.28, 0.18] : [0.22, 0.55, 0.22] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: node.locked
              ? "linear-gradient(135deg, rgba(255,255,255,0.06), transparent, rgba(255,255,255,0.03))"
              : `linear-gradient(135deg, rgba(139,92,246,0.55), rgba(59,130,246,0.22), rgba(168,85,247,0.35))`,
            filter: "blur(10px)"
          }}
        />

        <div className="relative -mt-2 text-[42px] font-semibold text-neon-300 drop-shadow-[0_0_18px_rgba(139,92,246,0.45)]">
          {node.icon}
        </div>
      </motion.div>
    </motion.button>
  );
}

