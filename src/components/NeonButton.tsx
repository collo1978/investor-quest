"use client";

import Link from "next/link";
import * as React from "react";

type Props = {
  variant?: "primary" | "ghost";
  href?: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export function NeonButton({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: Props) {
  const base =
    [
      "relative inline-flex items-center justify-center gap-2 overflow-hidden",
      "rounded-[14px] px-4 py-[10px] text-sm font-semibold tracking-[-0.01em]",
      "transition-[transform,box-shadow,background-color,border-color] duration-200",
      "focus:outline-none focus:ring-2 focus:ring-neon-400/60 focus:ring-offset-0",
      "active:translate-y-[0.5px]",
      "disabled:cursor-not-allowed disabled:opacity-60"
    ].join(" ");
  const styles =
    variant === "ghost"
      ? [
          "border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] text-ink-0 backdrop-blur-xl",
          "shadow-[0_18px_55px_rgba(0,0,0,0.55)]",
          "hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(139,92,246,0.26)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.14),0_18px_55px_rgba(0,0,0,0.55),0_0_30px_rgba(139,92,246,0.10)]",
          "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-300",
          "before:bg-[radial-gradient(600px_260px_at_50%_0%,rgba(139,92,246,0.22),transparent_62%)]",
          "hover:before:opacity-100",
          "after:pointer-events-none after:absolute after:inset-0 after:opacity-80",
          "after:bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_38%)]",
          "after:[mask-image:radial-gradient(220px_120px_at_50%_0%,black,transparent_70%)]"
        ].join(" ")
      : [
          "border border-[rgba(139,92,246,0.44)] bg-[rgba(139,92,246,0.14)] text-neon-300 backdrop-blur-xl",
          "shadow-[0_0_0_1px_rgba(139,92,246,0.22),0_18px_55px_rgba(0,0,0,0.55),0_0_55px_rgba(139,92,246,0.12)]",
          "hover:bg-[rgba(139,92,246,0.18)] hover:border-[rgba(168,85,247,0.55)]",
          "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.30),0_18px_55px_rgba(0,0,0,0.55),0_0_75px_rgba(139,92,246,0.18)]",
          "before:pointer-events-none before:absolute before:inset-[-60%] before:opacity-0 before:transition before:duration-300",
          "before:bg-[conic-gradient(from_180deg,rgba(255,255,255,0.00),rgba(255,255,255,0.16),rgba(139,92,246,0.00),rgba(168,85,247,0.14),rgba(59,130,246,0.10),rgba(255,255,255,0.00))]",
          "before:[mask-image:radial-gradient(240px_140px_at_50%_40%,black,transparent_66%)]",
          "hover:before:opacity-100",
          "after:pointer-events-none after:absolute after:inset-0 after:opacity-90",
          "after:bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_38%)]",
          "after:[mask-image:radial-gradient(260px_140px_at_50%_0%,black,transparent_70%)]"
        ].join(" ");

  if (href) {
    return (
      <Link className={[base, styles, className ?? ""].join(" ")} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={[base, styles, className ?? ""].join(" ")}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

