"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useGame } from "@/components/GameProvider";
import { type PillarId } from "@/data/pillars";
import {
  getPillarViews,
  isTenKFinalChallengeUnlocked,
  type PillarView
} from "@/engine";
import { getActiveCompanyProgress } from "@/engine/progression/selectors";
import {
  KHAN_FINAL_MODULE,
  KHAN_MAP_MODULES,
  KHAN_MAP_SUBTITLE,
  KHAN_MAP_TITLE,
  KHAN_ROOKIE_BADGE,
  type KhanFinalMeta,
  type KhanModuleMeta
} from "@/lib/schools/schoolsKhanMapConfig";
import {
  formatKhanDuration,
  khanEstimatedMinutesRemaining,
  khanEstimatedMinutesTotal,
  khanFinalChallengeHref,
  khanPillarHref,
  resolveKhanFinalState,
  resolveKhanModuleState,
  type KhanModuleVisualState
} from "@/lib/schools/schoolsKhanMapHelpers";

const EASE = [0.25, 0.1, 0.25, 1] as const;

function StatusLabel({ state }: { state: KhanModuleVisualState }) {
  if (state === "completed") return <span className="iq-khan-map__status iq-khan-map__status--done">Completed</span>;
  if (state === "locked") return <span className="iq-khan-map__status iq-khan-map__status--lock">Locked</span>;
  if (state === "in-progress") {
    return <span className="iq-khan-map__status iq-khan-map__status--active">In progress</span>;
  }
  return <span className="iq-khan-map__status iq-khan-map__status--go">Start</span>;
}

function ModuleCard({
  meta,
  state,
  href,
  pillarView
}: {
  meta: KhanModuleMeta;
  state: KhanModuleVisualState;
  href?: string;
  pillarView?: PillarView;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);
  const progress = pillarView?.progressPct ?? 0;
  const minutesLeft = pillarView ? khanEstimatedMinutesRemaining(pillarView) : 0;
  const minutesTotal = pillarView ? khanEstimatedMinutesTotal(pillarView) : 0;

  const card = (
    <article
      className={[
        "iq-khan-map__card",
        locked ? "iq-khan-map__card--locked" : "",
        state === "completed" ? "iq-khan-map__card--done" : "",
        state === "in-progress" ? "iq-khan-map__card--active" : "",
        interactive && hovered ? "iq-khan-map__card--hover" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ["--module-accent" as string]: meta.accent,
        ["--module-soft" as string]: meta.accentSoft
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="iq-khan-map__card-head">
        <span className="iq-khan-map__card-icon" aria-hidden>
          {meta.emoji}
        </span>
        <div className="iq-khan-map__card-titles">
          <h2 className="iq-khan-map__card-title">{meta.label}</h2>
          <p className="iq-khan-map__card-sub">{meta.subtitle}</p>
        </div>
        <StatusLabel state={state} />
      </div>

      <div className="iq-khan-map__card-progress" aria-label={`${progress}% complete`}>
        <div className="iq-khan-map__card-track">
          <motion.div
            className="iq-khan-map__card-fill"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: EASE }}
          />
        </div>
        <span className="iq-khan-map__card-pct">{Math.round(progress)}%</span>
      </div>

      {pillarView ? (
        <p className="iq-khan-map__card-lessons">
          {pillarView.completedCount}/{pillarView.totalCount} lessons
        </p>
      ) : null}

      <div className="iq-khan-map__card-meta">
        <span className="iq-khan-map__card-xp">+{meta.xpReward} XP</span>
        <span className="iq-khan-map__card-time">
          {state === "completed"
            ? "Done"
            : state === "locked"
              ? formatKhanDuration(minutesTotal)
              : `${formatKhanDuration(minutesLeft)} left`}
        </span>
      </div>

      {interactive ? (
        <span className="iq-khan-map__card-cta">
          {state === "in-progress" ? "Continue →" : "Open module →"}
        </span>
      ) : (
        <span className="iq-khan-map__card-cta iq-khan-map__card-cta--muted">
          {locked ? "Complete prior modules to unlock" : "Review module"}
        </span>
      )}
    </article>
  );

  if (interactive && href) {
    return (
      <Link href={href} prefetch className="iq-khan-map__card-link" aria-label={`${meta.label} — ${meta.subtitle}`}>
        {card}
      </Link>
    );
  }

  return <div className="iq-khan-map__card-wrap">{card}</div>;
}

