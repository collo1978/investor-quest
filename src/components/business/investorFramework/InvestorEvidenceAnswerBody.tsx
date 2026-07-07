"use client";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { InvestorEvidenceAnswerContent } from "@/lib/business/resolveInvestorEvidenceAnswerContent";

type Props = {
  content: InvestorEvidenceAnswerContent;
  theme: PillarQuestTheme;
};

/**
 * Fixed A-section for every investor evidence card — headline, body, optional bullets/callout.
 * Same structure on every card; only content changes.
 */
export function InvestorEvidenceAnswerBody({ content, theme }: Props) {
  const isMission = theme.cardChrome === "mission";

  return (
    <div className="iq-investor-evidence-answer w-full space-y-6 sm:space-y-7">
      <h2 className="iq-investor-evidence-answer__headline">{content.headline}</h2>

      {content.body ? (
        <p className="iq-investor-evidence-answer__body">{content.body}</p>
      ) : null}

      {content.bullets && content.bullets.length > 0 ? (
        <ul className="iq-investor-evidence-answer__bullets">
          {content.bullets.map((item) => (
            <li key={item} className="iq-investor-evidence-answer__bullet-item">
              <span className="iq-investor-evidence-answer__bullet-dot" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {content.callout ? (
        <div
          className="iq-investor-evidence-answer__callout"
          style={
            isMission
              ? undefined
              : {
                  borderColor: theme.borderSoft,
                  background: theme.glowSoft
                }
          }
        >
          {content.callout}
        </div>
      ) : null}
    </div>
  );
}
