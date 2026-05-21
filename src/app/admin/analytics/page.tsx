"use client";

import dynamic from "next/dynamic";

const BehaviorIntelligenceDashboard = dynamic(
  () =>
    import("@/components/platform/BehaviorIntelligenceDashboard").then(
      (m) => m.BehaviorIntelligenceDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <p className="py-12 text-center text-sm text-white/50">
        Loading behavior intelligence…
      </p>
    )
  }
);

export default function AdminAnalyticsPage() {
  return <BehaviorIntelligenceDashboard />;
}
