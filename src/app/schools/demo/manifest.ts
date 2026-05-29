import type { MetadataRoute } from "next";

/**
 * PWA manifest for `/schools/demo` — Add to Home Screen on iPhone / Android.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/schools/demo",
    name: "Investor Quest — Schools Demo",
    short_name: "IQ Schools",
    description:
      "Schools live demo: avatar, onboarding, quest map, and business island.",
    start_url: "/schools/demo",
    scope: "/schools/demo",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05010f",
    theme_color: "#05010f",
    icons: [
      {
        src: "/logos/investor-quest-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
