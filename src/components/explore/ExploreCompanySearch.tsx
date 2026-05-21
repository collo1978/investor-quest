"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { CompanyBrandMark } from "@/components/CompanyBrandMark";
import type { Company } from "@/data/companies";
import {
  resolveCompanySearch,
  type CompanySearchRow
} from "@/lib/explore/resolveCompanySearch";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";

type Props = {
  /** Called after a supported company is selected (e.g. close mobile drawer). */
  onSelected?: () => void;
  className?: string;
};

const inputClass =
  "w-full rounded-xl border border-[rgba(139,92,246,0.28)] bg-[rgba(6,6,14,0.85)] px-3 py-2 text-sm text-ink-0 outline-none ring-0 placeholder:text-ink-2/80 focus:border-[rgba(168,85,247,0.55)] focus:shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_0_20px_-6px_rgba(168,85,247,0.35)]";

function StatusPill({
  supported
}: {
  supported: boolean;
}) {
  return (
    <span
      className={[
        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]",
        supported
          ? "border border-emerald-400/35 bg-emerald-500/10 text-emerald-200/95"
          : "border border-white/10 bg-white/[0.04] text-ink-2"
      ].join(" ")}
    >
      {supported ? "Supported" : "Coming soon"}
    </span>
  );
}

function UnsupportedLogo({ ticker }: { ticker: string }) {
  const initials = ticker.replace(/[^A-Z]/gi, "").slice(0, 2).toUpperCase() || "?";
  return (
    <span
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-[rgba(255,255,255,0.04)]"
      aria-hidden
    >
      <span className="font-[var(--font-grotesk)] text-[10px] font-bold tracking-tight text-ink-2">
        {initials}
      </span>
    </span>
  );
}

function SupportedResultRow({
  company,
  onSelect
}: {
  company: Company;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-[rgba(139,92,246,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
      role="option"
    >
      <CompanyBrandMark
        src={resolveCompanyLogoUrl(company, company.companyLogoUrl)}
        alt={company.name}
        ticker={company.ticker}
        className="h-8 w-8 shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-0">
          {company.name}
        </span>
        <span className="block text-[11px] font-medium text-violet-300/85">
          {company.ticker}
        </span>
      </span>
      <StatusPill supported />
    </button>
  );
}

function UnsupportedResultRow({ row }: { row: Extract<CompanySearchRow, { kind: "unsupported" }> }) {
  return (
    <div
      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg border border-dashed border-white/[0.08] bg-black/20 px-2 py-2 opacity-80"
      role="option"
      aria-disabled="true"
    >
      <UnsupportedLogo ticker={row.ticker} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-1">
          {row.label}
        </span>
        <span className="block text-[11px] text-ink-2">{row.ticker}</span>
        <span className="mt-1 block text-[10px] leading-snug text-ink-2/90">
          Dynamic company generation coming soon
        </span>
      </span>
      <StatusPill supported={false} />
    </div>
  );
}

function SearchResultRow({
  row,
  onSelectSupported
}: {
  row: CompanySearchRow;
  onSelectSupported: (company: Company) => void;
}) {
  if (row.kind === "supported") {
    return (
      <SupportedResultRow
        company={row.company}
        onSelect={() => onSelectSupported(row.company)}
      />
    );
  }
  return <UnsupportedResultRow row={row} />;
}

export function ExploreCompanySearch({ onSelected, className = "" }: Props) {
  const router = useRouter();
  const { actions } = useGame();
  const [query, setQuery] = useState("");

  const result = useMemo(() => resolveCompanySearch(query), [query]);

  const startCampaign = (company: Company) => {
    actions.setActiveCompany(company.id);
    setQuery("");
    onSelected?.();
    router.push("/map");
  };

  return (
    <div className={["space-y-2", className].join(" ")}>
      <label className="sr-only" htmlFor="explore-company-search">
        Search company or ticker
      </label>
      <input
        id="explore-company-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search company or ticker…"
        autoComplete="off"
        spellCheck={false}
        className={inputClass}
      />

      <AnimatePresence mode="wait" initial={false}>
        {result.kind === "results" && result.rows.length > 0 ? (
          <motion.ul
            key="results"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="m-0 max-h-[200px] list-none space-y-1 overflow-y-auto overscroll-y-contain rounded-xl border border-white/[0.08] bg-black/35 p-1.5 [-webkit-overflow-scrolling:touch]"
            role="listbox"
            aria-label="Company search results"
          >
            {result.rows.map((row) => (
              <li key={row.kind === "supported" ? row.company.id : `unsupported-${row.ticker}`}>
                <SearchResultRow row={row} onSelectSupported={startCampaign} />
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
