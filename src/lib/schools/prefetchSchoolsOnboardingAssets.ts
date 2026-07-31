import { preloadImage } from "@/lib/preloadImage";
import { SCHOOLS_AVATARS } from "@/lib/schools/avatars";
import { SCHOOLS_ARMOR_IMAGE_SRC } from "@/lib/schools/schoolsArmorCardZones";
import { getSchoolsAvatarPortraitSrc } from "@/lib/schools/schoolsAvatarPortraits";

export function warmSchoolsAvatarPortraitImages(): void {
  for (const avatar of SCHOOLS_AVATARS) {
    preloadImage(getSchoolsAvatarPortraitSrc(avatar.id));
  }
}

export function warmSchoolsArmorPickerImage(): void {
  preloadImage(SCHOOLS_ARMOR_IMAGE_SRC);
}
