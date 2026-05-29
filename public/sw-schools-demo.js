/**
 * Minimal service worker for /schools/demo PWA scope (iOS 16.4+ installability).
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Network-first — app is served by Next.js / Vercel.
});
