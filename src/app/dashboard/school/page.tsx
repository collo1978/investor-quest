"use client";

import { DashboardSegmentBody } from "@/components/platform/DashboardSegmentBody";

export default function SchoolDashboardPage() {
  return (
    <DashboardSegmentBody
      segment="school"
      title="School dashboard"
      subtitle="Student learning progress · quiz scores · completion rates"
      defaultPartnerType="school"
    />
  );
}
