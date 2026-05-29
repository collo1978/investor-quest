"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";

export type HubQuestCarouselAxis = "horizontal" | "vertical";

export type HubQuestCarouselConfig = {
  axis?: HubQuestCarouselAxis;
  /** Fraction of viewport width per slide (horizontal). */
  slideVw?: number;
  /** Fraction of viewport height per slide (vertical). */
  slideVh?: number;
  slideGap: number;
  velocityThreshold?: number;
};

export function useHubQuestCarousel(
  itemCount: number,
  initialIndex: number,
  {
    axis = "horizontal",
    slideVw = 0.86,
    slideVh = 0.52,
    slideGap,
    velocityThreshold = 280
  }: HubQuestCarouselConfig
) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState(0);
  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(Math.max(itemCount - 1, 0), initialIndex))
  );
  const offset = useMotionValue(0);

  const vertical = axis === "vertical";
  const slideSize =
    viewportSize > 0
      ? viewportSize * (vertical ? slideVh : slideVw)
      : vertical
        ? 220
        : 280;
  const slideStep = slideSize + slideGap;
  const sideInset = viewportSize > 0 ? (viewportSize - slideSize) / 2 : 0;

  const snapOffset = useCallback(
    (i: number) => sideInset - i * slideStep,
    [sideInset, slideStep]
  );

  const snapToIndex = useCallback(
    (next: number, animateSnap = true) => {
      if (itemCount <= 0) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, next));
      setIndex(clamped);
      const target = snapOffset(clamped);
      if (animateSnap && !reduceMotion) {
        animate(offset, target, { type: "spring", stiffness: 420, damping: 38 });
      } else {
        offset.set(target);
      }
    },
    [itemCount, offset, reduceMotion, snapOffset]
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const size = vertical ? el.clientHeight : el.clientWidth;
      if (size > 0) {
        setViewportSize(size);
        return;
      }
      if (typeof window !== "undefined") {
        setViewportSize(vertical ? window.innerHeight : window.innerWidth);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vertical]);

  useLayoutEffect(() => {
    if (itemCount <= 0) return;
    const clamped = Math.max(0, Math.min(itemCount - 1, initialIndex));
    setIndex(clamped);
  }, [initialIndex, itemCount]);

  useLayoutEffect(() => {
    if (viewportSize <= 0 || itemCount <= 0) return;
    offset.set(snapOffset(index));
  }, [index, itemCount, offset, snapOffset, viewportSize]);

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const current = offset.get();
    const raw = (sideInset - current) / slideStep;
    let next = Math.round(raw);
    const velocity = vertical ? info.velocity.y : info.velocity.x;
    if (velocity < -velocityThreshold) next += 1;
    if (velocity > velocityThreshold) next -= 1;
    snapToIndex(next);
  };

  const onDrag = useCallback(() => {
    if (slideStep <= 0 || itemCount <= 0) return;
    const raw = (sideInset - offset.get()) / slideStep;
    const next = Math.max(0, Math.min(itemCount - 1, Math.round(raw)));
    setIndex((prev) => (prev === next ? prev : next));
  }, [itemCount, offset, sideInset, slideStep]);

  const dragMin = itemCount > 0 ? snapOffset(itemCount - 1) : 0;
  const dragMax = itemCount > 0 ? snapOffset(0) : 0;

  return {
    trackRef,
    offset,
    index,
    slideSize,
    slideGap,
    snapToIndex,
    onDrag,
    onDragEnd,
    dragMin,
    dragMax,
    vertical
  };
}
