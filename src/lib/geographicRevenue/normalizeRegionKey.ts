/** Map filing region labels to stable map keys. */
export function normalizeRegionKey(label: string): string {
  const t = label.trim().toLowerCase();
  if (/^americas?$/.test(t) || /united states/.test(t)) return "americas";
  if (/^europe/.test(t)) return "europe";
  if (/greater\s+china/.test(t) || /^china$/.test(t)) return "greater_china";
  if (/^japan/.test(t)) return "japan";
  if (/rest\s+of\s+asia/.test(t) || /asia\s+pacific/.test(t)) return "rest_of_asia_pacific";
  return t.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "other";
}

export const CANONICAL_REGION_LABELS: Record<string, string> = {
  americas: "Americas",
  europe: "Europe",
  greater_china: "Greater China",
  japan: "Japan",
  rest_of_asia_pacific: "Rest of Asia Pacific"
};
