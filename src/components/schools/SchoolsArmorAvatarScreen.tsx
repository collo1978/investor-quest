"use client";

import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

import { NeonButton } from "@/components/NeonButton";
import { SchoolsMobileAvatarPicker } from "@/components/schools/SchoolsMobileAvatarPicker";
import { SchoolsTabletAvatarPicker } from "@/components/schools/SchoolsTabletAvatarPicker";
import { SCHOOLS_AVATAR_ACCENT_RING_SELECTED } from "@/components/schools/SchoolsAvatarPortraitCard";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";
import {
  SCHOOLS_AVATARS,
  type SchoolsAvatarAccent,
  type SchoolsAvatarGender,
  type SchoolsAvatarId
} from "@/lib/schools/avatars";
import {
  getSchoolsAvatarPortraitSrc,
  SCHOOLS_AVATAR_PORTRAIT_ASPECT
} from "@/lib/schools/schoolsAvatarPortraits";
import { playSchoolsIdentityTalkSound } from "@/lib/schools/schoolsIdentityTalkSound";

/** Always-on "living portrait" sway — subtle, so it reads as alive rather than jittery. */
const IDLE_LOOP = {
  y: [0, -3, 0],
  scale: [1, 1.015, 1],
  rotate: [0, -0.6, 0.6, 0],
  transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const }
};

/** Repeats for as long as the character is actually speaking. */
const TALKING_LOOP = {
  rotate: [0, -2.5, 2.5, -1.8, 1.8, 0],
  y: [0, -2.5, 0, -1.5, 0],
  scale: [1, 1.03, 1, 1.02, 1],
  transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut" as const }
};

export type SchoolsArmorAvatarScreenProps = {
  onContinue: (avatarId: SchoolsAvatarId) => void;
};

/** Unselected hover ring per accent — separate from {@link SCHOOLS_AVATAR_ACCENT_RING_SELECTED}. */
const HOVER_RING: Record<SchoolsAvatarAccent, string> = {
  violet: "hover:border-violet-400/70 hover:shadow-[0_0_36px_rgba(139,92,246,0.5)]",
  fuchsia: "hover:border-fuchsia-400/70 hover:shadow-[0_0_36px_rgba(232,121,249,0.45)]",
  emerald: "hover:border-emerald-400/70 hover:shadow-[0_0_36px_rgba(52,211,153,0.42)]",
  amber: "hover:border-amber-400/70 hover:shadow-[0_0_36px_rgba(251,191,36,0.42)]",
  cyan: "hover:border-cyan-400/70 hover:shadow-[0_0_36px_rgba(34,211,238,0.42)]",
  rose: "hover:border-rose-400/70 hover:shadow-[0_0_36px_rgba(251,113,133,0.42)]",
  sky: "hover:border-sky-400/70 hover:shadow-[0_0_36px_rgba(56,189,248,0.42)]"
};

function SchoolsDesktopAvatarGridCard({
  id,
  name,
  tagline,
  accent,
  gender,
  greeting,
  selected,
  onSelect
}: {
  id: SchoolsAvatarId;
  name: string;
  tagline: string;
  accent: SchoolsAvatarAccent;
  gender: SchoolsAvatarGender;
  greeting: string;
  selected: boolean;
  onSelect: (id: SchoolsAvatarId) => void;
}) {
  const ring = selected
    ? SCHOOLS_AVATAR_ACCENT_RING_SELECTED[accent]
    : `border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${HOVER_RING[accent]}`;

  // One shared controller for the image + face overlays, so they move as a
  // single rigid unit — previously the mouth/blink were siblings positioned
  // by fixed percentage while only the image swayed, so they'd visibly drift
  // off the face ("glitching") the moment any idle/talk motion played.
  const faceControls = useAnimationControls();
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    void faceControls.start(IDLE_LOOP);
  }, [faceControls]);

  const handleClick = () => {
    onSelect(id);
    setTalking(true);
    void faceControls.start(TALKING_LOOP);
    playSchoolsIdentityTalkSound({
      seed: id,
      text: greeting,
      gender,
      onEnd: () => {
        setTalking(false);
        void faceControls.start(IDLE_LOOP);
      }
    });
  };

  return (
    <motion.button
      type="button"
      aria-label={selected ? `${name} selected` : `Select ${name}`}
      aria-pressed={selected}
      onClick={handleClick}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border-2 bg-[#05050f] text-left",
        "transition-[transform,border-color,box-shadow] duration-300 ease-out",
        selected ? "scale-[1.045]" : "hover:-translate-y-1 hover:scale-[1.02]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        ring
      ].join(" ")}
      style={{ aspectRatio: `${SCHOOLS_AVATAR_PORTRAIT_ASPECT}` }}
    >
      <motion.div
        className="absolute inset-0"
        animate={faceControls}
        style={{ transformOrigin: "50% 30%" }}
      >
        <img
          src={getSchoolsAvatarPortraitSrc(id)}
          alt=""
          aria-hidden
          draggable={false}
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        />
      </motion.div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5"
      />

      {selected ? (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full border border-violet-300/70 bg-[rgba(12,8,28,0.88)] text-violet-100 shadow-[0_0_16px_rgba(139,92,246,0.55)]"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M4.5 10.2 8.2 13.8 15.5 6.2"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      ) : null}

      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2.5">
        <span className="text-sm font-black uppercase tracking-[0.1em] text-white">
          {name}
        </span>
        <span className="text-[10.5px] font-medium leading-snug text-white/75">
          {tagline}
        </span>
      </span>
    </motion.button>
  );
}

