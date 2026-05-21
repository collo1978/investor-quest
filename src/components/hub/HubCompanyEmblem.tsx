"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import {
  emblemDisplayFilter,
  presetEmblemTreatment,
  resolveEmblemTreatment,
  type RocketEmblemTreatment
} from "@/lib/hub/rocketEmblemLogoStyle";

type Props = {
  logoUrl: string;
  companyName: string;
  /** Scene- or map-relative absolute placement. */
  position: CSSProperties;
  /** Classes on the inner logo bounds container. */
  innerSizeClass: string;
  imageWidth?: number;
  imageSizes?: string;
  altLabel?: string;
};

const EMBLEM_PLATE_CLASS =
  "rounded-md bg-black/60 ring-1 ring-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] p-[3px]";

/**
 * Company mark overlay on hub/map art — fixed anchor; dark plate blocks warm
 * artwork (e.g. orange rocket) bleeding through transparent logo SVGs.
 */
export function HubCompanyEmblem({
  logoUrl,
  companyName,
  position,
  innerSizeClass,
  imageWidth = 56,
  imageSizes = "72px",
  altLabel
}: Props) {
  const reduceMotion = useReducedMotion();
  const [treatment, setTreatment] = useState<RocketEmblemTreatment>(
    () => presetEmblemTreatment(logoUrl) ?? "color"
  );

  useEffect(() => {
    let cancelled = false;
    resolveEmblemTreatment(logoUrl).then((next) => {
      if (!cancelled) setTreatment(next);
    });
    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  const filter = emblemDisplayFilter(treatment);
  const alt = altLabel ?? `${companyName} emblem`;

  return (
    <motion.div
      className="pointer-events-none absolute z-[12] flex items-center justify-center"
      style={position}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        animate={reduceMotion ? undefined : { opacity: [0.92, 1, 0.92] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <span
          className={`relative flex items-center justify-center ${EMBLEM_PLATE_CLASS} ${innerSizeClass}`}
        >
          <Image
            src={logoUrl}
            alt={alt}
            width={imageWidth}
            height={imageWidth}
            unoptimized={logoUrl.startsWith("http")}
            className="h-full w-full object-contain transition-[filter] duration-500"
            style={{
              width: "auto",
              height: "auto",
              maxHeight: "100%",
              maxWidth: "100%",
              ...(filter ? { filter } : {})
            }}
            sizes={imageSizes}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}
