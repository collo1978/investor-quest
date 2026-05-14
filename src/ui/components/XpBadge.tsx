"use client";

export type XpBadgeProps = {
  amount: number;
  /** "reward" shows "+N XP"; "earned" shows neutral. */
  variant?: "reward" | "earned";
  size?: "xs" | "sm" | "md";
};

const SIZE: Record<NonNullable<XpBadgeProps["size"]>, string> = {
  xs: "px-1.5 py-0.5 text-[10px]",
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs"
};

/**
 * Reusable XP indicator used across cards, modals, and toasts.
 */
export function XpBadge({ amount, variant = "reward", size = "sm" }: XpBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] text-neon-300",
        SIZE[size]
      ].join(" ")}
    >
      <span aria-hidden>✦</span>
      <span>
        {variant === "reward" ? "+" : ""}
        {amount} XP
      </span>
    </span>
  );
}
