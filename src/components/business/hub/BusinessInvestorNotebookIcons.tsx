import type { ReactElement, ReactNode } from "react";

import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";

type IconProps = { className?: string };

function Ico({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ICONS: Record<InvestorNotebookQuestionId, (p: IconProps) => ReactElement> = {
  "explain-what-does": ({ className }) => (
    <Ico className={className}>
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01M15 10h.01" />
    </Ico>
  ),
  "explain-value-prop": ({ className }) => (
    <Ico className={className}>
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
    </Ico>
  ),
  "explain-products": ({ className }) => (
    <Ico className={className}>
      <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" />
    </Ico>
  ),
  "explain-makes-money": ({ className }) => (
    <Ico className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10" />
      <path d="M9.5 9.5c.6-1 1.7-1.5 2.5-1.5 1.4 0 2.5.8 2.5 2s-1.1 2-2.5 2h-1c-1.4 0-2.5.8-2.5 2s1.1 2 2.5 2c.9 0 1.9-.5 2.5-1.4" />
    </Ico>
  ),
  "explain-customers": ({ className }) => (
    <Ico className={className}>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="9" r="2" />
      <path d="M3.5 19c.6-3 2.6-4.5 5.5-4.5S14 16 14.5 19" />
      <path d="M14 14.2c1.4-.5 2.9-.3 4.5 1.3.4.4.7 1.2.9 2.5" />
    </Ico>
  ),
  "explain-where-operates": ({ className }) => (
    <Ico className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.5 2.8 4 5.4 4 8s-1.5 5.2-4 8c-2.5-2.8-4-5.4-4-8s1.5-5.2 4-8z" />
    </Ico>
  ),
  "explain-evolution": ({ className }) => (
    <Ico className={className}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15v4M12 11v8M16 7v12" />
      <path d="M15 5h4v4" />
      <path d="M14 10l5-5" />
    </Ico>
  ),
  "explain-future-growth": ({ className }) => (
    <Ico className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Ico>
  ),
  "explain-competitive-advantage": ({ className }) => (
    <Ico className={className}>
      <path d="M12 3 5 6v5c0 5 3.2 7.8 7 9 3.8-1.2 7-4 7-9V6l-7-3z" />
      <path d="M9.5 12.2 11.2 14l3.4-3.6" />
    </Ico>
  ),
  "explain-how-operates": ({ className }) => (
    <Ico className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.2 6.2l1.6 1.6M16.2 16.2l1.6 1.6M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6" />
    </Ico>
  )
};

export function InvestorNotebookQuestionIcon({
  id,
  className
}: {
  id: InvestorNotebookQuestionId;
  className?: string;
}) {
  const Glyph = ICONS[id];
  return <Glyph className={className} />;
}

/** Glowing circuit-eye hero for the checklist header. */
export function InvestorChecklistCircuitEye({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      aria-hidden
      fill="none"
    >
      <defs>
        <radialGradient id="iq-eye-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#bef264" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#76b900" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#76b900" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="iq-eye-circuit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="58" rx="52" ry="38" fill="url(#iq-eye-glow)" opacity="0.55" />
      <path
        d="M18 58c18-28 42-42 62-42s44 14 62 42c-18 28-42 42-62 42S36 86 18 58z"
        stroke="url(#iq-eye-circuit)"
        strokeWidth="2.2"
        opacity="0.9"
      />
      <circle cx="80" cy="58" r="22" stroke="#76b900" strokeWidth="2" />
      <circle cx="80" cy="58" r="11" fill="#76b900" />
      <circle cx="80" cy="58" r="4.5" fill="#052e05" />
      <path d="M28 40h18M114 40h18M28 76h14M118 76h14" stroke="#76b900" strokeWidth="1.4" opacity="0.7" />
      <path d="M40 28v12M120 28v12M48 88v10M112 88v10" stroke="#76b900" strokeWidth="1.4" opacity="0.55" />
      <circle cx="28" cy="40" r="2" fill="#bef264" />
      <circle cx="132" cy="40" r="2" fill="#bef264" />
      <circle cx="28" cy="76" r="2" fill="#a3e635" />
      <circle cx="132" cy="76" r="2" fill="#a3e635" />
      <path
        d="M80 16v10M80 90v12M16 58h12M132 58h12"
        stroke="#bef264"
        strokeWidth="1.2"
        opacity="0.65"
      />
    </svg>
  );
}
