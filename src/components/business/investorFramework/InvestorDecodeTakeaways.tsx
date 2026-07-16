"use client";

type Props = {
  takeaways: readonly string[];
};

/** Simple vertical checklist — quick scan after decoding company language. */
export function InvestorDecodeTakeaways({ takeaways }: Props) {
  return (
    <ul className="iq-investor-decode-takeaways" aria-label="Key takeaways">
      {takeaways.map((text) => (
        <li key={text} className="iq-investor-decode-takeaways__item">
          ✅ {text}
        </li>
      ))}
    </ul>
  );
}
