"use client";

import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";

import { NeonButton } from "@/components/NeonButton";
import { BorderBeam } from "@/components/ui/border-beam";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  readPickInterestsSelection,
  writePickInterestsSelection
} from "@/lib/bank/pickInterestsState";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import { shouldRunSchoolsDemoBackgroundSystems } from "@/lib/schools/schoolsDemoProtection";
import { SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT } from "@/lib/schools/schoolsPickInterestsConfig";

export type SchoolsPickInterestsScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

export type SchoolsInterestCard = {
  id: string;
  label: string;
  subtitle: string;
  background: string;
  glow: string;
  primary: string;
  secondary: string;
  highlight: string;
};

export const SCHOOLS_INTEREST_CARDS: readonly SchoolsInterestCard[] = [
  {
    id: "ai",
    label: "AI & Robotics",
    subtitle: "Neural networks, automation, the future",
    background:
      "radial-gradient(circle at 74% 20%, rgba(34,211,238,0.38), transparent 32%), linear-gradient(145deg, #07111f 0%, #1e1b4b 42%, #312e81 68%, #0891b2 100%)",
    glow: "rgba(34,211,238,0.55)",
    primary: "#22d3ee",
    secondary: "#a78bfa",
    highlight: "#e0f2fe"
  },
  {
    id: "gaming",
    label: "Gaming & Esports",
    subtitle: "Arenas, speed, digital competition",
    background:
      "radial-gradient(circle at 30% 22%, rgba(236,72,153,0.35), transparent 34%), linear-gradient(145deg, #120818 0%, #4c1d95 42%, #7c3aed 68%, #ec4899 100%)",
    glow: "rgba(236,72,153,0.52)",
    primary: "#f472b6",
    secondary: "#c4b5fd",
    highlight: "#fef3c7"
  },
  {
    id: "music",
    label: "Music & Media",
    subtitle: "Sound, creators, concerts, culture",
    background:
      "radial-gradient(circle at 30% 18%, rgba(217,70,239,0.36), transparent 34%), linear-gradient(145deg, #120619 0%, #581c87 42%, #a21caf 68%, #f0abfc 100%)",
    glow: "rgba(217,70,239,0.52)",
    primary: "#e879f9",
    secondary: "#facc15",
    highlight: "#fae8ff"
  },
  {
    id: "tech",
    label: "Technology",
    subtitle: "Devices, platforms, the connected world",
    background:
      "radial-gradient(circle at 74% 18%, rgba(96,165,250,0.4), transparent 32%), linear-gradient(145deg, #050816 0%, #1e3a8a 45%, #2563eb 72%, #60a5fa 100%)",
    glow: "rgba(96,165,250,0.5)",
    primary: "#60a5fa",
    secondary: "#38bdf8",
    highlight: "#dbeafe"
  },
  {
    id: "sports",
    label: "Sports",
    subtitle: "Teams, leagues, performance under pressure",
    background:
      "radial-gradient(circle at 30% 22%, rgba(52,211,153,0.34), transparent 34%), linear-gradient(145deg, #041510 0%, #064e3b 42%, #059669 68%, #34d399 100%)",
    glow: "rgba(52,211,153,0.48)",
    primary: "#34d399",
    secondary: "#facc15",
    highlight: "#dcfce7"
  },
  {
    id: "electric_cars",
    label: "Cars",
    subtitle: "Electric drives, roads, how we move",
    background:
      "radial-gradient(circle at 70% 22%, rgba(56,189,248,0.34), transparent 34%), linear-gradient(145deg, #050810 0%, #0f172a 40%, #334155 65%, #38bdf8 100%)",
    glow: "rgba(56,189,248,0.48)",
    primary: "#38bdf8",
    secondary: "#94a3b8",
    highlight: "#e0f2fe"
  },
  {
    id: "health",
    label: "Medicine & Healthcare",
    subtitle: "Breakthroughs, care, human resilience",
    background:
      "radial-gradient(circle at 28% 20%, rgba(103,232,249,0.36), transparent 34%), linear-gradient(145deg, #041018 0%, #0e7490 44%, #0891b2 70%, #67e8f9 100%)",
    glow: "rgba(103,232,249,0.45)",
    primary: "#67e8f9",
    secondary: "#f0abfc",
    highlight: "#ecfeff"
  },
  {
    id: "finance",
    label: "Money & Finance",
    subtitle: "Markets, banks, where value moves",
    background:
      "radial-gradient(circle at 70% 22%, rgba(251,191,36,0.4), transparent 34%), linear-gradient(145deg, #0c0a06 0%, #78350f 42%, #b45309 68%, #fbbf24 100%)",
    glow: "rgba(251,191,36,0.5)",
    primary: "#fbbf24",
    secondary: "#fef08a",
    highlight: "#fffbeb"
  },
  {
    id: "energy",
    label: "Energy & Power",
    subtitle: "Grid, fuel, what keeps the lights on",
    background:
      "radial-gradient(circle at 34% 20%, rgba(253,224,71,0.38), transparent 34%), linear-gradient(145deg, #0a0804 0%, #92400e 40%, #ea580c 66%, #fde047 100%)",
    glow: "rgba(253,224,71,0.48)",
    primary: "#fde047",
    secondary: "#fb923c",
    highlight: "#fefce8"
  },
  {
    id: "consumer",
    label: "Shopping & Brands",
    subtitle: "Stores, labels, what people buy",
    background:
      "radial-gradient(circle at 68% 22%, rgba(249,168,212,0.34), transparent 34%), linear-gradient(145deg, #100812 0%, #831843 44%, #db2777 70%, #f9a8d4 100%)",
    glow: "rgba(249,168,212,0.48)",
    primary: "#f9a8d4",
    secondary: "#f0abfc",
    highlight: "#fdf2f8"
  },
  {
    id: "travel",
    label: "Travel & Adventure",
    subtitle: "Horizons, journeys, places unseen",
    background:
      "radial-gradient(circle at 28% 20%, rgba(125,211,252,0.36), transparent 34%), linear-gradient(145deg, #050c18 0%, #1d4ed8 42%, #0284c7 68%, #7dd3fc 100%)",
    glow: "rgba(125,211,252,0.48)",
    primary: "#7dd3fc",
    secondary: "#facc15",
    highlight: "#f0f9ff"
  },
  {
    id: "food",
    label: "Food & Restaurants",
    subtitle: "Kitchens, flavors, dining culture",
    background:
      "radial-gradient(circle at 70% 22%, rgba(251,146,60,0.36), transparent 34%), linear-gradient(145deg, #120806 0%, #9a3412 42%, #dc2626 68%, #fb923c 100%)",
    glow: "rgba(251,146,60,0.5)",
    primary: "#fb923c",
    secondary: "#fde68a",
    highlight: "#fff7ed"
  }
] as const;

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.06 }
  }
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }
  }
};

