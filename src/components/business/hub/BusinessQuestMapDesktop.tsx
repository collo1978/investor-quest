"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BusinessHubSceneImage } from "@/components/business/BusinessHubSceneImage";
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

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

/**
 * Business island hub — wide 16:9 scene on desktop; tall portrait stage on phones.
 * Portrait layout is CSS-driven (`globals.css`) so SSR and hydration stay aligned.
 */
export function BusinessQuestMapDesktop({
  cards,
  company,
  companyLogoUrl,
  hubProgressPct,
  partnerId,
  userId
}: Props) {
  const logo = resolveCompanyLogoUrl(company, companyLogoUrl);
  const pct = Math.max(0, Math.min(100, Math.round(hubProgressPct)));
  const reduceMotion = useReducedMotion();

  return (
    <div className="business-hub-scene-root w-full" data-business-quest-hub>
      <div className="business-hub-scene-scroll w-full">
        <motion.div
          className="business-hub-scene-frame relative mx-auto flex w-full max-w-[1600px] flex-col py-1 max-md:min-h-0 max-md:flex-1 max-md:py-0"
          data-business-quest-hub-desktop
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="business-hub-scene-shell relative flex min-h-0 flex-1 flex-col overflow-visible rounded-2xl border border-[rgba(245,197,71,0.2)] shadow-[0_32px_100px_rgba(0,0,0,0.62)] sm:rounded-3xl">
            <div
              className="business-hub-scene-stage"
              style={BUSINESS_SCENE_STYLE}
              data-business-scene
            >
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl"
                aria-hidden
              >
                <div className="relative h-full w-full">
                  <BusinessHubSceneImage />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,3,8,0.48)] via-transparent to-[rgba(4,3,8,0.1)]" />
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_48%_42%_at_50%_42%,rgba(245,197,71,0.09),transparent_72%)]"
                  animate={reduceMotion ? undefined : { opacity: [0.4, 0.62, 0.4] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 7, repeat: Infinity, ease: "easeInOut" }
                  }
                />
              </div>

              <div
                className="pointer-events-none absolute inset-0 z-[1] overflow-visible"
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

              <HubTrailBridgeBeacon pillarId="business" />

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
            </div>

            <div
              className="pointer-events-none absolute right-2 top-2 z-30 sm:right-4 sm:top-4"
              style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
            >
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
