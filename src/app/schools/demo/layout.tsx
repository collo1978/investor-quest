import type { Metadata, Viewport } from "next";

import { SchoolsDemoProductionLayout } from "@/components/schools/SchoolsDemoProductionLayout";
import {
  SCHOOLS_DEMO_PWA,
  SCHOOLS_DEMO_PRODUCTION_ORIGIN
} from "@/lib/schools/schoolsDemoPwa";

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? SCHOOLS_DEMO_PRODUCTION_ORIGIN
);

export const metadata: Metadata = {
  metadataBase,
  title: "Investor Quest — Schools Live Demo",
  description:
    "Scripted Schools tour: logo intro, avatar, onboarding, quest map, and business island.",
  applicationName: SCHOOLS_DEMO_PWA.appName,
  manifest: SCHOOLS_DEMO_PWA.manifestPath,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SCHOOLS_DEMO_PWA.appName
  },
  icons: {
    icon: [{ url: SCHOOLS_DEMO_PWA.iconPath, type: "image/png" }],
    apple: [
      {
        url: SCHOOLS_DEMO_PWA.appleTouchIconPath,
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  formatDetection: {
    telephone: false
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": SCHOOLS_DEMO_PWA.appName
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: SCHOOLS_DEMO_PWA.themeColor
};

export default function SchoolsDemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SchoolsDemoProductionLayout>{children}</SchoolsDemoProductionLayout>;
}
