"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { NeonButton } from "@/components/NeonButton";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  readPickInterestsSelection,
  writePickInterestsSelection
} from "@/lib/bank/pickInterestsState";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import { shouldRunSchoolsDemoBackgroundSystems } from "@/lib/schools/schoolsDemoProtection";
import { SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT } from "@/lib/schools/schoolsPickInterestsConfig";

export type SchoolsPickInterestsScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

type SchoolsInterestCard = {
  id: string;
  label: string;
  subtitle: string;
  /** World art path — gradient fallback when unset. */
  image?: string;
  /** Optional image overlay gradient — standard dark veil when unset. */
  overlay?: string;
  /** Gradient fallback when `image` is missing. */
  background: string;
  glow: string;
};

const SCHOOLS_INTEREST_CARDS: readonly SchoolsInterestCard[] = [
  {
    id: "ai",
    label: "AI & Robotics",
    subtitle: "Neural networks, automation, the future",
    image: "/logos/ai-robotics.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #0c1222 0%, #1e1b4b 38%, #312e81 62%, #06b6d4 100%)",
    glow: "rgba(34,211,238,0.55)"
  },
  {
    id: "gaming",
    label: "Gaming & Esports",
    subtitle: "Arenas, speed, digital competition",
    image: "/screens/eports.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #120818 0%, #4c1d95 42%, #7c3aed 68%, #ec4899 100%)",
    glow: "rgba(236,72,153,0.52)"
  },
  {
    id: "tech",
    label: "Technology",
    subtitle: "Devices, platforms, the connected world",
    image: "/screens/Tech.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #050816 0%, #1e3a8a 45%, #2563eb 72%, #60a5fa 100%)",
    glow: "rgba(96,165,250,0.5)"
  },
  {
    id: "sports",
    label: "Sports",
    subtitle: "Teams, leagues, performance under pressure",
    image: "/screens/sport.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #041510 0%, #064e3b 42%, #059669 68%, #34d399 100%)",
    glow: "rgba(52,211,153,0.48)"
  },
  {
    id: "electric_cars",
    label: "Cars & Mobility",
    subtitle: "Electric drives, roads, how we move",
    image: "/screens/cars.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #050810 0%, #0f172a 40%, #334155 65%, #38bdf8 100%)",
    glow: "rgba(56,189,248,0.48)"
  },
  {
    id: "health",
    label: "Medicine & Healthcare",
    subtitle: "Breakthroughs, care, human resilience",
    image: "/screens/medicine.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #041018 0%, #0e7490 44%, #0891b2 70%, #67e8f9 100%)",
    glow: "rgba(103,232,249,0.45)"
  },
  {
    id: "finance",
    label: "Money & Finance",
    subtitle: "Markets, banks, where value moves",
    image: "/screens/money.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #0c0a06 0%, #78350f 42%, #b45309 68%, #fbbf24 100%)",
    glow: "rgba(251,191,36,0.5)"
  },
  {
    id: "energy",
    label: "Energy & Power",
    subtitle: "Grid, fuel, what keeps the lights on",
    image: "/screens/energy.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #0a0804 0%, #92400e 40%, #ea580c 66%, #fde047 100%)",
    glow: "rgba(253,224,71,0.48)"
  },
  {
    id: "consumer",
    label: "Shopping & Brands",
    subtitle: "Stores, labels, what people buy",
    image: "/screens/shopping.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #100812 0%, #831843 44%, #db2777 70%, #f9a8d4 100%)",
    glow: "rgba(249,168,212,0.48)"
  },
  {
    id: "travel",
    label: "Travel & Adventure",
    subtitle: "Horizons, journeys, places unseen",
    image: "/screens/travel.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #050c18 0%, #1d4ed8 42%, #0284c7 68%, #7dd3fc 100%)",
    glow: "rgba(125,211,252,0.48)"
  },
  {
    id: "food",
    label: "Food & Restaurants",
    subtitle: "Kitchens, flavors, dining culture",
    image: "/screens/food.png",
    overlay:
      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.10) 100%)",
    background:
      "linear-gradient(145deg, #120806 0%, #9a3412 42%, #dc2626 68%, #fb923c 100%)",
    glow: "rgba(251,146,60,0.5)"
  }
] as const;

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.06 }
  }
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }
  }
};

