"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useState } from "react";

import { SchoolsArmorGuidePanel } from "@/components/schools/SchoolsArmorGuidePanel";
import { SchoolsCompanyMasteryPanel } from "@/components/schools/SchoolsCompanyMasteryPanel";
import {
  SCHOOLS_PROFILE_ARMOR_GUIDE_HIT,
  SCHOOLS_PROFILE_COMPANY_MASTERY_CTA_HIT,
  SCHOOLS_PROFILE_IMAGE_NATURAL,
  SCHOOLS_PROFILE_IMAGE_SRC,
  SCHOOLS_PROFILE_XP_LADDER_HIT
} from "@/lib/schools/schoolsProfileConfig";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import {
  warmSchoolsArmorGuideImage,
  warmSchoolsCompanyMasteryImage,
  warmSchoolsProfileScreenAssets
} from "@/lib/schools/prefetchSchoolsProfileLinks";

const { width: ART_W, height: ART_H } = SCHOOLS_PROFILE_IMAGE_NATURAL;
const ART_ASPECT = ART_W / ART_H;

/** Schools profile — full-viewport artwork deck (mirrors Business Island layout). */
export default function SchoolsProfileHub() {
  const pathname = usePathname();
  const router = useRouter();
  const xpLadderHref = resolveSchoolsLearnerHref("/schools/xp-ladder", pathname);
  const [armorGuideOpen, setArmorGuideOpen] = useState(false);
  const [companyMasteryOpen, setCompanyMasteryOpen] = useState(false);

  useLayoutEffect(() => {
    warmSchoolsProfileScreenAssets();
  }, []);

  const openArmorGuide = useCallback(() => {
    warmSchoolsArmorGuideImage();
    setArmorGuideOpen(true);
  }, []);

  const closeArmorGuide = useCallback(() => {
    setArmorGuideOpen(false);
  }, []);

  const openCompanyMastery = useCallback(() => {
    warmSchoolsCompanyMasteryImage();
    setCompanyMasteryOpen(true);
  }, []);

  const closeCompanyMastery = useCallback(() => {
    setCompanyMasteryOpen(false);
  }, []);

  const openXpLadder = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!pathname || !isSchoolsDemoPath(pathname)) return;
      e.preventDefault();
      navigateSchoolsDemoStep("xp-ladder", pathname, router);
    },
    [pathname, router]
  );

  return (
    <>
      <main
        className="iq-schools-profile-hub-main iq-schools-profile-deck pointer-events-auto relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#040308]"
        aria-label="Your investor profile"
        style={{ ["--iq-profile-art-aspect" as string]: ART_ASPECT }}
      >
        <div className="iq-schools-profile-hub-stage flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <div className="iq-schools-profile-scene-root w-full">
            <div className="iq-schools-profile-scene-scroll w-full">
              <div className="iq-schools-profile-scene-frame relative flex w-full flex-col">
                <div className="iq-schools-profile-art-stage relative">
                  <img
                    src={SCHOOLS_PROFILE_IMAGE_SRC}
                    alt="Your investor profile"
                    width={ART_W}
                    height={ART_H}
                    decoding="async"
                    fetchPriority="high"
                    draggable={false}
                    className="iq-schools-profile-scene-art pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain"
                  />

                  <div className="pointer-events-none absolute inset-0 z-10">
                    <button
                      type="button"
                      aria-label="View armor guide"
                      onClick={openArmorGuide}
                      onMouseEnter={warmSchoolsArmorGuideImage}
                      onFocus={warmSchoolsArmorGuideImage}
                      onTouchStart={warmSchoolsArmorGuideImage}
                      className="iq-schools-profile-armor-guide-btn pointer-events-auto absolute z-20 m-0 inline-flex cursor-pointer items-center justify-center border-0 p-0"
                      style={{
                        left: `${SCHOOLS_PROFILE_ARMOR_GUIDE_HIT.left}%`,
                        top: `${SCHOOLS_PROFILE_ARMOR_GUIDE_HIT.top}%`,
                        width: `${SCHOOLS_PROFILE_ARMOR_GUIDE_HIT.width}%`,
                        height: `${SCHOOLS_PROFILE_ARMOR_GUIDE_HIT.height}%`
                      }}
                    >
                      Armor guide
                    </button>

                    <button
                      type="button"
                      aria-label="View company mastery"
                      onClick={openCompanyMastery}
                      onMouseEnter={warmSchoolsCompanyMasteryImage}
                      onFocus={warmSchoolsCompanyMasteryImage}
                      onTouchStart={warmSchoolsCompanyMasteryImage}
                      className="iq-schools-profile-company-mastery-btn pointer-events-auto absolute z-20 m-0 inline-flex cursor-pointer items-center justify-center border-0 p-0"
                      style={{
                        left: `${SCHOOLS_PROFILE_COMPANY_MASTERY_CTA_HIT.left}%`,
                        top: `${SCHOOLS_PROFILE_COMPANY_MASTERY_CTA_HIT.top}%`,
                        width: `${SCHOOLS_PROFILE_COMPANY_MASTERY_CTA_HIT.width}%`,
                        height: `${SCHOOLS_PROFILE_COMPANY_MASTERY_CTA_HIT.height}%`
                      }}
                    >
                      View
                    </button>

                    <Link
                      href={xpLadderHref}
                      onClick={openXpLadder}
                      aria-label="View XP Ladder"
                      className="iq-schools-profile-xp-ladder-btn pointer-events-auto absolute z-20 inline-flex cursor-pointer items-center justify-center no-underline"
                      style={{
                        left: `${SCHOOLS_PROFILE_XP_LADDER_HIT.left}%`,
                        top: `${SCHOOLS_PROFILE_XP_LADDER_HIT.top}%`,
                        width: `${SCHOOLS_PROFILE_XP_LADDER_HIT.width}%`,
                        height: `${SCHOOLS_PROFILE_XP_LADDER_HIT.height}%`
                      }}
                    >
                      XP LADDER
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {armorGuideOpen ? (
        <SchoolsArmorGuidePanel onClose={closeArmorGuide} variant="overlay" />
      ) : null}

      {companyMasteryOpen ? (
        <SchoolsCompanyMasteryPanel onClose={closeCompanyMastery} variant="overlay" />
      ) : null}
    </>
  );
}
