"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject
} from "react";

/** Normalized rect on an image (0..1): left, top, width, height. */
export type NormRect = { l: number; t: number; w: number; h: number };

type ImageFramePct = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function rectToPctFrame(
  rootCr: DOMRectReadOnly,
  innerLeft: number,
  innerTop: number,
  innerW: number,
  innerH: number
): ImageFramePct {
  return {
    left: ((innerLeft - rootCr.left) / rootCr.width) * 100,
    top: ((innerTop - rootCr.top) / rootCr.height) * 100,
    width: (innerW / rootCr.width) * 100,
    height: (innerH / rootCr.height) * 100
  };
}

/**
 * For `object-fit: contain | cover | scale-down`, the painted bitmap is
 * inset (letterboxed) or cropped inside the `<img>` border box. Hotspots
 * must normalise against that **content** rect, not the full element.
 */
function getImageContentFramePct(
  img: HTMLImageElement,
  rootCr: DOMRectReadOnly
): ImageFramePct {
  const ir = img.getBoundingClientRect();
  const ew = ir.width;
  const eh = ir.height;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;

  if (!nw || !nh || ew <= 0 || eh <= 0) {
    return rectToPctFrame(rootCr, ir.left, ir.top, ew, eh);
  }

  const fit = window.getComputedStyle(img).objectFit;

  if (fit === "contain") {
    const scale = Math.min(ew / nw, eh / nh);
    const dispW = nw * scale;
    const dispH = nh * scale;
    const offX = (ew - dispW) / 2;
    const offY = (eh - dispH) / 2;
    return rectToPctFrame(rootCr, ir.left + offX, ir.top + offY, dispW, dispH);
  }

  if (fit === "scale-down") {
    const scale = Math.min(1, Math.min(ew / nw, eh / nh));
    const dispW = nw * scale;
    const dispH = nh * scale;
    const offX = (ew - dispW) / 2;
    const offY = (eh - dispH) / 2;
    return rectToPctFrame(rootCr, ir.left + offX, ir.top + offY, dispW, dispH);
  }

  if (fit === "cover") {
    const scale = Math.max(ew / nw, eh / nh);
    const dispW = nw * scale;
    const dispH = nh * scale;
    const offX = (ew - dispW) / 2;
    const offY = (eh - dispH) / 2;
    return rectToPctFrame(rootCr, ir.left + offX, ir.top + offY, dispW, dispH);
  }

  return rectToPctFrame(rootCr, ir.left, ir.top, ew, eh);
}

/**
 * Tracks the painted bitmap bounds of the first `<img>` inside
 * `containerRef` (honouring `object-fit`), relative to the container.
 *
 * Returns `null` until the image has measured at least once.
 */
export function useImageFrame(
  containerRef: RefObject<HTMLElement | null>
): ImageFramePct | null {
  const [frame, setFrame] = useState<ImageFramePct | null>(null);

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const img = root.querySelector("img");
    if (!img) return;
    const cr = root.getBoundingClientRect();
    if (cr.width <= 0 || cr.height <= 0) return;
    setFrame(getImageContentFramePct(img, cr));
  }, [containerRef]);

  useLayoutEffect(() => {
    measure();
    const root = containerRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    const img = root.querySelector("img");
    if (img) ro.observe(img);
    const onLoad = () => measure();
    img?.addEventListener("load", onLoad);
    if (img?.complete) queueMicrotask(measure);
    return () => {
      ro.disconnect();
      img?.removeEventListener("load", onLoad);
    };
  }, [measure, containerRef]);

  // Recompute on window resize as a defensive measure.
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return frame;
}

/**
 * Convert a normalized rect (relative to the **painted** image content for
 * `object-fit: contain` / `cover` / `scale-down`) into a CSS `style` object
 * positioning an absolute element inside the container.
 *
 * Falls back to container-relative positioning when the image frame is
 * not yet measured.
 */
export function hotspotStyle(
  frame: ImageFramePct | null,
  box: NormRect
): CSSProperties {
  if (frame) {
    return {
      left: `${frame.left + box.l * frame.width}%`,
      top: `${frame.top + box.t * frame.height}%`,
      width: `${box.w * frame.width}%`,
      height: `${box.h * frame.height}%`
    };
  }
  return {
    left: `${box.l * 100}%`,
    top: `${box.t * 100}%`,
    width: `${box.w * 100}%`,
    height: `${box.h * 100}%`
  };
}
