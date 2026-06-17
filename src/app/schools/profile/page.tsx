import SchoolsProfileHub from "./SchoolsProfileHub";
import { SCHOOLS_PROFILE_IMAGE_SRC } from "@/lib/schools/schoolsProfileConfig";

/** Schools variant — student mastery + armor-forward profile. */
export default function SchoolsProfilePage() {
  return (
    <>
      <link rel="preload" as="image" href={SCHOOLS_PROFILE_IMAGE_SRC} />
      <SchoolsProfileHub />
    </>
  );
}
