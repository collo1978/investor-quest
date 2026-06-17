"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { NeonButton } from "@/components/NeonButton";
import { useGame } from "@/components/GameProvider";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import dynamic from "next/dynamic";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { hrefForBankMissionBrief } from "@/lib/bank/bankBrokerMissionBriefNavigation";
import { getOrCreateOnboardingGuestId } from "@/lib/onboarding/guestId";
import {
  CONTROLLED_DEMO_MODE,
  CONTROLLED_DEMO_COMPANY_ID
} from "@/lib/demo/controlledDemo";
import { NVDA_ONBOARDING } from "@/lib/demo/nvidiaDemoVoice";
import type { OnboardingInterest } from "@/lib/onboarding/types";
import { DEFAULT_COMPANY_ID } from "@/lib/demoData";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { isDemoStoryModeActive } from "@/lib/demo/demoStoryMode";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { releaseFunnelTransition } from "@/lib/startup/funnelTransition";
import { prefetchStartupAssets } from "@/lib/startup/prefetchStartupAssets";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

const BankBrokerQuestMatchReveal = dynamic(
  () =>
    import("@/components/bank/BankBrokerQuestMatchReveal").then((m) => ({
      default: m.BankBrokerQuestMatchReveal
    })),
  {
    loading: () => (
      <main className="static-ui relative flex min-h-screen items-center justify-center bg-[#05050F]">
        <p className="text-sm text-ink-2">Loading match…</p>
      </main>
    )
  }
);

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

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const mapRoute = pathname.startsWith("/schools")
    ? resolveSchoolsLearnerHref("/schools/map", pathname)
    : "/map";
  const { state, actions, persistenceReady, raw } = useGame();
  const demoStory = useDemoStory();
  const schoolsDemo = useSchoolsDemoStory();
  const isPreviewEmbed = useMobilePreviewEmbed();

  useRunOnceOnMount(() => {
    releaseFunnelTransition("onboarding");
    if (!isPreviewEmbed) {
      prefetchStartupAssets();
      preloadQuestDetailChunks();
    }
    try {
      router.prefetch("/business");
      router.prefetch("/business/what-they-do");
      router.prefetch("/map");
    } catch {
      /* ignore */
    }
  });

  useEffect(() => {
    if (isPreviewEmbed) return;
    if (demoStory.active || isDemoStoryModeActive()) return;
    if (schoolsDemo.active || isSchoolsDemoStoryModeActive()) return;
    if (!persistenceReady) return;
    if (raw.onboarding.completedAt != null) {
      router.replace(mapRoute);
    }
  }, [
    isPreviewEmbed,
    demoStory.active,
    mapRoute,
    persistenceReady,
    raw.onboarding.completedAt,
    router,
    schoolsDemo.active
  ]);

  const [step, setStep] = useState<1 | 2>(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] =
    useState<OnboardingInterest[]>(FALLBACK_INTERESTS);
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

  const persistInterests = useCallback((selected: string[]) => {
    const guestId = getOrCreateOnboardingGuestId();
    void fetch("/api/onboarding/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, interestIds: selected })
    });
  }, []);

  const progressIndex = useMemo(() => (step === 1 ? 0 : 1), [step]);

  const enterQuestFromMatch = useCallback(() => {
    actions.setActiveCompany(
      CONTROLLED_DEMO_MODE ? CONTROLLED_DEMO_COMPANY_ID : DEFAULT_COMPANY_ID
    );
    actions.setProfile({
      playerName: state.playerName ?? "Investor",
      goal: state.goal ?? "Build conviction"
    });

    if (demoStory.active || isDemoStoryModeActive()) {
      actions.completeOnboarding();
      demoStory.advance("map-brief");
      return;
    }

    if (
      schoolsDemo.active ||
      isSchoolsDemoStoryModeActive() ||
      isSchoolsDemoPath(pathname)
    ) {
      actions.completeOnboarding();
      navigateSchoolsDemoStep("map-brief", pathname, router);
      return;
    }

    if (isPreviewEmbed) {
      router.replace(hrefForBankMissionBrief(true));
      return;
    }

    if (!persistenceReady) return;
    actions.completeOnboarding();
    router.replace(mapRoute);
  }, [
    actions,
    demoStory,
    isPreviewEmbed,
    mapRoute,
    pathname,
    persistenceReady,
    router,
    schoolsDemo,
    state.goal,
    state.playerName
  ]);

  const mapPrefetchedRef = useRef(false);
  useEffect(() => {
    if (step >= 2 && !mapPrefetchedRef.current) {
      mapPrefetchedRef.current = true;
      try {
        router.prefetch("/map");
      } catch {
        /* ignore */
      }
    }
  }, [step, router]);

  const continueFromInterests = () => {
    if (CONTROLLED_DEMO_MODE && interests.length !== 2) return;
    persistInterests(interests);
    setStep(2);
  };

  const storyActive =
    isPreviewEmbed ||
    demoStory.active ||
    isDemoStoryModeActive() ||
    schoolsDemo.active ||
    isSchoolsDemoStoryModeActive();

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

  const schoolsDemoFlow = pathname.includes("/schools");

  if (step === 2) {
    return (
      <BankBrokerQuestMatchReveal
        interestIds={interests}
        onRevealComplete={() => enterQuestFromMatch()}
        enterQuestDisabled={!storyActive && !persistenceReady}
        continueLabel="BEGIN QUEST"
      />
    );
  }

  return (
    <main
      className={[
        "static-ui relative bg-[#05050F]",
        schoolsDemoFlow
          ? "flex min-h-[100dvh] flex-col overflow-y-auto overscroll-y-contain"
          : "min-h-screen overflow-hidden"
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#05050F]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_30%_18%,rgba(139,92,246,0.18),transparent_62%),radial-gradient(880px_560px_at_70%_30%,rgba(168,85,247,0.12),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(720px_520px_at_50%_30%,black,transparent_75%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_1px,transparent_1.2px)] [background-size:40px_40px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_35%,transparent_55%,rgba(0,0,0,0.85)_100%)]" />

      <div
        className={[
          "relative mx-auto w-full max-w-[720px] px-5 pt-6 sm:px-6",
          schoolsDemoFlow
            ? "pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            : ""
        ].join(" ")}
      >
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
                NVDA_ONBOARDING.step1TitleAccent ? (
                  <>
                    {NVDA_ONBOARDING.step1Title}{" "}
                    <span className="bg-[linear-gradient(90deg,#a855f7,#7c3aed,#60a5fa)] bg-clip-text text-transparent">
                      {NVDA_ONBOARDING.step1TitleAccent}
                    </span>
                  </>
                ) : (
                  NVDA_ONBOARDING.step1Title
                )
              ) : (
                <>
                  Discover{" "}
                  <span className="bg-[linear-gradient(90deg,#a855f7,#7c3aed,#60a5fa)] bg-clip-text text-transparent">
                    what matters
                  </span>
                </>
              )}
            </div>
            <div className="mt-3 text-sm text-ink-2">
              {CONTROLLED_DEMO_MODE ? (
                NVDA_ONBOARDING.step1Subtitle
              ) : (
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.75),transparent)] shadow-[0_0_18px_rgba(139,92,246,0.22)]" />
                  Choose topics you enjoy, we match companies from metadata first.
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {interestOptions.map((it) => {
                const active = interests.includes(it.id);
                const atMax = CONTROLLED_DEMO_MODE && interests.length >= 2;
                const dimmed = CONTROLLED_DEMO_MODE && !active && atMax;
                return (
                  <button
                    key={it.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setInterests((prev) => {
                        if (prev.includes(it.id)) {
                          return prev.filter((x) => x !== it.id);
                        }
                        if (CONTROLLED_DEMO_MODE && prev.length >= 2) {
                          return prev;
                        }
                        return [...prev, it.id];
                      })
                    }
                    className={[
                      "group relative rounded-2xl border px-3 py-4 text-center transition-[box-shadow,background-color,border-color,opacity] duration-200",
                      active
                        ? "border-[rgba(139,92,246,0.55)] bg-[rgba(139,92,246,0.14)] shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_24px_rgba(139,92,246,0.28)]"
                        : dimmed
                          ? "border-panel-border/60 bg-[rgba(255,255,255,0.02)] opacity-45"
                          : "border-panel-border bg-[rgba(255,255,255,0.03)] hover:border-violet-400/35 hover:bg-[rgba(139,92,246,0.08)] hover:shadow-[0_0_18px_rgba(139,92,246,0.16)]"
                    ].join(" ")}
                  >
                    {active && CONTROLLED_DEMO_MODE ? (
                      <span
                        aria-hidden
                        className="absolute right-2 top-2 text-[10px] font-bold text-violet-300"
                      >
                        ✓
                      </span>
                    ) : null}
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
                disabled={
                  CONTROLLED_DEMO_MODE
                    ? interests.length !== 2
                    : interests.length === 0
                }
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

      </div>
    </main>
  );
}