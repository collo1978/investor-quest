"use client";

import { MotionIn } from "@/components/MotionIn";
import { NeonButton } from "@/components/NeonButton";
import { getPlayableDemoCompanies } from "@/lib/demoData";
import { SkyBackdrop, XPHud, IslandPillarCard } from "@/components/FloatingIslands";
import Link from "next/link";
import { useGame } from "@/components/GameProvider";
import { pillarById, type PillarId } from "@/data/pillars";
import { pillarQuestCount } from "@/data/quests/library";

const HOME_PILLAR_SUBTITLES: Record<PillarId, string> = {
  business: "Model, segments, moat signals",
  forces: "Competition, disruption, structure",
  financials: "Margins, durability, allocation",
  management: "Incentives, cadence, execution"
};

export default function HomeHubPage() {
  const { state } = useGame();

  // Live island-preview model, reads pillar unlock + quest counts from the
  // engine so the home cards stay in sync with the real progression state.
  // Previously these props were hardcoded (locked=true, "2 quests"), which
  // both blocked clicks on Forces / Financials / Management and showed stale
  // counts after Financials grew to 5 sections.
  const islandFor = (pillarId: PillarId) => {
    const meta = pillarById(pillarId);
    const ps = state.pillars[pillarId];
    const total = pillarQuestCount(pillarId);
    const completed = ps?.completedQuestSlugs.length ?? 0;
    const progressPct = total > 0 ? (completed / total) * 100 : 0;
    return {
      title: meta.title,
      subtitle: HOME_PILLAR_SUBTITLES[pillarId],
      href: meta.route,
      locked: !(ps?.unlocked ?? false),
      progressPct,
      questsLabel: `${total} quest${total === 1 ? "" : "s"}`
    };
  };

  const businessCard = islandFor("business");
  const forcesCard = islandFor("forces");
  const financialsCard = islandFor("financials");
  const managementCard = islandFor("management");
  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-bg-0">
      <SkyBackdrop />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
        <MotionIn>
          <div className="grid items-start gap-6 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel px-3 py-1 text-[11px] text-ink-1 shadow-glow backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_18px_rgba(139,92,246,0.9)]" />
                Terminal-grade research, game-grade progression
              </div>

              <h1 className="mt-5 font-[var(--font-grotesk)] text-4xl leading-[1.05] tracking-tight text-ink-0 md:text-6xl">
                Investor Quest
              </h1>
              <p className="mt-4 max-w-xl text-base text-ink-1 md:text-lg">
                A futuristic research RPG for investors. Clear the four pillars,
                earn XP, unlock deeper quests, and build conviction like a pro.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <NeonButton href="/map">Enter the islands</NeonButton>
                <NeonButton variant="ghost" href="/onboarding">
                  Set up profile
                </NeonButton>
                <Link
                  href="/quest"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-ink-1 transition hover:text-ink-0"
                >
                  Jump to quests →
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-panel-border bg-panel p-4 shadow-glow backdrop-blur-xl">
                  <div className="text-[11px] text-ink-2">Available campaigns</div>
                  <div className="mt-2 text-sm font-semibold text-ink-0">
                    {getPlayableDemoCompanies().map((c) => c.ticker).join(" · ")}
                  </div>
                  <div className="mt-2 text-xs text-ink-2">
                    Each company saves its own XP, unlocks, and journal.
                  </div>
                </div>
                <XPHud
                  companyTicker={state.activeCompanyId.toUpperCase()}
                  xp={state.xp}
                  level={state.level}
                  researchStreak={state.streaks?.research.streak ?? 0}
                  quizStreak={state.streaks?.quiz.streak ?? 0}
                />
              </div>
            </div>

            {/* Floating island preview grid */}
            <div className="relative mt-4 md:mt-0">
              <div className="absolute -left-6 -top-6 h-16 w-16 rounded-3xl border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] shadow-glow" />
              <div className="absolute -bottom-8 -right-6 h-24 w-24 rounded-[36px] border border-panel-border bg-[rgba(255,255,255,0.04)] shadow-glow" />

              <div className="grid gap-4">
                <IslandPillarCard {...businessCard} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <IslandPillarCard {...forcesCard} />
                  <IslandPillarCard {...financialsCard} />
                </div>
                <IslandPillarCard {...managementCard} />
              </div>
            </div>
          </div>
        </MotionIn>
      </div>
    </main>
  );
}