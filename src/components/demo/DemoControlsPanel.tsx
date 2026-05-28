"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  DEMO_PROFILE_INVESTOR,
  DEMO_PROFILE_NEW_USER,
  getDemoProfileMeta,
  type DemoProfileId
} from "@/lib/demo/demoProfiles";
import type { DemoStoryStep } from "@/lib/demo/demoStoryMode";
import type { DemoProgressSummary } from "@/lib/demo/demoProgressSummary";

type Props = {
  summary: DemoProgressSummary;
  busy: boolean;
  onApplyProfile: (profileId: DemoProfileId) => void;
  demoStoryActive?: boolean;
  demoStoryStep?: DemoStoryStep | null;
  /** Compact floating tab vs full admin card */
  variant?: "floating" | "admin";
};

export function DemoControlsPanel({
  summary,
  busy,
  onApplyProfile,
  demoStoryActive = false,
  demoStoryStep = null,
  variant = "floating"
}: Props) {
  const [open, setOpen] = useState(variant === "admin");
  const collapsed = variant === "floating" && !open;

  const statRows = useMemo(
    () => [
      { label: "Profile", value: summary.profileLabel ?? "—" },
      { label: "Company", value: summary.companyId.toUpperCase() },
      { label: "XP", value: `${summary.xp} (Lv ${summary.level})` },
      { label: "Cards read", value: String(summary.readSlugCount) },
      { label: "Quizzes done", value: String(summary.completedQuestCount) },
      {
        label: "Islands",
        value:
          summary.unlockedPillars.length > 0
            ? summary.unlockedPillars.join(", ")
            : "none"
      },
      {
        label: "Badges",
        value: summary.badgeIds.length ? summary.badgeIds.join(", ") : "none"
      },
      {
        label: "Onboarding",
        value: summary.onboardingComplete ? "done" : "fresh"
      },
      {
        label: "Logo intro",
        value: summary.openingScreenSeen ? "seen" : "pending"
      },
      {
        label: "Welcome",
        value: summary.welcomeScreenSeen ? "seen" : "pending"
      },
      {
        label: "Map intro",
        value: summary.introMapBriefSeen ? "seen" : "pending"
      },
      {
        label: "Business intro",
        value: summary.introBusinessBriefSeen ? "seen" : "pending"
      }
    ],
    [summary]
  );

  const shellClass =
    variant === "admin"
      ? "w-full max-w-xl rounded-2xl border border-violet-400/25 bg-[rgba(8,6,18,0.92)] p-5 shadow-[0_0_40px_-12px_rgba(139,92,246,0.45)] backdrop-blur-xl"
      : collapsed
        ? "pointer-events-auto"
        : "pointer-events-auto w-[min(100vw-1.25rem,17.5rem)] rounded-2xl border border-violet-400/35 bg-[rgba(6,5,14,0.94)] p-3 shadow-[0_0_32px_-8px_rgba(139,92,246,0.55)] backdrop-blur-xl";

  return (
    <div
      className={
        variant === "floating"
          ? "pointer-events-none fixed right-0 top-[42%] z-[200] -translate-y-1/2"
          : ""
      }
      aria-label="Demo controls"
    >
      {variant === "floating" && collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto mr-0 rounded-l-xl border border-r-0 border-violet-400/40 bg-[rgba(8,6,16,0.92)] px-2.5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200 shadow-[0_0_24px_-6px_rgba(139,92,246,0.65)] backdrop-blur-md"
          aria-expanded={false}
        >
          Demo
        </button>
      ) : null}

      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div
            key="panel"
            initial={variant === "floating" ? { opacity: 0, x: 16 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={shellClass}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-violet-300/90">
                  Demo controls
                </p>
                <p className="mt-1 text-[11px] leading-snug text-ink-2">
                  {demoStoryActive
                    ? `Story mode · step: ${demoStoryStep ?? "—"}`
                    : "Local test save only — replays the funnel anytime."}
                </p>
              </div>
              {variant === "floating" ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 transition hover:text-ink-0"
                  aria-label="Collapse demo controls"
                >
                  Hide
                </button>
              ) : null}
            </div>

            <dl className="mt-3 grid gap-1.5 text-[10px]">
              {statRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-2 border-b border-white/[0.05] pb-1"
                >
                  <dt className="text-ink-2">{row.label}</dt>
                  <dd className="max-w-[58%] truncate text-right font-medium text-ink-0/90">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-col gap-2">
              <DemoProfileButton
                title="Start New User Demo"
                subtitle={getDemoProfileMeta(DEMO_PROFILE_NEW_USER).description}
                disabled={busy}
                onClick={() => onApplyProfile(DEMO_PROFILE_NEW_USER)}
                primary
              />
              <DemoProfileButton
                title="Skip To Investor Demo"
                subtitle={getDemoProfileMeta(DEMO_PROFILE_INVESTOR).description}
                disabled={busy}
                onClick={() => onApplyProfile(DEMO_PROFILE_INVESTOR)}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DemoProfileButton({
  title,
  subtitle,
  disabled,
  onClick,
  primary = false
}: {
  title: string;
  subtitle: string;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "border-violet-400/45 bg-violet-500/15 hover:bg-violet-500/22"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      ].join(" ")}
    >
      <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100">
        {title}
      </span>
      <span className="mt-1 block text-[10px] leading-snug text-ink-2">{subtitle}</span>
    </button>
  );
}
