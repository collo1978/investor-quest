"use client";

import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { NeonButton } from "@/components/NeonButton";
import {
  SchoolsAvatarCarouselMeta,
  SchoolsAvatarCarouselTrack
} from "@/components/schools/SchoolsAvatarCarouselTrack";
import { SchoolsAvatarProgressPanel } from "@/components/schools/SchoolsAvatarProgressPanel";
import { useSchoolsAvatarCarousel } from "@/components/schools/useSchoolsAvatarCarousel";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";

const SLIDE_GAP = 16;
const SLIDE_VW = 0.52;

type Props = {
  selectedId: SchoolsAvatarId | null;
  onSelect: (id: SchoolsAvatarId) => void;
  onContinue: (id: SchoolsAvatarId) => void;
};

/** iPad / tablet hybrid: carousel + progression panel, cinematic strategy-game feel. */
export function SchoolsTabletAvatarPicker({ selectedId, onSelect, onContinue }: Props) {
  const carousel = useSchoolsAvatarCarousel(selectedId, onSelect, {
    slideVw: SLIDE_VW,
    slideGap: SLIDE_GAP
  });

  return (
    <main
      className={`relative h-[100dvh] w-full overflow-hidden bg-[#030308] ${SCHOOLS_DEVICE.tabletOnly} flex-row`}
      role="application"
      aria-label="Choose your avatar"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_620px_at_65%_22%,rgba(139,92,246,0.14),transparent_58%),radial-gradient(680px_480px_at_12%_68%,rgba(99,102,241,0.1),transparent_55%)]"
      />

      <SchoolsAvatarProgressPanel />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between px-8 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))]">
          <InvestorQuestBrandLogo
            align="left"
            className="h-10 w-auto max-w-[240px]"
            showDecorativeGlow
          />
          <h1 className="iq-schools-armor-title text-right text-xs font-black uppercase tracking-[0.34em] text-violet-100/95">
            Choose your avatar
          </h1>
        </header>

        <SchoolsAvatarCarouselTrack slideGap={SLIDE_GAP} carousel={carousel} />

        <div className="flex shrink-0 items-end justify-between gap-6 px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <SchoolsAvatarCarouselMeta
            activeAvatar={carousel.activeAvatar}
            className="min-w-0 flex-1 px-0 pb-0"
          />
          <NeonButton
            type="button"
            className="mb-1 shrink-0 min-w-[10rem] px-7 py-3.5 text-sm font-black uppercase tracking-[0.28em]"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) onContinue(selectedId);
            }}
          >
            CONTINUE
          </NeonButton>
        </div>
      </div>
    </main>
  );
}
