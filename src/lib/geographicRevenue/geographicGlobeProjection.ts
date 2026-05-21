import {
  GEO_MAP_VIEWBOX,
  GEOGRAPHIC_REGION_MAP_LAYOUT,
  WORLD_MAP_CONTEXT_PATHS
} from "@/lib/geographicRevenue/geographicRevenueMapLayout";
import type { GeographicRevenueRegionKey } from "@/lib/geographicRevenue/types";

const DEG = Math.PI / 180;

export type GlobeProjectionConfig = {
  centerLon: number;
  centerLat: number;
  radius: number;
  cx: number;
  cy: number;
};

export type ProjectedPoint = {
  x: number;
  y: number;
  visible: boolean;
};

/** Parse SVG path vertices (M/L/C endpoints) → equirectangular lat/lon. */
export function pathToLatLonPoints(
  d: string,
  viewW = GEO_MAP_VIEWBOX.width,
  viewH = GEO_MAP_VIEWBOX.height
): { lat: number; lon: number }[] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g);
  if (!tokens?.length) return [];

  const points: { lat: number; lon: number }[] = [];
  let i = 0;
  let cmd = "";
  let cx = 0;
  let cy = 0;

  const push = (x: number, y: number) => {
    cx = x;
    cy = y;
    points.push({
      lon: (x / viewW) * 360 - 180,
      lat: 90 - (y / viewH) * 180
    });
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-zA-Z]$/.test(t)) {
      cmd = t;
      i++;
      continue;
    }
    const readNum = () => parseFloat(tokens[i++]);

    if (cmd === "M" || cmd === "L") {
      push(readNum(), readNum());
    } else if (cmd === "C") {
      readNum();
      readNum();
      readNum();
      readNum();
      push(readNum(), readNum());
    } else if (cmd === "Z") {
      // close
    } else {
      i++;
    }
  }

  return points;
}

export function projectLatLon(
  lat: number,
  lon: number,
  cfg: GlobeProjectionConfig
): ProjectedPoint {
  const phi = lat * DEG;
  const lam = lon * DEG;
  const phi0 = cfg.centerLat * DEG;
  const lam0 = cfg.centerLon * DEG;

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dLam = lam - lam0;

  const x = cosPhi * Math.sin(dLam);
  const y =
    Math.cos(phi0) * sinPhi - Math.sin(phi0) * cosPhi * Math.cos(dLam);
  const z =
    Math.sin(phi0) * sinPhi + Math.cos(phi0) * cosPhi * Math.cos(dLam);

  const visible = z > 0.04;

  return {
    x: cfg.cx + cfg.radius * x,
    y: cfg.cy - cfg.radius * y,
    visible
  };
}

/** Build SVG path on the visible hemisphere; breaks at horizon. */
export function latLonRingToSvgPath(
  ring: { lat: number; lon: number }[],
  cfg: GlobeProjectionConfig
): string | null {
  const parts: string[] = [];
  let started = false;

  for (const p of ring) {
    const pt = projectLatLon(p.lat, p.lon, cfg);
    if (!pt.visible) {
      started = false;
      continue;
    }
    if (!started) {
      parts.push(`M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
      started = true;
    } else {
      parts.push(`L ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
    }
  }

  if (parts.length < 3) return null;
  parts.push("Z");
  return parts.join(" ");
}

export function regionCentroidLatLon(regionKey: GeographicRevenueRegionKey): {
  lat: number;
  lon: number;
} {
  const layout = GEOGRAPHIC_REGION_MAP_LAYOUT[regionKey];
  const pts = pathToLatLonPoints(layout.path);
  if (!pts.length) return { lat: 0, lon: 0 };
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lon = pts.reduce((s, p) => s + p.lon, 0) / pts.length;
  return { lat, lon };
}

/** Label anchor on the visible face of the globe (centroid of projected ring). */
export function projectedRegionLabelPoint(
  regionKey: GeographicRevenueRegionKey,
  cfg: GlobeProjectionConfig
): { x: number; y: number } | null {
  const ring = getRegionLatLonRing(regionKey);
  const projected = ring
    .map((p) => projectLatLon(p.lat, p.lon, cfg))
    .filter((p) => p.visible);

  if (projected.length < 2) return null;

  let x = projected.reduce((s, p) => s + p.x, 0) / projected.length;
  let y = projected.reduce((s, p) => s + p.y, 0) / projected.length;

  const dx = x - cfg.cx;
  const dy = y - cfg.cy;
  const dist = Math.hypot(dx, dy);
  const maxDist = cfg.radius * 0.78;
  if (dist > maxDist && dist > 0) {
    const t = maxDist / dist;
    x = cfg.cx + dx * t;
    y = cfg.cy + dy * t;
  }

  return { x, y };
}

export function getRegionLatLonRing(
  regionKey: GeographicRevenueRegionKey
): { lat: number; lon: number }[] {
  return pathToLatLonPoints(GEOGRAPHIC_REGION_MAP_LAYOUT[regionKey].path);
}

export function getContextLandRings(): { lat: number; lon: number }[][] {
  return WORLD_MAP_CONTEXT_PATHS.map((d) => pathToLatLonPoints(d));
}

export const DEFAULT_GLOBE_VIEW = {
  centerLon: -55,
  centerLat: 12,
  /** Inner globe coordinate space (cx/cy = size/2). */
  size: 400,
  radius: 148,
  /** Bleed around sphere for atmosphere + glow (prevents clipping). */
  pad: 36
} as const;

export function globeViewBox(): {
  minX: number;
  minY: number;
  width: number;
  height: number;
} {
  const { size, pad } = DEFAULT_GLOBE_VIEW;
  return {
    minX: -pad,
    minY: -pad,
    width: size + pad * 2,
    height: size + pad * 2
  };
}
