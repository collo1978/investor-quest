"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/NeonButton";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useGame } from "@/components/GameProvider";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { QuestMatchReveal } from "@/app/onboarding/QuestMatchReveal";
import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import {
  CONTROLLED_DEMO_MODE,
  CONTROLLED_DEMO_COMPANY_ID
} from "@/lib/demo/controlledDemo";
import { NVDA_ONBOARDING } from "@/lib/demo/nvidiaDemoVoice";
import {
  buildControlledDemoOnboardingShowcase,
  buildControlledDemoQuestMatchPool,
  mergeRecommendationsForControlledDemo,
  shuffleOnboardingDeck
} from "@/lib/demo/controlledOnboarding";
import { buildQuestMatchFallbackCards } from "@/lib/onboarding/questMatchFallback";
import type {
  OnboardingInterest,
  RecommendedCompanyCard
} from "@/lib/onboarding/types";
import {
  DEFAULT_COMPANY_ID,
  isCompanyId,
  type CompanyId
} from "@/lib/demoData";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { isDemoStoryModeActive } from "@/lib/demo/demoStoryMode";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { releaseFunnelTransition } from "@/lib/startup/funnelTransition";
import { prefetchStartupAssets } from "@/lib/startup/prefetchStartupAssets";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

const FALLBACK_INTERESTS: OnboardingInterest[] = [
  { id: "ai", label: "AI & Robotics", icon: "⌬", sortOrder: 10 },
  { id: "electric_cars", label: "Electric Cars", icon: "⚡", sortOrder: 20 },
  { id: "gaming", label: "Gaming", icon: "⌁", sortOrder: 30 },
  { id: "fashion", label: "Fashion", icon: "◆", sortOrder: 40 },
  { id: "sports", label: "Sports", icon: "◎", sortOrder: 50 },
  { id: "tech", label: "Technology", icon: "✦", sortOrder: 60 },
  { id: "consumer", label: "Consumer", icon: "◐", sortOrder: 70 },
  { id: "music", label: "Music & Media", icon: "♫", sortOrder: 80 }
];

function resolveGameCompanyId(cardId: string): CompanyId {
  if (CONTROLLED_DEMO_MODE) return CONTROLLED_DEMO_COMPANY_ID;
  return isCompanyId(cardId) ? cardId : DEFAULT_COMPANY_ID;
}

