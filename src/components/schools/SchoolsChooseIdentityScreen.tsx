"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  getSchoolsArmorById,
  type SchoolsArmorId
} from "@/lib/schools/schoolsIdentities";
import {
  ARMOR_SELECT_ZONES,
  SCHOOLS_ARMOR_IMAGE_NATURAL,
  SCHOOLS_ARMOR_IMAGE_SRC,
  type ArmorOptionZone
} from "@/lib/schools/schoolsIdentityImageZones";
import { readSchoolsArmor, saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";

const { width: ART_W, height: ART_H } = SCHOOLS_ARMOR_IMAGE_NATURAL;
const ART_ASPECT = ART_W / ART_H;

/** Largest uncropped poster box that fits the viewport — matches profile / opening. */
function SchoolsArmorArtStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="iq-schools-choose-stage relative mx-auto w-full max-h-[100dvh] shrink-0 overflow-hidden"
      style={{
        maxWidth: `min(100vw, calc(100dvh * ${ART_ASPECT}))`,
        aspectRatio: `${ART_W} / ${ART_H}`,
        ["--iq-art-aspect" as string]: ART_ASPECT
      }}
    >
      {children}
    </div>
  );
}

export type SchoolsChooseIdentityScreenProps = {
  onContinue: (armorId: SchoolsArmorId) => void;
};

function ArmorSelectButton({
  zone,
  selected,
  onSelect
}: {
  zone: ArmorOptionZone;
  selected: boolean;
  onSelect: (id: SchoolsArmorId) => void;
}) {
  const armor = getSchoolsArmorById(zone.id);

  return (
    <button
      type="button"
      aria-label={selected ? `${armor.shortTitle} selected` : `Select ${armor.shortTitle}`}
      aria-pressed={selected}
      onClick={() => onSelect(zone.id)}
      className={[
        "iq-schools-armor-select-btn absolute z-20 m-0 cursor-pointer border-0 p-0",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-400",
        selected ? "iq-schools-armor-select-btn--selected" : ""
      ].join(" ")}
      style={{
        left: `${zone.left}%`,
        top: `${zone.top}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        ["--iq-accent" as string]: armor.accent
      }}
    >
      {selected ? "SELECTED" : "SELECT"}
    </button>
  );
}

/**
 * Schools armor picker — artwork is background only.
 * SELECT CTA under each character + CONTINUE in the bottom-right.
 */
export function SchoolsChooseIdentityScreen({
  onContinue
}: SchoolsChooseIdentityScreenProps) {
  const [selectedId, setSelectedId] = useState<SchoolsArmorId | null>(null);
  const canContinue = selectedId != null;

  useEffect(() => {
    const stored = readSchoolsArmor();
    if (stored) setSelectedId(stored.id);
  }, []);

  const handleSelect = (id: SchoolsArmorId) => {
    setSelectedId(id);
    saveSchoolsArmor(id);
  };

  return (
    <main
      className="iq-schools-choose-identity iq-schools-avatar-deck pointer-events-auto relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#030208]"
      role="application"
      aria-label="Choose your investor armor"
      style={{ ["--iq-art-aspect" as string]: ART_ASPECT }}
    >
      <SchoolsArmorArtStage>
        <img
          src={SCHOOLS_ARMOR_IMAGE_SRC}
          alt=""
          width={ART_W}
          height={ART_H}
          draggable={false}
          decoding="async"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain object-center"
        />

        <div
          className="absolute inset-0 z-10"
          role="group"
          aria-label="Armor options"
        >
          {ARMOR_SELECT_ZONES.map((zone) => (
            <ArmorSelectButton
              key={zone.id}
              zone={zone}
              selected={selectedId === zone.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <footer className="pointer-events-none absolute bottom-[2%] right-[1%] z-30">
          <button
            type="button"
            aria-label="Continue to onboarding"
            aria-disabled={!canContinue}
            disabled={!canContinue}
            onClick={() => {
              if (selectedId) onContinue(selectedId);
            }}
            className={[
              "iq-schools-choose-continue-btn pointer-events-auto touch-manipulation",
              canContinue
                ? "iq-schools-choose-continue-btn--armed cursor-pointer"
                : "cursor-not-allowed"
            ].join(" ")}
          >
            CONTINUE
          </button>
        </footer>
      </SchoolsArmorArtStage>
    </main>
  );
}
