/** Shared PWA identity for `/schools/demo` (iOS Add to Home Screen + Android install). */
/** Bump when shipping Schools demo fixes so installed PWAs pick up new SW + assets. */
export const SCHOOLS_DEMO_SW_VERSION = "4";

export const SCHOOLS_DEMO_PWA = {
  appName: "Investor Quest",
  shortName: "IQ Schools",
  themeColor: "#05010f",
  backgroundColor: "#05010f",
  /** Add to Home Screen from this URL for correct standalone launch on iOS. */
  startPath: "/schools/demo",
  scopePath: "/schools/demo",
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

  const swUrl = `/sw-schools-demo.js?v=${SCHOOLS_DEMO_SW_VERSION}`;

  void (async () => {
    try {
      const existing = await navigator.serviceWorker.getRegistrations();
      for (const reg of existing) {
        const scriptUrl = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? "";
        if (
          scriptUrl.includes("/sw-schools-demo.js") &&
          !scriptUrl.includes(`v=${SCHOOLS_DEMO_SW_VERSION}`)
        ) {
          await reg.unregister();
        }
      }
    } catch {
      /* ignore */
    }

    await navigator.serviceWorker.register(swUrl, {
      scope: "/schools/demo"
    });
  })();
}
