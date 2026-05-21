"use client";

import { DashboardSegmentBody } from "@/components/platform/DashboardSegmentBody";

export default function BrokerDashboardPage() {
  return (
    <DashboardSegmentBody
      segment="broker"
      title="Broker dashboard"
      subtitle="Investor engagement · quest completion · retention signals"
      defaultPartnerType="broker"
    />
  );
}
