"use client";

import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

export function OpsTouchButton({
  children,
  description,
  variant = "secondary",
  disabled,
  onClick,
  type = "button"
}: {
  children: ReactNode;
  description?: string;
  variant?: Variant;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "flex w-full min-h-[56px] flex-col items-start justify-center rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99] disabled:opacity-50 touch-manipulation";

  const variantClass =
    variant === "primary"
      ? "border-[var(--partner-primary)] bg-[var(--partner-primary)] text-black"
      : variant === "danger"
        ? "border-red-500/40 bg-red-500/10 text-red-50"
        : variant === "ghost"
          ? "border-transparent bg-transparent text-[var(--partner-primary)]"
          : "border-white/15 bg-white/5 text-white";

  const descClass =
    variant === "primary" ? "text-black/65" : "text-white/55";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variantClass}`}
    >
      <span className="text-[17px] font-bold leading-snug">{children}</span>
      {description ? (
        <span className={`mt-1 text-[14px] leading-snug ${descClass}`}>
          {description}
        </span>
      ) : null}
    </button>
  );
}
