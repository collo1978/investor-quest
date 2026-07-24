"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { GlassCard } from "@/components/GlassCard";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { useInvestorProfileSnapshot } from "@/hooks/useInvestorProfileSnapshot";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";
import { getSchoolsAvatarPortraitSrc } from "@/lib/schools/schoolsAvatarPortraits";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";
import type {
  ProfileAchievement,
  ProfileCompanyView,
  ProfileQuizResult,
  ProfileSectionRow,
  ProfileSectorRow,
  ProfileStatistics
} from "@/lib/profile/investorProfileTypes";

const GOLD = "#F5C547";
const VIOLET = "#C4B5FD";

type Props = {
  variant?: "default" | "schools";
  backHref?: string;
  backLabel?: string;
  /** Extra header action(s) rendered alongside back/nav buttons (e.g. replay-profile). */
  headerExtra?: ReactNode;
};

export function InvestorProfileDashboard({
  variant = "default",
  backHref,
  backLabel = "Back",
  headerExtra
}: Props) {
  const { snapshot, selectedCompanyId, setSelectedCompanyId } =
    useInvestorProfileSnapshot();

  const selectedCompany = useMemo(
    () =>
      snapshot.companies.find((c) => c.id === selectedCompanyId) ??
      snapshot.companies[0]!,
    [snapshot.companies, selectedCompanyId]
  );

  const isSchools = variant === "schools";

  return (
    <div className="iq-profile-dashboard relative min-h-screen min-w-0 max-w-[100vw] overflow-x-hidden overflow-y-auto bg-[#050508] text-ink-0">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(245,197,71,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35] [mask-image:radial-gradient(900px_520px_at_50%_20%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)",
          backgroundSize: "56px 56px"
        }}
      />

      <main className="relative z-[1] mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pt-10">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.08] pb-7 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            {!isSchools ? (
              <Link href="/home" className="relative z-10 shrink-0">
                <InvestorQuestBrandLogo
                  className="h-10 w-auto sm:h-11"
                  sizes="(max-width: 640px) 240px, 280px"
                />
              </Link>
            ) : null}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200/80">
                Investor dashboard
              </p>
              <h1 className="font-[var(--font-grotesk)] text-3xl leading-tight tracking-tight md:text-4xl">
                <span className="text-ink-0">Your </span>
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-400 bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-1">
                Live progress across XP, checklist mastery, quizzes, and achievements.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {backHref ? (
              <NeonButton variant="ghost" href={backHref}>
                {backLabel}
              </NeonButton>
            ) : null}
            {!isSchools ? (
              <>
                <NeonButton variant="ghost" href="/map">
                  Quest map
                </NeonButton>
                <NeonButton href="/home">Home</NeonButton>
              </>
            ) : (
              <NeonButton variant="ghost" href="/schools/xp-ladder">
                XP ladder
              </NeonButton>
            )}
            {headerExtra}
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-5">
            <InvestorHeroCard snapshot={snapshot} />
            <CompanyMasteryCard
              companies={snapshot.companies}
              selected={selectedCompany}
              onSelect={setSelectedCompanyId}
            />
            <ChecklistSummaryCard company={selectedCompany} />
          </div>

          <div className="flex flex-col gap-5">
            <StatisticsCard stats={snapshot.statistics} />
            <SectorMasteryCard rows={snapshot.sectorMastery} />
            <QuizProgressCard results={snapshot.quizResults} />
            <AchievementsCard achievements={snapshot.achievements} />
          </div>
        </div>

        <Link href={isSchools ? "/schools/xp-ladder" : "/xp-ladder"} className="group mt-6 block">
          <GlassCard className="border border-violet-500/30 bg-[linear-gradient(125deg,rgba(139,92,246,0.14),rgba(10,8,20,0.65))] backdrop-blur-xl transition group-hover:border-amber-300/35 group-hover:shadow-[0_0_32px_rgba(168,85,247,0.25)]">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200/90">
                  Progression
                </p>
                <h3 className="mt-1 font-[var(--font-grotesk)] text-xl text-ink-0 md:text-2xl">
                  View XP ladder
                </h3>
                <p className="mt-1 max-w-xl text-sm text-ink-2">
                  Climb from Rookie Investor to Wall St Warrior.
                </p>
              </div>
              <span
                className="inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: "rgba(245,197,71,0.4)",
                  color: GOLD,
                  background: "rgba(245,197,71,0.08)"
                }}
              >
                Open →
              </span>
            </div>
          </GlassCard>
        </Link>
      </main>
    </div>
  );
}

