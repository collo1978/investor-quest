/** Stable number formatting (avoids locale hydration drift). */
export function formatAnalyticsNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/** Short UTC timestamp for dashboards (stable SSR + client). */
export function formatAnalyticsDateTimeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

/** UTC display for activity timestamps — no locale-dependent formatting. */
export function formatAnalyticsDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${min} UTC`;
}
