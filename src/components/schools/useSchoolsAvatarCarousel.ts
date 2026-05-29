"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";

import { SCHOOLS_AVATARS, type SchoolsAvatar, type SchoolsAvatarId } from "@/lib/schools/avatars";

export type SchoolsAvatarCarouselConfig = {
  slideVw: number;
  slideGap: number;
  velocityThreshold?: number;
  /** When false, swiping only moves the carousel — selection happens on tap. */
  selectOnSnap?: boolean;
};

export function useSchoolsAvatarCarousel(
  selectedId: SchoolsAvatarId | null,
  onSelect: (id: SchoolsAvatarId) => void,
  {
    slideVw,
    slideGap,
    velocityThreshold = 280,
    selectOnSnap = true
  }: SchoolsAvatarCarouselConfig
) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);

  const slideWidth = viewportWidth > 0 ? viewportWidth * slideVw : 280;
  const slideStep = slideWidth + slideGap;
  const sideInset = viewportWidth > 0 ? (viewportWidth - slideWidth) / 2 : 0;

  const snapX = useCallback(
    (i: number) => sideInset - i * slideStep,
    [sideInset, slideStep]
  );

  const snapToIndex = useCallback(
    (next: number, animateSnap = true, options?: { select?: boolean }) => {
      const clamped = Math.max(0, Math.min(SCHOOLS_AVATARS.length - 1, next));
      setIndex(clamped);
      const shouldSelect = options?.select ?? selectOnSnap;
      if (shouldSelect) {
        onSelect(SCHOOLS_AVATARS[clamped].id);
      }
      const target = snapX(clamped);
      if (animateSnap && !reduceMotion) {
        animate(x, target, { type: "spring", stiffness: 420, damping: 38 });
      } else {
        x.set(target);
      }
    },
    [onSelect, reduceMotion, selectOnSnap, snapX, x]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => setViewportWidth(el.clientWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    const match = SCHOOLS_AVATARS.findIndex((a) => a.id === selectedId);
    if (match >= 0 && match !== index) {
      setIndex(match);
    }
  }, [index, selectedId]);

  useEffect(() => {
    if (viewportWidth <= 0) return;
    x.set(snapX(index));
  }, [index, snapX, viewportWidth, x]);

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const current = x.get();
    const raw = (sideInset - current) / slideStep;
    let next = Math.round(raw);
    if (info.velocity.x < -velocityThreshold) next += 1;
    if (info.velocity.x > velocityThreshold) next -= 1;
    snapToIndex(next);
  };

  const activeAvatar: SchoolsAvatar =
    SCHOOLS_AVATARS.find((a) => a.id === selectedId) ?? SCHOOLS_AVATARS[index];

  const focusedAvatar: SchoolsAvatar = SCHOOLS_AVATARS[index];

  const dragMin = snapX(SCHOOLS_AVATARS.length - 1);
  const dragMax = snapX(0);

  return {
    trackRef,
    x,
    index,
    slideWidth,
    slideGap,
    snapToIndex,
    onDragEnd,
    dragMin,
    dragMax,
    activeAvatar,
    focusedAvatar
  };
}
