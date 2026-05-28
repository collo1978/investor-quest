"use client";

import { useRouter } from "next/navigation";

import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { motion, useReducedMotion } from "framer-motion";

import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { NeonButton } from "@/components/NeonButton";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const BENEFITS = [
  {
    icon: "✦",
    title: "No jargon",
    body: "Plain English explanations."
  },
  {
    icon: "◎",
    title: "No experience needed",
    body: "We guide you every step."
  },
  {
    icon: "◈",
    title: "Built from real company filings",
    body: "10-Ks, 10-Qs, earnings & more."
  }
] as const;

/** Deterministic motes — no Math.random() during render. */
const AMBIENT_PARTICLES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  drift: number;
  dur: number;
  delay: number;
}> = [
  { x: 14, y: 18, size: 1.1, opacity: 0.32, drift: 4, dur: 18, delay: 0 },
  { x: 72, y: 24, size: 1.0, opacity: 0.26, drift: 3, dur: 15, delay: 0.6 },
  { x: 48, y: 38, size: 1.3, opacity: 0.28, drift: 5, dur: 20, delay: 1.2 },
  { x: 86, y: 52, size: 1.0, opacity: 0.22, drift: 3, dur: 14, delay: 0.3 },
  { x: 22, y: 68, size: 1.2, opacity: 0.3, drift: 4, dur: 17, delay: 1.8 },
  { x: 58, y: 78, size: 1.0, opacity: 0.24, drift: 3, dur: 16, delay: 0.9 }
];

export type WelcomeScreenProps = {
  onStartQuest: () => void;
};

/**
 * Post-logo welcome landing — hero message, benefits, single CTA into onboarding.
 */
export function WelcomeScreen({ onStartQuest }: WelcomeScreenProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useRunOnceOnMount(() => {
    try {
      router.prefetch("/onboarding");
      router.prefetch("/business");
      router.prefetch("/business/what-they-do");
    } catch {
      /* ignore RSC prefetch failures in dev */
    }
    void import("@/components/QuestDetailScreen");
    void fetch("/api/onboarding/interests").catch(() => undefined);
  });

  /** Content visible on first paint — motion is transform-only (no opacity-0 stall). */
  const fade = () =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: false,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, ease: EASE_OUT_EXPO }
        };

  const headlineLine = () =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: false,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: EASE_OUT_EXPO }
        };

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#030308] px-5 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10"
      role="main"
      aria-label="Welcome to Investor Quest"
    >
      {/* Slow ambient gradient drift */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-[-20%] bg-[radial-gradient(ellipse_70%_55%_at_30%_20%,rgba(139,92,246,0.18),transparent_55%),radial-gradient(ellipse_60%_50%_at_75%_65%,rgba(168,85,247,0.1),transparent_60%)]"
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.55, 0.85, 0.6], scale: [1, 1.04, 1] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_-8%,rgba(139,92,246,0.22),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_65%_at_50%_100%,rgba(0,0,0,0.9),transparent_52%)]"
      />

      {/* Faint fog + light rays */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[12%] h-[42vh] w-[min(100vw,720px)] -translate-x-1/2 bg-[conic-gradient(from_200deg_at_50%_0%,transparent_40%,rgba(167,139,250,0.1)_48%,transparent_56%)] blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.12, 0.28, 0.16] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[32%] h-[min(55vw,300px)] w-[min(88vw,480px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(139,92,246,0.14),transparent_72%)] blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.35, 0.55, 0.4], scale: [0.98, 1.03, 1] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {AMBIENT_PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-violet-200/70"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -p.drift, 0],
                    opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5]
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: p.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.delay
                  }
            }
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        <motion.div {...fade()} className="flex justify-center">
          <InvestorQuestBrandLogo
            priority
            align="center"
            className="h-9 w-auto max-w-[220px] sm:h-10"
            sizes="220px"
          />
        </motion.div>

        <motion.header {...fade()} className="mt-10 text-center sm:mt-12">
          <h1 className="text-balance text-[clamp(1.9rem,7.8vw,2.55rem)] font-bold leading-[1.1] tracking-[-0.035em] text-white">
            <motion.span {...headlineLine()} className="block">
              Understand any{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
                U.S. stock
              </span>
            </motion.span>
            <motion.span {...headlineLine()} className="mt-1 block">
              like the world&apos;s best investors.
            </motion.span>
          </h1>
          <p className="mx-auto mt-5 max-w-[20rem] text-pretty text-[15px] leading-relaxed text-ink-1 sm:max-w-none sm:text-base">
            We make the documents great investors read
            <br />
            simple and visual.
          </p>
        </motion.header>

        <motion.ul
          className="mt-10 flex flex-col gap-3.5 sm:mt-11"
          aria-label="Why Investor Quest"
          initial={false}
        >
          {BENEFITS.map((item, index) => (
            <motion.li
              key={item.title}
              {...fade()}
              className="group relative overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-[linear-gradient(145deg,rgba(255,255,255,0.07)_0%,rgba(139,92,246,0.05)_48%,rgba(12,8,24,0.55)_100%)] px-4 py-4 shadow-[0_0_40px_-18px_rgba(139,92,246,0.45)] backdrop-blur-xl sm:px-[1.15rem] sm:py-[1.1rem]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_80%_120%_at_0%_0%,rgba(167,139,250,0.12),transparent_55%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_90%_80%_at_100%_100%,rgba(139,92,246,0.14),transparent_60%)]"
              />
              <div className="relative flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-[rgba(139,92,246,0.12)] text-[15px] text-violet-200 shadow-[0_0_20px_-4px_rgba(167,139,250,0.55)] backdrop-blur-sm"
                >
                  {item.icon}
                </span>
                <div className="min-w-0 pt-0.5 text-left">
                  <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-ink-1/95">
                    {item.body}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          {...fade()}
          className="mt-auto flex flex-col items-center pt-9 sm:pt-10"
        >
          <div className="relative w-full max-w-[340px]">
            {!reduceMotion ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[16px]"
              >
                <motion.span
                  className="absolute top-0 bottom-0 w-[42%] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.22)_48%,transparent_100%)]"
                  initial={{ x: "-120%" }}
                  animate={{ x: "320%" }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    repeatDelay: 3.2,
                    ease: "easeInOut"
                  }}
                />
              </motion.span>
            ) : null}
            <NeonButton
              type="button"
              className="relative z-10 w-full rounded-[16px] border-violet-400/55 px-6 py-4 text-base font-bold tracking-[-0.02em] shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_12px_48px_rgba(0,0,0,0.5),0_0_64px_rgba(139,92,246,0.28)] transition-[transform,box-shadow] duration-300 hover:scale-[1.02] active:scale-[0.99]"
              onClick={onStartQuest}
            >
              Start your first quest
            </NeonButton>
          </div>
          <p className="mt-4 text-center text-xs font-medium tracking-[0.12em] text-ink-2 uppercase">
            Secure. Private. Yours.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
