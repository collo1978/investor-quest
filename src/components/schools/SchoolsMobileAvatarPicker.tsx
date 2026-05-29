"use client";

import { NeonButton } from "@/components/NeonButton";
import {
  SchoolsAvatarCarouselMeta,
  SchoolsAvatarCarouselTrack
} from "@/components/schools/SchoolsAvatarCarouselTrack";
import { useSchoolsAvatarCarousel } from "@/components/schools/useSchoolsAvatarCarousel";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";

const SLIDE_GAP = 14;
const SLIDE_VW = 0.84;

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
      className={`relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#030308] ${SCHOOLS_DEVICE.mobileOnly}`}
      role="application"
      aria-label="Choose your avatar"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_18%,rgba(139,92,246,0.16),transparent_62%),radial-gradient(720px_480px_at_80%_72%,rgba(168,85,247,0.1),transparent_60%)]"
      />

      <header className="relative z-10 flex shrink-0 flex-col items-center px-5 pb-2 pt-[max(1.15rem,env(safe-area-inset-top))]">
        <h1 className="iq-schools-armor-title text-center text-[0.68rem] font-black uppercase tracking-[0.34em] text-violet-100/95 sm:text-xs">
          Choose your avatar
        </h1>
        <p className="iq-schools-avatar-swipe-hint mt-3 max-w-[16rem] text-center text-[0.72rem] font-medium leading-relaxed tracking-[0.04em]">
          Swipe to find your favorite avatar.
        </p>
      </header>

      <SchoolsAvatarCarouselTrack
        slideGap={SLIDE_GAP}
        carousel={carousel}
        mobileSelection={{ selectedId, onSelectAvatar: onSelect }}
      />

      <SchoolsAvatarCarouselMeta activeAvatar={carousel.focusedAvatar} />

      <div className="relative z-20 shrink-0 bg-gradient-to-t from-[#030308] via-[#030308]/90 to-transparent px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex justify-end">
          <NeonButton
            type="button"
            className={[
              "min-h-[44px] min-w-[9.5rem] px-6 py-3 text-xs font-black uppercase tracking-[0.28em] transition-[box-shadow,opacity,transform] duration-300",
              selectedId ? "iq-schools-armor-cta" : ""
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
