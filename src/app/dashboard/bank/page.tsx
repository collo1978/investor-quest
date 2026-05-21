"use client";

import { DashboardSegmentBody } from "@/components/platform/DashboardSegmentBody";

export default function BankDashboardPage() {
  return (
    <DashboardSegmentBody
      segment="bank"
      title="Bank dashboard"
      subtitle="Financial education engagement · confidence signals (planned)"
      defaultPartnerType="bank"
    />
  );
}
