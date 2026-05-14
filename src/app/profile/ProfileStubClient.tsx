"use client";

import { GameSurface } from "@/components/GameSurface";
import { GlassCard } from "@/components/GlassCard";
import { MotionIn } from "@/components/MotionIn";
import { NeonButton } from "@/components/NeonButton";

export function ProfileStubClient({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <GameSurface variant="flat">
      <MotionIn>
        <header className="mb-8">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-2">
            Investor Quest
          </p>
          <h1
            className="mt-2 font-[var(--font-grotesk)] text-3xl text-ink-0 md:text-4xl"
            style={{ textShadow: "0 0 36px rgba(168,85,247,0.35)" }}
          >
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-1">{description}</p>
        </header>
        <GlassCard className="max-w-lg">
          <p className="text-sm text-ink-1">
            This view is a planned drill-in from your profile hub. Ship is sailing there next.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <NeonButton href="/profile">← Profile hub</NeonButton>
            <NeonButton variant="ghost" href="/map">
              Quest map
            </NeonButton>
          </div>
        </GlassCard>
      </MotionIn>
    </GameSurface>
  );
}
