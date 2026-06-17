import { preloadImage } from "@/lib/preloadImage";
import { SCHOOLS_ARMOR_GUIDE_IMAGE_SRC } from "@/lib/schools/schoolsArmorGuideConfig";
import { SCHOOLS_COMPANY_MASTERY_PROGRESS_IMAGE_SRC } from "@/lib/schools/schoolsCompanyMasteryConfig";
import { SCHOOLS_PROFILE_IMAGE_SRC } from "@/lib/schools/schoolsProfileConfig";

let armorGuideImageWarmed = false;
let companyMasteryImageWarmed = false;
let profileImageWarmed = false;

function deferSecondaryProfilePreloads(): void {
  const warm = () => {
    warmSchoolsArmorGuideImage();
    warmSchoolsCompanyMasteryImage();
  };
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(warm, { timeout: 2500 });
  } else {
    setTimeout(warm, 1);
  }
}

/** Preload armor guide poster (≈2MB) — call on CTA hover, not profile first paint. */
export function warmSchoolsArmorGuideImage(): void {
  if (armorGuideImageWarmed) return;
  armorGuideImageWarmed = true;
  preloadImage(SCHOOLS_ARMOR_GUIDE_IMAGE_SRC);
}

/** Preload company mastery progress poster — call on CTA hover, not profile first paint. */
export function warmSchoolsCompanyMasteryImage(): void {
  if (companyMasteryImageWarmed) return;
  companyMasteryImageWarmed = true;
  preloadImage(SCHOOLS_COMPANY_MASTERY_PROGRESS_IMAGE_SRC);
}

/** Preload profile poster — call before navigation to profile when possible. */
export function warmSchoolsProfileImage(): void {
  if (profileImageWarmed) return;
  profileImageWarmed = true;
  preloadImage(SCHOOLS_PROFILE_IMAGE_SRC);
}

/** Profile mount — profile art first; overlay posters idle-deferred. */
export function warmSchoolsProfileScreenAssets(): void {
  warmSchoolsProfileImage();
  deferSecondaryProfilePreloads();
}

/** Armor guide mount — warm profile art for Profile return. */
export function warmSchoolsArmorGuideScreenAssets(): void {
  warmSchoolsProfileImage();
}

/** Business conviction / quest — start profile download before route change. */
export function warmSchoolsProfileApproachAssets(): void {
  warmSchoolsProfileImage();
}
