import type { Metadata, Viewport } from "next";

import { SchoolsDemoProductionLayout } from "@/components/schools/SchoolsDemoProductionLayout";

export const metadata: Metadata = {
  title: "Investor Quest — Schools Live Demo",
  description:
    "Scripted Schools tour: logo intro, avatar, onboarding, quest map, and business island.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Investor Quest"
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05010f"
};

export default function SchoolsDemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SchoolsDemoProductionLayout>{children}</SchoolsDemoProductionLayout>;
}