function FinalModuleCard({
  meta,
  state,
  href,
  pillarsComplete,
  pillarsTotal
}: {
  meta: KhanFinalMeta;
  state: KhanModuleVisualState;
  href?: string;
  pillarsComplete: number;
  pillarsTotal: number;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";
  const interactive = !locked && Boolean(href);
  const progress =
    state === "completed" ? 100 : Math.round((pillarsComplete / pillarsTotal) * 85);

  const card = (
    <article
      className={[
        "iq-khan-map__card iq-khan-map__card--final",
        locked ? "iq-khan-map__card--locked" : "",
        state === "completed" ? "iq-khan-map__card--done" : "",
        interactive && hovered ? "iq-khan-map__card--hover" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ["--module-accent" as string]: meta.accent,
        ["--module-soft" as string]: meta.accentSoft
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="iq-khan-map__card-head">
        <span className="iq-khan-map__card-icon iq-khan-map__card-icon--final" aria-hidden>
          {meta.emoji}
        </span>
        <div className="iq-khan-map__card-titles">
          <h2 className="iq-khan-map__card-title">{meta.label}</h2>
          <p className="iq-khan-map__card-sub">{meta.subtitle}</p>
        </div>
        <StatusLabel state={state} />
      </div>

      <div className="iq-khan-map__card-progress" aria-label={`${progress}% toward unlock`}>
        <div className="iq-khan-map__card-track">
          <motion.div
            className="iq-khan-map__card-fill"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: EASE }}
          />
        </div>
        <span className="iq-khan-map__card-pct">
          {state === "completed" ? "100%" : `${pillarsComplete}/${pillarsTotal} modules`}
        </span>
      </div>

      <div className="iq-khan-map__card-meta">
        <span className="iq-khan-map__card-xp">+{meta.xpReward} XP</span>
        <span className="iq-khan-map__card-time">~45 min</span>
      </div>

      {interactive ? (
        <span className="iq-khan-map__card-cta">Take final challenge →</span>
      ) : (
        <span className="iq-khan-map__card-cta iq-khan-map__card-cta--muted">
          {state === "completed"
            ? "Challenge complete — badge earned"
            : "Unlock by completing all four modules"}
        </span>
      )}
    </article>
  );

  if (interactive && href) {
    return (
      <Link href={href} prefetch className="iq-khan-map__card-link" aria-label={meta.label}>
        {card}
      </Link>
    );
  }

  return <div className="iq-khan-map__card-wrap">{card}</div>;
}

/** Khan Academy–style structured learning journey — preview only. */
export function SchoolsKhanMapScreen() {
  const pathname = usePathname();
  const { raw } = useGame();
  const pillarViews = useMemo(() => getPillarViews(raw), [raw]);
  const pillarById = useMemo(
    () =>
      Object.fromEntries(pillarViews.map((p) => [p.id, p])) as Record<PillarId, PillarView>,
    [pillarViews]
  );

  const companyProgress = getActiveCompanyProgress(raw);
  const finalUnlocked = isTenKFinalChallengeUnlocked(raw);
  const finalCompleted = companyProgress.tenKRookieChallenge != null;
  const finalState = resolveKhanFinalState(finalUnlocked, finalCompleted);

  const pillarsComplete = pillarViews.filter((p) => p.completed).length;
  const lessonsComplete = pillarViews.reduce((sum, p) => sum + p.completedCount, 0);
  const lessonsTotal = pillarViews.reduce((sum, p) => sum + p.totalCount, 0);

  const overallProgressPct = useMemo(() => {
    if (pillarViews.length === 0) return 0;
    const pillarAvg =
      pillarViews.reduce((sum, p) => sum + p.progressPct, 0) / pillarViews.length;
    const finalBonus = finalCompleted ? 100 : finalUnlocked ? 50 : 0;
    return Math.min(100, Math.round(pillarAvg * 0.85 + finalBonus * 0.15));
  }, [pillarViews, finalCompleted, finalUnlocked]);

  const badgeProgressPct = Math.round(
    ((pillarsComplete + (finalCompleted ? 1 : 0)) / 5) * 100
  );
  const badgeEarned = KHAN_ROOKIE_BADGE.id in companyProgress.badges;

  const hubHref = finalState !== "locked" ? khanFinalChallengeHref(pathname) : undefined;

  return (
    <main className="iq-khan-map">
      <div className="iq-khan-map__shell">
        <header className="iq-khan-map__top">
          <div className="iq-khan-map__brand">
            <Image
              src="/logos/investor-quest-logo.png"
              alt="Investor Quest"
              width={148}
              height={36}
              className="iq-khan-map__logo"
              priority
            />
            <span className="iq-khan-map__tag">Khan preview</span>
          </div>
          <div className="iq-khan-map__title-row">
            <Image
              src="/logos/companies/nvda.svg"
              alt=""
              width={32}
              height={32}
              className="iq-khan-map__nvda"
              aria-hidden
            />
            <div>
              <h1 className="iq-khan-map__title">{KHAN_MAP_TITLE}</h1>
              <p className="iq-khan-map__subtitle">{KHAN_MAP_SUBTITLE}</p>
            </div>
          </div>
        </header>

        <section className="iq-khan-map__hero" aria-label="Course progress">
          <div className="iq-khan-map__hero-main">
            <div className="iq-khan-map__hero-label-row">
              <span className="iq-khan-map__hero-label">Overall progress</span>
              <span className="iq-khan-map__hero-pct">{overallProgressPct}%</span>
            </div>
            <div className="iq-khan-map__hero-track">
              <motion.div
                className="iq-khan-map__hero-fill"
                initial={false}
                animate={{ width: `${overallProgressPct}%` }}
                transition={{ duration: 0.45, ease: EASE }}
              />
            </div>
            <p className="iq-khan-map__hero-lessons">
              {lessonsComplete}/{lessonsTotal} lessons complete · {pillarsComplete}/4 modules
            </p>
          </div>

          <div className="iq-khan-map__stats">
            <div className="iq-khan-map__stat">
              <span className="iq-khan-map__stat-label">XP earned</span>
              <span className="iq-khan-map__stat-value">{companyProgress.xp.toLocaleString()}</span>
            </div>
            <div className="iq-khan-map__stat">
              <span className="iq-khan-map__stat-label">{KHAN_ROOKIE_BADGE.label}</span>
              <span className="iq-khan-map__stat-value">{badgeEarned ? "Earned" : `${badgeProgressPct}%`}</span>
              {!badgeEarned ? (
                <div className="iq-khan-map__stat-track">
                  <motion.div
                    className="iq-khan-map__stat-fill"
                    initial={false}
                    animate={{ width: `${badgeProgressPct}%` }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="iq-khan-map__modules" aria-label="Learning modules">
          <h2 className="iq-khan-map__section-title">Modules</h2>
          <div className="iq-khan-map__grid">
            {KHAN_MAP_MODULES.map((mod) => {
              const state = resolveKhanModuleState(mod.id, pillarById);
              const href = state !== "locked" ? khanPillarHref(mod.id, pathname) : undefined;
              return (
                <ModuleCard
                  key={mod.id}
                  meta={mod}
                  state={state}
                  href={href}
                  pillarView={pillarById[mod.id]}
                />
              );
            })}
          </div>
        </section>

        <section className="iq-khan-map__final" aria-label="Final challenge">
          <h2 className="iq-khan-map__section-title">Mastery</h2>
          <FinalModuleCard
            meta={KHAN_FINAL_MODULE}
            state={finalState}
            href={hubHref}
            pillarsComplete={pillarsComplete}
            pillarsTotal={4}
          />
        </section>

        <footer className="iq-khan-map__footer">
          <Link href="/schools/map" className="iq-khan-map__footer-link">
            Cinematic (A)
          </Link>
          <span aria-hidden>·</span>
          <Link href="/schools/preview/map-cartoon" className="iq-khan-map__footer-link">
            Cartoon (B)
          </Link>
          <span aria-hidden>·</span>
          <Link href="/schools/preview/map-prodigy" className="iq-khan-map__footer-link">
            Prodigy (C)
          </Link>
          <span aria-hidden>·</span>
          <Link href="/schools/preview/map-dragonbox" className="iq-khan-map__footer-link">
            DragonBox (D)
          </Link>
          <span aria-hidden>·</span>
          <Link href="/schools/preview/map-roblox" className="iq-khan-map__footer-link">
            Roblox (E)
          </Link>
          <span aria-hidden>·</span>
          <span className="iq-khan-map__footer-here">Khan (F)</span>
        </footer>
      </div>
    </main>
  );
}
