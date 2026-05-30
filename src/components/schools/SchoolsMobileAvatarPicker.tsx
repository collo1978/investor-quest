"use client";

import { NeonButton } from "@/components/NeonButton";
import {
  SchoolsAvatarCarouselMeta,
  SchoolsAvatarCarouselTrack
} from "@/components/schools/SchoolsAvatarCarouselTrack";
import { useSchoolsAvatarCarousel } from "@/components/schools/useSchoolsAvatarCarousel";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";

const SLIDE_GAP = 10;
/** ~10% wider slides + neighbor peek for swipe affordance */
const SLIDE_VW = 0.92;

const AVATAR_BG_PARTICLES = [
  { left: "12%", top: "22%", size: 2, delay: "0s", dur: "11s" },
  { left: "78%", top: "18%", size: 3, delay: "-2s", dur: "13s" },
  { left: "88%", top: "62%", size: 2, delay: "-4s", dur: "10s" },
  { left: "24%", top: "78%", size: 2, delay: "-1s", dur: "12s" },
  { left: "52%", top: "8%", size: 2, delay: "-3s", dur: "9s" },
  { left: "6%", top: "52%", size: 3, delay: "-5s", dur: "14s" }
] as const;

type Props = {
  selectedId: SchoolsAvatarId | null;
  onSelect: (id: SchoolsAvatarId) => void;
  onContinue: (id: SchoolsAvatarId) => void;
};

/** Phone portrait-first: swipe carousel, minimal chrome, one primary action. */
export function SchoolsMobileAvatarPicker({ selectedId, onSelect, onContinue }: Props) {
  const carousel = useSchoolsAvatarCarousel(selectedId, onSelect, {
    slideVw: SLIDE_VW,
    slideGap: SLIDE_GAP,
    selectOnSnap: false
  });

  const handleContinue = () => {
    const id = selectedId ?? carousel.focusedAvatar.id;
    if (!selectedId) {
      onSelect(id);
    }
    onContinue(id);
  };

  return (
    <main
      className={`relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#030308] ${SCHOOLS_DEVICE.mobileOnly}`}
      role="application"
      aria-label="Pick your Investor Quest identity"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-armor-bg" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-avatar-mobile-nebula" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-avatar-mobile-hologram" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-armor-vignette" />
      {AVATAR_BG_PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="iq-schools-avatar-mobile-particle pointer-events-none absolute rounded-full bg-violet-200/70"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur
          }}
        />
      ))}

      <header className="relative z-10 shrink-0 px-5 pb-1 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <p className="iq-schools-avatar-identity-tagline mx-auto max-w-[20rem] text-center text-[1.08rem] font-bold leading-snug tracking-[0.015em] text-violet-50/95 sm:text-[1.15rem]">
          Pick your Investor Quest identity.
        </p>
        <p
          aria-hidden
          className="iq-schools-avatar-swipe-nudge mx-auto mt-2 flex items-center justify-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-violet-200/45"
        >
          <span className="iq-schools-avatar-swipe-nudge-arrow">‹</span>
          Swipe to browse
          <span className="iq-schools-avatar-swipe-nudge-arrow iq-schools-avatar-swipe-nudge-arrow--right">
            ›
          </span>
        </p>
      </header>

      <SchoolsAvatarCarouselTrack
        slideGap={SLIDE_GAP}
        carousel={carousel}
        mobileSelection={{ selectedId, onSelectAvatar: onSelect }}
      />

      <SchoolsAvatarCarouselMeta
        activeAvatar={carousel.focusedAvatar}
        className="pb-1 pt-0"
      />

      <div className="relative z-20 shrink-0 px-4 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex justify-center">
          <NeonButton
            type="button"
            className={[
              "iq-schools-armor-cta iq-schools-armor-cta-premium w-full max-w-[18.5rem]",
              "min-h-[48px] px-8 py-3.5 text-xs font-black uppercase tracking-[0.26em]",
              "transition-[box-shadow,opacity,transform] duration-300",
              selectedId ? "iq-schools-armor-cta--armed" : ""
            ].join(" ")}
            onClick={handleContinue}
          >
            CONTINUE
          </NeonButton>
        </div>
      </div>
    </main>
  );
}
