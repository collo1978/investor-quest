"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

import type { SchoolsAvatar, SchoolsAvatarId } from "@/lib/schools/avatars";
import { SCHOOLS_AVATARS } from "@/lib/schools/avatars";
import { SchoolsAvatarPortraitCard } from "@/components/schools/SchoolsAvatarPortraitCard";
import { useSchoolsAvatarCarousel } from "@/components/schools/useSchoolsAvatarCarousel";

const SELECTED_AVATAR_SPARKS = [
  { top: "6%", left: "10%", delay: 0 },
  { top: "14%", right: "8%", delay: 0.4 },
  { bottom: "18%", left: "6%", delay: 0.8 },
  { bottom: "10%", right: "12%", delay: 1.2 },
  { top: "42%", left: "-2%", delay: 0.6 },
  { top: "38%", right: "-1%", delay: 1.0 }
] as const;

type Props = {
  slideGap: number;
  carousel: ReturnType<typeof useSchoolsAvatarCarousel>;
  className?: string;
  portraitHeightScale?: number;
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
  slideIndex,
  focused,
  selected,
  distance,
  onTap,
  trackX,
  sideInset,
  slideStep,
  portraitHeightScale = 1
}: {
  avatar: SchoolsAvatar;
  slideWidth: number;
  slideIndex: number;
  focused: boolean;
  selected: boolean;
  distance: number;
  onTap: () => void;
  trackX: MotionValue<number>;
  sideInset: number;
  slideStep: number;
  portraitHeightScale?: number;
}) {
  const reduceMotion = useReducedMotion();

  let scale = 0.84;
  if (distance === 1) scale = 0.94;
  if (focused && !selected) scale = 1.04;
  if (focused && selected) scale = 1.08;
  if (!focused && selected) scale = distance === 1 ? 0.96 : 0.86;

  let opacity = 0.42;
  if (distance === 1) opacity = 0.72;
  if (focused) opacity = 1;
  if (selected && !focused) opacity = distance === 1 ? 0.82 : 0.52;

  const tiltY = useTransform(trackX, (latest) => {
    if (reduceMotion || slideStep <= 0) return 0;
    const target = sideInset - slideIndex * slideStep;
    const delta = latest - target;
    return Math.max(-7, Math.min(7, delta * 0.038));
  });

  const shouldFloat = (focused || selected) && !reduceMotion;
  const floatY = selected && focused ? -7 : selected ? -5 : -6;

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
      style={{
        width: slideWidth,
        rotateY: tiltY
      }}
      animate={{ scale, opacity }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <motion.div
        className="relative"
        animate={
          shouldFloat ? { y: [0, floatY, 0] } : { y: 0 }
        }
        transition={
          shouldFloat
            ? { duration: selected ? 2.8 : 3.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        {focused || selected ? (
          <motion.div
            aria-hidden
            className={[
              "pointer-events-none absolute -inset-3 rounded-[1.35rem] iq-schools-avatar-glow-pulse",
              selected ? "iq-schools-avatar-glow-pulse--selected" : ""
            ].join(" ")}
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: selected ? [0.55, 0.95, 0.55] : [0.45, 0.85, 0.45],
                    scale: selected ? [0.97, 1.05, 0.97] : [0.96, 1.04, 0.96]
                  }
            }
            transition={{
              duration: selected ? 2.2 : 2.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ) : null}

        {selected && !reduceMotion
          ? SELECTED_AVATAR_SPARKS.map((spark, i) => (
              <motion.span
                key={`${spark.delay}-${i}`}
                aria-hidden
                className="iq-schools-avatar-selected-spark pointer-events-none absolute rounded-full"
                style={{
                  top: "top" in spark ? spark.top : undefined,
                  bottom: "bottom" in spark ? spark.bottom : undefined,
                  left: "left" in spark ? spark.left : undefined,
                  right: "right" in spark ? spark.right : undefined
                }}
                animate={{ opacity: [0.15, 0.65, 0.15], scale: [0.8, 1.15, 0.8] }}
                transition={{
                  duration: 2.4 + i * 0.15,
                  delay: spark.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))
          : null}

        {selected ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-[2px] rounded-[1.05rem] border-2 border-violet-200/75 iq-schools-avatar-selected-ring"
            animate={
              reduceMotion ? undefined : { opacity: [0.35, 0.9, 0.35], scale: [1, 1.015, 1] }
            }
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        <SchoolsAvatarPortraitCard
          avatarId={avatar.id}
          accent={avatar.accent}
          width={slideWidth}
          heightScale={portraitHeightScale}
          active={focused && !selected}
          selected={selected}
          className={[
            focused ? "iq-schools-avatar-portrait--focused" : "",
            selected ? "iq-schools-avatar-portrait--selected" : ""
          ]
            .filter(Boolean)
            .join(" ") || undefined}
        />
      </motion.div>

      {selected ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 26 }}
        >
          <SelectionCheckmark />
        </motion.div>
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

export function SchoolsAvatarCarouselTrack({
  slideGap,
  carousel,
  className = "",
  portraitHeightScale = 1,
  mobileSelection
}: Props) {
  const {
    trackRef,
    x,
    index,
    slideWidth,
    slideStep,
    sideInset,
    snapToIndex,
    onDrag,
    onDragEnd,
    dragMin,
    dragMax
  } = carousel;

  return (
    <div
      ref={trackRef}
      className={["relative min-h-0 flex-1 touch-pan-y overflow-hidden", className].join(" ")}
      style={{ perspective: 900 }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center will-change-transform"
        style={{ x, gap: slideGap }}
        drag="x"
        dragConstraints={{ left: dragMin, right: dragMax }}
        dragElastic={0.1}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      >
        {SCHOOLS_AVATARS.map((avatar, i) =>
          mobileSelection ? (
            <MobileCarouselSlide
              key={avatar.id}
              avatar={avatar}
              slideWidth={slideWidth}
              slideIndex={i}
              focused={i === index}
              selected={mobileSelection.selectedId === avatar.id}
              distance={Math.abs(i - index)}
              trackX={x}
              sideInset={sideInset}
              slideStep={slideStep}
              portraitHeightScale={portraitHeightScale}
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
  className = "",
  variant = "default",
  selected = false
}: {
  activeAvatar: SchoolsAvatar;
  className?: string;
  variant?: "default" | "mobile";
  selected?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const mobile = variant === "mobile";

  return (
    <div
      className={[
        "shrink-0 text-center md:text-left",
        mobile
          ? "iq-schools-avatar-mobile-meta px-5 pb-0 pt-0"
          : "px-6 pb-2 pt-1",
        className
      ].join(" ")}
      aria-live="polite"
    >
      <div className="relative mx-auto inline-block max-w-full">
        {mobile ? (
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute inset-[-0.35rem_-0.75rem] iq-schools-avatar-name-glow",
              selected ? "iq-schools-avatar-name-glow--active" : ""
            ].join(" ")}
          />
        ) : null}
        <motion.h2
          key={`name-${activeAvatar.id}`}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className={[
            "relative",
            mobile
              ? "text-[1.02rem] font-black uppercase tracking-[0.17em]"
              : "text-xl font-black uppercase tracking-[0.2em] md:text-2xl",
            `iq-schools-avatar-name--${activeAvatar.accent}`
          ].join(" ")}
        >
          {activeAvatar.name}
        </motion.h2>
      </div>
      <motion.p
        key={`tag-${activeAvatar.id}`}
        initial={reduceMotion ? false : { opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
        className={[
          mobile
            ? "iq-schools-avatar-identity-desc mx-auto mt-0.5 max-w-[17rem] text-[0.78rem] font-medium leading-snug tracking-[0.02em]"
            : "mt-1.5 text-sm leading-relaxed text-violet-100/78 md:max-w-md md:text-base"
        ].join(" ")}
      >
        {activeAvatar.tagline}
      </motion.p>
    </div>
  );
}
