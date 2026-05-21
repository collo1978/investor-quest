"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { OpsQuickNav } from "@/components/operations/OpsQuickNav";

export function OpsPageShell({
  title,
  subtitle,
  children,
  showQuickNav = true,
  showBackLink = true,
  backHref = "/admin/game-health"
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showQuickNav?: boolean;
  showBackLink?: boolean;
  backHref?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-28 sm:max-w-2xl md:max-w-4xl md:pb-16">
      <header className="space-y-2">
        {showBackLink ? (
          <Link
            href={backHref}
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--partner-primary)] touch-manipulation"
          >
            ← Mission Control
          </Link>
        ) : null}
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300/75">
          Investor Quest · Operations
        </p>
        <h1 className="font-[var(--font-grotesk)] text-2xl leading-tight text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-[15px] leading-relaxed text-white/60">{subtitle}</p>
        ) : null}
      </header>

      {showQuickNav ? <OpsQuickNav /> : null}

      {children}
    </div>
  );
}