function InterestTags({
  ids,
  labelById
}: {
  ids: string[];
  labelById: Map<string, string>;
}) {
  if (!ids.length) return null;
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-1">
      {ids.slice(0, 3).map((id) => (
        <span
          key={id}
          className="rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] px-2 py-0.5 text-[9px] font-semibold text-neon-300"
        >
          {labelById.get(id) ?? id}
        </span>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { state, actions, persistenceReady, raw } = useGame();
  const demoStory = useDemoStory();

  useRunOnceOnMount(() => {
    releaseFunnelTransition("onboarding");
    prefetchStartupAssets();
    preloadQuestDetailChunks();
    try {
      router.prefetch("/business");
      router.prefetch("/business/what-they-do");
      router.prefetch("/map");
    } catch {
      /* ignore */
    }
  });

  useEffect(() => {
    if (demoStory.active || isDemoStoryModeActive()) return;
    if (!persistenceReady) return;
    if (raw.onboarding.completedAt != null) {
      router.replace("/map");
    }
  }, [demoStory.active, persistenceReady, raw.onboarding.completedAt, router]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] =
    useState<OnboardingInterest[]>(FALLBACK_INTERESTS);
  const [recommendedCards, setRecommendedCards] = useState<RecommendedCompanyCard[]>(
    []
  );
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [swipeLikes, setSwipeLikes] = useState<string[]>([]);
  const [swipeNope, setSwipeNope] = useState<string[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>(state.activeCompanyId);
  const [questMatchKey, setQuestMatchKey] = useState(0);

  const interestLabelById = useMemo(() => {
    const map = new Map<string, string>();
    interestOptions.forEach((o) => map.set(o.id, o.label));
    return map;
  }, [interestOptions]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/interests", { cache: "no-store" });
        if (!res.ok) throw new Error("interests fetch failed");
        const body = (await res.json()) as { interests?: OnboardingInterest[] };
        if (!cancelled && Array.isArray(body.interests) && body.interests.length) {
          setInterestOptions(body.interests);
        }
      } catch {
        // keep fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadRecommendations = useCallback(async (selected: string[]) => {
    if (CONTROLLED_DEMO_MODE) {
      setRecommendedCards(
        shuffleOnboardingDeck(buildControlledDemoOnboardingShowcase(selected))
      );
      setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID);
      return;
    }
    if (!selected.length) {
      setRecommendedCards([]);
      return;
    }
    const qs = encodeURIComponent(selected.join(","));
    const res = await fetch(`/api/onboarding/recommendations?interests=${qs}&limit=12`, {
      cache: "no-store"
    });
    if (!res.ok) {
      if (CONTROLLED_DEMO_MODE) {
        setRecommendedCards(
          shuffleOnboardingDeck(buildControlledDemoOnboardingShowcase(selected))
        );
        setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID);
      }
      return;
    }
    const body = (await res.json()) as { companies?: RecommendedCompanyCard[] };
    if (Array.isArray(body.companies)) {
      const companies = CONTROLLED_DEMO_MODE
        ? shuffleOnboardingDeck(
            mergeRecommendationsForControlledDemo(body.companies, selected)
          )
        : body.companies;
      setRecommendedCards(companies);
      setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID);
    } else if (CONTROLLED_DEMO_MODE) {
      setRecommendedCards(
        shuffleOnboardingDeck(buildControlledDemoOnboardingShowcase(selected))
      );
      setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID);
    }
  }, []);

  const persistInterests = useCallback((selected: string[]) => {
    const guestId = getOrCreateOnboardingGuestId();
    void fetch("/api/onboarding/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, interestIds: selected })
    });
  }, []);

  const swipeDeck = recommendedCards;

  const swipable = useMemo(() => {
    const seen = new Set([...swipeLikes, ...swipeNope]);
    return swipeDeck.filter((c) => !seen.has(c.id));
  }, [swipeDeck, swipeLikes, swipeNope]);

  const selectedCard = useMemo(
    () => recommendedCards.find((c) => c.id === selectedCardId) ?? recommendedCards[0],
    [recommendedCards, selectedCardId]
  );


  const progressIndex = useMemo(
    () => (step === 1 ? 0 : step === 2 ? 1 : 2),
    [step]
  );

  const enterQuestFromMatch = useCallback(() => {
    const gameId = selectedCard
      ? resolveGameCompanyId(selectedCard.id)
      : DEFAULT_COMPANY_ID;
    actions.setActiveCompany(gameId);
    actions.setProfile({
      playerName: state.playerName ?? "Investor",
      goal: state.goal ?? "Build conviction"
    });

    if (demoStory.active || isDemoStoryModeActive()) {
      actions.completeOnboarding();
      demoStory.advance("map-brief");
      return;
    }

    if (!persistenceReady) return;
    actions.completeOnboarding();
    router.replace("/map");
  }, [
    actions,
    demoStory,
    persistenceReady,
    router,
    selectedCard,
    state.goal,
    state.playerName
  ]);

  const questMatchPool = useMemo(() => {
    if (CONTROLLED_DEMO_MODE) {
      return buildControlledDemoQuestMatchPool(recommendedCards);
    }
    if (recommendedCards.length > 0) return recommendedCards;
    return buildQuestMatchFallbackCards();
  }, [recommendedCards]);

  const mapPrefetchedRef = useRef(false);
  useEffect(() => {
    if (step === 3) {
      setQuestMatchKey((k) => k + 1);
      if (!mapPrefetchedRef.current) {
        mapPrefetchedRef.current = true;
        try {
          router.prefetch("/map");
        } catch {
          /* ignore */
        }
      }
    }
  }, [step, router]);

  const continueFromInterests = () => {
    if (CONTROLLED_DEMO_MODE) {
      setRecommendedCards(
        shuffleOnboardingDeck(buildControlledDemoOnboardingShowcase(interests))
      );
      setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID);
    } else if (recommendedCards.length === 0) {
      setRecommendationsLoading(true);
      void loadRecommendations(interests).finally(() =>
        setRecommendationsLoading(false)
      );
    }
    persistInterests(interests);
    setStep(2);
  };

  useEffect(() => {
    if (interests.length === 0) return;
    if (CONTROLLED_DEMO_MODE) {
      setRecommendedCards(
        shuffleOnboardingDeck(buildControlledDemoOnboardingShowcase(interests))
      );
      setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID);
      return;
    }
    const timer = window.setTimeout(() => {
      void loadRecommendations(interests);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [interests, loadRecommendations]);

  const storyActive = demoStory.active || isDemoStoryModeActive();

  if (!storyActive && !persistenceReady) {
    return (
      <main className="static-ui relative flex min-h-screen items-center justify-center bg-[#05050F]">
        <p className="text-sm text-ink-2">Loading onboarding…</p>
      </main>
    );
  }

  if (!storyActive && raw.onboarding.completedAt != null) {
    return (
      <main className="static-ui relative flex min-h-screen items-center justify-center bg-[#05050F]">
        <p className="text-sm text-ink-2">Loading…</p>
      </main>
    );
  }

  return (
    <main className="static-ui relative min-h-screen overflow-hidden bg-[#05050F]">
      <div className="pointer-events-none absolute inset-0 bg-[#05050F]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_30%_18%,rgba(139,92,246,0.18),transparent_62%),radial-gradient(880px_560px_at_70%_30%,rgba(168,85,247,0.12),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(720px_520px_at_50%_30%,black,transparent_75%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_1px,transparent_1.2px)] [background-size:40px_40px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_35%,transparent_55%,rgba(0,0,0,0.85)_100%)]" />

      <div className="relative mx-auto w-full max-w-[720px] px-5 pt-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex min-w-0 flex-1 items-center py-1">
            <InvestorQuestBrandLogo
              priority
              className="h-14 w-auto max-w-[min(70vw,300px)] sm:h-16 sm:max-w-none"
            />
          </div>
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-xl bg-[radial-gradient(ellipse_90%_90%_at_50%_50%,rgba(139,92,246,0.35),transparent_70%)] blur-[8px] opacity-70"
            />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(10,10,22,0.75)] shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_4px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:h-12 sm:w-12">
              <Image
                src="/logos/iq-hex-badge.svg"
                alt="IQ Badge"
                width={44}
                height={44}
                priority
                unoptimized
                className="h-8 w-8 select-none sm:h-9 sm:w-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[520px] px-6 pb-10 pt-6">
        <div className="mb-7 flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-2">
              ONBOARDING
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => {
              const active = i === progressIndex;
              return (
                <div
                  key={i}
                  className={[
                    "grid h-8 w-8 place-items-center rounded-full border text-[11px] font-semibold",
                    active
                      ? "border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.18)] text-neon-300 shadow-[0_0_22px_rgba(139,92,246,0.22)]"
                      : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-2"
                  ].join(" ")}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 ? (
          <section className="rounded-[28px] border border-panel-border bg-[rgba(7,7,18,0.55)] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="text-[44px] leading-[1.02] font-[var(--font-grotesk)] font-extrabold text-ink-0">
              {CONTROLLED_DEMO_MODE ? (
                <>
                  {NVDA_ONBOARDING.step1Title}{" "}
                  <span className="bg-[linear-gradient(90deg,#a855f7,#7c3aed,#60a5fa)] bg-clip-text text-transparent">
                    {NVDA_ONBOARDING.step1TitleAccent}
                  </span>
                </>
              ) : (
                <>
                  Discover{" "}
                  <span className="bg-[linear-gradient(90deg,#a855f7,#7c3aed,#60a5fa)] bg-clip-text text-transparent">
                    what matters
                  </span>
                </>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-ink-2">
              <span className="h-px w-10 bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.75),transparent)] shadow-[0_0_18px_rgba(139,92,246,0.22)]" />
              {CONTROLLED_DEMO_MODE
                ? NVDA_ONBOARDING.step1Subtitle
                : "Choose topics you enjoy, we match companies from metadata first."}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {interestOptions.map((it) => {
                const active = interests.includes(it.id);
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() =>
                      setInterests((prev) =>
                        prev.includes(it.id)
                          ? prev.filter((x) => x !== it.id)
                          : [...prev, it.id]
                      )
                    }
                    className={[
                      "group rounded-2xl border px-3 py-4 text-center transition",
                      active
                        ? "border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.12)] shadow-[0_0_22px_rgba(139,92,246,0.18)]"
                        : "border-panel-border bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
                    ].join(" ")}
                  >
                    <div className="text-neon-300 text-xl">{it.icon}</div>
                    <div className="mt-2 text-[11px] font-semibold text-ink-0">
                      {it.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <NeonButton
                className="w-full justify-center"
                onClick={() => void continueFromInterests()}
                disabled={interests.length === 0}
              >
                {CONTROLLED_DEMO_MODE
                  ? NVDA_ONBOARDING.step1Continue
                  : "Continue"}
              </NeonButton>
              <div className="mt-2 text-center text-[11px] text-ink-2">
                {CONTROLLED_DEMO_MODE
                  ? NVDA_ONBOARDING.step1Footnote
                  : "Takes less than 30 seconds"}
              </div>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="rounded-[28px] border border-panel-border bg-[rgba(7,7,18,0.55)] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="text-3xl font-[var(--font-grotesk)] font-extrabold text-ink-0">
              {CONTROLLED_DEMO_MODE
                ? NVDA_ONBOARDING.step2Title
                : "Swipe to discover"}
            </div>
            <div className="mt-2 text-sm text-ink-2">
              {CONTROLLED_DEMO_MODE
                ? NVDA_ONBOARDING.step2Subtitle
                : "Right if you like it, left if you don’t."}
            </div>

            {(() => {
              const top = swipable[0] ?? null;
              const next = swipable[1] ?? null;
              return (
                <>
                  <div
                    className="relative mx-auto mt-6 w-full overflow-visible"
                    style={{ width: 420, maxWidth: "100%", height: 390 }}
                  >
                    {next ? (
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ zIndex: 10, transform: "translateY(10px) scale(0.96)" }}
                        aria-hidden
                      >
                        <div className="h-full w-full rounded-3xl border border-panel-border bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
                          <div className="relative flex h-full items-center justify-center p-10 opacity-60">
                            <CompanyLogo
                              src={next.logo}
                              alt={next.companyName}
                              className="h-20 w-20"
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {top ? (
                      <div className="absolute inset-0" style={{ zIndex: 20 }}>
                        <div className="h-full w-full rounded-3xl border border-[rgba(139,92,246,0.40)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl">
                          <div className="flex h-full flex-col items-center justify-center px-10 py-10 text-center">
                            <CompanyLogo
                              src={top.logo}
                              alt={top.companyName}
                              className="h-24 w-24 rounded-3xl"
                            />
                            <div className="mt-6 text-2xl font-[var(--font-grotesk)] font-extrabold leading-tight text-ink-0">
                              {top.companyName}
                            </div>
                            <div className="mt-2 text-sm text-ink-2">{top.ticker}</div>
                            <div className="mt-1 text-[11px] text-ink-2">{top.sector}</div>
                            <InterestTags ids={top.matchingInterests} labelById={interestLabelById} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-sm text-ink-2">
                        {recommendationsLoading
                          ? "Loading matches…"
                          : recommendedCards.length === 0
                            ? "Pick interests and continue."
                            : "No more cards."}
                      </div>
                    )}
                  </div>

                  {top ? (
                    <div className="mt-4 flex items-center justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => setSwipeNope((p) => [...p, top.id])}
                        className="grid h-14 w-14 place-items-center rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-1 shadow-[0_0_24px_rgba(0,0,0,0.55)] hover:bg-[rgba(255,255,255,0.06)]"
                        aria-label="Not interested"
                      >
                        ✕
                      </button>
                      <button
                        type="button"
                        onClick={() => setSwipeLikes((p) => [...p, top.id])}
                        className="grid h-14 w-14 place-items-center rounded-2xl border border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.12)] text-neon-300 shadow-[0_0_28px_rgba(139,92,246,0.22)] hover:bg-[rgba(139,92,246,0.18)]"
                        aria-label="Interested"
                      >
                        ❤
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-6 flex gap-3">
                    <NeonButton
                      variant="ghost"
                      className="flex-1 justify-center"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </NeonButton>
                    <NeonButton
                      className="flex-1 justify-center"
                      onClick={() => setStep(3)}
                      disabled={swipeLikes.length + swipeNope.length === 0}
                    >
                      Continue
                    </NeonButton>
                  </div>
                </>
              );
            })()}
          </section>
        ) : null}

        {step === 3 ? (
          <section className="rounded-[28px] border border-panel-border bg-[rgba(7,7,18,0.55)] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <QuestMatchReveal
              key={questMatchKey}
              companies={questMatchPool}
              interestLabelById={interestLabelById}
              controlledDemoReveal={CONTROLLED_DEMO_MODE}
              onWinnerChosen={() => setSelectedCardId(CONTROLLED_DEMO_COMPANY_ID)}
              onEnterQuest={enterQuestFromMatch}
              enterQuestDisabled={!persistenceReady}
            />
          </section>
        ) : null}

      </div>
    </main>
  );
}