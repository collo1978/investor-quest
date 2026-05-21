"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const OPS_LINKS = [
  { href: "/admin/game-health", label: "Health", short: "Health" },
  { href: "/admin/quest-generation", label: "Regenerate", short: "Regen" },
  { href: "/admin/prompts", label: "Prompts", short: "Prompts" }
] as const;

export function OpsQuickNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const partner = searchParams.get("partner");
  const qs = partner ? `?partner=${encodeURIComponent(partner)}` : "";

  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
      aria-label="Operations shortcuts"
    >
      {OPS_LINKS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={`${item.href}${qs}`}
            className={[
              "shrink-0 rounded-full px-4 py-2.5 text-[13px] font-bold touch-manipulation transition",
              active
                ? "bg-[var(--partner-primary)] text-black"
                : "border border-white/15 bg-white/5 text-white/80"
            ].join(" ")}
          >
            <span className="sm:hidden">{item.short}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
