import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { MotionIn } from "@/components/MotionIn";
import { NeonButton } from "@/components/NeonButton";

export default function AiFrontierPlaceholderPage() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-bg-0 md:min-h-screen">
      <div className="relative z-[1] mx-auto max-w-lg px-6 py-10 md:py-14">
        <MotionIn>
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-1 hover:text-ink-0"
          >
            <span className="text-violet-300 group-hover:text-violet-200" aria-hidden>
              ←
            </span>
            Back to Explore
          </Link>
          <h1
            className="mt-8 font-[var(--font-grotesk)] text-3xl text-ink-0 md:text-4xl"
            style={{ textShadow: "0 0 36px rgba(168,85,247,0.35)" }}
          >
            AI Frontier
          </h1>
          <p className="mt-3 text-sm text-ink-1">
            This lane is shipping next — fast-moving AI infrastructure and platform names in one
            curated arc.
          </p>
          <GlassCard className="mt-8">
            <p className="text-sm text-ink-2">No campaigns here yet. Check back soon.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <NeonButton href="/explore/my-interests">My Interests</NeonButton>
              <NeonButton variant="ghost" href="/explore">
                Explore hub
              </NeonButton>
            </div>
          </GlassCard>
        </MotionIn>
      </div>
    </div>
  );
}
