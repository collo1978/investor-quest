"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";

import { BusinessHubSceneImage } from "@/components/business/BusinessHubSceneImage";
import { BusinessIslandQuestHud } from "@/components/business/hub/BusinessIslandQuestHud";
import {
  BUSINESS_MAP_AMBIENT_PARTICLES,
  BUSINESS_MAP_CARD_POSITIONS,
  BUSINESS_SCENE_STYLE
} from "@/app/business/businessQuestMapPositions";
import { BusinessCompanyEmblem } from "@/components/business/BusinessCompanyEmblem";
import { BusinessQuestMapCard } from "@/components/business/BusinessQuestMapCard";
import { HubTrailBridgeBeacon } from "@/components/quest/hub/HubTrailBridgeBeacon";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";
import type { Company } from "@/data/companies";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { consumeSchoolsHubCelebrateReturn } from "@/lib/schools/schoolsQuestRewardFlow";

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
  missionBriefOpen?: boolean;
};

/**
 * Business island hub — full-viewport stage on desktop; tall portrait stage on phones.
 * Portrait layout is CSS-driven (`globals.css`) so SSR and hydration stay aligned.
 */
export function BusinessQuestMapDesktop({
  cards,
  company,
  companyLogoUrl,
  hubProgressPct,
  partnerId,
  userId,
  missionBriefOpen = false
}: Props) {
  const pathname = usePathname();
  const schoolsBusinessIsland =
    isSchoolsDemoPath(pathname) || pathname.startsWith("/schools/business");
  const schoolsMapHref = resolveSchoolsLearnerHref("/schools/map", pathname);
  const logo = resolveCompanyLogoUrl(company, companyLogoUrl);
  const pct = Math.max(0, Math.min(100, Math.round(hubProgressPct)));
  const completedCards = useMemo(
    () => cards.filter((c) => c.completed).length,
    [cards]
  );
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hubCelebrateFrom, setHubCelebrateFrom] = useState<number | null>(null);

  useEffect(() => {
    if (!schoolsBusinessIsland) return;
    if (consumeSchoolsHubCelebrateReturn()) {
      setHubCelebrateFrom(0);
    }
  }, [schoolsBusinessIsland]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="business-hub-scene-root flex min-h-0 w-full flex-1 flex-col" data-business-quest-hub>
      <div className="business-hub-scene-scroll flex min-h-0 w-full flex-1 flex-col">
        <motion.div
          className="business-hub-scene-frame relative mx-auto flex w-full min-h-0 flex-1 flex-col max-md:max-w-[1600px]"
          data-business-quest-hub-desktop
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={[
              "business-hub-scene-shell relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl sm:rounded-3xl",
              missionBriefOpen
                ? "border-0 shadow-none"
                : "border border-[rgba(245,197,71,0.2)] shadow-[0_32px_100px_rgba(0,0,0,0.62)]"
            ].join(" ")}
            data-mission-brief-open={missionBriefOpen ? "" : undefined}
          >
            <div
              className="business-hub-scene-stage relative flex min-h-0 flex-1 flex-col"
              style={BUSINESS_SCENE_STYLE}
              data-business-scene
            >
              <div
                className="business-hub-scene-art-wrap pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl"
                aria-hidden
              >
                <div className="relative h-full w-full">
                  <BusinessHubSceneImage />
                </div>
                {!missionBriefOpen ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,3,8,0.38)] via-transparent to-[rgba(4,3,8,0.12)]" />
                    <motion.div
                      className="absolute inset-0 bg-[radial-gradient(ellipse_42%_36%_at_50%_40%,rgba(245,197,71,0.05),transparent_74%)]"
                      animate={reduceMotion ? undefined : { opacity: [0.4, 0.62, 0.4] }}
                      transition={
                        reduceMotion
                          ? undefined
                          : { duration: 7, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                  </>
                ) : null}
              </div>

              <div
                className={[
                  "pointer-events-none absolute inset-0 z-[1] overflow-visible",
                  missionBriefOpen ? "hidden" : ""
                ].join(" ")}
                aria-hidden
              >
                {BUSINESS_MAP_AMBIENT_PARTICLES.map((p, i) => (
                  <motion.span
                    key={`${p.left}-${p.top}`}
                    className="absolute rounded-full bg-[rgba(255,229,141,0.7)] blur-[1px]"
                    style={{
                      left: p.left,
                      top: p.top,
                      width: p.size,
                      height: p.size
                    }}
                    animate={
                      reduceMotion
                        ? undefined
                        : { opacity: [0.12, 0.42, 0.12], scale: [1, 1.2, 1] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 3.8 + i * 0.25,
                            delay: p.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                    }
                  />
                ))}
                {logo ? (
                  <BusinessCompanyEmblem logoUrl={logo} companyName={company.name} />
                ) : null}
              </div>

              {!missionBriefOpen ? (
                <HubTrailBridgeBeacon pillarId="business" />
              ) : null}

              {!missionBriefOpen ? (
                <div className="business-hub-cards-layer pointer-events-none absolute inset-0 z-[2] overflow-visible">
                  <div className="pointer-events-auto absolute inset-0">
                    {cards.map((card, i) => {
                      const slot = BUSINESS_MAP_CARD_POSITIONS[card.orderNumber];
                      if (!slot) return null;
                      return (
                        <BusinessQuestMapCard
                          key={card.slug}
                          card={card}
                          position={slot}
                          company={company}
                          partnerId={partnerId}
                          userId={userId}
                          staggerIndex={i}
                          hubProgressPct={pct}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}

            </div>

            {!missionBriefOpen ? (
            <>
            {schoolsBusinessIsland ? (
              <div
                className="pointer-events-none absolute bottom-3 left-2 z-30 sm:bottom-4 sm:left-4"
                style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
              >
                <Link
                  href={schoolsMapHref}
                  prefetch
                  scroll
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[rgba(245,197,71,0.42)] bg-[rgba(8,7,4,0.88)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,229,141,0.96)] shadow-[0_0_20px_rgba(245,197,71,0.18)] backdrop-blur-md transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 sm:px-3.5 sm:py-2.5 sm:text-[11.5px]"
                >
                  <span aria-hidden className="text-[14px] leading-none">
                    ←
                  </span>
                  Back to map
                </Link>
              </div>
            ) : null}

            {/* Mobile top menu — match map dropdown (hamburger → glass menu). */}
            <div
              className="pointer-events-none absolute left-2 top-2 z-30 sm:left-4 sm:top-4 md:hidden"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
            >
              <div className="relative">
                <button
                  type="button"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  onClick={() => setMenuOpen((o) => !o)}
                  className={[
                    "pointer-events-auto relative grid h-10 w-10 place-items-center rounded-full border",
                    "border-violet-400/35 bg-[rgba(10,9,20,0.82)]",
                    "shadow-[0_0_0_1px_rgba(139,92,246,0.18),0_0_18px_rgba(59,130,246,0.22),0_0_22px_rgba(139,92,246,0.18)]",
                    "transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(59,130,246,0.18),transparent_60%)]"
                  />
                  <svg
                    viewBox="0 0 24 24"
                    className="relative h-5 w-5"
                    fill="none"
                    stroke="rgba(237,233,254,0.92)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M5 7h14" />
                    <path d="M5 12h14" />
                    <path d="M5 17h14" />
                  </svg>
                </button>

                {menuOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setMenuOpen(false)}
                      className="pointer-events-auto fixed inset-0 z-[198] cursor-default bg-transparent md:hidden"
                    />
                    <motion.div
                      id={menuId}
                      role="menu"
                      aria-label="Menu"
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="pointer-events-auto absolute left-0 top-full z-[199] mt-2 w-[min(88vw,18rem)] overflow-hidden rounded-2xl border border-violet-400/30 bg-[rgba(8,7,18,0.82)] shadow-[0_18px_60px_rgba(0,0,0,0.55),0_0_32px_rgba(139,92,246,0.12)] backdrop-blur-xl"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(139,92,246,0.12),transparent_60%)]"
                      />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="relative w-full px-4 py-3 text-left text-sm font-semibold text-violet-100 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                      >
                        Profile
                      </button>
                    </motion.div>
                  </>
                ) : null}
              </div>
            </div>

            <div
              className="pointer-events-none absolute right-2 top-2 z-30 sm:right-4 sm:top-4"
              style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
            >
              {schoolsBusinessIsland ? (
                <BusinessIslandQuestHud
                  completedCards={completedCards}
                  totalCards={cards.length}
                  cards={cards}
                  companyLogoUrl={logo || undefined}
                  companyName={company.name}
                  celebrateFrom={hubCelebrateFrom}
                />
              ) : (
                <div
                  className="pointer-events-auto rounded-xl border border-[rgba(245,197,71,0.42)] bg-[rgba(8,7,4,0.88)] px-3 py-1.5 shadow-[0_0_20px_rgba(245,197,71,0.18)] backdrop-blur-md sm:px-3.5 sm:py-2"
                  role="status"
                  aria-label={`Business quest progress ${pct} percent`}
                >
                  <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,229,141,0.5)] sm:text-[8px]">
                    Island progress
                  </p>
                  <p className="text-right font-[var(--font-grotesk)] text-base font-bold tabular-nums text-[rgba(255,229,141,0.98)] sm:text-lg">
                    {pct}%
                  </p>
                </div>
              )}
            </div>
            </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
