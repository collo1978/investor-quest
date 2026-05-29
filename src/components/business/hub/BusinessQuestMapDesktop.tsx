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

/** Desktop cinematic island scene — unchanged orbit card layout (lg+). */
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
    <motion.div
      className="relative mx-auto w-full py-1"
      data-business-quest-hub-desktop
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="relative overflow-visible rounded-2xl border border-[rgba(245,197,71,0.2)] shadow-[0_32px_100px_rgba(0,0,0,0.62)] sm:rounded-3xl">
        <motion.div style={BUSINESS_SCENE_STYLE} data-business-scene>
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl"
            aria-hidden
          >
            <div className="relative h-full w-full">
              <BusinessHubSceneImage />
            </div>
            <motion.div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,3,8,0.48)] via-transparent to-[rgba(4,3,8,0.1)]" />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(ellipse_48%_42%_at_50%_42%,rgba(245,197,71,0.09),transparent_72%)]"
              animate={reduceMotion ? undefined : { opacity: [0.4, 0.62, 0.4] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 7, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </motion.div>

          <motion.div
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
          </motion.div>

          <HubTrailBridgeBeacon pillarId="business" />
          <motion.div className="pointer-events-none absolute inset-0 z-[2] overflow-visible">
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
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-3 top-3 z-30 sm:right-4 sm:top-4"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div
            className="rounded-xl border border-[rgba(245,197,71,0.42)] bg-[rgba(8,7,4,0.88)] px-3.5 py-2 shadow-[0_0_28px_rgba(245,197,71,0.22)] backdrop-blur-md"
            role="status"
            aria-label={`Business quest progress ${pct} percent`}
          >
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[rgba(255,229,141,0.5)]">
              Island progress
            </p>
            <p className="text-right font-[var(--font-grotesk)] text-lg font-bold tabular-nums text-[rgba(255,229,141,0.98)]">
              {pct}%
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
