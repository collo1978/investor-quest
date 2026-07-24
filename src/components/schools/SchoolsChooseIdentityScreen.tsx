"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { NeonButton } from "@/components/NeonButton";
import { SchoolsArmorCard } from "@/components/schools/SchoolsArmorCard";
import {
  SCHOOLS_ARMOR_TYPES,
  type SchoolsArmorId
} from "@/lib/schools/schoolsIdentities";
import { readSchoolsArmor, saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";

const GOLD = "#F5C547";

export type SchoolsChooseIdentityScreenProps = {
  onContinue: (armorId: SchoolsArmorId) => void;
};

/**
 * Schools armor picker — real interactive cards (cropped from the shared
 * artwork, each its own clickable element with hover/selection feedback),
 * not a single flat image with invisible hit-zones.
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
      className="iq-schools-choose-identity relative flex min-h-[100dvh] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-[#030208] px-4 py-5 sm:px-5 sm:py-7 md:px-10"
      role="application"
      aria-label="Choose your investor armor"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,197,71,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(139,92,246,0.1),transparent_50%)]"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 iq-schools-armor-vault-bg" />
      <div aria-hidden className="pointer-events-none fixed inset-0 iq-schools-armor-circuit-bg" />
      <div aria-hidden className="pointer-events-none fixed inset-0 iq-schools-armor-spotlight-bg" />

      <header className="relative z-[1] mb-4 text-center sm:mb-5 md:mb-6">
        <h1
          className="font-[var(--font-grotesk)] text-[clamp(1.65rem,7vw,3rem)] font-black uppercase leading-[0.98] tracking-[0.06em] md:text-5xl"
          style={{
            background: `linear-gradient(180deg, #fff8e1, ${GOLD})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Choose your investor armor
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/70">
          All armors start at Bronze.
        </p>
      </header>

      <div className="iq-schools-armor-grid relative z-[1] grid w-full max-w-6xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {SCHOOLS_ARMOR_TYPES.map((armor) => (
          <SchoolsArmorCard
            key={armor.id}
            armor={armor}
            selected={selectedId === armor.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <footer className="relative z-[1] mt-5 flex w-full max-w-6xl flex-col items-center gap-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:mt-6">
        <p className="iq-schools-armor-caption text-center text-xs font-semibold text-amber-50/72">
          <span className="font-semibold uppercase tracking-[0.14em] text-amber-100/80">
            Sector strength
          </span>{" "}
          - your chest plate reflects your sector mastery.
        </p>
        <motion.div
          animate={
            canContinue
              ? { y: [0, -2, 0], scale: [1, 1.018, 1] }
              : { y: 0, scale: 1 }
          }
          transition={
            canContinue
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          <NeonButton
            type="button"
            aria-label="Continue to onboarding"
            aria-disabled={!canContinue}
            disabled={!canContinue}
            className={[
              "iq-schools-armor-continue-btn min-w-[13rem] px-8 py-3.5 text-sm font-black uppercase tracking-[0.28em]",
              canContinue ? "iq-schools-armor-continue-btn--armed" : ""
            ].join(" ")}
            onClick={() => {
              if (selectedId) onContinue(selectedId);
            }}
          >
            Continue
          </NeonButton>
        </motion.div>
      </footer>
    </main>
  );
}
