import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Decode CTA attached to the lower edge of the paper. */
  action?: ReactNode;
  className?: string;
};

const EVIDENCE_FILE_FRAME_SRC =
  "/images/business-island/evidence-file-frame.png";

/**
 * Official 10-K evidence file — blank artwork frame + live quote + Decode.
 * Title, source, NVIDIA branding, tab, and stamp live in the image.
 */
export function Official10KEvidenceFile({
  children,
  action,
  className = ""
}: Props) {
  return (
    <div
      className={["iq-evidence-file", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Official 10-K evidence file"
    >
      <Image
        src={EVIDENCE_FILE_FRAME_SRC}
        alt=""
        width={1536}
        height={1024}
        className="iq-evidence-file__frame"
        priority
        unoptimized
      />

      <div className="iq-evidence-file__age" aria-hidden />

      <div className="iq-evidence-file__quote-slot">
        <blockquote className="iq-evidence-file__quote">{children}</blockquote>
      </div>

      {action ? <div className="iq-evidence-file__action">{action}</div> : null}
    </div>
  );
}
