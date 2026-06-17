"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

/** Legacy route — redirects to stocks experience (screen 5). */
export default function SchoolsOnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace(
      resolveSchoolsLearnerHref("/schools/screen5-onboarding", pathname)
    );
  }, [pathname, router]);

  return null;
}
