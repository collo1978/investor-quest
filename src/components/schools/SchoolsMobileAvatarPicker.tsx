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
const SLIDE_VW = 0.88;
/** Shorter portrait — compact cinematic stack on phone */
const PORTRAIT_HEIGHT_SCALE = 0.8;

const AVATAR_BG_PARTICLES = [
  { left: "12%", top: "22%", size: 2, delay: "0s", dur: "11s" },
  { left: "78%", top: "18%", size: 3, delay: "-2s", dur: "13s" },
  { left: "88%", top: "62%", size: 2, delay: "-4s", dur: "10s" },
  { left: "24%", top: "78%", size: 2, delay: "-1s", dur: "12s" },
  { left: "52%", top: "8%", size: 2, delay: "-3s", dur: "9s" },
  { left: "6%", top: "52%", size: 3, delay: "-5s", dur: "14s" }
] as const;

/** Faint particles clustered around the avatar reveal zone */
const AVATAR_STAGE_PARTICLES = [
  { left: "16%", top: "36%", size: 2, delay: "0s", dur: "9s" },
  { left: "84%", top: "40%", size: 2, delay: "-1.2s", dur: "11s" },
  { left: "74%", top: "56%", size: 3, delay: "-2.8s", dur: "12s" },
  { left: "26%", top: "52%", size: 2, delay: "-1.8s", dur: "10s" },
  { left: "48%", top: "44%", size: 2, delay: "-3.5s", dur: "13s" },
  { left: "58%", top: "60%", size: 2, delay: "-0.6s", dur: "10s" }
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

      <header className="iq-schools-avatar-mobile-header relative z-10 shrink-0 px-4 pb-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="iq-schools-avatar-mobile-hero-wrap relative mx-auto max-w-[22rem] px-2 py-0.5">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 iq-schools-avatar-hero-glow"
          />
          <p className="iq-schools-avatar-mobile-hero-title iq-schools-avatar-identity-tagline relative text-center text-violet-50">
            Pick your Investor Quest identity.
          </p>
        </div>
        <p
          aria-hidden
          className="iq-schools-avatar-swipe-nudge mx-auto flex items-center justify-center gap-2.5"
        >
          <span className="iq-schools-avatar-swipe-nudge-arrow">‹</span>
          Swipe to browse
          <span className="iq-schools-avatar-swipe-nudge-arrow iq-schools-avatar-swipe-nudge-arrow--right">
            ›
          </span>
        </p>
      </header>

      <div className="iq-schools-avatar-mobile-body relative z-10 flex min-h-0 flex-1 flex-col justify-start">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 bottom-[26%] iq-schools-avatar-mobile-stage-glow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[16%] h-[50%] iq-schools-avatar-mobile-stage-hologram"
        />
        {AVATAR_STAGE_PARTICLES.map((p, i) => (
          <span
            key={`stage-${i}`}
            aria-hidden
            className="iq-schools-avatar-mobile-particle iq-schools-avatar-mobile-stage-particle pointer-events-none absolute rounded-full bg-violet-100/80"
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

        <SchoolsAvatarCarouselTrack
          slideGap={SLIDE_GAP}
          carousel={carousel}
          className="iq-schools-avatar-mobile-carousel"
          portraitHeightScale={PORTRAIT_HEIGHT_SCALE}
          mobileSelection={{ selectedId, onSelectAvatar: onSelect }}
        />

        <div className="iq-schools-avatar-mobile-identity-stack shrink-0">
          <SchoolsAvatarCarouselMeta
            activeAvatar={carousel.focusedAvatar}
            variant="mobile"
            selected={selectedId === carousel.focusedAvatar.id}
          />

          <div className="iq-schools-avatar-mobile-footer relative z-20 px-4">
            <div className="flex justify-center">
              <NeonButton
                type="button"
                className={[
                  "iq-schools-armor-cta iq-schools-armor-cta-premium w-full max-w-[18.5rem]",
                  "min-h-[46px] px-8 py-3 text-xs font-black uppercase tracking-[0.26em]",
                  "transition-[box-shadow,opacity,transform] duration-300",
                  selectedId ? "iq-schools-armor-cta--armed" : ""
                ].join(" ")}
                onClick={handleContinue}
              >
                CONTINUE
              </NeonButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
