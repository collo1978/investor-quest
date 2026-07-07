"use client";

import { usePathname } from "next/navigation";

import { InvestorProfileDashboard } from "@/components/profile/InvestorProfileDashboard";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

/** Schools profile — same live dashboard as the main app. */
export default function SchoolsProfileHub() {
  const pathname = usePathname();
  const backHref = resolveSchoolsLearnerHref("/schools/map", pathname);

  return (
    <InvestorProfileDashboard
      variant="schools"
      backHref={backHref}
      backLabel="Back to map"
    />
  );
}
