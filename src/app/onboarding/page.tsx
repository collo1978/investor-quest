"use client";

import { useMemo, useState } from "react";
import { NeonButton } from "@/components/NeonButton";
import { useGame } from "@/components/GameProvider";
import { COMPANIES, companyById, type Company } from "@/lib/demoData";
import Image from "next/image";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";

export default function OnboardingPage() {
  const { state, actions } = useGame();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [swipeLikes, setSwipeLikes] = useState<string[]>([]);
  const [swipeNope, setSwipeNope] = useState<string[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(state.activeCompanyId);
  const selectedCompany = companyById(selectedCompanyId);

  const interestOptions = useMemo(
    () => [
      { id: "tech", label: "Technology", icon: "✦" },
      { id: "ai", label: "AI & Robotics", icon: "⌬" },
      { id: "health", label: "Healthcare", icon: "♡" },
      { id: "finance", label: "Finance", icon: "▦" },
      { id: "consumer", label: "Consumer", icon: "◐" },
      { id: "energy", label: "Energy", icon: "☼" },
      { id: "gaming", label: "Gaming", icon: "⌁" },
      { id: "travel", label: "Travel", icon: "✈" },
      { id: "music", label: "Music & Media", icon: "♫" }
    ],
    []
  );

  const swipeDeck = useMemo(() => {
    const order: string[] = ["nvda", "aapl", "tsla", "msft", "nke", "spot"];
    const map = new Map<string, Company>(COMPANIES.map((c) => [c.id, c]));
    return order
      .map((id) => map.get(id))
      .filter((c): c is Company => Boolean(c));
  }, []);

  const swipable = useMemo(() => {
    const seen = new Set([...swipeLikes, ...swipeNope]);
    return swipeDeck.filter((c) => !seen.has(c.id));
  }, [swipeDeck, swipeLikes, swipeNope]);

  const recommended = useMemo(() => {
    // simple deterministic recommendation: likes first, else defaults
    const liked = swipeLikes.map((id) => companyById(id));
    const fallbackIds = ["aapl", "nvda", "tsla", "msft", "nke", "spot"];
    const fallback = fallbackIds.map((id) => companyById(id));
    const unique = new Map<string, Company>();
    [...liked, ...fallback].forEach((c) => unique.set(c.id, c));
    return Array.from(unique.values()).slice(0, 6);
  }, [swipeLikes]);

  const progressIndex = useMemo(() => (step === 1 ? 0 : step === 2 ? 1 : step === 3 ? 2 : 3), [step]);

  const Step1 = (
    <section className="rounded-[28px] border border-panel-border bg-[rgba(7,7,18,0.55)] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="text-[44px] leading-[1.02] font-[var(--font-grotesk)] font-extrabold text-ink-0">
        Discover{" "}
        <span className="bg-[linear-gradient(90deg,#a855f7,#7c3aed,#60a5fa)] bg-clip-text text-transparent">
          what matters
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm text-ink-2">
        <span className="h-px w-10 bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.75),transparent)] shadow-[0_0_18px_rgba(139,92,246,0.22)]" />
        Choose a few topics you enjoy.
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
                  prev.includes(it.id) ? prev.filter((x) => x !== it.id) : [...prev, it.id]
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
              <div className="mt-2 text-[11px] font-semibold text-ink-0">{it.label}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <NeonButton
          className="w-full justify-center"
          onClick={() => setStep(2)}
          disabled={interests.length === 0}
        >
          Continue
        </NeonButton>
        <div className="mt-2 text-center text-[11px] text-ink-2">
          Takes less than 30 seconds
        </div>
      </div>
    </section>
  );

  return (
    <main className="static-ui relative min-h-screen overflow-hidden bg-[#05050F]">
      {/* cinematic backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[#05050F]" />
      {/* soft purple bloom lighting (low contrast) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_30%_18%,rgba(139,92,246,0.18),transparent_62%),radial-gradient(880px_560px_at_70%_30%,rgba(168,85,247,0.12),transparent_62%)]" />
      {/* faint grid/dot matrix */}
      <div className="pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(720px_520px_at_50%_30%,black,transparent_75%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_1px,transparent_1.2px)] [background-size:40px_40px]" />
      </div>
      {/* cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_35%,transparent_55%,rgba(0,0,0,0.85)_100%)]" />
      {/* thin circuit-style neon wiring around edges */}
      <div className="pointer-events-none absolute inset-0 opacity-45 [mask-image:radial-gradient(720px_520px_at_50%_35%,black,transparent_78%)]">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
        >
          <path
            d="M32 70 H240 M32 70 V250 M32 250 H120 M968 90 H760 M968 90 V280 M968 280 H860
               M80 740 H260 M80 740 V600 M80 600 H150 M920 720 H740 M920 720 V600 M920 600 H850"
            fill="none"
            stroke="rgba(139,92,246,0.18)"
            strokeWidth="1.2"
          />
          <path
            d="M70 105 H210 M930 120 H790 M110 705 H240 M900 690 H780"
            fill="none"
            stroke="rgba(168,85,247,0.12)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* branded header (logo + badge) — matches app header scale */}
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
        {/* header */}
        <div className="mb-7 flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-2">
              ONBOARDING
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => {
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

        {step === 1 ? Step1 : null}

          {step === 2 ? (
            <section className="rounded-[28px] border border-panel-border bg-[rgba(7,7,18,0.55)] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="text-3xl font-[var(--font-grotesk)] font-extrabold text-ink-0">
                Swipe to discover
              </div>
              <div className="mt-2 text-sm text-ink-2">
                Right if you like it, left if you don’t.
              </div>

              {(() => {
                const top = swipable[0] ?? null;
                const next = swipable[1] ?? null;
                return (
                  <>
                    {/* dedicated centered deck stage (fixed size, relative, overflow visible) */}
                    <div
                      className="relative mx-auto mt-6 w-full overflow-visible"
                      style={{ width: 420, maxWidth: "100%", height: 390 }}
                    >
                        {/* preview card (visual-only; no text to avoid overlap) */}
                        {next ? (
                          <div
                            className="pointer-events-none absolute inset-0"
                            style={{ zIndex: 10, transform: "translateY(10px) scale(0.96)" }}
                            aria-hidden
                          >
                          <div className="h-full w-full rounded-3xl border border-panel-border bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
                            <div className="relative flex h-full items-center justify-center p-10 opacity-60">
                              <div
                                className="absolute inset-0 rounded-3xl"
                                style={{
                                  background:
                                    "radial-gradient(520px 320px at 50% 10%, rgba(139,92,246,0.16), transparent 60%)"
                                }}
                              />
                              <div className="h-28 w-28 rounded-3xl border border-panel-border bg-[rgba(0,0,0,0.18)]" />
                            </div>
                          </div>
                          </div>
                        ) : null}

                        {/* active card (only card with text) */}
                        {top ? (
                          <div className="absolute inset-0" style={{ zIndex: 20 }}>
                            <div className="h-full w-full rounded-3xl border border-[rgba(139,92,246,0.40)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl">
                              <div className="flex h-full flex-col items-center justify-center px-10 py-10 text-center">
                                <div
                                  className="grid place-items-center border bg-[rgba(0,0,0,0.26)]"
                                  style={{
                                    width: 112,
                                    height: 112,
                                    borderRadius: 24,
                                    borderColor: "rgba(139,92,246,0.55)"
                                  }}
                                >
                                  <span className="text-5xl font-extrabold text-ink-0">
                                    {top.name[0]}
                                  </span>
                                </div>
                                <div className="mt-6 text-2xl font-[var(--font-grotesk)] font-extrabold leading-tight text-ink-0">
                                  {top.name}
                                </div>
                                <div className="mt-2 text-sm text-ink-2">{top.ticker}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-sm text-ink-2">
                            No more cards.
                          </div>
                        )}
                    </div>

                    {/* swipe controls */}
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

                    {/* nav buttons */}
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
              <div className="text-3xl font-[var(--font-grotesk)] font-extrabold text-ink-0">
                We’ve chosen these
              </div>
              <div className="mt-2 text-sm text-ink-2">
                Based on your interests & engagement.
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {recommended.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(c.id)}
                    className={[
                      "rounded-2xl border p-3 text-center transition",
                      c.id === selectedCompanyId
                        ? "border-[rgba(139,92,246,0.55)] bg-[rgba(139,92,246,0.14)] shadow-[0_0_24px_rgba(139,92,246,0.20)]"
                        : "border-panel-border bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
                    ].join(" ")}
                  >
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.22)] text-ink-0">
                      <span className="font-extrabold">{c.name[0]}</span>
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-ink-0">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-ink-2">{c.ticker}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <NeonButton className="w-full justify-center" onClick={() => setStep(4)}>
                  View companies
                </NeonButton>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="rounded-[28px] border border-panel-border bg-[rgba(7,7,18,0.55)] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="text-3xl font-[var(--font-grotesk)] font-extrabold text-ink-0">
                Your company{" "}
                <span className="text-neon-300">is selected</span>
              </div>
              <div className="mt-2 text-sm text-ink-2">
                This is where your journey begins.
              </div>

              <div className="mt-5 grid place-items-center">
                <div className="grid h-32 w-32 place-items-center rounded-[28px] border border-[rgba(139,92,246,0.55)] bg-[rgba(0,0,0,0.22)] shadow-[0_0_45px_rgba(139,92,246,0.25)]">
                  <span className="text-5xl font-extrabold text-ink-0">
                    {selectedCompany.name[0]}
                  </span>
                </div>
                <div className="mt-4 text-xl font-[var(--font-grotesk)] font-extrabold text-ink-0">
                  {selectedCompany.name}
                </div>
                <div className="mt-1 text-sm text-ink-2">{selectedCompany.ticker}</div>
              </div>

              <div className="mt-6 grid gap-2 text-sm text-ink-1">
                <div className="flex items-center gap-2">
                  <span className="text-neon-300">✓</span> Explore the company
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-300">✓</span> Understand the business
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-300">✓</span> Make smarter decisions
                </div>
              </div>

              <div className="mt-6">
                <NeonButton
                  className="w-full justify-center"
                  onClick={() => {
                    actions.setActiveCompany(selectedCompanyId);
                    actions.setProfile({
                      playerName: state.playerName ?? "Investor",
                      goal: state.goal ?? "Build conviction"
                    });
                  }}
                  href="/map"
                >
                  Start my quest
                </NeonButton>
                <NeonButton variant="ghost" className="mt-3 w-full justify-center" onClick={() => setStep(3)}>
                  Back
                </NeonButton>
              </div>
            </section>
          ) : null}
      </div>
    </main>
  );
}

