"use client";

import { motion } from "framer-motion";

export function NeonWorldBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* sky gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_10%,rgba(168,85,247,0.28),transparent_60%),radial-gradient(900px_520px_at_20%_20%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(1200px_700px_at_80%_30%,rgba(139,92,246,0.18),transparent_62%)]" />

      {/* stars */}
      <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(900px_560px_at_50%_15%,black,transparent_70%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1.2px)] [background-size:26px_26px]" />
      </div>

      {/* horizon mist / ocean */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(900px_380px_at_50%_0%,rgba(139,92,246,0.22),transparent_60%),radial-gradient(1200px_520px_at_50%_30%,rgba(0,0,0,0.0),rgba(7,7,18,0.92)_70%)]" />

      {/* clouds */}
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(216,180,254,0.22),transparent_65%)] blur-3xl opacity-60" />
      <div className="absolute -right-32 top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(147,197,253,0.16),transparent_65%)] blur-3xl opacity-55" />
      <div className="absolute left-[20%] bottom-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.18),transparent_65%)] blur-3xl opacity-50" />
    </div>
  );
}

export function CentralHub({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
    >
      {/* beam */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-320px] h-[560px] w-[10px] -translate-x-1/2 rounded-full"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.55, 0.28] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(139,92,246,0.85), rgba(168,85,247,0.55), transparent)",
          filter: "drop-shadow(0 0 18px rgba(139,92,246,0.55))"
        }}
      />

      {/* hub platform */}
      <div className="relative h-[190px] w-[190px]">
        <div className="absolute inset-0 rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(255,255,255,0.05)] shadow-glow backdrop-blur-xl" />
        <div className="absolute inset-3 rounded-full border border-panel-border bg-[rgba(0,0,0,0.25)]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.32),transparent_55%)]" />

        <motion.div
          aria-hidden
          className="absolute inset-[-10px] rounded-full border border-[rgba(139,92,246,0.18)]"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.18, 0.35, 0.18] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "blur(0px)" }}
        />

        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.14)] shadow-glow" />
      </div>

      <div className="mt-4 text-center text-xs font-semibold text-ink-1 transition group-hover:text-ink-0">
        Central Nexus
      </div>
    </button>
  );
}

export function NeonRoutes() {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      viewBox="0 0 1000 740"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(139,92,246,0.25)" />
          <stop offset="0.5" stopColor="rgba(139,92,246,0.85)" />
          <stop offset="1" stopColor="rgba(168,85,247,0.35)" />
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

      {/* ring */}
      <path
        d="M 300 610 C 420 710, 580 710, 700 610"
        stroke="url(#routeGlow)"
        strokeWidth="4"
        fill="none"
        opacity="0.75"
        filter="url(#softGlow)"
      />

      {/* four spokes */}
      <path
        d="M 500 370 C 410 320, 360 250, 320 180"
        stroke="url(#routeGlow)"
        strokeWidth="4"
        fill="none"
        opacity="0.85"
        filter="url(#softGlow)"
      />
      <path
        d="M 500 370 C 590 320, 640 250, 680 180"
        stroke="url(#routeGlow)"
        strokeWidth="4"
        fill="none"
        opacity="0.85"
        filter="url(#softGlow)"
      />
      <path
        d="M 500 370 C 420 430, 360 500, 320 580"
        stroke="url(#routeGlow)"
        strokeWidth="4"
        fill="none"
        opacity="0.78"
        filter="url(#softGlow)"
      />
      <path
        d="M 500 370 C 580 430, 640 500, 680 580"
        stroke="url(#routeGlow)"
        strokeWidth="4"
        fill="none"
        opacity="0.78"
        filter="url(#softGlow)"
      />
    </svg>
  );
}

