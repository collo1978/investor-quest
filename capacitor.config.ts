import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor loads the live Next.js app over HTTPS (production) or your dev server (local).
 * Vercel web demo is unchanged — this wrapper only adds native iOS/Android shells.
 *
 * Local sync examples:
 *   set CAPACITOR_SERVER_URL=http://localhost:3003/schools/demo && npm run cap:sync
 *   set CAPACITOR_SERVER_URL=http://10.0.2.2:3003/schools/demo && npm run cap:sync
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL ??
  "https://investor-quest.vercel.app/schools/demo";

const isCleartext = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "com.investorquest.app",
  appName: "Investor Quest",
  webDir: "capacitor/www",
  server: {
    url: serverUrl,
    cleartext: isCleartext,
    androidScheme: isCleartext ? "http" : "https",
    iosScheme: isCleartext ? "http" : "https",
    allowNavigation: [
      "investor-quest.vercel.app",
      "localhost",
      "127.0.0.1",
      "10.0.2.2"
    ]
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#05010f",
    allowsLinkPreview: false
  },
  android: {
    backgroundColor: "#05010f",
    allowMixedContent: isCleartext
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#05010f",
      androidSplashResourceName: "splash",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#05010f"
    }
  }
};

export default config;
