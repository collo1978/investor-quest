import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-14">
      <GlassCard>
        <div className="text-sm text-ink-2">404</div>
        <div className="mt-2 font-[var(--font-grotesk)] text-2xl text-ink-0">
          Page not found
        </div>
        <div className="mt-2 text-ink-1">
          That route doesn’t exist in Investor Quest. Head back to the map and keep
          progressing.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <NeonButton href="/map">Go to map</NeonButton>
          <NeonButton variant="ghost" href="/home">
            Home
          </NeonButton>
        </div>
      </GlassCard>
    </main>
  );
}

