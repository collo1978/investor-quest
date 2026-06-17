"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { NeonButton } from "@/components/NeonButton";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import {
  readScreen5Selections,
  writeScreen5Selections,
  type Screen5OptionId
} from "@/lib/bank/screen5OnboardingState";
import {
  BANK_BROKER_PICK_INTERESTS_ROUTE,
  BANK_BROKER_SCREEN4_ONBOARDING_ROUTE
} from "@/lib/bank/bankBrokerPreviewRoutes";
import { hrefForBankOnboardingStep } from "@/lib/bank/bankBrokerOnboardingFlow";
import { warmBankPickInterestsCatalog } from "@/lib/bank/warmBankPickInterestsCatalog";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";

type ColumnTheme = "orange" | "purple";

type OptionDef = {
  id: Screen5OptionId;
  title: string;
  subtitle?: string;
  icon: ReactNode;
};

const EXPERIENCED_OPTIONS: OptionDef[] = [
  {
    id: "exp-social",
    title: "Social media or influencers",
    icon: <SocialIcon />
  },
  {
    id: "exp-someone-told",
    title: "Someone told me to",
    subtitle: "Friends • family • online communities",
    icon: <PeopleIcon />
  },
  {
    id: "exp-guessing",
    title: "I was mostly guessing",
    subtitle: "I hoped the stock would go up.",
    icon: <DiceIcon />
  },
  {
    id: "exp-liked",
    title: "I bought companies I personally liked",
    subtitle: "Brands • products • apps I already used",
    icon: <HeartIcon />
  },
  {
    id: "exp-education",
    title: "Education",
    subtitle: "Books • courses • podcasts • research",
    icon: <BookIcon theme="orange" />
  },
  {
    id: "exp-research",
    title: "Research",
    subtitle: "10-Ks • earnings reports • company analysis",
    icon: <SearchIcon />
  }
];

const BEGINNER_OPTIONS: OptionDef[] = [
  {
    id: "beg-watch",
    title: "I watch stock content online",
    icon: <PhonePlayIcon />
  },
  {
    id: "beg-afraid",
    title: "I'm afraid of losing money",
    subtitle: "I don't want to risk my savings.",
    icon: <ShieldIcon />
  },
  {
    id: "beg-understand",
    title: "I don't understand companies",
    subtitle: "Financial information feels overwhelming.",
    icon: <CloudQuestionIcon />
  },
  {
    id: "beg-start",
    title: "I don't know where to start",
    subtitle: "It all feels unfamiliar.",
    icon: <CompassIcon />
  },
  {
    id: "beg-education",
    title: "Education",
    subtitle: "Books • courses • podcasts • research",
    icon: <GradCapIcon />
  }
];

function OptionCard({
  option,
  theme,
  selected,
  onToggle
}: {
  option: OptionDef;
  theme: ColumnTheme;
  selected: boolean;
  onToggle: () => void;
}) {
  const isOrange = theme === "orange";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        "group relative w-full rounded-xl border px-2 py-2 text-left transition-[box-shadow,transform,background-color,border-color] duration-200",
        "focus:outline-none focus:ring-2 focus:ring-violet-400/50 active:scale-[0.98]",
        isOrange
          ? selected
            ? "border-orange-400/80 bg-orange-500/[0.14] shadow-[0_0_0_1px_rgba(251,146,60,0.5),0_0_22px_rgba(251,146,60,0.35)]"
            : "border-orange-500/25 bg-[rgba(8,6,14,0.55)] hover:border-orange-400/55 hover:bg-orange-500/[0.08] hover:shadow-[0_0_18px_rgba(251,146,60,0.22)] md:hover:scale-[1.01]"
          : selected
            ? "border-violet-400/80 bg-violet-500/[0.14] shadow-[0_0_0_1px_rgba(139,92,246,0.5),0_0_24px_rgba(139,92,246,0.38)]"
            : "border-violet-500/25 bg-[rgba(8,6,14,0.55)] hover:border-violet-400/55 hover:bg-violet-500/[0.08] hover:shadow-[0_0_20px_rgba(139,92,246,0.24)] md:hover:scale-[1.01]"
      ].join(" ")}
    >
      {selected ? (
        <span
          aria-hidden
          className={[
            "absolute right-1.5 top-1.5 text-[10px] font-bold leading-none",
            isOrange ? "text-orange-300" : "text-violet-300"
          ].join(" ")}
        >
          ✓
        </span>
      ) : null}

      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">{option.icon}</span>
        <span className="min-w-0 flex-1 pr-3">
          <span className="block text-[0.62rem] font-semibold leading-snug text-white/95 sm:text-[0.68rem]">
            {option.title}
          </span>
          {option.subtitle ? (
            <span className="mt-0.5 block text-[0.52rem] leading-snug text-white/45 sm:text-[0.56rem]">
              {option.subtitle}
            </span>
          ) : null}
        </span>
      </div>
    </button>
  );
}

