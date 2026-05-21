"use client";

import Image from "next/image";
import { useState } from "react";

type ObjectPosition = "center" | "top";

type Props = {
  src: string;
  /** CSS background shown until the optimized image loads. */
  placeholderBg: string;
  objectPosition?: ObjectPosition;
};

/**
 * Pillar hub scenery — priority Next image (WebP) with a tinted
 * placeholder so quest cards are not on empty space while the asset loads.
 */
export function IslandHubSceneImage({
  src,
  placeholderBg,
  objectPosition = "center"
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const objectClass =
    objectPosition === "top" ? "object-top" : "object-center";

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
        className={[
          `select-none object-cover ${objectClass} transition-opacity duration-500`,
          loaded ? "opacity-100" : "opacity-0"
        ].join(" ")}
      />
    </>
  );
}
