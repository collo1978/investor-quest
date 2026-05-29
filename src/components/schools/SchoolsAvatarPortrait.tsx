"use client";

import type { SchoolsAvatarAccent } from "@/lib/schools/avatars";

const ACCENT_STYLES: Record<
  SchoolsAvatarAccent,
  { glow: string; line: string; fill: string; text: string }
> = {
  violet: {
    glow: "rgba(167,139,250,0.55)",
    line: "rgba(196,181,253,0.95)",
    fill: "rgba(109,40,217,0.35)",
    text: "#EDE9FE"
  },
  emerald: {
    glow: "rgba(52,211,153,0.5)",
    line: "rgba(110,231,183,0.95)",
    fill: "rgba(16,185,129,0.28)",
    text: "#D1FAE5"
  },
  amber: {
    glow: "rgba(251,191,36,0.5)",
    line: "rgba(253,224,71,0.95)",
    fill: "rgba(217,119,6,0.28)",
    text: "#FEF3C7"
  },
  cyan: {
    glow: "rgba(34,211,238,0.5)",
    line: "rgba(103,232,249,0.95)",
    fill: "rgba(8,145,178,0.28)",
    text: "#CFFAFE"
  },
  fuchsia: {
    glow: "rgba(232,121,249,0.5)",
    line: "rgba(240,171,252,0.95)",
    fill: "rgba(192,38,211,0.28)",
    text: "#FAE8FF"
  },
  rose: {
    glow: "rgba(251,113,133,0.5)",
    line: "rgba(253,164,175,0.95)",
    fill: "rgba(225,29,72,0.26)",
    text: "#FFE4E6"
  },
  sky: {
    glow: "rgba(56,189,248,0.5)",
    line: "rgba(125,211,252,0.95)",
    fill: "rgba(2,132,199,0.28)",
    text: "#E0F2FE"
  }
};

export type SchoolsAvatarPortraitProps = {
  accent: SchoolsAvatarAccent;
  active?: boolean;
  className?: string;
};

/**
 * Stylized hooded investor armor silhouette — accent glow per avatar.
 */
export function SchoolsAvatarPortrait({
  accent,
  active = false,
  className = ""
}: SchoolsAvatarPortraitProps) {
  const palette = ACCENT_STYLES[accent];

  return (
    <svg
      viewBox="0 0 200 280"
      className={["h-full w-full", className].join(" ")}
      aria-hidden
    >
      <defs>
        <radialGradient id={`armor-glow-${accent}`} cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor={palette.glow} stopOpacity={active ? 0.9 : 0.45} />
          <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`armor-fill-${accent}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.fill} />
          <stop offset="100%" stopColor="rgba(8,6,18,0.92)" />
        </linearGradient>
      </defs>

      <ellipse
        cx="100"
        cy="200"
        rx="72"
        ry="18"
        fill={palette.glow}
        opacity={active ? 0.35 : 0.18}
      />

      <circle cx="100" cy="118" r="88" fill={`url(#armor-glow-${accent})`} />

      <path
        d="M52 118c0-36 21-62 48-62s48 26 48 62v72c0 8-6 14-14 14H66c-8 0-14-6-14-14v-72z"
        fill={`url(#armor-fill-${accent})`}
        stroke={palette.line}
        strokeWidth={active ? 2.2 : 1.4}
        strokeLinejoin="round"
      />

      <path
        d="M68 96c8-18 24-28 32-28s24 10 32 28"
        fill="none"
        stroke={palette.line}
        strokeWidth={active ? 2 : 1.2}
        strokeLinecap="round"
        opacity={0.85}
      />

      <ellipse
        cx="100"
        cy="88"
        rx="34"
        ry="38"
        fill="rgba(12,10,22,0.88)"
        stroke={palette.line}
        strokeWidth={active ? 2 : 1.2}
      />

      <path
        d="M78 118h44"
        stroke={palette.line}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
        opacity={0.7}
      />

      {active ? (
        <>
          <path
            d="M62 142l12 28M138 142l-12 28"
            stroke={palette.line}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle cx="100" cy="168" r="6" fill={palette.line} opacity="0.8" />
        </>
      ) : null}
    </svg>
  );
}
