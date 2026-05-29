/** Shared PWA identity for `/schools/demo` (iOS Add to Home Screen + Android install). */
export const SCHOOLS_DEMO_PWA = {
  appName: "Investor Quest",
  shortName: "IQ Schools",
  themeColor: "#05010f",
  backgroundColor: "#05010f",
  /** Add to Home Screen from this URL for correct standalone launch on iOS. */
  startPath: "/schools/demo/",
  scopePath: "/schools/demo/",
  manifestPath: "/schools/demo/manifest.webmanifest",
  appleTouchIconPath: "/schools/demo/apple-touch-icon.png",
  iconPath: "/logos/investor-quest-logo.png"
} as const;

export const SCHOOLS_DEMO_PRODUCTION_ORIGIN = "https://investor-quest.vercel.app";

export function getSchoolsDemoPwaOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? SCHOOLS_DEMO_PRODUCTION_ORIGIN;
}

export function getSchoolsDemoStartUrl(origin = SCHOOLS_DEMO_PRODUCTION_ORIGIN): string {
  return `${origin}${SCHOOLS_DEMO_PWA.startPath}`;
}

/** iOS Safari + installed web app detection. */
export function isIosStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

/** Register SW scoped to Schools demo (helps iOS treat A2HS as an installed web app). */
export function registerSchoolsDemoServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!window.location.pathname.startsWith("/schools/demo")) return;

  void navigator.serviceWorker.register("/sw-schools-demo.js", {
    scope: "/schools/demo/"
  });
}
