/** Round to 2dp so SSR and client emit identical SVG attribute strings. */
export function svgCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  degrees: number
): { x: number; y: number } {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: svgCoord(cx + Math.cos(rad) * radius),
    y: svgCoord(cy + Math.sin(rad) * radius),
  };
}

export function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  degrees: number
): { x: number; y: number } {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: svgCoord(cx + Math.cos(rad) * rx),
    y: svgCoord(cy + Math.sin(rad) * ry),
  };
}
