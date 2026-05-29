/**
 * Native shell tweaks when running inside Capacitor (iOS/Android).
 * No-op on web / Vercel — the public demo is unchanged.
 */
export async function configureCapacitorNativeShell(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { SplashScreen } = await import("@capacitor/splash-screen");

    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#05010f" });
    await SplashScreen.hide();
  } catch {
    // Capacitor plugins unavailable (web-only install path).
  }
}

export async function isCapacitorNativeApp(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
