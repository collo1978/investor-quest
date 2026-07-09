"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ForcesHubSceneImage } from "@/components/forces/ForcesHubSceneImage";
import { ForcesChecklistLadderSheet } from "@/components/forces/hub/ForcesChecklistLadderSheet";
import { ForcesIslandAcademySign } from "@/components/forces/hub/ForcesIslandAcademySign";
import {
  FORCES_MAP_AMBIENT_PARTICLES,
  FORCES_MAP_CARD_POSITIONS,
  FORCES_SCENE_STYLE
} from "@/app/forces/forcesQuestMapPositions";
import { ForcesCompanyEmblem } from "@/components/forces/ForcesCompanyEmblem";
import { ForcesQuestMapCard } from "@/components/forces/ForcesQuestMapCard";
import { HubTrailBridgeBeacon } from "@/components/quest/hub/HubTrailBridgeBeacon";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";
import type { ForcesHubQuestCard } from "@/lib/forces/forcesHubTypes";
import type { Company } from "@/data/companies";

type Props = {
  cards: ForcesHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

export function ForcesQuestMap({
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
  const [ladderOpen, setLadderOpen] = useState(false);

  return (
    <motion.div
      className="relative mx-auto w-full py-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="relative overflow-visible rounded-2xl border border-[rgba(251,146,60,0.28)] shadow-[0_32px_100px_rgba(0,0,0,0.62)] sm:rounded-3xl">
        <motion.div style={FORCES_SCENE_STYLE} data-forces-scene>
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl"
            aria-hidden
          >
            <div className="relative h-full w-full">
              <ForcesHubSceneImage />
            </div>
            <motion.div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,4,2,0.54)] via-transparent to-[rgba(6,8,18,0.16)]" />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(ellipse_50%_44%_at_50%_48%,rgba(251,146,60,0.14),transparent_72%)]"
              animate={reduceMotion ? undefined : { opacity: [0.38, 0.62, 0.38] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] overflow-visible"
            aria-hidden
          >
            {FORCES_MAP_AMBIENT_PARTICLES.map((p, i) => (
              <motion.span
                key={`${p.left}-${p.top}`}
                className="absolute rounded-full bg-[rgba(56,189,248,0.75)] blur-[1px]"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size
                }}
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.15, 0.5, 0.15], scale: [1, 1.25, 1] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 3.2 + i * 0.28,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                }
              />
            ))}
            {logo ? (
              <ForcesCompanyEmblem logoUrl={logo} companyName={company.name} />
            ) : null}
          </motion.div>

          {/* Interactive cards above scene FX; slot 1 is top-left (was under z-30 map chrome at z-[2]). */}
          <motion.div className="absolute inset-0 z-[40] overflow-visible pointer-events-none">
            {cards.length === 0 ? (
              <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm text-[rgba(251,191,36,0.78)]">
                No Forces quests loaded. Seed Supabase hub cards, then hard refresh
                (Ctrl+Shift+R).
              </p>
            ) : null}
            {cards.map((card, i) => {
              const slot = FORCES_MAP_CARD_POSITIONS[card.orderNumber];
              if (!slot) return null;
              return (
                <ForcesQuestMapCard
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

          <motion.div className="pointer-events-none absolute left-3 top-3 z-50 sm:left-4 sm:top-4">
            <Link
              href="/map"
              prefetch
              className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-[rgba(251,146,60,0.42)] bg-[rgba(8,6,4,0.88)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(255,237,213,0.92)] shadow-[0_0_20px_rgba(251,146,60,0.2)] backdrop-blur-md transition hover:border-[rgba(251,191,36,0.65)] hover:bg-[rgba(12,8,4,0.95)]"
            >
              <span aria-hidden className="text-amber-300">
                ←
              </span>
              Map
            </Link>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute bottom-3 left-3 z-50 sm:bottom-4 sm:left-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <ForcesIslandAcademySign
              companyId={company.id}
              onOpenLadder={() => setLadderOpen(true)}
            />
          </motion.div>
        </motion.div>

        <ForcesChecklistLadderSheet
          open={ladderOpen}
          onClose={() => setLadderOpen(false)}
          companyId={company.id}
        />

        <motion.div
          className="pointer-events-none absolute right-3 top-3 z-30 sm:right-4 sm:top-4"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div
            className="rounded-xl border border-[rgba(251,146,60,0.45)] bg-[rgba(10,6,4,0.88)] px-3.5 py-2 shadow-[0_0_28px_rgba(251,146,60,0.24)] backdrop-blur-md"
            role="status"
            aria-label={`Forces quest progress ${pct} percent`}
          >
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[rgba(251,191,36,0.55)]">
              Launch progress
            </p>
            <p className="text-right font-[var(--font-grotesk)] text-lg font-bold tabular-nums text-[rgba(255,237,213,0.98)]">
              {pct}%
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
