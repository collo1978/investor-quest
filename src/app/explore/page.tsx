import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { MotionIn } from "@/components/MotionIn";

const ZONES = [
  {
    href: "/explore/my-interests",
    title: "My Interests",
    subtitle: "Campaigns matched to your onboarding profile.",
    ready: true
  },
  {
    href: "/explore/ai-frontier",
    title: "AI Frontier",
    subtitle: "High-velocity names at the edge of the stack.",
    ready: false
  },
  {
    href: "/explore/market-giants",
    title: "Market Giants",
    subtitle: "Mega-cap durability and capital return machines.",
    ready: false
  }
] as const;

export default function ExploreHubPage() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-bg-0 md:min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,rgba(168,85,247,0.18),transparent_55%)]"
      />
      <div className="relative z-[1] mx-auto max-w-4xl px-6 py-10 md:py-14">
        <MotionIn>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-2">
            Investor Quest
          </p>
          <h1
            className="mt-3 font-[var(--font-grotesk)] text-4xl text-ink-0 md:text-5xl"
            style={{ textShadow: "0 0 42px rgba(168,85,247,0.35)" }}
          >
            Explore a New Company
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-1 md:text-lg">
            Choose how you want to discover your next research campaign — curated lanes, not a
            spreadsheet of tickers.
          </p>

          <ul className="mt-10 grid gap-4 md:gap-5">
            {ZONES.map((z) => (
              <li key={z.href}>
                <Link href={z.href} className="group block">
                  <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] transition group-hover:border-violet-400/40 group-hover:shadow-[0_0_36px_rgba(168,85,247,0.2)]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-[var(--font-grotesk)] text-xl font-semibold text-ink-0 md:text-2xl">
                          {z.title}
                        </h2>
                        <p className="mt-1 text-sm text-ink-2">{z.subtitle}</p>
                      </div>
                      <span className="text-sm font-semibold text-violet-300 transition group-hover:text-violet-200">
                        {z.ready ? "Enter →" : "Preview →"}
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center text-xs text-ink-2 md:text-left">
            Prefer the classic hub?{" "}
            <Link href="/home" className="font-semibold text-violet-300 hover:text-violet-200">
              Open Home
            </Link>
          </p>
        </MotionIn>
      </div>
    </div>
  );
}
