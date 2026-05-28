"use client";

import { useMemo } from "react";

import { buildCopyChangeDiff, type CopyDiffSegment } from "@/lib/communicationQuality/copyChangeDiff";

function DiffLine({ segments }: { segments: CopyDiffSegment[] }) {
  return (
    <p className="text-[14px] leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.type === "removed") {
          return (
            <mark
              key={i}
              className="rounded-sm bg-rose-500/35 px-0.5 text-rose-100 line-through decoration-rose-300/80"
            >
              {seg.text}
            </mark>
          );
        }
        if (seg.type === "added") {
          return (
            <mark
              key={i}
              className="rounded-sm bg-emerald-500/35 px-0.5 font-medium text-emerald-50"
            >
              {seg.text}
            </mark>
          );
        }
        return (
          <span key={i} className="text-white/88">
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}

export function CopyChangeDiffView({
  before,
  after,
  removedPhrases
}: {
  before: string;
  after: string;
  removedPhrases?: string[];
}) {
  const diff = useMemo(() => buildCopyChangeDiff(before, after), [before, after]);
  const jargon = removedPhrases?.length ? removedPhrases : diff.removedPhrases;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80">
            Before — flagged
          </p>
          <div className="mt-2">
            <DiffLine segments={diff.beforeSegments} />
          </div>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
            After — rewritten
          </p>
          <div className="mt-2">
            <DiffLine segments={diff.afterSegments} />
          </div>
        </div>
      </div>

      {jargon.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-semibold text-white/45">Removed jargon:</span>
          {jargon.map((phrase) => (
            <span
              key={phrase}
              className="rounded-full border border-rose-400/35 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-medium text-rose-100"
            >
              {phrase}
            </span>
          ))}
        </div>
      ) : null}

      <p className="text-[11px] text-white/38">
        <span className="text-rose-300/90 line-through">Strikethrough</span> = removed wording ·{" "}
        <span className="rounded-sm bg-emerald-500/35 px-1 text-emerald-100">Highlight</span> =
        new wording
      </p>
    </div>
  );
}
