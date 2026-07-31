"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

export type SchoolsNameEntryScreenProps = {
  initialName?: string | null;
  onContinue: (name: string) => void;
};

const NAME_MAX_LENGTH = 24;

/** Schools onboarding — first step: capture the learner's name. */
export function SchoolsNameEntryScreen({
  initialName,
  onContinue
}: SchoolsNameEntryScreenProps) {
  const [name, setName] = useState(initialName ?? "");
  const trimmed = name.trim();
  const canContinue = trimmed.length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    onContinue(trimmed);
  };

  return (
    <main
      className="iq-schools-name-entry relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#030308] px-5"
      role="main"
      aria-label="Enter your name"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(168,85,247,0.24),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(245,197,71,0.08),transparent_50%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-name-entry__grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-name-entry__ribbons" />
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-schools-name-entry__orbits" />

      <GlassCard className="iq-schools-name-entry__card relative z-[1] w-full max-w-[34rem] border-white/10 bg-[rgba(12,10,24,0.72)] backdrop-blur-xl">
        <form onSubmit={submit} className="flex flex-col items-center gap-5 p-1 text-center">
          <div className="flex w-full flex-col items-center">
            <motion.span
              aria-hidden
              className="iq-schools-name-entry__badge mb-4"
              animate={{ y: [0, -3, 0], scale: [1, 1.025, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              IQ
            </motion.span>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200/80">
              Investor profile
            </p>
            <h1 className="mt-1 font-[var(--font-grotesk)] text-2xl font-semibold leading-tight text-ink-0 md:text-3xl">
              What should we call you?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-1">
              This is how you&apos;ll show up on your investor profile.
            </p>
          </div>

          <input
            autoFocus
            type="text"
            inputMode="text"
            maxLength={NAME_MAX_LENGTH}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Your name"
            className="iq-schools-name-entry__input w-full rounded-2xl border border-violet-500/25 bg-black/40 px-4 py-3 text-center text-lg font-semibold text-ink-0 placeholder:text-ink-2 focus:border-violet-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/50"
          />

          <NeonButton
            type="submit"
            aria-disabled={!canContinue}
            disabled={!canContinue}
            className="w-full justify-center"
          >
            Continue
          </NeonButton>
        </form>
      </GlassCard>
    </main>
  );
}
