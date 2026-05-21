"use client";

import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";

export default function AdminRewardsPage() {
  const { partner } = usePartnerPreview();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Rewards</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          Reward model selects copy + fulfillment rails — values live in partner
          policy, not JSX literals.
        </p>
      </header>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
        <div>
          <span className="text-white/45">Model:</span>{" "}
          {partner.policy.rewardModelId}
        </div>
        <div className="mt-3">
          <span className="text-white/45">Broker rewards access:</span>{" "}
          {partner.policy.brokerRewardsAccess ? "yes" : "no"}
        </div>
      </div>
    </div>
  );
}
