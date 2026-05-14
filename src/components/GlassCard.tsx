"use client";

import { type HTMLAttributes } from "react";

export function GlassCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-panel-border bg-panel p-5 shadow-glow backdrop-blur-xl",
        "relative overflow-hidden",
        className ?? ""
      ].join(" ")}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.10)] via-transparent to-[rgba(59,130,246,0.06)]" />
      <div className="relative">{props.children}</div>
    </div>
  );
}