/** Widescreen desktop — real card grid, not a single flat image with hotspots. */
function SchoolsDesktopAvatarPicker({
  selectedId,
  onSelect,
  onContinue
}: {
  selectedId: SchoolsAvatarId | null;
  onSelect: (id: SchoolsAvatarId) => void;
  onContinue: (avatarId: SchoolsAvatarId) => void;
}) {
  return (
    <main
      className={`relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#030308] ${SCHOOLS_DEVICE.desktopOnly}`}
      role="application"
      aria-label="Choose your avatar"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.16),transparent_55%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-avatar-desktop-bg" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-avatar-tech-grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-avatar-light-ribbons" />

      <header className="relative z-[1] shrink-0 pt-8 text-center">
        <h1 className="font-[var(--font-grotesk)] text-3xl font-black uppercase tracking-[0.06em] text-violet-100 md:text-4xl">
          Choose your avatar
        </h1>
      </header>

      <section className="relative z-[1] mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-8 pb-8 pt-5">
        <div className="grid w-full max-w-5xl grid-cols-5 gap-4">
          {SCHOOLS_AVATARS.map((avatar) => (
            <SchoolsDesktopAvatarGridCard
              key={avatar.id}
              id={avatar.id}
              name={avatar.name}
              tagline={avatar.tagline}
              accent={avatar.accent}
              gender={avatar.gender}
              greeting={avatar.greeting}
              selected={selectedId === avatar.id}
              onSelect={onSelect}
            />
          ))}
        </div>

        <motion.div
          className="mt-7 flex justify-center"
          animate={
            selectedId
              ? { y: [0, -2, 0], scale: [1, 1.018, 1] }
              : { y: 0, scale: 1 }
          }
          transition={
            selectedId
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          <NeonButton
            type="button"
            disabled={!selectedId}
            aria-disabled={!selectedId}
            className={[
              "iq-schools-avatar-continue-btn min-w-[13rem] px-8 py-3.5 text-sm font-black uppercase tracking-[0.28em]",
              selectedId ? "iq-schools-avatar-continue-btn--armed" : ""
            ].join(" ")}
            onClick={() => {
              if (selectedId) onContinue(selectedId);
            }}
          >
            CONTINUE
          </NeonButton>
        </motion.div>
      </section>
    </main>
  );
}

/**
 * Schools avatar pick — three intentional layouts:
 * mobile (<768) swipe carousel, tablet (768–1023) carousel, desktop
 * widescreen (1024+) real card grid.
 */
export function SchoolsArmorAvatarScreen({ onContinue }: SchoolsArmorAvatarScreenProps) {
  const [selectedId, setSelectedId] = useState<SchoolsAvatarId | null>(null);

  return (
    <>
      <SchoolsMobileAvatarPicker
        selectedId={selectedId}
        onSelect={setSelectedId}
        onContinue={onContinue}
      />
      <SchoolsTabletAvatarPicker
        selectedId={selectedId}
        onSelect={setSelectedId}
        onContinue={onContinue}
      />
      <SchoolsDesktopAvatarPicker
        selectedId={selectedId}
        onSelect={setSelectedId}
        onContinue={onContinue}
      />
    </>
  );
}
