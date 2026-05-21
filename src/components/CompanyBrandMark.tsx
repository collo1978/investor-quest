"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  emblemDisplayFilter,
  presetEmblemTreatment,
  resolveEmblemTreatment,
  type RocketEmblemTreatment
} from "@/lib/hub/rocketEmblemLogoStyle";

export type CompanyBrandMarkProps = {
  src: string;
  alt: string;
  /** Used for initials fallback when the image fails to load. */
  ticker?: string;
  className?: string;
};

function InitialsFallback({
  ticker,
  alt,
  className
}: {
  ticker?: string;
  alt: string;
  className: string;
}) {
  const raw = (ticker ?? alt).replace(/[^A-Za-z]/g, "");
  const initials = raw.slice(0, 2).toUpperCase() || "?";
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-[rgba(255,255,255,0.06)] ${className}`}
      aria-hidden
    >
      <span className="font-[var(--font-grotesk)] text-[10px] font-bold tracking-tight text-ink-1">
        {initials}
      </span>
    </span>
  );
}

/**
 * Company mark for dark glass UI (search, nav) — same logo URLs and treatment
 * rules as hub map emblems.
 */
export function CompanyBrandMark({
  src,
  alt,
  ticker,
  className = "h-8 w-8"
}: CompanyBrandMarkProps) {
  const trimmed = src.trim();
  const [treatment, setTreatment] = useState<RocketEmblemTreatment | null>(
    () => presetEmblemTreatment(trimmed)
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (!trimmed) return;

    let cancelled = false;
    resolveEmblemTreatment(trimmed).then((next) => {
      if (!cancelled) setTreatment(next);
    });
    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  if (!trimmed || failed) {
    return <InitialsFallback ticker={ticker} alt={alt} className={className} />;
  }

  const filter =
    treatment !== null ? emblemDisplayFilter(treatment) : undefined;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.12] bg-black/60 p-1 ring-1 ring-white/[0.14] ${className}`}
      title={alt}
    >
      <Image
        src={trimmed}
        alt={alt}
        width={32}
        height={32}
        unoptimized={trimmed.startsWith("http")}
        className="h-full w-full object-contain"
        style={filter ? { filter } : undefined}
        sizes="32px"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
