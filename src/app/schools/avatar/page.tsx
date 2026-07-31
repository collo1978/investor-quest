"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

/**
 * Legacy route — avatar (face) and armor (archetype) selection merged into
 * one step at `/schools/pick-avatar`. Redirects any stale mid-funnel link.
 */
export default function SchoolsAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace(resolveSchoolsLearnerHref("/schools/pick-avatar", pathname));
  }, [pathname, router]);

  return null;
}
