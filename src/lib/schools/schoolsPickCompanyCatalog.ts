export type SchoolsPickCompanyOption = {
  id: string;
  label: string;
};

export type SchoolsPickCompanySector = SchoolsPickCompanyOption & {
  icon: string;
  industries: readonly (SchoolsPickCompanyOption & {
    companies: readonly string[];
  })[];
};

/** Sector → Industry → Company catalog for Schools pick flow. */
export const SCHOOLS_PICK_COMPANY_SECTORS: readonly SchoolsPickCompanySector[] = [
  {
    id: "technology",
    label: "Technology",
    icon: "⚡",
    industries: [
      { id: "semiconductors", label: "Semiconductors", companies: ["NVIDIA", "AMD", "TSMC"] },
      { id: "software", label: "Software", companies: ["Microsoft", "Adobe", "Salesforce"] },
      {
        id: "cybersecurity",
        label: "Cybersecurity",
        companies: ["CrowdStrike", "Palo Alto Networks", "Fortinet"]
      },
      {
        id: "cloud_computing",
        label: "Cloud Computing",
        companies: ["Amazon", "Google", "Oracle"]
      },
      { id: "hardware", label: "Hardware", companies: ["Apple", "Dell", "HP"] }
    ]
  },
  {
    id: "financials",
    label: "Financials",
    icon: "🏦",
    industries: [
      { id: "banks", label: "Banks", companies: ["JPMorgan", "Bank of America", "Wells Fargo"] },
      { id: "payments", label: "Payments", companies: ["Visa", "Mastercard", "PayPal"] },
      {
        id: "insurance",
        label: "Insurance",
        companies: ["Berkshire Hathaway", "Progressive", "AIG"]
      }
    ]
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: "➕",
    industries: [
      {
        id: "pharmaceuticals",
        label: "Pharmaceuticals",
        companies: ["Eli Lilly", "Pfizer", "Johnson & Johnson"]
      },
      {
        id: "medical_devices",
        label: "Medical Devices",
        companies: ["Medtronic", "Abbott", "Intuitive Surgical"]
      },
      {
        id: "health_insurance",
        label: "Health Insurance",
        companies: ["UnitedHealth", "Cigna", "Humana"]
      }
    ]
  },
  {
    id: "energy",
    label: "Energy",
    icon: "🔥",
    industries: [
      {
        id: "oil_gas",
        label: "Oil & Gas",
        companies: ["Exxon Mobil", "Chevron", "ConocoPhillips"]
      },
      {
        id: "renewables",
        label: "Renewables",
        companies: ["NextEra Energy", "Enphase Energy", "First Solar"]
      }
    ]
  },
  {
    id: "industrials",
    label: "Industrials",
    icon: "⚙️",
    industries: [
      {
        id: "aerospace",
        label: "Aerospace",
        companies: ["Boeing", "Lockheed Martin", "RTX"]
      },
      {
        id: "manufacturing",
        label: "Manufacturing",
        companies: ["Caterpillar", "3M", "Honeywell"]
      }
    ]
  },
  {
    id: "consumer",
    label: "Consumer",
    icon: "🛒",
    industries: [
      { id: "retail", label: "Retail", companies: ["Walmart", "Target", "Costco"] },
      { id: "brands", label: "Brands", companies: ["Nike", "Starbucks", "McDonald's"] }
    ]
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: "💡",
    industries: [
      {
        id: "electric",
        label: "Electric Utilities",
        companies: ["Duke Energy", "Southern Company", "Dominion Energy"]
      },
      { id: "gas", label: "Gas Utilities", companies: ["Sempra", "Atmos Energy", "ONE Gas"] }
    ]
  },
  {
    id: "real_estate",
    label: "Real Estate",
    icon: "🏰",
    industries: [
      {
        id: "reits",
        label: "REITs",
        companies: ["Prologis", "American Tower", "Simon Property Group"]
      }
    ]
  },
  {
    id: "communication",
    label: "Communication",
    icon: "📡",
    industries: [
      { id: "media", label: "Media", companies: ["Disney", "Netflix", "Comcast"] },
      { id: "telecom", label: "Telecom", companies: ["Verizon", "AT&T", "T-Mobile"] }
    ]
  },
  {
    id: "materials",
    label: "Materials",
    icon: "⛏️",
    industries: [
      { id: "chemicals", label: "Chemicals", companies: ["Linde", "Dow", "DuPont"] },
      { id: "mining", label: "Mining", companies: ["Freeport-McMoRan", "Newmont", "Nucor"] }
    ]
  }
] as const;

export function findSchoolsPickSector(sectorId: string): SchoolsPickCompanySector | undefined {
  return SCHOOLS_PICK_COMPANY_SECTORS.find((s) => s.id === sectorId);
}

export function findSchoolsPickIndustry(sectorId: string, industryId: string) {
  return findSchoolsPickSector(sectorId)?.industries.find((i) => i.id === industryId);
}
