"use client";

import { motion } from "framer-motion";
import {
  requiredTierForFeature,
  TIER_LABELS,
  type AnalyticsFeatureKey
} from "@/lib/analytics/tiers";
import { useClientMounted } from "@/hooks/useClientMounted";

type Props = {
  feature: AnalyticsFeatureKey;
  enabled: boolean;
  isClientView: boolean;
  title: string;
  children: React.ReactNode;
};

export function LockedFeatureGate({
  feature,
  enabled,
  isClientView,
  title,
  children
}: Props) {
  const mounted = useClientMounted();

  if (enabled) {
    return <>{children}</>;
  }

  const tier = requiredTierForFeature(feature);
  const tierLabel = TIER_LABELS[tier];

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 8 } : false}
      animate={mounted ? { opacity: 1, y: 0 } : undefined}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/50 to-violet-950/20 p-6"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_12px)]"
      />
      <motion.div className="relative flex flex-col items-center justify-center gap-3 py-8 text-center">
        <span className="text-3xl" aria-hidden>
          🔒
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/90">
          {title}
        </h3>
        <p className="max-w-sm text-sm text-white/55">
          {isClientView ? (
            <>
              Upgrade to <span className="text-violet-300">{tierLabel}</span> to
              unlock this intelligence layer for your organization.
            </>
          ) : (
            <>
              {tierLabel} feature — enable in Partner Feature Access below.
            </>
          )}
        </p>
        {isClientView ? (
          <button
            type="button"
            className="mt-2 rounded-full border border-violet-400/40 bg-violet-500/15 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200 transition hover:bg-violet-500/25"
          >
            Upgrade to {tierLabel}
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
