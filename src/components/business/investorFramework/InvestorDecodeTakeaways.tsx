"use client";

type Props = {
  takeaways: readonly string[];
  /** Optional real-world analogy shown as a distinct "example" line. */
  analogy?: string;
};

/** Simple vertical checklist — quick scan after decoding company language. */
export function InvestorDecodeTakeaways({ takeaways, analogy }: Props) {
  return (
    <ul className="iq-investor-decode-takeaways" aria-label="Key takeaways">
      {takeaways.map((text) => (
        <li key={text} className="iq-investor-decode-takeaways__item">
          ✅ {text}
        </li>
      ))}
      {analogy ? (
        <li className="iq-investor-decode-takeaways__analogy">
          <span className="iq-investor-decode-takeaways__analogy-label">
            <span aria-hidden>💡</span> Think of it like…
          </span>
          <span className="iq-investor-decode-takeaways__analogy-text">
            {analogy}
          </span>
        </li>
      ) : null}
    </ul>
  );
}
