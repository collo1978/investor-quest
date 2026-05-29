"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";

export type HubQuestCarouselConfig = {
  slideVw: number;
  slideGap: number;
  velocityThreshold?: number;
};

export function useHubQuestCarousel(
  itemCount: number,
  initialIndex: number,
  { slideVw, slideGap, velocityThreshold = 280 }: HubQuestCarouselConfig
) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(itemCount - 1, initialIndex))
  );
  const x = useMotionValue(0);

  const slideWidth = viewportWidth > 0 ? viewportWidth * slideVw : 280;
  const slideStep = slideWidth + slideGap;
  const sideInset = viewportWidth > 0 ? (viewportWidth - slideWidth) / 2 : 0;

  const snapX = useCallback(
    (i: number) => sideInset - i * slideStep,
    [sideInset, slideStep]
  );

  const snapToIndex = useCallback(
    (next: number, animateSnap = true) => {
      if (itemCount <= 0) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, next));
      setIndex(clamped);
      const target = snapX(clamped);
      if (animateSnap && !reduceMotion) {
        animate(x, target, { type: "spring", stiffness: 420, damping: 38 });
      } else {
        x.set(target);
      }
    },
    [itemCount, reduceMotion, snapX, x]
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setViewportWidth(w);
        return;
      }
      if (typeof window !== "undefined") {
        setViewportWidth(window.innerWidth);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (itemCount <= 0) return;
    const clamped = Math.max(0, Math.min(itemCount - 1, initialIndex));
    setIndex(clamped);
  }, [initialIndex, itemCount]);

  useEffect(() => {
    if (viewportWidth <= 0 || itemCount <= 0) return;
    x.set(snapX(index));
  }, [index, itemCount, snapX, viewportWidth, x]);

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const current = x.get();
    const raw = (sideInset - current) / slideStep;
    let next = Math.round(raw);
    if (info.velocity.x < -velocityThreshold) next += 1;
    if (info.velocity.x > velocityThreshold) next -= 1;
    snapToIndex(next);
  };

  const onDrag = useCallback(() => {
    if (slideStep <= 0 || itemCount <= 0) return;
    const raw = (sideInset - x.get()) / slideStep;
    const next = Math.max(0, Math.min(itemCount - 1, Math.round(raw)));
    setIndex((prev) => (prev === next ? prev : next));
  }, [itemCount, sideInset, slideStep, x]);

  const dragMin = itemCount > 0 ? snapX(itemCount - 1) : 0;
  const dragMax = itemCount > 0 ? snapX(0) : 0;

  return {
    trackRef,
    x,
    index,
    slideWidth,
    slideGap,
    snapToIndex,
    onDrag,
    onDragEnd,
    dragMin,
    dragMax
  };
}