function InvestorHeroCard({
  snapshot
}: {
  snapshot: ReturnType<typeof useInvestorProfileSnapshot>["snapshot"];
}) {
  return (
    <GlassCard className="border-white/10 bg-[rgba(12,10,24,0.55)] backdrop-blur-xl">
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div
          className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 md:mx-0 md:h-28 md:w-28"
          style={{
            borderColor: "rgba(168,85,247,0.5)",
            background:
              "linear-gradient(145deg, rgba(139,92,246,0.35), rgba(7,7,18,0.92))",
            boxShadow: "0 0 40px rgba(168,85,247,0.35)"
          }}
        >
          {snapshot.schoolsIdentity?.avatar ? (
            <img
              src={getSchoolsAvatarPortraitSrc(
                snapshot.schoolsIdentity.avatar.id as SchoolsAvatarId
              )}
              alt={snapshot.schoolsIdentity.avatar.name}
              draggable={false}
              decoding="async"
              className="h-full w-full select-none object-cover object-top"
            />
          ) : (
            <span className="font-[var(--font-grotesk)] text-xl font-bold tracking-[0.18em] md:text-2xl">
              {snapshot.initials}
            </span>
          )}
        </div>
        <div className="min-w-0 text-center md:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-2">
            Investor profile
          </p>
          <h2 className="mt-1 font-[var(--font-grotesk)] text-2xl font-semibold text-ink-0">
            {snapshot.playerName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span
              className="rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{
                borderColor: "rgba(168,85,247,0.45)",
                color: VIOLET,
                background: "rgba(139,92,246,0.12)"
              }}
            >
              Level {snapshot.level}
            </span>
            <span className="text-sm font-semibold text-amber-100/95">{snapshot.title}</span>
            {snapshot.schoolsIdentity?.armor ? (
              <span
                className="rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  borderColor: "rgba(245,197,71,0.4)",
                  color: GOLD,
                  background: "rgba(245,197,71,0.08)"
                }}
              >
                {snapshot.schoolsIdentity.armor.title}
              </span>
            ) : null}
          </div>
          {snapshot.schoolsIdentity &&
          snapshot.schoolsIdentity.interestLabels.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
              {snapshot.schoolsIdentity.interestLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-medium text-ink-1"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          {snapshot.schoolsIdentity &&
          snapshot.schoolsIdentity.learnerTypeLabels.length > 0 ? (
            <p className="mt-2 text-xs italic text-ink-2">
              &ldquo;{snapshot.schoolsIdentity.learnerTypeLabels[0]}&rdquo;
              {snapshot.schoolsIdentity.learnerTypeLabels.length > 1
                ? ` +${snapshot.schoolsIdentity.learnerTypeLabels.length - 1} more`
                : ""}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-ink-1">
            <span className="font-semibold tabular-nums text-ink-0">
              {formatAnalyticsNumber(snapshot.xp)}
            </span>{" "}
            XP
            {snapshot.nextTitle ? (
              <span className="text-ink-2">
                {" "}
                · {formatAnalyticsNumber(snapshot.xpToNextTitle)} XP until{" "}
                <span className="text-violet-200/95">{snapshot.nextTitle}</span>
              </span>
            ) : null}
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-ink-2">
              <span>Rank charge</span>
              <span className="tabular-nums text-ink-0">
                {Math.round(snapshot.xpBandPct)}%
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/50">
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{ width: `${snapshot.xpBandPct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(168,85,247,0.95), rgba(245,197,71,0.9))",
                  boxShadow: "0 0 18px rgba(245,197,71,0.35)"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function CompanyMasteryCard({
  companies,
  selected,
  onSelect
}: {
  companies: ProfileCompanyView[];
  selected: ProfileCompanyView;
  onSelect: (id: ProfileCompanyView["id"]) => void;
}) {
  return (
    <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
      <SectionHeader title="Company mastery" subtitle="Checklist sections drive mastery" />
      <div className="mt-4 flex flex-wrap gap-2">
        {companies.map((company) => (
          <button
            key={company.id}
            type="button"
            onClick={() => onSelect(company.id)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              selected.id === company.id
                ? "border-amber-300/45 bg-amber-300/10 text-amber-100"
                : "border-white/10 bg-black/30 text-ink-1 hover:border-violet-400/35"
            ].join(" ")}
          >
            {company.ticker}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-[var(--font-grotesk)] text-lg font-semibold text-ink-0">
              {selected.name}
            </h3>
            <p className="mt-0.5 text-xs text-ink-2">{selected.sector}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-2">
              Overall mastery
            </p>
            <p className="font-[var(--font-grotesk)] text-2xl font-bold tabular-nums text-violet-200">
              {selected.masteryPct}%
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/45">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-300"
            style={{ width: `${selected.masteryPct}%` }}
          />
        </div>
        <ul className="mt-4 space-y-2">
          {selected.sections.map((section) => (
            <SectionProgressRow key={section.id} section={section} compact />
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

function ChecklistSummaryCard({ company }: { company: ProfileCompanyView }) {
  return (
    <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
      <SectionHeader
        title="Investor checklist"
        subtitle={`${company.ticker} section progress`}
      />
      <ul className="mt-4 space-y-2">
        {company.sections.map((section) => (
          <SectionProgressRow key={section.id} section={section} showEmoji />
        ))}
      </ul>
    </GlassCard>
  );
}

function SectionProgressRow({
  section,
  compact = false,
  showEmoji = false
}: {
  section: ProfileSectionRow;
  compact?: boolean;
  showEmoji?: boolean;
}) {
  const marker = resolveSectionMarker(section);
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5">
      <span className="min-w-0 text-sm text-ink-0">
        {showEmoji ? (
          <span className="mr-2" aria-hidden>
            {section.emoji}
          </span>
        ) : null}
        {compact ? section.shortLabel : section.label}
      </span>
      <span className="shrink-0 text-sm" aria-label={section.state}>
        {marker}
      </span>
    </li>
  );
}

function resolveSectionMarker(section: ProfileSectionRow): string {
  if (section.quizStatus === "passed" || section.state === "completed") {
    if (section.overallRating === "strong") return "🟢";
    if (section.overallRating === "weak") return "🔴";
    if (section.overallRating === "mixed") return "🟡";
    return "✅";
  }
  if (section.state === "active" || section.quizStatus === "ready") return "🔓";
  return "🔒";
}

function StatisticsCard({ stats }: { stats: ProfileStatistics }) {
  const rows: { label: string; value: number }[] = [
    { label: "XP earned", value: stats.xpEarned },
    { label: "Evidence cards completed", value: stats.evidenceCardsCompleted },
    { label: "Evidence ratings submitted", value: stats.evidenceRatingsSubmitted },
    { label: "Investor principles completed", value: stats.principlesCompleted },
    { label: "Checklist sections completed", value: stats.checklistSectionsCompleted },
    { label: "Quizzes passed", value: stats.quizzesPassed },
    { label: "Companies started", value: stats.companiesStarted },
    { label: "Companies mastered", value: stats.companiesMastered }
  ];

  return (
    <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
      <SectionHeader title="Investor statistics" subtitle="Updated from live gameplay" />
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2">
              {row.label}
            </dt>
            <dd className="mt-1 font-[var(--font-grotesk)] text-xl font-bold tabular-nums text-ink-0">
              {formatAnalyticsNumber(row.value)}
            </dd>
          </div>
        ))}
      </dl>
      {stats.quizStreak > 0 ? (
        <p className="mt-3 text-xs text-emerald-300/90">
          Quiz streak: {stats.quizStreak} day{stats.quizStreak === 1 ? "" : "s"}
        </p>
      ) : null}
    </GlassCard>
  );
}

function SectorMasteryCard({ rows }: { rows: ProfileSectorRow[] }) {
  return (
    <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
      <SectionHeader
        title="Sector mastery"
        subtitle="Grows as you complete companies"
      />
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.sector} className={row.locked ? "opacity-55" : ""}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-ink-0">{row.sector}</span>
              {row.locked ? (
                <span className="text-[10px] uppercase tracking-[0.14em] text-ink-2">
                  Locked
                </span>
              ) : (
                <span className="tabular-nums text-violet-200/90">{row.masteryPct}%</span>
              )}
            </div>
            {!row.locked ? (
              <>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500/90 to-fuchsia-400/70"
                    style={{ width: `${Math.max(row.masteryPct, 4)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-ink-2">
                  {row.companiesMastered} mastered · {row.companiesStarted} started
                </p>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function QuizProgressCard({ results }: { results: ProfileQuizResult[] }) {
  return (
    <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
      <SectionHeader title="Quiz progress" subtitle="Section checkpoint results" />
      {results.length === 0 ? (
        <p className="mt-4 text-sm text-ink-2">
          Pass a checklist section quiz to see results here.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {results.map((result) => (
            <li
              key={`${result.companyTicker}-${result.sectionId}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5"
            >
              <span className="min-w-0 text-sm text-ink-0">
                <span aria-hidden>{result.emoji}</span> {result.label}
                <span className="ml-2 text-[11px] text-ink-2">{result.companyTicker}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-300">Passed</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

function AchievementsCard({ achievements }: { achievements: ProfileAchievement[] }) {
  return (
    <GlassCard className="border-white/10 bg-[rgba(10,8,20,0.55)] backdrop-blur-xl">
      <SectionHeader title="Achievements" subtitle="Badges from your investor journey" />
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <li
            key={achievement.id}
            className={[
              "rounded-2xl border px-3 py-3 transition",
              achievement.earned
                ? "border-amber-300/35 bg-[linear-gradient(145deg,rgba(245,197,71,0.12),rgba(139,92,246,0.08))]"
                : "border-white/10 bg-black/25 opacity-70"
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink-0">{achievement.title}</p>
              <span aria-hidden>{achievement.earned ? "✅" : "🔒"}</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-ink-2">{achievement.detail}</p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">{title}</h3>
      <p className="mt-1 text-xs text-ink-2">{subtitle}</p>
    </div>
  );
}
