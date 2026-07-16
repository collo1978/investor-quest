import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import type {
  BusinessIslandPlaceTheme,
  BusinessIslandStoryLocationId
} from "@/lib/business/businessIslandStoryLocations";

export type DistrictMissionExperience = {
  questionId: InvestorNotebookQuestionId;
  /** Short mission title inside the district. */
  missionTitle: string;
  insights: readonly string[];
};

export type BusinessIslandLocationExperienceDef = {
  locationId: BusinessIslandStoryLocationId;
  roomName: string;
  ambience: string;
  missions: readonly DistrictMissionExperience[];
};

/**
 * District rooms — each landmark hosts its checklist missions.
 */
export const BUSINESS_ISLAND_LOCATION_EXPERIENCES: Record<
  BusinessIslandStoryLocationId,
  BusinessIslandLocationExperienceDef
> = {
  "district-hq": {
    locationId: "district-hq",
    roomName: "Headquarters",
    ambience:
      "Black glass towers pulse with neon green — the campus heart where NVIDIA's identity is defined.",
    missions: [
      {
        questionId: "explain-what-does",
        missionTitle: "What NVIDIA does",
        insights: [
          "NVIDIA designs accelerated computing platforms — hardware and software that make hard compute problems solvable.",
          "Its core role is enabling AI training and inference, plus graphics and scientific computing.",
          "If you can say what NVIDIA does in one clear sentence, you have the foundation for every later judgement."
        ]
      },
      {
        questionId: "explain-value-prop",
        missionTitle: "Why customers choose NVIDIA",
        insights: [
          "Customers come for performance they cannot easily get elsewhere — plus a deep software and developer ecosystem.",
          "The value proposition is not only chips; it is an end-to-end platform that shortens time-to-result.",
          "Investors care because a lasting value prop creates stickiness and pricing power."
        ]
      }
    ]
  },
  "district-showroom": {
    locationId: "district-showroom",
    roomName: "Products Center",
    ambience:
      "GPUs, AI servers, and holographic product towers rotate under neon lighting — NVIDIA's catalogue in one room.",
    missions: [
      {
        questionId: "explain-products",
        missionTitle: "What NVIDIA sells",
        insights: [
          "Core products include data-center GPUs and systems, networking, CUDA software, and gaming/professional GPUs.",
          "Offerings span chips, full systems, and software platforms that lock into customer workflows.",
          "Knowing the product mix helps you judge diversification and where innovation is concentrated."
        ]
      }
    ]
  },
  "district-commerce": {
    locationId: "district-commerce",
    roomName: "Business Model Center",
    ambience:
      "Digital revenue dashboards and a glowing world map fill the hall — money, customers, and markets in one place.",
    missions: [
      {
        questionId: "explain-makes-money",
        missionTitle: "How NVIDIA makes money",
        insights: [
          "Most revenue comes from selling accelerated computing platforms and related software to paying customers.",
          "Data Center has become the growth engine; Graphics and other segments still matter.",
          "Investors track whether income streams are durable, concentrated, or shifting with AI demand."
        ]
      },
      {
        questionId: "explain-customers",
        missionTitle: "Who buys from NVIDIA",
        insights: [
          "Buyers include cloud providers, enterprises, gaming consumers, creators, and automotive partners.",
          "Concentration in a few hyperscalers can amplify both upside and risk.",
          "Knowing who pays clarifies where loyalty and bargaining power sit."
        ]
      },
      {
        questionId: "explain-where-operates",
        missionTitle: "Where NVIDIA operates",
        insights: [
          "NVIDIA serves global markets across data center, gaming, professional visualization, and automotive.",
          "Different regions and industries bring different growth, competition, and geopolitical risk.",
          "Geographic and market map literacy stops you treating the company as a single monolithic bet."
        ]
      }
    ]
  },
  "district-evolution": {
    locationId: "district-evolution",
    roomName: "Global & History Center",
    ambience:
      "A holographic timeline rises beside a world map — graphics → CUDA → AI infrastructure → what comes next.",
    missions: [
      {
        questionId: "explain-evolution",
        missionTitle: "How NVIDIA evolved",
        insights: [
          "NVIDIA started in graphics, then reinvented around general-purpose GPU computing and AI.",
          "Each era reused the platform and opened a larger market — reinvention, not a one-trick story.",
          "Evolution evidence shows whether management can invent new categories after a boom."
        ]
      },
      {
        questionId: "explain-future-growth",
        missionTitle: "Where growth comes from",
        insights: [
          "Future growth bets extend accelerated computing into new workloads, software, networking, and systems.",
          "Investors ask which next markets are real options versus hype.",
          "Growth strategy is how NVIDIA plans to keep compounding after the first wave of AI demand."
        ]
      }
    ]
  },
  "district-ops": {
    locationId: "district-ops",
    roomName: "Operations Center",
    ambience:
      "Command screens track fab partners, logistics, and production pulses — ops as an AI-era control room.",
    missions: [
      {
        questionId: "explain-how-operates",
        missionTitle: "How NVIDIA operates",
        insights: [
          "NVIDIA is fabless: it designs chips and relies on manufacturing and packaging partners.",
          "This model scales capital differently than owning fabs — partners become execution-critical.",
          "Operations understanding reveals where bottlenecks and resilience actually live."
        ]
      }
    ]
  },
  "district-fortress": {
    locationId: "district-fortress",
    roomName: "Competitive Advantage Center",
    ambience:
      "Digital barriers ring a fortified AI campus — the edge NVIDIA must keep earning against rivals.",
    missions: [
      {
        questionId: "explain-competitive-advantage",
        missionTitle: "What protects the edge",
        insights: [
          "Advantage comes from performance, CUDA and software ecosystems, full-stack systems, and supply execution.",
          "Rivals attack with custom silicon, AMD, Intel, and cloud stacks — the moat must be defended continuously.",
          "If you can name the real advantages — and what could weaken them — you are thinking like an investor."
        ]
      }
    ]
  }
};

export function resolveLocationExperience(
  locationId: BusinessIslandStoryLocationId
): BusinessIslandLocationExperienceDef {
  return BUSINESS_ISLAND_LOCATION_EXPERIENCES[locationId];
}

export function resolveDistrictMission(
  locationId: BusinessIslandStoryLocationId,
  questionId: InvestorNotebookQuestionId
): DistrictMissionExperience | undefined {
  return resolveLocationExperience(locationId).missions.find(
    (mission) => mission.questionId === questionId
  );
}

export function atmosphereLabelForTheme(theme: BusinessIslandPlaceTheme): string {
  switch (theme) {
    case "headquarters":
      return "Entering Headquarters";
    case "products-hall":
      return "Entering Products Center";
    case "division-hub":
      return "Entering Business Model Center";
    case "history-trail":
      return "Entering Global & History Center";
    case "manufacturing":
      return "Entering Operations Center";
    case "competitive-arena":
      return "Entering Competitive Advantage Center";
    default:
      return "Entering district";
  }
}