function ColumnPanel({
  theme,
  badgeIcon,
  title,
  titleAccent,
  titleSuffix,
  subtitle,
  subtitleAccent,
  options,
  selectedSet,
  onToggle
}: {
  theme: ColumnTheme;
  badgeIcon: ReactNode;
  title: string;
  titleAccent: string;
  titleSuffix?: string;
  subtitle: string;
  subtitleAccent: string;
  options: OptionDef[];
  selectedSet: Set<Screen5OptionId>;
  onToggle: (id: Screen5OptionId) => void;
}) {
  const isOrange = theme === "orange";

  return (
    <div
      className={[
        "flex min-w-0 flex-1 flex-col rounded-2xl border px-2 pb-2.5 pt-2.5",
        isOrange
          ? "border-orange-500/40 shadow-[0_0_28px_rgba(251,146,60,0.12),inset_0_0_40px_rgba(251,146,60,0.04)]"
          : "border-violet-500/40 shadow-[0_0_28px_rgba(139,92,246,0.12),inset_0_0_40px_rgba(139,92,246,0.04)]"
      ].join(" ")}
    >
      <div className="mb-3 flex flex-col items-center text-center">
        <div
          className={[
            "mb-2 flex h-9 w-9 items-center justify-center rounded-full border",
            isOrange
              ? "border-orange-400/50 bg-orange-500/10 shadow-[0_0_16px_rgba(251,146,60,0.25)]"
              : "border-violet-400/50 bg-violet-500/10 shadow-[0_0_16px_rgba(139,92,246,0.25)]"
          ].join(" ")}
        >
          {badgeIcon}
        </div>
        <p className="text-[0.62rem] font-bold leading-tight text-white sm:text-[0.68rem]">
          {title}{" "}
          <span className={isOrange ? "text-orange-400" : "text-violet-400"}>
            {titleAccent}
          </span>
          {titleSuffix ? ` ${titleSuffix}` : null}
        </p>
        <p className="mt-1 text-[0.52rem] leading-snug text-white/55 sm:text-[0.56rem]">
          {subtitle}{" "}
          <span className={isOrange ? "text-orange-400/90" : "text-violet-400/90"}>
            {subtitleAccent}
          </span>
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-1.5 pt-1">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            theme={theme}
            selected={selectedSet.has(option.id)}
            onToggle={() => onToggle(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

type Screen5Props = {
  onContinue?: () => void;
  onBack?: () => void;
};

/** Coded Screen 5 — two-column onboarding multi-select. */
export function BankBrokerScreen5Onboarding({
  onContinue,
  onBack
}: Screen5Props = {}) {
  const router = useRouter();
  const isPreviewEmbed = useMobilePreviewEmbed();
  const [selected, setSelected] = useState<Screen5OptionId[]>([]);

  useRunOnceOnMount(() => {
    setSelected(readScreen5Selections());
    warmBankPickInterestsCatalog();
  });

  useEffect(() => {
    writeScreen5Selections(selected);
  }, [selected]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const canContinue = selected.length > 0;

  const toggle = (id: Screen5OptionId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (!canContinue) return;
    if (onContinue) {
      onContinue();
      return;
    }
    router.replace(
      hrefForBankOnboardingStep(BANK_BROKER_PICK_INTERESTS_ROUTE, isPreviewEmbed)
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.replace(
      hrefForBankOnboardingStep(BANK_BROKER_SCREEN4_ONBOARDING_ROUTE, isPreviewEmbed)
    );
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(139,92,246,0.12),transparent_55%),radial-gradient(ellipse_70%_40%_at_20%_100%,rgba(251,146,60,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(139,92,246,0.35)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-[520px] px-3 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/35 bg-[rgba(8,6,18,0.75)] text-violet-200/90 shadow-[0_0_12px_rgba(139,92,246,0.15)] transition hover:border-violet-400/50 hover:bg-violet-500/10"
          >
            ‹
          </button>

          <header className="text-center">
            <h1 className="font-[var(--font-grotesk)] text-[1.35rem] font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
              Which sounds{" "}
              <span className="text-[#F5C547]">more like you?</span>
            </h1>
            <p className="mt-2 text-[0.65rem] font-medium text-violet-300/75 sm:text-xs">
              <span aria-hidden className="text-violet-400/60">
                ⌇{" "}
              </span>
              Select as many as you want.
              <span aria-hidden className="text-violet-400/60">
                {" "}
                ⌇
              </span>
            </p>
          </header>

          <div className="mt-10 flex gap-2 sm:mt-12 sm:gap-2.5">
            <ColumnPanel
              theme="orange"
              badgeIcon={<ChartIcon />}
              title="I've bought stocks"
              titleAccent="before"
              subtitle="What"
              subtitleAccent="influenced your decisions?"
              options={EXPERIENCED_OPTIONS}
              selectedSet={selectedSet}
              onToggle={toggle}
            />
            <ColumnPanel
              theme="purple"
              badgeIcon={<BrainIcon />}
              title="I've"
              titleAccent="never"
              titleSuffix="bought stocks before"
              subtitle="What have you done or what's"
              subtitleAccent="holding you back?"
              options={BEGINNER_OPTIONS}
              selectedSet={selectedSet}
              onToggle={toggle}
            />
          </div>
        </div>
      </div>

      <div className="iq-schools-opening-cta-dock relative z-20 shrink-0">
        <div className="mx-auto w-full max-w-[22rem]">
          <NeonButton
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className={[
              "iq-schools-opening-cta-primary w-full justify-center",
              "min-h-[52px] rounded-full px-6 py-3.5",
              "border-2 border-violet-300/45",
              "text-sm font-semibold normal-case tracking-[0.02em]"
            ].join(" ")}
          >
            Continue
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (match reference palette) ---- */

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="text-orange-400">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 18l5-6 4 3 7-9"
      />
      <path fill="currentColor" d="M18 4h2v2h-2z" opacity="0.8" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="text-violet-400">
      <path
        fill="currentColor"
        d="M12 4c-2 0-3.5 1.2-4 3-.8-.3-1.7 0-2.2.7C4.8 9 5 11 6.5 12c-1.2.8-1.8 2.4-1.2 3.8.5 1.2 1.8 2 3.2 1.7.5 1.4 2 2.3 3.5 2.3s3-1 3.5-2.3c1.4.3 2.7-.5 3.2-1.7.6-1.4 0-3-1.2-3.8 1.5-1 1.7-3 1.7-4.3-.5-.7-1.4-1-2.2-.7C15.5 5.2 14 4 12 4z"
        opacity="0.9"
      />
    </svg>
  );
}

function SocialIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center gap-0.5 rounded-lg bg-[rgba(251,146,60,0.08)] text-[0.55rem] font-bold text-orange-300">
      TT YT
    </span>
  );
}

function PeopleIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(251,146,60,0.08)] text-base">
      👥
    </span>
  );
}

function DiceIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(251,146,60,0.08)] text-base">
      🎲
    </span>
  );
}

function HeartIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(251,146,60,0.08)] text-base text-red-400">
      ♥
    </span>
  );
}

function BookIcon({ theme }: { theme: ColumnTheme }) {
  const color = theme === "orange" ? "text-orange-400" : "text-violet-400";
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.04)] text-base ${color}`}
    >
      📖
    </span>
  );
}

function SearchIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(251,146,60,0.08)] text-base text-orange-300">
      🔍
    </span>
  );
}

function PhonePlayIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.1)] text-base text-violet-300">
      ▶
    </span>
  );
}

function ShieldIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.1)] text-base text-violet-300">
      🛡
    </span>
  );
}

function CloudQuestionIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.1)] text-base text-violet-300">
      ?
    </span>
  );
}

function CompassIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.1)] text-base text-violet-300">
      🧭
    </span>
  );
}

function GradCapIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.1)] text-base text-violet-300">
      🎓
    </span>
  );
}
