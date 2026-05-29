"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { NeonButton } from "@/components/NeonButton";
import { SchoolsMobileAvatarPicker } from "@/components/schools/SchoolsMobileAvatarPicker";
import { SchoolsTabletAvatarPicker } from "@/components/schools/SchoolsTabletAvatarPicker";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";
import { getSchoolsAvatarById, type SchoolsAvatarId } from "@/lib/schools/avatars";
import {
  AVATAR_IMAGE_ZONES,
  SCHOOLS_CHOOSE_AVATAR_IMAGE_SRC,
  SCHOOLS_CHOOSE_AVATAR_NATURAL
} from "@/lib/schools/avatarImageZones";

const { width: ART_W, height: ART_H } = SCHOOLS_CHOOSE_AVATAR_NATURAL;
const ART_ASPECT = ART_W / ART_H;

export type SchoolsArmorAvatarScreenProps = {
  onContinue: (avatarId: SchoolsAvatarId) => void;
};

function SchoolsDesktopAvatarPicker({
  selectedId,
  onSelect,
  onContinue
}: {
  selectedId: SchoolsAvatarId | null;
  onSelect: (id: SchoolsAvatarId) => void;
  onContinue: (avatarId: SchoolsAvatarId) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <main
      className={`relative h-[100dvh] w-full overflow-hidden bg-[#030308] ${SCHOOLS_DEVICE.desktopOnly}`}
      role="application"
      aria-label="Choose your avatar"
    >
      <div className="iq-schools-avatar-stage-wrap absolute inset-0 flex items-center justify-center">
        <div
          className="iq-schools-avatar-art-stage relative shrink-0"
          style={{
            aspectRatio: `${ART_W} / ${ART_H}`,
            height: `min(100dvh, calc(100vw / ${ART_ASPECT}))`,
            width: `min(100vw, calc(100dvh * ${ART_ASPECT}))`
          }}
        >
          <img
            src={SCHOOLS_CHOOSE_AVATAR_IMAGE_SRC}
            alt=""
            aria-hidden
            width={ART_W}
            height={ART_H}
            draggable={false}
            className="pointer-events-none block h-full w-full select-none"
          />

          {AVATAR_IMAGE_ZONES.map((zone) => {
            const selected = selectedId != null && zone.id === selectedId;
            return (
              <button
                key={zone.id}
                type="button"
                aria-label={`Select ${getSchoolsAvatarById(zone.id).name}`}
                aria-pressed={selected}
                onClick={() => onSelect(zone.id)}
                className={[
                  "absolute box-border rounded-[8px] border-2 border-transparent bg-transparent p-0",
                  "cursor-pointer transition-[box-shadow,border-color] duration-200 ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                  selected
                    ? "iq-schools-avatar-zone--selected"
                    : "iq-schools-avatar-zone--idle"
                ].join(" ")}
                style={{
                  left: `${zone.left}%`,
                  top: `${zone.top}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`
                }}
              >
                {selected ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-[5%] top-[3%] grid h-7 w-7 place-items-center rounded-full border border-violet-300/70 bg-[rgba(12,8,28,0.88)] text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.55)] sm:h-8 sm:w-8"
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
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-[#030308]/85 to-transparent" />

      <motion.div
        className="absolute bottom-7 right-7 z-30"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <NeonButton
          type="button"
          className="pointer-events-auto min-w-[9.5rem] px-6 py-3 text-sm font-black uppercase tracking-[0.28em]"
          onClick={() => {
            if (selectedId) onContinue(selectedId);
          }}
        >
          CONTINUE
        </NeonButton>
      </motion.div>
    </main>
  );
}

/**
 * Schools avatar pick — three intentional layouts:
 * mobile (<768), tablet (768–1023), desktop widescreen (1024+).
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
