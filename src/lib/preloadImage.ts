/** Fire-and-forget browser preload (client-only). */
export function preloadImage(src: string): void {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}
