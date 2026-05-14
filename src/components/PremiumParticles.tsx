"use client";

import { useMemo, type CSSProperties } from "react";

type Particle = {
  id: string;
  leftPct: number;
  topPct: number;
  sizePx: number;
  alpha: number;
  driftXPx: number;
  driftYPx: number;
  durationS: number;
  delayS: number;
};

// Deterministic pseudo-random using 32-bit integer math (stable across server/client).
function rand01(seed: number) {
  // xorshift32
  let x = (seed | 0) || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) / 4294967296) % 1;
}

function q(n: number, digits: number) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function makeParticles(n: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const s0 = 4242 + i * 97;
    const s1 = 9551 + i * 131;
    const s2 = 14141 + i * 173;
    const s3 = 2222 + i * 211;
    const s4 = 7777 + i * 263;
    const s5 = 9999 + i * 307;
    const s6 = 3131 + i * 359;

    const size = 1 + rand01(s0) * 2.2;
    out.push({
      id: `pp_${i}`,
      leftPct: q(rand01(s1) * 100, 4),
      topPct: q(rand01(s2) * 100, 4),
      sizePx: q(size, 3),
      alpha: q(0.08 + rand01(s3) * 0.20, 4),
      driftXPx: q((rand01(s4) - 0.5) * 22, 3),
      driftYPx: q(-14 - rand01(s5) * 34, 3),
      durationS: q(8 + rand01(s6) * 10, 3),
      delayS: q(rand01(6061 + i * 541) * 2.2, 3)
    });
  }
  return out;
}

export function PremiumParticles({
  count = 26,
  className
}: {
  count?: number;
  className?: string;
}) {
  const particles = useMemo(() => makeParticles(count), [count]);
  return (
    <div className={["pointer-events-none absolute inset-0", className ?? ""].join(" ")}>
      {particles.map((p) => (
        <span
          key={p.id}
          aria-hidden
          className="premium-particle"
          style={
            {
              left: `${p.leftPct}%`,
              top: `${p.topPct}%`,
              width: `${p.sizePx}px`,
              height: `${p.sizePx}px`,
              opacity: p.alpha,
              "--pp-dx": `${p.driftXPx}px`,
              "--pp-dy": `${p.driftYPx}px`,
              "--pp-dur": `${p.durationS}s`,
              "--pp-delay": `${p.delayS}s`
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

