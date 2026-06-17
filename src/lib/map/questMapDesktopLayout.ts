/**
 * Cover-fit image box — fills the stage (may extend beyond edges; centered).
 * Matches CSS `background-size: cover` + `background-position: center`.
 */
export function computeDesktopCoverImageBox(
  stageWidth: number,
  stageHeight: number,
  aspect: number
): { w: number; h: number } {
  const stageAspect = stageWidth / stageHeight;
  let w: number;
  let h: number;
  if (stageAspect > aspect) {
    w = stageWidth;
    h = w / aspect;
  } else {
    h = stageHeight;
    w = h * aspect;
  }
  return { w: Math.round(w), h: Math.round(h) };
}
