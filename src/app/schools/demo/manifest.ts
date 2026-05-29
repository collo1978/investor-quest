import type { MetadataRoute } from "next";

import {
  SCHOOLS_DEMO_PWA,
  SCHOOLS_DEMO_PRODUCTION_ORIGIN,
  getSchoolsDemoStartUrl
} from "@/lib/schools/schoolsDemoPwa";

/**
 * Web app manifest for `/schools/demo` — iOS 16.4+ and Android Add to Home Screen.
 * Linked via layout metadata + served at `/schools/demo/manifest.webmanifest`.
 */
export default function manifest(): MetadataRoute.Manifest {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? SCHOOLS_DEMO_PRODUCTION_ORIGIN;

  return {
    id: getSchoolsDemoStartUrl(origin),
    name: SCHOOLS_DEMO_PWA.appName,
    short_name: SCHOOLS_DEMO_PWA.shortName,
    description:
      "Schools live demo: avatar, onboarding, quest map, and business island.",
    start_url: SCHOOLS_DEMO_PWA.startPath,
    scope: SCHOOLS_DEMO_PWA.scopePath,
    display: "standalone",
    display_override: ["standalone", "fullscreen"],
    orientation: "portrait",
    background_color: SCHOOLS_DEMO_PWA.backgroundColor,
    theme_color: SCHOOLS_DEMO_PWA.themeColor,
    prefer_related_applications: false,
    icons: [
      {
        src: SCHOOLS_DEMO_PWA.appleTouchIconPath,
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      },
      {
        src: SCHOOLS_DEMO_PWA.iconPath,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
