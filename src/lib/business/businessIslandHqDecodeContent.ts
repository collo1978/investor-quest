/**
 * Headquarters Decode — multi-evidence mission from NVIDIA's 10-K Business section.
 * Exact company language in each evidence quote; do not rewrite filings.
 */

export type HqDecodeTermDef = {
  id: string;
  /** Exact substring in the evidence text (case-sensitive). */
  phrase: string;
  title: string;
  /** Plain-English explanation shown when the card expands. */
  explanation: string;
};

export type HqDecodeEvidencePiece = {
  id: string;
  /** Exact company sentences shown in the Official 10-K panel. */
  sentences: readonly string[];
  terms: readonly HqDecodeTermDef[];
  /** Plain-English takeaways after Decode. */
  takeaways: readonly string[];
};

export const HQ_DECODE_EVIDENCE: readonly HqDecodeEvidencePiece[] = [
  {
    id: "opening-identity",
    sentences: [
      "NVIDIA pioneered accelerated computing to help solve the most challenging computational problems.",
      "NVIDIA is now a full-stack computing infrastructure company with data-center-scale offerings that are reshaping industry."
    ],
    terms: [
      {
        id: "accelerated-computing",
        phrase: "accelerated computing",
        title: "Accelerated Computing",
        explanation:
          "Using specialised technology to solve difficult computing problems much faster than traditional computers."
      },
      {
        id: "full-stack-computing",
        phrase: "full-stack computing",
        title: "Full-Stack Computing",
        explanation:
          "Building the whole chain — chips, software, systems, and services — so customers get a complete platform, not just one piece."
      },
      {
        id: "data-center-scale",
        phrase: "data-center-scale",
        title: "Data-Center-Scale Computing",
        explanation:
          "Products built to power entire server rooms and cloud facilities — not just one laptop or phone."
      }
    ],
    takeaways: [
      "We solve difficult computing problems.",
      "We build complete AI systems.",
      "We power innovation across many industries."
    ]
  },
  {
    id: "cuda-software-stack",
    sentences: [
      "Our full-stack includes the foundational CUDA programming model that runs on all NVIDIA GPUs.",
      "This software stack accelerates AI, data analytics, scientific computing and 3D graphics across many industries."
    ],
    terms: [
      {
        id: "cuda",
        phrase: "CUDA",
        title: "CUDA",
        explanation:
          "NVIDIA's software language that lets programmers use its chips for many kinds of computing — not just graphics."
      },
      {
        id: "nvidia-gpu",
        phrase: "NVIDIA GPUs",
        title: "NVIDIA GPU",
        explanation:
          "NVIDIA's specialised computer chips that process heavy work much faster than ordinary processors."
      },
      {
        id: "data-analytics",
        phrase: "data analytics",
        title: "Data Analytics",
        explanation:
          "Turning large amounts of data into useful insights — spotting patterns, trends, and answers."
      },
      {
        id: "scientific-computing",
        phrase: "scientific computing",
        title: "Scientific Computing",
        explanation:
          "Using powerful computers to run research simulations — like weather, medicine, or physics experiments."
      }
    ],
    takeaways: [
      "NVIDIA doesn't just sell hardware.",
      "NVIDIA provides software that makes its hardware easy to use.",
      "This software helps power AI and many different industries."
    ]
  },
  {
    id: "gpu-platform",
    sentences: [
      "Our GPUs were initially used to address the needs of the PC market for high-quality graphics.",
      "As the usefulness of GPUs has expanded beyond traditional graphics and video, we have created and sold products for professional visualization, high-performance computing, and artificial intelligence markets."
    ],
    terms: [
      {
        id: "gpus",
        phrase: "GPUs",
        title: "GPUs",
        explanation:
          "Specialised computer chips originally built for graphics — now also used to train AI and run heavy scientific calculations."
      },
      {
        id: "professional-visualization",
        phrase: "professional visualization",
        title: "Professional Visualization",
        explanation:
          "Tools that help designers, engineers, and creators see and work with complex 3D models and images."
      },
      {
        id: "high-performance-computing",
        phrase: "high-performance computing",
        title: "High-Performance Computing",
        explanation:
          "Super-fast computers used for huge scientific and research problems that normal PCs can't handle."
      }
    ],
    takeaways: [
      "We started by making graphics much better.",
      "Our chips now power far more than games.",
      "We sell into AI, science, and professional design."
    ]
  },
  {
    id: "markets-value",
    sentences: [
      "We serve markets that benefit from our platform approach of bringing together hardware, networking, software, and libraries.",
      "Our products are designed to deliver greater performance and efficiency, helping customers train larger AI models, run more complex simulations, and create richer visual experiences."
    ],
    terms: [
      {
        id: "platform-approach",
        phrase: "platform approach",
        title: "Platform Approach",
        explanation:
          "Selling a complete toolkit that works together — not just one product — so customers get stronger results."
      },
      {
        id: "libraries",
        phrase: "libraries",
        title: "Libraries",
        explanation:
          "Ready-made software building blocks that help developers use NVIDIA hardware without writing everything from scratch."
      },
      {
        id: "ai-models",
        phrase: "AI models",
        title: "AI Models",
        explanation:
          "Computer systems trained to recognise patterns and make predictions — like the brains behind chatbots and image tools."
      }
    ],
    takeaways: [
      "We win by combining chips, software, and networking.",
      "Customers get more speed and efficiency from our stack.",
      "Our value is helping people build bigger AI and richer experiences."
    ]
  }
] as const;

