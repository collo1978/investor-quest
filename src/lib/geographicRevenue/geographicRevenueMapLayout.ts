import type { GeographicRevenueRegionKey } from "@/lib/geographicRevenue/types";

export const GEO_MAP_VIEWBOX = { width: 1000, height: 520 } as const;

/** Globe frame (equirectangular projection clipped to sphere). */
export const GLOBE_FRAME = {
  cx: 500,
  cy: 262,
  rx: 468,
  ry: 228
} as const;

export type RegionMapLayout = {
  path: string;
  labelX: number;
  labelY: number;
};

/**
 * Full world landmass silhouettes (dim base under revenue highlights).
 * Equirectangular layout — reads as one connected world map inside the globe clip.
 */
export const WORLD_LAND_BASE_PATHS: readonly string[] = [
  // Americas (N + S)
  [
    "M 118 52",
    "C 168 38 228 42 278 58",
    "L 308 78 322 108 318 142",
    "L 298 178 272 208 248 248",
    "C 228 298 218 352 214 398",
    "L 218 442 248 478 288 498",
    "L 328 508 358 492 372 452",
    "L 382 388 388 318 392 248",
    "L 388 178 368 118 328 82",
    "L 268 58 198 48 148 48 Z"
  ].join(" "),
  // Greenland
  "M 318 42 L 352 36 378 48 372 68 348 78 322 72 308 56 Z",
  // Europe
  [
    "M 448 72",
    "L 488 58 528 62 558 82",
    "L 572 108 568 138 548 162",
    "L 512 172 478 168 452 152",
    "L 438 122 442 92 Z"
  ].join(" "),
  // Africa
  [
    "M 468 168",
    "L 508 158 542 172 558 208",
    "L 552 268 528 328 488 368",
    "L 448 378 422 352 412 298",
    "L 418 238 438 192 Z"
  ].join(" "),
  // Middle East / Central Asia
  [
    "M 528 148",
    "L 568 138 598 152 608 182",
    "L 598 218 568 238 532 228",
    "L 518 192 Z"
  ].join(" "),
  // Russia / North Asia
  [
    "M 548 72",
    "L 648 58 748 68 828 88",
    "L 868 118 872 152 848 178",
    "L 788 188 708 182 628 172",
    "L 558 158 528 128 532 98 Z"
  ].join(" "),
  // South / Southeast Asia (non-highlight context)
  [
    "M 548 198",
    "L 598 188 638 208 658 248",
    "L 648 298 618 338 588 368",
    "L 548 378 518 348 508 298",
    "L 518 238 Z"
  ].join(" "),
  // Australia
  [
    "M 698 328",
    "L 758 318 808 338 828 378",
    "L 812 418 768 438 718 432",
    "L 682 398 678 358 Z"
  ].join(" "),
  // Antarctica (subtle rim)
  "M 148 488 C 328 468 668 468 848 488 L 848 508 L 148 508 Z"
];

/**
 * Revenue region overlays — aligned to Apple 10-K geographic buckets on the world base.
 */
export const GEOGRAPHIC_REGION_MAP_LAYOUT: Record<
  GeographicRevenueRegionKey,
  RegionMapLayout
> = {
  americas: {
    path: [
      "M 122 56",
      "C 172 44 232 48 282 64",
      "L 312 88 322 128 318 168",
      "L 292 212 258 258",
      "C 232 318 222 378 220 428",
      "L 228 472 268 502 312 508",
      "L 352 492 368 438 378 358",
      "L 384 268 380 178 358 112",
      "L 308 72 248 58 182 52 Z"
    ].join(" "),
    labelX: 268,
    labelY: 268
  },
  europe: {
    path: [
      "M 452 78",
      "L 492 66 532 72 558 92",
      "L 568 122 558 152 532 172",
      "L 498 178 462 168 442 142",
      "L 438 108 444 86 Z"
    ].join(" "),
    labelX: 508,
    labelY: 122
  },
  greater_china: {
    path: [
      "M 592 88",
      "L 648 82 692 98 712 128",
      "L 708 168 678 192 638 198",
      "L 598 182 578 152",
      "L 582 112 Z"
    ].join(" "),
    labelX: 648,
    labelY: 138
  },
  japan: {
    path: [
      "M 718 98",
      "L 732 92 742 108 738 132",
      "L 724 142 708 128 Z",
      "M 744 108",
      "L 758 104 766 122 758 138",
      "L 746 134 Z"
    ].join(" "),
    labelX: 738,
    labelY: 118
  },
  rest_of_asia_pacific: {
    path: [
      "M 538 172",
      "L 578 162 618 178 642 212",
      "L 638 258 618 302 638 338",
      "L 682 358 738 348 788 368",
      "L 822 408 812 452 772 478",
      "L 718 492 662 482 618 452",
      "L 578 398 552 338 538 278",
      "L 528 218 Z"
    ].join(" "),
    labelX: 688,
    labelY: 328
  }
};

/** @deprecated Use WORLD_LAND_BASE_PATHS */
export const WORLD_MAP_CONTEXT_PATHS = WORLD_LAND_BASE_PATHS;
