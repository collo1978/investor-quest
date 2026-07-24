"use client";

import { motion } from "framer-motion";

import type { SchoolsArmor } from "@/lib/schools/schoolsIdentities";
import { getArmorCardCrop, SCHOOLS_ARMOR_IMAGE_SRC } from "@/lib/schools/schoolsArmorCardZones";
import { playSchoolsIdentityTalkSound } from "@/lib/schools/schoolsIdentityTalkSound";

export type SchoolsArmorCardProps = {
  armor: SchoolsArmor;
  selected: boolean;
  onSelect: (id: SchoolsArmor["id"]) => void;
  className?: string;
};

/** Real interactive card cropped from the shared armor composite. */
export function SchoolsArmorCard({
  armor,
  selected,
  onSelect,
  className = ""
}: SchoolsArmorCardProps) {
  const crop = getArmorCardCrop(armor.id);

  const handleClick = () => {
    onSelect(armor.id);
    playSchoolsIdentityTalkSound({
      seed: armor.id,
      text: armor.greeting
    });
  };

  return (
    <motion.button
      type="button"
      aria-label={armor.title}
      aria-pressed={selected}
      onClick={handleClick}
      className={[
        "iq-schools-armor-card group relative w-full overflow-hidden rounded-2xl border-2 bg-[#05050f] text-left",
        "transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:-translate-y-1 hover:scale-[1.02]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className
      ].join(" ")}
      style={{
        borderColor: selected ? armor.accent : "rgba(255,255,255,0.12)",
        boxShadow: selected
          ? `0 0 0 1px ${armor.accent}, 0 0 42px ${armor.accent}55, 0 18px 40px rgba(0,0,0,0.55)`
          : "0 10px 30px rgba(0,0,0,0.45)"
      }}
    >
      <div className="absolute inset-0">
        <span
          aria-hidden
          className="absolute inset-0 block bg-no-repeat"
          style={{
            backgroundImage: `url(${SCHOOLS_ARMOR_IMAGE_SRC})`,
            backgroundSize: `${crop.backgroundSizePct.x}% ${crop.backgroundSizePct.y}%`,
            backgroundPosition: `${crop.backgroundPositionPct.x}% ${crop.backgroundPositionPct.y}%`
          }}
        />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 70% at 50% 0%, ${armor.accent}33, transparent 65%)`
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"
      />

      {selected ? (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="absolute right-2.5 top-2.5 z-20 grid h-7 w-7 place-items-center rounded-full border text-xs font-bold"
          style={{
            borderColor: armor.accent,
            background: "rgba(5,5,15,0.9)",
            color: armor.accent,
            boxShadow: `0 0 16px ${armor.accent}88`
          }}
        >
          ✓
        </motion.span>
      ) : null}

      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3">
        <span
          className="text-sm font-black uppercase tracking-[0.14em]"
          style={{ color: armor.accent }}
        >
          {armor.shortTitle}
        </span>
        <span className="text-[11px] font-medium leading-snug text-white/80">
          {armor.tagline}
        </span>
      </span>
    </motion.button>
  );
}
