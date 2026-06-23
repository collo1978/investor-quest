"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

import {
  TECH_SECTOR_BUTTON_SIZE,
  TECH_SECTOR_BUTTONS,
  TECH_SECTOR_IMAGE_NATURAL,
  TECH_SECTOR_IMAGE_OBJECT_POSITION,
  TECH_SECTOR_IMAGE_SRC,
  type TechSectorButton
} from "@/lib/schools/techSectorConfig";

const { width: ART_W, height: ART_H } = TECH_SECTOR_IMAGE_NATURAL;
const { width: BTN_W, height: BTN_H } = TECH_SECTOR_BUTTON_SIZE;

const iconClass = "h-[1.125rem] w-[1.125rem] shrink-0";

function TechSectorButtonIcon({ id }: { id: TechSectorButton["id"] }) {
  switch (id) {
    case "ai-robotics":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden fill="none">
          <path
            d="M12 3a4 4 0 0 1 4 4v1h1.5a2.5 2.5 0 0 1 0 5H16v1a4 4 0 1 1-8 0v-1H6.5a2.5 2.5 0 0 1 0-5H8V7a4 4 0 0 1 4-4Z"
            stroke="rgb(56,189,248)"
            strokeWidth="1.5"
          />
          <circle cx="9" cy="10" r="1" fill="rgb(56,189,248)" />
          <circle cx="15" cy="10" r="1" fill="rgb(56,189,248)" />
        </svg>
      );
    case "software":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="13"
            rx="2"
            stroke="rgb(74,222,128)"
            strokeWidth="1.5"
          />
          <path d="M8 20h8" stroke="rgb(74,222,128)" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M9 9l2 2-2 2M13 13h3"
            stroke="rgb(74,222,128)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "semiconductors":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden fill="none">
          <rect
            x="7"
            y="7"
            width="10"
            height="10"
            rx="1.5"
            stroke="rgb(192,132,252)"
            strokeWidth="1.5"
          />
          <path
            d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"
            stroke="rgb(192,132,252)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "cloud-computing":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden fill="none">
          <path
            d="M7 18h9a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.8A3.5 3.5 0 0 0 7 18Z"
            stroke="rgb(34,211,238)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cybersecurity":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden fill="none">
          <path
            d="M12 3 5 6.5V12c0 4.1 3 7.9 7 8.5 4-.6 7-4.4 7-8.5V6.5L12 3Z"
            stroke="rgb(251,146,60)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect
            x="10"
            y="11"
            width="4"
            height="5"
            rx="0.5"
            stroke="rgb(251,146,60)"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}

function placementStyle(placement: TechSectorButton["placement"]): CSSProperties {
  return {
    position: "absolute",
    left: placement.left,
    right: placement.right,
    top: placement.top,
    bottom: placement.bottom,
    transform: placement.transform,
    width: BTN_W,
    height: BTN_H
  };
}

function TechSectorSubsectorButton({ button }: { button: TechSectorButton }) {
  const panelStyle = {
    ["--iq-tech-border" as string]: button.border,
    ["--iq-tech-glow" as string]: button.glow,
    ["--iq-tech-glow-hover" as string]: button.glowHover
  } as CSSProperties;

  return (
    <div className="iq-schools-tech-sector-btn z-20" style={placementStyle(button.placement)}>
      <motion.div
        className="h-full w-full"
        initial={false}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={button.href}
          aria-label={button.title}
          style={panelStyle}
          className={[
            "group flex h-full w-full cursor-pointer items-center gap-2.5 rounded-xl border px-2.5",
            "touch-manipulation backdrop-blur-md",
            "bg-[rgba(6,8,18,0.78)]",
            "border-[var(--iq-tech-border)]",
            "shadow-[0_0_0_1px_var(--iq-tech-glow),0_6px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]",
            "transition-[border-color,box-shadow,background-color] duration-200",
            "hover:border-[var(--iq-tech-glow-hover)]",
            "hover:bg-[rgba(8,10,22,0.88)]",
            "hover:shadow-[0_0_0_1px_var(--iq-tech-glow-hover),0_0_24px_var(--iq-tech-glow-hover),0_0_40px_color-mix(in_srgb,var(--iq-tech-glow-hover)_35%,transparent),inset_0_1px_0_rgba(255,255,255,0.12)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/75 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
          ].join(" ")}
        >
          <span className="shrink-0">
            <TechSectorButtonIcon id={button.id} />
          </span>

          <span className="min-w-0 flex-1 font-[var(--font-grotesk)] text-[0.72rem] font-bold uppercase leading-tight tracking-[0.04em] text-white">
            {button.title}
          </span>

          <span
            aria-hidden
            className={[
              "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs text-white/90",
              "border-[var(--iq-tech-border)] bg-[rgba(4,6,14,0.65)]",
              "transition-[border-color,box-shadow] duration-200",
              "group-hover:border-[var(--iq-tech-glow-hover)] group-hover:shadow-[0_0_14px_var(--iq-tech-glow-hover)]"
            ].join(" ")}
          >
            ›
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

/** Technology sector hub — fullscreen cover map with viewport-anchored district labels. */
export function SchoolsTechSectorPreviewScreen() {
  return (
    <main
      className="iq-schools-tech-sector-preview pointer-events-auto relative overflow-hidden bg-black"
      style={{
        width: "100vw",
        height: "100vh",
        paddingTop: "max(env(safe-area-inset-top, 0px), 0px)"
      }}
      aria-label="Technology sector preview"
    >
      <img
        src={TECH_SECTOR_IMAGE_SRC}
        alt="Technology sector — choose a subsector"
        width={ART_W}
        height={ART_H}
        draggable={false}
        decoding="async"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 z-0 select-none"
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: TECH_SECTOR_IMAGE_OBJECT_POSITION
        }}
      />

      <div
        className="absolute inset-0 z-10"
        role="group"
        aria-label="Technology subsectors"
      >
        {TECH_SECTOR_BUTTONS.map((button) => (
          <TechSectorSubsectorButton key={button.id} button={button} />
        ))}
      </div>
    </main>
  );
}
