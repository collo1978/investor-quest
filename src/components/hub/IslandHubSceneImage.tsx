"use client";

import Image from "next/image";
import { useState } from "react";

type ObjectPosition = "center" | "top";

type Props = {
  src: string;
  /** CSS background shown until the optimized image loads. */
  placeholderBg: string;
  /** Preset crop anchors, or any valid CSS `object-position` (e.g. `center 32%`). */
  objectPosition?: ObjectPosition | (string & {});
  imageClassName?: string;
};

/**
 * Pillar hub scenery — priority Next image (WebP) with a tinted
 * placeholder so quest cards are not on empty space while the asset loads.
 */
export function IslandHubSceneImage({
  src,
  placeholderBg,
  objectPosition = "center",
  imageClassName = ""
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const preset =
    objectPosition === "top"
      ? "object-top"
      : objectPosition === "center" || objectPosition == null
        ? "object-center"
        : "";
  const customObjectPosition =
    preset === "" && objectPosition ? objectPosition : undefined;

  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: placeholderBg,
          opacity: loaded ? 0 : 1
        }}
        aria-hidden
      />
      <Image
        src={src}
        alt=""
        fill
        priority
        unoptimized
        sizes="(max-width: 768px) 92vw, 1600px"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={
          customObjectPosition
            ? { objectPosition: customObjectPosition }
            : undefined
        }
        className={[
          `select-none object-cover ${preset} transition-opacity duration-500`,
          imageClassName,
          loaded ? "opacity-100" : "opacity-0"
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </>
  );
}
