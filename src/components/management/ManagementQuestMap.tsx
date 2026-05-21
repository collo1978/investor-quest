"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ManagementHubSceneImage } from "@/components/management/ManagementHubSceneImage";
import {
  MANAGEMENT_MAP_AMBIENT_PARTICLES,
  MANAGEMENT_MAP_CARD_POSITIONS,
  MANAGEMENT_SCENE_STYLE
} from "@/app/management/managementQuestMapPositions";
import { ManagementQuestMapCard } from "@/components/management/ManagementQuestMapCard";
import { HubTrailBridgeBeacon } from "@/components/quest/hub/HubTrailBridgeBeacon";
import type { ManagementHubQuestCard } from "@/lib/management/managementHubTypes";
import type { Company } from "@/data/companies";

type Props = {
  cards: ManagementHubQuestCard[];
  company: Company;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

export function ManagementQuestMap({
  cards,
  company,
  hubProgressPct,
  partnerId,
  userId
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(hubProgressPct)));
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full py-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="relative overflow-visible rounded-2xl border border-[rgba(168,85,247,0.24)] shadow-[0_32px_100px_rgba(0,0,0,0.62)] sm:rounded-3xl">
        <motion.div style={MANAGEMENT_SCENE_STYLE} data-management-scene>
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl"
            aria-hidden
          >
            <div className="relative h-full w-full">
              <ManagementHubSceneImage />
            </div>
            <motion.div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,4,12,0.54)] via-transparent to-[rgba(6,4,12,0.14)]" />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(ellipse_48%_42%_at_50%_42%,rgba(168,85,247,0.11),transparent_72%)]"
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
            {MANAGEMENT_MAP_AMBIENT_PARTICLES.map((p, i) => (
              <motion.span
                key={`${p.left}-${p.top}`}
                className="absolute rounded-full bg-[rgba(192,132,252,0.7)] blur-[1px]"
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
          </motion.div>

          <HubTrailBridgeBeacon pillarId="management" />
          <motion.div className="absolute inset-0 z-[2] overflow-visible pointer-events-none">
            {cards.map((card, i) => {
              const slot = MANAGEMENT_MAP_CARD_POSITIONS[card.orderNumber];
              if (!slot) return null;
              return (
                <ManagementQuestMapCard
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
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-3 top-3 z-30 sm:right-4 sm:top-4"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div
            className="rounded-xl border border-[rgba(168,85,247,0.42)] bg-[rgba(8,5,14,0.88)] px-3.5 py-2 shadow-[0_0_28px_rgba(168,85,247,0.22)] backdrop-blur-md"
            role="status"
            aria-label={`Management quest progress ${pct} percent`}
          >
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[rgba(192,132,252,0.5)]">
              Command progress
            </p>
            <p className="text-right font-[var(--font-grotesk)] text-lg font-bold tabular-nums text-[rgba(216,180,254,0.98)]">
              {pct}%
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
