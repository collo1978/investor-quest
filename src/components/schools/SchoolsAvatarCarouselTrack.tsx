"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { SchoolsAvatar, SchoolsAvatarId } from "@/lib/schools/avatars";
import { SCHOOLS_AVATARS } from "@/lib/schools/avatars";
import { SchoolsAvatarPortraitCard } from "@/components/schools/SchoolsAvatarPortraitCard";
import { useSchoolsAvatarCarousel } from "@/components/schools/useSchoolsAvatarCarousel";

type Props = {
  slideGap: number;
  carousel: ReturnType<typeof useSchoolsAvatarCarousel>;
  /** Mobile-only: tap locks selection; swipe browses without auto-selecting. */
  mobileSelection?: {
    selectedId: SchoolsAvatarId | null;
    onSelectAvatar: (id: SchoolsAvatarId) => void;
  };
};

function SelectionCheckmark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-violet-300/80 bg-[rgba(12,8,28,0.92)] text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.65)]"
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
    </span>
  );
}

function MobileCarouselSlide({
  avatar,
  slideWidth,
  focused,
  selected,
  distance,
  onTap
}: {
  avatar: SchoolsAvatar;
  slideWidth: number;
  focused: boolean;
  selected: boolean;
  distance: number;
  onTap: () => void;
}) {
  const reduceMotion = useReducedMotion();

  let scale = 0.78;
  if (distance === 1) scale = 0.88;
  if (focused && !selected) scale = 1;
  if (focused && selected) scale = 1.06;
  if (!focused && selected) scale = distance === 1 ? 0.93 : 0.82;

  let opacity = 0.35;
  if (distance === 1) opacity = 0.62;
  if (focused) opacity = 1;
  if (selected && !focused) opacity = distance === 1 ? 0.78 : 0.48;

  return (
    <motion.div
      role="button"
      tabIndex={focused ? 0 : -1}
      aria-label={`Select ${avatar.name}`}
      aria-pressed={selected}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      className="relative shrink-0 cursor-pointer touch-pan-y border-0 bg-transparent p-0 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
      style={{ width: slideWidth }}
      animate={{ scale, opacity }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <SchoolsAvatarPortraitCard
        avatarId={avatar.id}
        accent={avatar.accent}
        width={slideWidth}
        active={focused && !selected}
        selected={selected}
      />
      {selected ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 26 }}
        >
          <SelectionCheckmark />
        </motion.div>
      ) : null}
      {focused && selected ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[1.15rem] bg-[radial-gradient(ellipse_85%_65%_at_50%_38%,rgba(139,92,246,0.32),transparent_72%)]"
          animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : focused ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.1rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(139,92,246,0.14),transparent_70%)]"
        />
      ) : null}
    </motion.div>
  );
}

function CarouselSlide({
  avatar,
  slideWidth,
  active,
  distance,
  onSnap
}: {
  avatar: SchoolsAvatar;
  slideWidth: number;
  active: boolean;
  distance: number;
  onSnap: () => void;
}) {
  const scale = active ? 1 : distance === 1 ? 0.9 : 0.8;
  const opacity = active ? 1 : distance === 1 ? 0.62 : 0.35;

  return (
    <motion.div
      role="button"
      tabIndex={active ? -1 : 0}
      aria-label={`Select ${avatar.name}`}
      aria-pressed={active}
      onClick={() => {
        if (!active) onSnap();
      }}
      onKeyDown={(e) => {
        if (!active && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSnap();
        }
      }}
      className="relative shrink-0 cursor-pointer touch-pan-y border-0 bg-transparent p-0 outline-none"
      style={{ width: slideWidth }}
      animate={{ scale, opacity }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      <SchoolsAvatarPortraitCard
        avatarId={avatar.id}
        accent={avatar.accent}
        width={slideWidth}
        active={active}
      />
      {active ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.1rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(139,92,246,0.22),transparent_70%)]"
        />
      ) : null}
    </motion.div>
  );
}

export function SchoolsAvatarCarouselTrack({ slideGap, carousel, mobileSelection }: Props) {
  const {
    trackRef,
    x,
    index,
    slideWidth,
    snapToIndex,
    onDrag,
    onDragEnd,
    dragMin,
    dragMax
  } = carousel;

  return (
    <div ref={trackRef} className="relative min-h-0 flex-1 touch-pan-y overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center will-change-transform"
        style={{ x, gap: slideGap }}
        drag="x"
        dragConstraints={{ left: dragMin, right: dragMax }}
        dragElastic={0.08}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      >
        {SCHOOLS_AVATARS.map((avatar, i) =>
          mobileSelection ? (
            <MobileCarouselSlide
              key={avatar.id}
              avatar={avatar}
              slideWidth={slideWidth}
              focused={i === index}
              selected={mobileSelection.selectedId === avatar.id}
              distance={Math.abs(i - index)}
              onTap={() => {
                mobileSelection.onSelectAvatar(avatar.id);
                if (i !== index) {
                  snapToIndex(i, true, { select: false });
                }
              }}
            />
          ) : (
            <CarouselSlide
              key={avatar.id}
              avatar={avatar}
              slideWidth={slideWidth}
              active={i === index}
              distance={Math.abs(i - index)}
              onSnap={() => snapToIndex(i)}
            />
          )
        )}
      </motion.div>
    </div>
  );
}

export function SchoolsAvatarCarouselMeta({
  activeAvatar,
  className = ""
}: {
  activeAvatar: SchoolsAvatar;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={["shrink-0 px-6 pb-2 pt-1 text-center md:text-left", className].join(" ")}>
      <motion.h2
        key={`name-${activeAvatar.id}`}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`text-xl font-black uppercase tracking-[0.2em] md:text-2xl iq-schools-avatar-name--${activeAvatar.accent}`}
      >
        {activeAvatar.name}
      </motion.h2>
      <motion.p
        key={`tag-${activeAvatar.id}`}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-sm leading-relaxed text-violet-100/78 md:max-w-md md:text-base"
      >
        {activeAvatar.tagline}
      </motion.p>
    </div>
  );
}