function CinematicInterestCard({
  card,
  selected,
  dimmed,
  onToggle
}: {
  card: SchoolsInterestCard;
  selected: boolean;
  dimmed: boolean;
  onToggle: () => void;
}) {
  const hasImage = Boolean(card.image);

  const handleSelect = () => {
    if (dimmed) return;
    onToggle();
  };

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-disabled={dimmed}
      aria-label={`Select ${card.label}`}
      onClick={handleSelect}
      variants={gridItemVariants}
      whileHover={
        dimmed
          ? undefined
          : {
              boxShadow: `0 0 0 1px rgba(196,181,253,0.35), 0 0 32px ${card.glow}, 0 18px 40px rgba(0,0,0,0.45)`
            }
      }
      whileTap={dimmed ? undefined : { scale: 0.98 }}
      animate={{
        scale: selected ? 1.02 : 1,
        opacity: dimmed ? 0.42 : 1,
        boxShadow: selected
          ? `0 0 0 2px rgba(233,213,255,0.85), 0 0 44px ${card.glow}, 0 0 72px rgba(139,92,246,0.28), 0 16px 36px rgba(0,0,0,0.5)`
          : `0 0 0 1px rgba(139,92,246,0.22), 0 8px 28px rgba(0,0,0,0.38)`
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "group relative isolate flex aspect-[3/4] min-h-[9.5rem] w-full flex-col justify-end overflow-hidden rounded-2xl border text-left",
        "pointer-events-auto touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/75",
        dimmed ? "cursor-not-allowed" : "cursor-pointer",
        selected ? "border-violet-200/70" : "border-violet-500/20"
      ].join(" ")}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.span
          className="absolute inset-0 h-full w-full"
          initial={false}
          animate={{ scale: selected ? 1.04 : 1 }}
          whileHover={dimmed ? undefined : { scale: 1.08 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.image}
              alt=""
              draggable={false}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span
              className="block h-full w-full bg-cover bg-center"
              style={{ backgroundImage: card.background }}
            />
          )}
        </motion.span>
      </span>

      <span
        aria-hidden
        className={
          card.overlay
            ? "pointer-events-none absolute inset-0"
            : "pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030308]/95 via-[#030308]/55 to-[#030308]/20"
        }
        style={card.overlay ? { background: card.overlay } : undefined}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_52%)]"
      />
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100 md:group-hover:opacity-100",
          selected ? "opacity-100" : ""
        ].join(" ")}
        style={{
          background: `radial-gradient(circle at 50% 85%, ${card.glow.replace(/[\d.]+\)$/, "0.22)")}, transparent 68%)`
        }}
      />

      {selected ? (
        <motion.span
          aria-hidden
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="pointer-events-none absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-violet-100/55 bg-[rgba(8,6,18,0.88)] text-sm font-bold text-violet-50 shadow-[0_0_20px_rgba(139,92,246,0.55)]"
        >
          ✓
        </motion.span>
      ) : null}

      <div className="pointer-events-none relative z-10 px-3 pb-3 pt-10 text-left">
        <span className="block font-[var(--font-grotesk)] text-[clamp(0.72rem,2.8vw,0.92rem)] font-bold uppercase leading-tight tracking-[0.06em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          {card.label}
        </span>
        <span className="mt-1 block text-[clamp(0.62rem,2.2vw,0.78rem)] font-medium leading-snug text-violet-100/78 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
          {card.subtitle}
        </span>
      </div>
    </motion.button>
  );
}

/** Schools onboarding — cinematic pick 1 interest. */
export function SchoolsPickInterestsScreen({
  onContinue,
  onBack
}: SchoolsPickInterestsScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const canContinue = selected.length === SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT;
  const remaining = SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT - selected.length;

  useRunOnceOnMount(() => {
    setSelected(
      readPickInterestsSelection().slice(0, SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT)
    );
    warmBankPickInterestsCatalog();
  });

  useEffect(() => {
    writePickInterestsSelection(selected);
  }, [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT === 1) return [id];
      if (prev.length >= SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT) return prev;
      return [...prev, id];
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (shouldRunSchoolsDemoBackgroundSystems()) {
      const guestId = getOrCreateOnboardingGuestId();
      void fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, interestIds: selected })
      });
    }
    onContinue();
  };

  return (
    <div className="iq-schools-deck-pick-interests relative isolate flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_8%,rgba(139,92,246,0.2),transparent_62%),radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(109,40,217,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [background-image:radial-gradient(rgba(139,92,246,0.35)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="iq-schools-deck-pick-body relative z-20 flex min-h-0 flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <div className="flex shrink-0 items-center pt-[max(0.85rem,env(safe-area-inset-top))]">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/35 bg-[rgba(8,6,18,0.75)] text-lg text-violet-200/90 shadow-[0_0_14px_rgba(139,92,246,0.18)] transition hover:border-violet-400/55 hover:bg-violet-500/10"
          >
            ‹
          </button>
        </div>

        <header className="pointer-events-none shrink-0 px-2 pb-4 pt-1 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="font-[var(--font-grotesk)] text-[clamp(1.85rem,3.4vw,3rem)] font-black uppercase leading-[0.95] tracking-[0.06em] text-white"
          >
            Choose 1 Interest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[clamp(0.85rem,1.2vw,1.05rem)] font-medium text-violet-100/85"
          >
            Your interest will help reveal your first sector.
          </motion.p>
        </header>

        <div className="relative z-30 min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1 md:py-2">
          <motion.div
            className="iq-schools-deck-pick-grid pointer-events-auto mx-auto grid w-full max-w-[min(1240px,96vw)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {SCHOOLS_INTEREST_CARDS.map((card) => {
              const active = selected.includes(card.id);
              const atMax = selected.length >= SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT;
              const dimmed =
                SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT > 1 && !active && atMax;

              return (
                <CinematicInterestCard
                  key={card.id}
                  card={card}
                  selected={active}
                  dimmed={dimmed}
                  onToggle={() => toggle(card.id)}
                />
              );
            })}
          </motion.div>
        </div>
      </div>

      <footer className="iq-schools-opening-cta-dock pointer-events-none absolute inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto w-full max-w-lg px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] text-center">
          {canContinue ? (
            <p className="mb-3 text-sm font-semibold tracking-[0.04em] text-violet-200/90">
              Worlds unlocked — ready to explore.
            </p>
          ) : (
            <p className="mb-3 text-xs text-ink-2">
              {remaining === SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT
                ? `Select ${SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT} to continue`
                : `Select ${remaining} more`}
            </p>
          )}
          <NeonButton
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[54px] rounded-full px-8 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-bold uppercase tracking-[0.14em]"
            ].join(" ")}
          >
            Continue
          </NeonButton>
        </div>
      </footer>
    </div>
  );
}