export const HQ_FIRST_QUEST_ROUTE = "/business/what-they-do";

export const HQ_MISSION_BRIEF_OUTRO =
  "By the end of this mission, you'll understand:";

export const HQ_DECODE_MESSAGE_HEADING =
  "🤖 Here's what NVIDIA is really saying...";

export const HQ_DECODE_KEY_TERMS_HEADING = "📘 Key Terms They Mentioned";

export function formatOfficial10KSourceLabel(companyName: string): string {
  return `Source: ${companyName} Annual Report (10-K)`;
}

export function formatHqEvidenceProgress(
  index: number,
  total: number
): string {
  return `Evidence ${index + 1} of ${total}`;
}

export type HqDecodeParagraphSegment =
  | { kind: "text"; text: string }
  | { kind: "term"; termId: string; text: string };

function buildHqDecodeSentenceSegments(
  sentence: string,
  terms: readonly HqDecodeTermDef[]
): readonly HqDecodeParagraphSegment[] {
  const segments: HqDecodeParagraphSegment[] = [];
  let cursor = 0;

  const sortedTerms = [...terms]
    .filter((term) => sentence.includes(term.phrase))
    .sort((a, b) => sentence.indexOf(a.phrase) - sentence.indexOf(b.phrase));

  for (const term of sortedTerms) {
    const index = sentence.indexOf(term.phrase, cursor);
    if (index < 0) continue;
    if (index > cursor) {
      segments.push({ kind: "text", text: sentence.slice(cursor, index) });
    }
    segments.push({ kind: "term", termId: term.id, text: term.phrase });
    cursor = index + term.phrase.length;
  }

  if (cursor < sentence.length) {
    segments.push({ kind: "text", text: sentence.slice(cursor) });
  }

  return segments;
}

/** Split each evidence sentence into plain text + highlighted term segments. */
export function buildHqDecodeParagraphSegments(
  piece: HqDecodeEvidencePiece
): readonly (readonly HqDecodeParagraphSegment[])[] {
  return piece.sentences.map((sentence) =>
    buildHqDecodeSentenceSegments(sentence, piece.terms)
  );
}

/** @deprecated Prefer HQ_DECODE_EVIDENCE[0] — kept for any residual imports. */
export const HQ_DECODE_OPENING_SENTENCES = HQ_DECODE_EVIDENCE[0].sentences;
export const HQ_DECODE_OPENING_PARAGRAPH = HQ_DECODE_OPENING_SENTENCES.join(" ");
export const HQ_DECODE_TERMS = HQ_DECODE_EVIDENCE[0].terms;
export const HQ_DECODE_MESSAGE_TAKEAWAYS = HQ_DECODE_EVIDENCE[0].takeaways;