function SceneParticles({ card }: { card: SchoolsInterestCard }) {
  const particles = [
    { x: 38, y: 32, r: 1.9, delay: 0 },
    { x: 96, y: 22, r: 1.3, delay: 0.7 },
    { x: 172, y: 34, r: 1.7, delay: 1.1 },
    { x: 250, y: 24, r: 1.5, delay: 0.35 },
    { x: 286, y: 72, r: 1.2, delay: 1.55 }
  ];

  return (
    <>
      {particles.map((particle, index) => (
        <motion.circle
          key={`${card.id}-particle-${index}`}
          cx={particle.x}
          cy={particle.y}
          r={particle.r}
          fill={index % 2 ? card.secondary : card.highlight}
          opacity="0.72"
          animate={{ y: [0, -5, 0], opacity: [0.28, 0.86, 0.28] }}
          transition={{
            duration: 3.6 + index * 0.35,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  );
}

function SceneShell({ card, children }: { card: SchoolsInterestCard; children: React.ReactNode }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 320 180"
      className="absolute inset-0 h-full w-full overflow-hidden"
      animate={{ y: [0, -1.8, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <radialGradient id={`scene-orb-${card.id}`} cx="68%" cy="20%" r="62%">
          <stop offset="0%" stopColor={card.highlight} stopOpacity="0.36" />
          <stop offset="42%" stopColor={card.primary} stopOpacity="0.13" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`scene-ground-${card.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={card.primary} stopOpacity="0.26" />
          <stop offset="55%" stopColor="#020617" stopOpacity="0.2" />
          <stop offset="100%" stopColor={card.secondary} stopOpacity="0.2" />
        </linearGradient>
        <filter id={`scene-shadow-${card.id}`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#020617" floodOpacity="0.55" />
        </filter>
        <filter id={`scene-glow-${card.id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill={`url(#scene-orb-${card.id})`} />
      <path d="M-8 72 C38 48 74 62 112 44 C152 24 194 48 228 32 C266 16 294 28 330 20 V0 H-8 Z" fill={card.primary} opacity="0.08" />
      <path d="M24 98 H54 V64 H78 V98 H106 V50 H132 V98 H162 V76 H186 V98 H214 V58 H238 V98 H272 V70 H296 V98" fill="#020617" opacity="0.24" />
      <path d="M28 98 H300" stroke={card.highlight} strokeOpacity="0.12" strokeWidth="2" />
      <path d="M48 116 V92 M272 116 V90" stroke={card.highlight} strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="88" r="6" fill={card.primary} opacity="0.34" filter={`url(#scene-glow-${card.id})`} />
      <circle cx="272" cy="86" r="6" fill={card.secondary} opacity="0.34" filter={`url(#scene-glow-${card.id})`} />
      <path d="M-10 145 C44 118 86 134 124 112 C174 82 214 126 330 80 L330 190 L-10 190 Z" fill={`url(#scene-ground-${card.id})`} opacity="0.9" />
      <ellipse cx="82" cy="154" rx="44" ry="9" fill="#020617" opacity="0.28" />
      <ellipse cx="222" cy="150" rx="62" ry="12" fill="#020617" opacity="0.26" />
      <path d="M8 150 C70 126 118 144 164 118 C220 86 258 110 314 94" fill="none" stroke={card.highlight} strokeOpacity="0.18" strokeWidth="2" strokeDasharray="7 12" />
      <path d="M20 166 H300" stroke="white" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="4 9" />
      <path d="M34 158 L48 146 L62 158 M264 154 L276 142 L290 154" fill="none" stroke={card.secondary} strokeOpacity="0.34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <SceneParticles card={card} />
      <motion.g
        className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
        filter={`url(#scene-shadow-${card.id})`}
      >
        {children}
      </motion.g>
      <motion.path
        d="M16 26 H302"
        stroke={card.highlight}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.36"
        animate={{ pathLength: [0.15, 0.9, 0.15], opacity: [0.16, 0.56, 0.16] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect x="7" y="7" width="306" height="166" rx="20" fill="none" stroke="white" strokeOpacity="0.11" />
    </motion.svg>
  );
}

function GameInterestArt({ card }: { card: SchoolsInterestCard }) {
  const p = card.primary;
  const s = card.secondary;
  const h = card.highlight;
  const glass = "rgba(15,23,42,0.72)";
  const panel = "rgba(255,255,255,0.11)";

  switch (card.id) {
    case "ai":
      return (
        <SceneShell card={card}>
          <path d="M42 124 H180 L204 154 H22 Z" fill={panel} stroke={p} strokeOpacity="0.45" strokeWidth="2" />
          <rect x="48" y="48" width="74" height="72" rx="14" fill={glass} stroke={p} strokeWidth="3" />
          <rect x="62" y="65" width="46" height="28" rx="9" fill="rgba(34,211,238,0.18)" stroke={h} strokeWidth="2" />
          <circle cx="76" cy="79" r="4" fill={h} />
          <circle cx="96" cy="79" r="4" fill={h} />
          <path d="M74 99 Q86 106 98 99" fill="none" stroke={p} strokeWidth="3" strokeLinecap="round" />
          <path d="M36 82 H14 M122 82 H152 M84 48 V28 M104 54 L142 30" stroke={p} strokeWidth="3" strokeLinecap="round" />
          <path d="M168 52 L244 34 L278 70 L224 116 L160 98 Z" fill="rgba(167,139,250,0.12)" stroke={s} strokeWidth="2" />
          <path d="M180 64 L232 50 L260 72 M174 88 L226 100 L260 72 M232 50 L226 100" fill="none" stroke={h} strokeOpacity="0.7" strokeWidth="1.8" />
          {[180, 232, 260, 226].map((x, i) => (
            <circle key={`ai-node-${i}`} cx={x} cy={[64, 50, 72, 100][i]} r="4.5" fill={i % 2 ? s : p} stroke={h} strokeWidth="1.5" />
          ))}
          <path d="M28 58 C46 40 62 38 76 50 M124 48 C140 30 164 30 178 46" fill="none" stroke={s} strokeOpacity="0.42" strokeWidth="2" strokeDasharray="5 6" />
          <path d="M36 130 H146 M52 142 H198" stroke={h} strokeOpacity="0.26" strokeWidth="2" strokeLinecap="round" />
          <rect x="140" y="118" width="34" height="22" rx="5" fill="rgba(34,211,238,0.12)" stroke={p} strokeWidth="1.5" />
          <path d="M150 128 H164 M152 134 H170" stroke={h} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="30" cy="82" r="7" fill="rgba(34,211,238,0.16)" stroke={p} strokeWidth="1.8" />
          <motion.rect x="212" y="22" width="54" height="30" rx="9" fill="rgba(224,242,254,0.12)" stroke={h} strokeWidth="1.8" animate={{ opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 2.6, repeat: Infinity }} />
        </SceneShell>
      );
    case "gaming":
      return (
        <SceneShell card={card}>
          <path d="M34 122 C70 86 244 86 286 122 L268 154 H52 Z" fill="rgba(76,29,149,0.5)" stroke={p} strokeWidth="2.5" />
          <path d="M58 74 H244 L260 124 H42 Z" fill={glass} stroke={p} strokeWidth="3" />
          <rect x="82" y="45" width="114" height="48" rx="11" fill="rgba(236,72,153,0.18)" stroke={h} strokeWidth="2.4" />
          <path d="M102 64 H176 M108 78 H156" stroke={s} strokeWidth="4" strokeLinecap="round" />
          <path d="M215 70 L226 40 L237 70 Z" fill={s} stroke={h} strokeWidth="2" />
          <rect x="207" y="70" width="38" height="12" rx="6" fill={h} opacity="0.9" />
          <path d="M108 118 C88 112 70 124 66 144 H132 C128 130 120 122 108 118 Z" fill={p} stroke={h} strokeWidth="2" />
          <circle cx="92" cy="135" r="4" fill={h} />
          <path d="M168 134 H198 M183 119 V149" stroke={h} strokeWidth="4" strokeLinecap="round" />
          <path d="M54 42 L102 100 M272 42 L222 100" stroke={h} strokeOpacity="0.25" strokeWidth="7" strokeLinecap="round" />
          <path d="M36 84 C74 54 246 54 286 84" fill="none" stroke={h} strokeOpacity="0.2" strokeWidth="5" />
          {[68, 92, 116, 204, 228, 252].map((x, i) => (
            <circle key={`crowd-${i}`} cx={x} cy={86 + (i % 2) * 8} r="3.2" fill={i % 2 ? s : p} opacity="0.72" />
          ))}
          <path d="M118 102 L134 88 L150 102 M118 102 H150" fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="204" y="104" width="28" height="18" rx="5" fill="rgba(255,255,255,0.1)" stroke={h} strokeWidth="1.7" />
        </SceneShell>
      );
    case "music":
      return (
        <SceneShell card={card}>
          <path d="M42 128 C76 98 236 98 280 128 L260 158 H62 Z" fill="rgba(88,28,135,0.58)" stroke={p} strokeWidth="2.5" />
          <path d="M72 80 H248 L264 128 H56 Z" fill={glass} stroke={p} strokeWidth="3" />
          <rect x="106" y="42" width="108" height="48" rx="13" fill="rgba(232,121,249,0.16)" stroke={h} strokeWidth="2.5" />
          <motion.path
            d="M120 66 C128 52 136 82 144 66 C152 50 160 84 168 66 C176 52 184 80 192 66"
            fill="none"
            stroke={s}
            strokeWidth="4"
            strokeLinecap="round"
            filter={`url(#scene-glow-${card.id})`}
            animate={{ opacity: [0.35, 0.95, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <rect x="68" y="94" width="34" height="50" rx="8" fill="rgba(15,23,42,0.8)" stroke={h} strokeWidth="2.3" />
          <rect x="218" y="94" width="34" height="50" rx="8" fill="rgba(15,23,42,0.8)" stroke={h} strokeWidth="2.3" />
          <circle cx="85" cy="112" r="9" fill={p} opacity="0.42" stroke={h} strokeWidth="1.8" />
          <circle cx="235" cy="112" r="9" fill={p} opacity="0.42" stroke={h} strokeWidth="1.8" />
          <path d="M132 138 H188 L178 112 H142 Z" fill={s} opacity="0.86" stroke={h} strokeWidth="2" />
          <path d="M150 112 V72 H162 V104 C162 116 154 120 148 116 C142 112 144 104 152 102" fill="none" stroke={h} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M48 48 L112 116 M272 48 L208 116" stroke={h} strokeOpacity="0.26" strokeWidth="8" strokeLinecap="round" />
          <path d="M252 38 V72 M252 38 C272 40 268 56 252 54" fill="none" stroke={s} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M78 46 V76 M78 46 C96 48 94 62 78 62" fill="none" stroke={p} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M102 126 C124 112 196 112 222 126" fill="none" stroke={h} strokeOpacity="0.42" strokeWidth="2" strokeDasharray="3 6" />
          <rect x="112" y="96" width="22" height="28" rx="5" fill="rgba(250,232,255,0.12)" stroke={p} strokeWidth="1.6" />
          <rect x="188" y="96" width="22" height="28" rx="5" fill="rgba(250,232,255,0.12)" stroke={s} strokeWidth="1.6" />
          <circle cx="160" cy="136" r="7" fill={p} opacity="0.45" stroke={h} strokeWidth="1.6" />
        </SceneShell>
      );
    case "tech":
      return (
        <SceneShell card={card}>
          <rect x="38" y="78" width="42" height="74" rx="8" fill={glass} stroke={p} strokeWidth="2.5" />
          <rect x="92" y="64" width="44" height="88" rx="8" fill={glass} stroke={s} strokeWidth="2.5" />
          <rect x="148" y="86" width="38" height="66" rx="8" fill={glass} stroke={h} strokeWidth="2.2" />
          {[48, 62, 102, 118, 158, 172].map((x, i) => (
            <path key={`server-${i}`} d={`M${x} ${i < 2 ? 96 : i < 4 ? 84 : 106} H${x + 12}`} stroke={i % 2 ? s : p} strokeWidth="2" strokeLinecap="round" />
          ))}
          <path d="M206 74 C210 48 240 48 252 64 C266 54 290 68 286 88 C304 91 306 118 282 122 H218 C196 122 190 94 206 74 Z" fill="rgba(96,165,250,0.18)" stroke={h} strokeWidth="3" />
          <rect x="210" y="122" width="48" height="28" rx="6" fill={glass} stroke={p} strokeWidth="2" />
          <rect x="270" y="112" width="22" height="38" rx="5" fill={glass} stroke={s} strokeWidth="2" />
          <path d="M80 92 L206 84 M136 76 L228 122 M186 104 L270 130" stroke={h} strokeOpacity="0.6" strokeWidth="2" strokeDasharray="5 7" />
          <path d="M56 140 H180 M64 128 H172" stroke={p} strokeOpacity="0.26" strokeWidth="2" strokeLinecap="round" />
          {[52, 66, 106, 122, 162, 176].map((x, i) => (
            <circle key={`server-light-${i}`} cx={x} cy={i < 2 ? 112 : i < 4 ? 100 : 122} r="2.2" fill={i % 2 ? h : p} opacity="0.8" />
          ))}
          <path d="M224 76 H268 M220 92 H282 M232 108 H272" stroke={h} strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
          <circle cx="250" cy="84" r="4" fill={s} opacity="0.85" />
        </SceneShell>
      );
    case "sports":
      return (
        <SceneShell card={card}>
          <path d="M30 126 C82 96 238 96 292 126 L272 162 H50 Z" fill="rgba(6,78,59,0.75)" stroke={p} strokeWidth="3" />
          <path d="M58 130 H264 M160 102 V162 M82 120 H112 M208 120 H238" stroke={h} strokeOpacity="0.72" strokeWidth="2.5" />
          <ellipse cx="160" cy="132" rx="42" ry="18" fill="none" stroke={h} strokeOpacity="0.55" strokeWidth="2.5" />
          <path d="M42 70 C94 38 226 38 280 70" fill="none" stroke={p} strokeOpacity="0.48" strokeWidth="13" />
          <path d="M54 76 C104 56 216 56 266 76" fill="none" stroke={h} strokeOpacity="0.2" strokeWidth="7" />
          {[66, 88, 110, 210, 232, 254].map((x, i) => (
            <circle key={`sports-crowd-${i}`} cx={x} cy={76 + (i % 2) * 7} r="3.5" fill={i % 2 ? s : p} opacity="0.78" />
          ))}
          <rect x="112" y="38" width="96" height="36" rx="8" fill={glass} stroke={s} strokeWidth="2.5" />
          <path d="M128 56 H146 M174 56 H192" stroke={h} strokeWidth="4" strokeLinecap="round" />
          <circle cx="160" cy="56" r="4" fill={s} />
          <path d="M48 98 H90 V136 H48 Z M230 98 H272 V136 H230 Z" fill="none" stroke={h} strokeOpacity="0.7" strokeWidth="3" />
          <path d="M132 88 H188 V106 C188 126 176 140 160 146 C144 140 132 126 132 106 Z" fill={s} stroke={h} strokeWidth="3" />
          <rect x="150" y="146" width="20" height="9" rx="3" fill={h} opacity="0.9" />
          <motion.g
            animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="96" cy="140" r="11" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
            <path d="M91 137 L96 132 L102 137 L100 144 H92 Z M86 143 H92 M100 144 H108" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
          <path d="M50 58 L100 118 M270 58 L220 118" stroke={h} strokeOpacity="0.24" strokeWidth="8" strokeLinecap="round" />
        </SceneShell>
      );
    case "electric_cars":
      return (
        <SceneShell card={card}>
          <path d="M-10 152 C58 114 174 106 332 82 L332 182 H-10 Z" fill="rgba(15,23,42,0.72)" />
          <path d="M26 150 C96 120 190 108 298 88" stroke={h} strokeOpacity="0.65" strokeWidth="3" strokeDasharray="12 12" />
          <rect x="210" y="46" width="26" height="74" rx="6" fill={glass} stroke={p} strokeWidth="2.5" />
          <path d="M222 62 H236 M222 76 H232" stroke={h} strokeWidth="2" />
          <path d="M62 98 L100 70 H178 L220 98 L234 130 H48 Z" fill="rgba(2,6,23,0.72)" stroke={p} strokeWidth="3" />
          <path d="M106 76 H172 L192 98 H82 Z" fill="rgba(56,189,248,0.2)" stroke={h} strokeWidth="2" />
          <circle cx="86" cy="132" r="15" fill="#020617" stroke={h} strokeWidth="4" />
          <circle cx="190" cy="132" r="15" fill="#020617" stroke={h} strokeWidth="4" />
          <rect x="254" y="58" width="18" height="62" fill="rgba(148,163,184,0.28)" stroke={s} strokeWidth="1.5" />
          <rect x="278" y="34" width="22" height="86" fill="rgba(148,163,184,0.18)" stroke={p} strokeWidth="1.5" />
          <path d="M236 82 C222 82 220 106 210 106" fill="none" stroke={h} strokeOpacity="0.7" strokeWidth="2.5" strokeDasharray="4 5" />
          <rect x="258" y="74" width="8" height="8" fill={h} opacity="0.55" />
          <rect x="282" y="50" width="7" height="7" fill={p} opacity="0.55" />
          <rect x="292" y="72" width="6" height="6" fill={s} opacity="0.5" />
          <path d="M54 118 H38 M238 118 H260 M72 100 H48" stroke={s} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
          <circle cx="135" cy="126" r="4" fill={p} opacity="0.65" />
        </SceneShell>
      );
    case "health":
      return (
        <SceneShell card={card}>
          <rect x="50" y="58" width="86" height="96" rx="10" fill={glass} stroke={p} strokeWidth="3" />
          <path d="M94 76 V110 M77 93 H111" stroke={h} strokeWidth="11" strokeLinecap="round" />
          <rect x="154" y="82" width="44" height="72" rx="8" fill="rgba(255,255,255,0.12)" stroke={s} strokeWidth="2.5" />
          <path d="M166 82 V58 H188 V82" stroke={h} strokeWidth="3" />
          <path d="M216 50 C244 68 210 90 238 108 C252 116 244 134 224 148" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />
          <path d="M238 50 C210 68 244 90 216 108 C202 116 210 134 230 148" fill="none" stroke={h} strokeWidth="3" strokeLinecap="round" />
          <path d="M34 126 H84 L100 106 L118 144 L136 122 H292" fill="none" stroke={h} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter={`url(#scene-glow-${card.id})`} />
          <circle cx="252" cy="74" r="12" fill={p} opacity="0.45" />
          <rect x="64" y="116" width="12" height="20" rx="3" fill="rgba(255,255,255,0.12)" stroke={h} strokeWidth="1.5" />
          <path d="M70 116 V108 H86 V116" stroke={p} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="224" cy="70" r="4" fill={h} />
          <circle cx="236" cy="92" r="3.5" fill={s} />
          <circle cx="218" cy="116" r="3.5" fill={p} />
          <path d="M216 50 H254 M214 148 H250" stroke={h} strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
        </SceneShell>
      );
    case "finance":
      return (
        <SceneShell card={card}>
          <path d="M54 72 H178 L154 52 H78 Z" fill={glass} stroke={p} strokeWidth="3" />
          <path d="M72 78 V134 M104 78 V134 M136 78 V134 M168 78 V134" stroke={h} strokeWidth="5" strokeLinecap="round" />
          <rect x="58" y="134" width="126" height="14" rx="7" fill={p} stroke={h} strokeWidth="2" />
          <path d="M204 132 C212 104 244 106 254 126 C266 126 278 134 282 148 H206 Z" fill="rgba(15,23,42,0.7)" stroke={s} strokeWidth="2.5" />
          <path d="M218 132 C228 118 238 120 246 132" fill="none" stroke={h} strokeWidth="3" strokeLinecap="round" />
          {[216, 238, 260].map((x, i) => (
            <circle key={`coin-${i}`} cx={x} cy={58 + i * 17} r="11" fill={i % 2 ? p : s} stroke={h} strokeWidth="2" />
          ))}
          <path d="M194 112 L214 96 L230 104 L268 70" fill="none" stroke={h} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M198 82 H272 M198 68 H242" stroke={p} strokeOpacity="0.55" strokeWidth="2" />
          <path d="M78 54 L116 32 L154 54" fill="none" stroke={h} strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="202" y="56" width="76" height="64" rx="8" fill="rgba(15,23,42,0.38)" stroke={p} strokeOpacity="0.45" strokeWidth="1.8" />
          <path d="M212 102 V86 M226 102 V76 M240 102 V92 M254 102 V68 M268 102 V82" stroke={s} strokeWidth="3" strokeLinecap="round" />
          <path d="M210 116 H274" stroke={h} strokeOpacity="0.28" strokeWidth="2" />
          <circle cx="228" cy="138" r="7" fill={p} opacity="0.6" />
        </SceneShell>
      );
    case "energy":
      return (
        <SceneShell card={card}>
          <path d="M44 134 L88 80 H132 L176 134 Z" fill="rgba(14,116,144,0.18)" stroke={p} strokeWidth="2.5" />
          <path d="M62 134 H158 M74 118 H146 M88 102 H132" stroke={h} strokeOpacity="0.45" strokeWidth="2" />
          <rect x="184" y="118" width="66" height="28" rx="5" fill="rgba(255,255,255,0.12)" stroke={s} strokeWidth="2" />
          <path d="M184 128 H250 M206 118 V146 M228 118 V146" stroke={h} strokeOpacity="0.55" strokeWidth="1.5" />
          {[214, 268].map((x, i) => (
            <g key={`turbine-${i}`}>
              <path d={`M${x} 146 V78`} stroke={h} strokeWidth="4" strokeLinecap="round" />
              <circle cx={x} cy="78" r="6" fill={p} />
              <motion.path d={`M${x} 78 L${x} 44 M${x} 78 L${x + 26} 92 M${x} 78 L${x - 24} 94`} stroke={i ? s : h} strokeWidth="3" strokeLinecap="round" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: `${x}px 78px` }} />
            </g>
          ))}
          <path d="M126 30 L100 84 H128 L112 126 L170 58 H136 Z" fill={p} stroke={h} strokeWidth="3" />
          <path d="M38 122 C64 112 88 112 112 122 C134 132 154 132 178 122" fill="none" stroke={h} strokeOpacity="0.36" strokeWidth="3" />
          <path d="M42 136 C66 128 92 128 118 136" fill="none" stroke={p} strokeOpacity="0.32" strokeWidth="2" />
          <path d="M286 134 H306 M296 118 V154" stroke={s} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
          <circle cx="296" cy="118" r="5" fill={h} opacity="0.7" />
          <path d="M172 92 H258" stroke={h} strokeOpacity="0.22" strokeWidth="2" strokeDasharray="5 6" />
        </SceneShell>
      );
    case "consumer":
      return (
        <SceneShell card={card}>
          <rect x="44" y="70" width="64" height="82" rx="9" fill={glass} stroke={p} strokeWidth="2.5" />
          <rect x="118" y="58" width="78" height="94" rx="9" fill="rgba(255,255,255,0.1)" stroke={s} strokeWidth="2.5" />
          <rect x="208" y="76" width="58" height="76" rx="9" fill={glass} stroke={h} strokeWidth="2.3" />
          <path d="M56 96 H96 M132 86 H182 M222 100 H254" stroke={h} strokeWidth="4" strokeLinecap="round" />
          <path d="M76 128 H114 V154 H76 Z" fill={p} stroke={h} strokeWidth="2" />
          <path d="M86 128 C86 112 104 112 104 128" fill="none" stroke={h} strokeWidth="3" />
          <path d="M206 118 H246 L238 154 H198 Z" fill={s} stroke={h} strokeWidth="2" />
          <path d="M34 52 H116 L104 72 H46 Z" fill={p} opacity="0.65" />
          <path d="M130 38 H208 L196 58 H142 Z" fill={s} opacity="0.65" />
          <rect x="62" y="114" width="28" height="24" rx="5" fill="rgba(255,255,255,0.12)" stroke={h} strokeWidth="1.5" />
          <rect x="132" y="106" width="18" height="18" rx="4" fill={p} opacity="0.72" />
          <rect x="160" y="104" width="20" height="20" rx="4" fill={s} opacity="0.72" />
          <path d="M214 118 C214 106 232 106 232 118" fill="none" stroke={h} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M48 148 H266" stroke={h} strokeOpacity="0.2" strokeWidth="2" strokeDasharray="6 7" />
        </SceneShell>
      );
    case "travel":
      return (
        <SceneShell card={card}>
          <path d="M34 138 L82 78 L112 114 L152 58 L224 138 Z" fill="rgba(15,23,42,0.65)" stroke={p} strokeWidth="3" />
          <path d="M82 78 L102 102 L112 114 L152 58 L168 88" fill="none" stroke={h} strokeWidth="4" strokeLinecap="round" />
          <circle cx="242" cy="86" r="30" fill="rgba(125,211,252,0.16)" stroke={s} strokeWidth="3" />
          <path d="M212 86 H272 M242 56 C230 76 230 96 242 116 M242 56 C254 76 254 96 242 116" stroke={h} strokeOpacity="0.65" strokeWidth="1.8" />
          <path d="M198 50 L254 30 L236 72 Z" fill={p} stroke={h} strokeWidth="2.5" />
          <path d="M44 56 C92 26 134 44 180 24 C218 8 252 18 288 34" fill="none" stroke={h} strokeWidth="3" strokeDasharray="7 9" />
          <circle cx="72" cy="50" r="10" fill={s} opacity="0.7" />
          <path d="M54 136 C86 122 124 122 156 136" fill="none" stroke={h} strokeOpacity="0.24" strokeWidth="3" />
          <path d="M218 84 L242 74 L234 100 Z" fill={s} opacity="0.64" />
          <circle cx="242" cy="86" r="18" fill="none" stroke={h} strokeOpacity="0.34" strokeWidth="2" strokeDasharray="4 5" />
          <path d="M284 52 C296 62 296 76 284 86" fill="none" stroke={s} strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="286" cy="52" r="3.5" fill={h} />
        </SceneShell>
      );
    case "food":
      return (
        <SceneShell card={card}>
          <rect x="42" y="72" width="112" height="76" rx="12" fill={glass} stroke={p} strokeWidth="3" />
          <path d="M48 72 L62 46 H138 L154 72 Z" fill={p} opacity="0.72" stroke={h} strokeWidth="2" />
          <path d="M62 48 V72 M82 48 V72 M102 48 V72 M122 48 V72 M142 48 V72" stroke={h} strokeOpacity="0.45" strokeWidth="2" />
          <rect x="58" y="94" width="34" height="54" rx="7" fill="rgba(15,23,42,0.74)" stroke={h} strokeWidth="2" />
          <rect x="104" y="94" width="34" height="28" rx="6" fill="rgba(251,146,60,0.16)" stroke={s} strokeWidth="2" />
          <path d="M68 86 H128" stroke={h} strokeOpacity="0.42" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 62 H132" stroke="#fff7ed" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="218" cy="130" rx="58" ry="20" fill="rgba(15,23,42,0.44)" stroke={p} strokeOpacity="0.5" strokeWidth="2" />
          <ellipse cx="218" cy="118" rx="48" ry="24" fill="rgba(255,255,255,0.16)" stroke={h} strokeWidth="3" />
          <ellipse cx="218" cy="118" rx="28" ry="13" fill={p} opacity="0.42" />
          <path d="M194 112 C202 100 216 102 224 112 C232 106 244 112 244 124" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />
          <circle cx="204" cy="117" r="4" fill={s} />
          <circle cx="226" cy="122" r="4.5" fill={h} />
          <circle cx="238" cy="116" r="3.5" fill="#22c55e" opacity="0.85" />
          <path d="M172 78 C190 94 190 122 172 146" fill="none" stroke={h} strokeWidth="5" strokeLinecap="round" />
          <path d="M272 78 V146 M284 78 V146 M272 108 H284" stroke={s} strokeWidth="4" strokeLinecap="round" />
          <path d="M76 58 C78 40 100 36 108 50 C118 36 140 40 138 58" fill={h} stroke={s} strokeWidth="3" />
          <path d="M82 148 C104 138 132 138 154 148 M178 148 C198 140 242 140 264 148" fill="none" stroke={h} strokeOpacity="0.28" strokeWidth="2.5" />
          <motion.g
            animate={{ y: [0, -4, 0], opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M198 78 C192 66 204 60 198 48 M224 82 C218 70 230 64 224 52 M248 78 C242 68 254 62 248 50" fill="none" stroke={h} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
          </motion.g>
        </SceneShell>
      );
    default:
      return null;
  }
}

function CinematicInterestCard({
  card,
  selected,
  dimmed,
  onToggle
}: {
  card: SchoolsInterestCard;
  selected: boolean;
  dimmed: boolean;
  onToggle: () => void;
}) {
  const handleSelect = () => {
    if (dimmed) return;
    onToggle();
  };

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-disabled={dimmed}
      aria-label={`Select ${card.label}`}
      onClick={handleSelect}
      variants={gridItemVariants}
      whileHover={
        dimmed
          ? undefined
          : {
              boxShadow: `0 0 0 1px rgba(196,181,253,0.35), 0 0 32px ${card.glow}, 0 18px 40px rgba(0,0,0,0.45)`
            }
      }
      whileTap={dimmed ? undefined : { scale: 0.98 }}
      animate={{
        y: selected ? [0, -3, 0] : [0, -1.5, 0],
        scale: selected ? [1.018, 1.035, 1.018] : [1, 1.006, 1],
        opacity: dimmed ? 0.42 : 1
      }}
      transition={{
        duration: selected ? 2.6 : 4.2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={[
        "group relative isolate flex h-[11.35rem] w-full flex-col items-stretch gap-2.5 rounded-3xl text-center md:h-[10.95rem]",
        "pointer-events-auto touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/75",
        dimmed ? "cursor-not-allowed" : "cursor-pointer"
      ].join(" ")}
    >
      <div
        className={[
          "relative isolate h-[8.25rem] shrink-0 overflow-hidden rounded-3xl border md:h-[7.95rem]",
          "shadow-[0_18px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)]",
          selected ? "border-violet-100/75" : "border-violet-300/20"
        ].join(" ")}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.span
            className="absolute inset-0 h-full w-full"
            initial={false}
            animate={{ scale: selected ? 1.04 : 1 }}
            whileHover={dimmed ? undefined : { scale: 1.08 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="block h-full w-full bg-cover bg-center"
              style={{ backgroundImage: card.background }}
            />
          </motion.span>
        </span>
        <GameInterestArt card={card} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(255,255,255,0.13),transparent_34%),linear-gradient(to_top,rgba(3,3,8,0.46)_0%,rgba(3,3,8,0.18)_40%,rgba(3,3,8,0.02)_78%)]"
        />
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
            "group-hover:opacity-100 md:group-hover:opacity-100",
            selected ? "opacity-100" : ""
          ].join(" ")}
          style={{
            background: `radial-gradient(circle at 50% 85%, ${card.glow.replace(/[\d.]+\)$/, "0.2)")}, transparent 68%)`
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-white/75 shadow-[0_0_12px_currentColor]"
          style={{ color: card.primary }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-7 top-6 h-1 w-1 rounded-full bg-white/55 shadow-[0_0_10px_currentColor]"
          style={{ color: card.secondary }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-2 h-px bg-gradient-to-r from-white/45 via-white/10 to-transparent"
        />
        <BorderBeam
          size={86}
          duration={selected ? 3.8 : 6.5}
          colorFrom={card.primary}
          colorTo={card.secondary}
          borderWidth={selected ? 2 : 1}
        />
        <BorderBeam
          size={52}
          duration={7.2}
          delay={1.8}
          reverse
          colorFrom={card.highlight}
          colorTo={card.primary}
          borderWidth={1}
          className={selected ? "opacity-100" : "opacity-45"}
        />
        {selected ? (
          <motion.span
            aria-hidden
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="pointer-events-none absolute right-2.5 top-2.5 z-10 grid h-6 w-6 place-items-center rounded-full border border-violet-100/55 bg-[rgba(8,6,18,0.9)] text-[0.68rem] font-bold text-violet-50 shadow-[0_0_18px_rgba(139,92,246,0.55)]"
          >
            ✓
          </motion.span>
        ) : null}
      </div>

      <div className="pointer-events-none relative z-10 h-[2.55rem] shrink-0 px-1 text-center">
        <span
          className="mx-auto grid h-full w-full place-items-center rounded-full border border-white/10 bg-[rgba(8,6,18,0.54)] px-3 py-1 font-[var(--font-grotesk)] text-[clamp(0.74rem,1.05vw,0.9rem)] font-black uppercase leading-tight tracking-[0.075em] text-white shadow-[0_8px_22px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
          style={{
            boxShadow: selected
              ? `0 0 0 1px rgba(255,255,255,0.12), 0 0 22px ${card.glow}, 0 8px 22px rgba(0,0,0,0.32)`
              : undefined
          }}
        >
          {card.label}
        </span>
      </div>
    </motion.button>
  );
}

/** Schools onboarding — cinematic pick 1 interest. */
export function SchoolsPickInterestsScreen({
  onContinue,
  onBack: _onBack
}: SchoolsPickInterestsScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const canContinue = selected.length === SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT;
  const remaining = SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT - selected.length;

  useRunOnceOnMount(() => {
    setSelected(
      readPickInterestsSelection().slice(0, SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT)
    );
    warmBankPickInterestsCatalog();
  });

  useEffect(() => {
    writePickInterestsSelection(selected);
  }, [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT === 1) return [id];
      if (prev.length >= SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT) return prev;
      return [...prev, id];
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (shouldRunSchoolsDemoBackgroundSystems()) {
      const guestId = getOrCreateOnboardingGuestId();
      void fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, interestIds: selected })
      });
    }
    onContinue();
  };

  return (
    <div className="iq-schools-deck-pick-interests relative isolate flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_8%,rgba(139,92,246,0.2),transparent_62%),radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(109,40,217,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [background-image:radial-gradient(rgba(139,92,246,0.35)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 iq-schools-interest-vault-bg" />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 iq-schools-interest-ribbon-bg" />

      <div className="iq-schools-deck-pick-body relative z-20 flex min-h-0 flex-1 flex-col items-center px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(7.6rem+env(safe-area-inset-bottom))]">
        <div className="hidden">
          <button
            type="button"
            aria-label="Go back"
            onClick={_onBack}
            className="iq-schools-interest-back-btn pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/35 bg-[rgba(8,6,18,0.75)] text-lg text-violet-200/90 shadow-[0_0_14px_rgba(139,92,246,0.18)] transition hover:border-violet-400/55 hover:bg-violet-500/10"
          >
            ‹
          </button>
        </div>

        <header className="pointer-events-none shrink-0 px-12 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))] text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="font-[var(--font-grotesk)] text-[clamp(1.45rem,2.45vw,2.15rem)] font-black uppercase leading-[0.95] tracking-[0.06em] text-white"
          >
            Choose 1 Interest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 text-[clamp(0.72rem,0.92vw,0.86rem)] font-medium text-violet-100/85"
          >
            Your interest will help reveal your first sector.
          </motion.p>
        </header>

        <div className="iq-schools-interest-stage relative z-30 mx-auto w-full max-w-[min(1580px,96vw)] overflow-y-auto overflow-x-hidden px-6 py-6">
          <motion.div
            className="iq-schools-deck-pick-grid pointer-events-auto mx-auto grid w-full grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 xl:grid-cols-6 xl:gap-7"
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {SCHOOLS_INTEREST_CARDS.map((card) => {
              const active = selected.includes(card.id);
              const atMax = selected.length >= SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT;
              const dimmed =
                SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT > 1 && !active && atMax;

              return (
                <CinematicInterestCard
                  key={card.id}
                  card={card}
                  selected={active}
                  dimmed={dimmed}
                  onToggle={() => toggle(card.id)}
                />
              );
            })}
          </motion.div>
        </div>
      </div>

      <footer className="iq-schools-interest-cta-dock pointer-events-none absolute inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl flex-col items-center px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] text-center">
          {canContinue ? (
            <p className="iq-schools-interest-status mb-3 text-sm font-semibold tracking-[0.04em] text-violet-100/90">
              Worlds unlocked — ready to explore.
            </p>
          ) : (
            <p className="iq-schools-interest-status mb-3 text-xs text-violet-100/70">
              {remaining === SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT
                ? `Select ${SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT} to continue`
                : `Select ${remaining} more`}
            </p>
          )}
          <NeonButton
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className={[
              "iq-schools-interest-continue-btn w-full justify-center",
              canContinue ? "iq-schools-interest-continue-btn--armed" : "",
              "min-h-[54px] rounded-full px-8 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-bold uppercase tracking-[0.14em]"
            ].join(" ")}
          >
            Continue
          </NeonButton>
        </div>
      </footer>
    </div>
  );
}
