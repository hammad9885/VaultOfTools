import type { PublicTool } from "@/app/lib/data/public-tools";

export type ComparisonWinner = "a" | "b" | "tie";

export type ComparisonRowType =
  | "higher"
  | "lower"
  | "number"
  | "boolean"
  | "text";

export type ComparisonRow = {
  label: string;
  a: string;
  b: string;
  type: ComparisonRowType;
};

export type ComparisonTool = {
  slug: string;
  name: string;
  logo?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  website?: string | null;
  category: string;
  pricing: string;
  rating: number | null;
  reviews: number;
  features: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
  tags: string[];
};

export type ComparisonFaq = {
  question: string;
  answer: string;
};

export type Comparison = {
  slug: string;
  category: string;
  votes: number;
  ratingA: number | null;
  ratingB: number | null;
  pricingA: string;
  pricingB: string;
  a: ComparisonTool;
  b: ComparisonTool;
  rows: ComparisonRow[];
  prosA: string[];
  prosB: string[];
  faq: ComparisonFaq[];
};

export type ComparisonResult = {
  winner: ComparisonWinner;
  winnerName: string | null;
  loserName: string | null;
  aWins: number;
  bWins: number;
  ties: number;
  totalDecidable: number;
  aPercentage: number;
  bPercentage: number;
  reasons: string[];
  aAdvantages: string[];
  bAdvantages: string[];
  tiedFeatures: string[];
};

export type ComparisonFilterTab = {
  label: string;
  icon: "Search" | "Check" | "Zap";
};

export type ComparisonAlternative = {
  slug: string;
  name: string;
  category: string;
};

export const filterTabs: ComparisonFilterTab[] = [
  {
    label: "All",
    icon: "Search",
  },
  {
    label: "AI",
    icon: "Sparkles" as never,
  },
  {
    label: "Productivity",
    icon: "Check",
  },
  {
    label: "Developer",
    icon: "Zap",
  },
];

export const howItWorks = [
  {
    title: "Choose two tools",
    description:
      "Select any two published tools from the directory.",
  },
  {
    title: "Compare the data",
    description:
      "Tool information is loaded directly from the latest published data.",
  },
  {
    title: "Review the differences",
    description:
      "See ratings, features, pricing, strengths, and measurable differences side by side.",
  },
];

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => cleanString(item))
    .filter(Boolean);
}

function formatBoolean(value: boolean | undefined): string {
  return value ? "Yes" : "No";
}

function formatNumber(value: number | null): string {
  return value === null ? "—" : String(value);
}

function formatCount(value: string[]): string {
  return String(value.length);
}

function getToolCategory(tool: PublicTool): string {
  return (
    cleanString(tool.category) ||
    cleanString(tool.subcategory) ||
    "AI Tools"
  );
}

function getToolWebsite(tool: PublicTool): string | null {
  return (
    cleanString(tool.website) ||
    cleanString(tool.url) ||
    null
  );
}

function getToolLogo(tool: PublicTool): string | null {
  return (
    cleanString(tool.logoUrl) ||
    cleanString(tool.logo) ||
    cleanString(tool.imageUrl) ||
    null
  );
}

function buildComparisonTool(tool: PublicTool): ComparisonTool {
  const features = cleanArray(tool.features);
  const pros = cleanArray(tool.pros);
  const cons = cleanArray(tool.cons);
  const useCases = cleanArray(tool.useCases);
  const tags = cleanArray(tool.tags);

  return {
    slug: cleanString(tool.slug),
    name: cleanString(tool.name),
    logo: cleanString(tool.logo) || null,
    logoUrl: cleanString(tool.logoUrl) || null,
    imageUrl: cleanString(tool.imageUrl) || null,
    website: getToolWebsite(tool),
    category: getToolCategory(tool),
    pricing: cleanString(tool.pricing) || "—",
    rating: cleanNumber(tool.rating),
    reviews:
      typeof tool.reviews === "number" && Number.isFinite(tool.reviews)
        ? tool.reviews
        : 0,
    features,
    pros,
    cons,
    useCases,
    tags,
  };
}

function buildRows(
  a: PublicTool,
  b: PublicTool
): ComparisonRow[] {
  const compareA = a.compare;
  const compareB = b.compare;

  const rows: ComparisonRow[] = [];

  const overallA = cleanNumber(
    compareA?.overallRating ?? a.rating
  );

  const overallB = cleanNumber(
    compareB?.overallRating ?? b.rating
  );

  rows.push({
    label: "Overall Rating",
    a: formatNumber(overallA),
    b: formatNumber(overallB),
    type: "higher",
  });

  const easeA = cleanNumber(compareA?.easeOfUse);
  const easeB = cleanNumber(compareB?.easeOfUse);

  if (easeA !== null || easeB !== null) {
    rows.push({
      label: "Ease of Use",
      a: formatNumber(easeA),
      b: formatNumber(easeB),
      type: "higher",
    });
  }

  const featuresScoreA = cleanNumber(
    compareA?.featuresScore
  );

  const featuresScoreB = cleanNumber(
    compareB?.featuresScore
  );

  if (
    featuresScoreA !== null ||
    featuresScoreB !== null
  ) {
    rows.push({
      label: "Features Score",
      a: formatNumber(featuresScoreA),
      b: formatNumber(featuresScoreB),
      type: "higher",
    });
  }

  const valueA = cleanNumber(
    compareA?.valueForMoney
  );

  const valueB = cleanNumber(
    compareB?.valueForMoney
  );

  if (valueA !== null || valueB !== null) {
    rows.push({
      label: "Value for Money",
      a: formatNumber(valueA),
      b: formatNumber(valueB),
      type: "higher",
    });
  }

  if (
    compareA?.aiPowered !== undefined ||
    compareB?.aiPowered !== undefined
  ) {
    rows.push({
      label: "AI Powered",
      a: formatBoolean(compareA?.aiPowered),
      b: formatBoolean(compareB?.aiPowered),
      type: "boolean",
    });
  }

  if (
    compareA?.apiAvailable !== undefined ||
    compareB?.apiAvailable !== undefined
  ) {
    rows.push({
      label: "API Available",
      a: formatBoolean(compareA?.apiAvailable),
      b: formatBoolean(compareB?.apiAvailable),
      type: "boolean",
    });
  }

  if (
    compareA?.teamCollaboration !== undefined ||
    compareB?.teamCollaboration !== undefined
  ) {
    rows.push({
      label: "Team Collaboration",
      a: formatBoolean(compareA?.teamCollaboration),
      b: formatBoolean(compareB?.teamCollaboration),
      type: "boolean",
    });
  }

  const platformsA = cleanArray(compareA?.platforms);
  const platformsB = cleanArray(compareB?.platforms);

  if (platformsA.length || platformsB.length) {
    rows.push({
      label: "Platforms",
      a: formatCount(platformsA),
      b: formatCount(platformsB),
      type: "higher",
    });
  }

  const integrationsA = cleanArray(
    compareA?.integrations
  );

  const integrationsB = cleanArray(
    compareB?.integrations
  );

  if (
    integrationsA.length ||
    integrationsB.length
  ) {
    rows.push({
      label: "Integrations",
      a: formatCount(integrationsA),
      b: formatCount(integrationsB),
      type: "higher",
    });
  }

  rows.push({
    label: "Reviews",
    a: String(a.reviews ?? 0),
    b: String(b.reviews ?? 0),
    type: "number",
  });

  rows.push({
    label: "Features",
    a: String(cleanArray(a.features).length),
    b: String(cleanArray(b.features).length),
    type: "number",
  });

  const supportA = cleanString(
    compareA?.customerSupport
  );

  const supportB = cleanString(
    compareB?.customerSupport
  );

  if (supportA || supportB) {
    rows.push({
      label: "Customer Support",
      a: supportA || "—",
      b: supportB || "—",
      type: "text",
    });
  }

  const customA = Array.isArray(
    compareA?.attributes
  )
    ? compareA.attributes
    : [];

  const customB = Array.isArray(
    compareB?.attributes
  )
    ? compareB.attributes
    : [];

  const attributeLabels = new Set<string>();

  customA.forEach((attribute) => {
    const label = cleanString(attribute?.label);

    if (label) {
      attributeLabels.add(label);
    }
  });

  customB.forEach((attribute) => {
    const label = cleanString(attribute?.label);

    if (label) {
      attributeLabels.add(label);
    }
  });

  attributeLabels.forEach((label) => {
    const aAttribute = customA.find(
      (attribute) =>
        cleanString(attribute?.label).toLowerCase() ===
        label.toLowerCase()
    );

    const bAttribute = customB.find(
      (attribute) =>
        cleanString(attribute?.label).toLowerCase() ===
        label.toLowerCase()
    );

    rows.push({
      label,
      a: cleanString(aAttribute?.value) || "—",
      b: cleanString(bAttribute?.value) || "—",
      type: "text",
    });
  });

  return rows;
}

function buildFaq(
  a: PublicTool,
  b: PublicTool
): ComparisonFaq[] {
  return [
    {
      question: `What is the main difference between ${a.name} and ${b.name}?`,
      answer: `${a.name} and ${b.name} are compared using their current published tool data, including ratings, pricing, features, capabilities, and comparison fields configured in the admin dashboard.`,
    },
    {
      question: `Which tool has the higher rating?`,
      answer: `The current ratings are ${a.name}: ${formatNumber(cleanNumber(a.rating))} and ${b.name}: ${formatNumber(cleanNumber(b.rating))}.`,
    },
    {
      question: `Where can I check the latest pricing?`,
      answer: `Pricing shown on this comparison comes from the current published tool records. Check the official website of each tool for the latest pricing details.`,
    },
  ];
}

export function createComparison(
  a: PublicTool,
  b: PublicTool
): Comparison {
  const first = buildComparisonTool(a);
  const second = buildComparisonTool(b);

  const slug = `${first.slug}-vs-${second.slug}`;

  return {
    slug,
    category:
      first.category === second.category
        ? first.category
        : "AI Tools",
    votes: 0,
    ratingA: first.rating,
    ratingB: second.rating,
    pricingA: first.pricing,
    pricingB: second.pricing,
    a: first,
    b: second,
    rows: buildRows(a, b),
    prosA:
      first.pros.length > 0
        ? first.pros
        : first.features.slice(0, 5),
    prosB:
      second.pros.length > 0
        ? second.pros
        : second.features.slice(0, 5),
    faq: buildFaq(a, b),
  };
}

export function parseComparisonNumber(
  value: string
): number | null {
  const match = value.match(/[\d,.]+/);

  if (!match) {
    return null;
  }

  const number = Number(
    match[0].replace(/,/g, "")
  );

  return Number.isFinite(number) ? number : null;
}

export function getComparisonRowWinner(
  row: ComparisonRow
): ComparisonWinner {
  const aValue = row.a.trim();
  const bValue = row.b.trim();

  if (!aValue || !bValue) {
    return "tie";
  }

  if (
    aValue === "—" ||
    bValue === "—" ||
    aValue === "-" ||
    bValue === "-"
  ) {
    return "tie";
  }

  if (
    aValue.toLowerCase() ===
    bValue.toLowerCase()
  ) {
    return "tie";
  }

  if (
    row.type === "higher" ||
    row.type === "lower"
  ) {
    const a = parseComparisonNumber(aValue);
    const b = parseComparisonNumber(bValue);

    if (a === null || b === null || a === b) {
      return "tie";
    }

    if (row.type === "higher") {
      return a > b ? "a" : "b";
    }

    return a < b ? "a" : "b";
  }

  if (row.type === "number") {
    const a = parseComparisonNumber(aValue);
    const b = parseComparisonNumber(bValue);

    if (a === null || b === null || a === b) {
      return "tie";
    }

    return a > b ? "a" : "b";
  }

  if (row.type === "boolean") {
    const aYes = /^yes\b/i.test(aValue);
    const bYes = /^yes\b/i.test(bValue);

    if (aYes && !bYes) {
      return "a";
    }

    if (bYes && !aYes) {
      return "b";
    }

    return "tie";
  }

  return "tie";
}

export function getComparisonResult(
  comparison: Comparison
): ComparisonResult {
  let aWins = 0;
  let bWins = 0;
  let ties = 0;

  const aAdvantages: string[] = [];
  const bAdvantages: string[] = [];
  const tiedFeatures: string[] = [];

  comparison.rows.forEach((row) => {
    const winner = getComparisonRowWinner(row);

    if (winner === "a") {
      aWins += 1;
      aAdvantages.push(
        `${row.label}: ${row.a}`
      );
      return;
    }

    if (winner === "b") {
      bWins += 1;
      bAdvantages.push(
        `${row.label}: ${row.b}`
      );
      return;
    }

    ties += 1;
    tiedFeatures.push(row.label);
  });

  const totalDecidable = aWins + bWins;

  const aPercentage =
    totalDecidable > 0
      ? Math.round(
          (aWins / totalDecidable) * 100
        )
      : 50;

  const bPercentage =
    totalDecidable > 0
      ? Math.round(
          (bWins / totalDecidable) * 100
        )
      : 50;

  let winner: ComparisonWinner = "tie";

  if (aWins > bWins) {
    winner = "a";
  } else if (bWins > aWins) {
    winner = "b";
  }

  const winnerName =
    winner === "a"
      ? comparison.a.name
      : winner === "b"
        ? comparison.b.name
        : null;

  const loserName =
    winner === "a"
      ? comparison.b.name
      : winner === "b"
        ? comparison.a.name
        : null;

  const reasons =
    winner === "a"
      ? aAdvantages.slice(0, 5)
      : winner === "b"
        ? bAdvantages.slice(0, 5)
        : [
            "Both tools have the same number of deciding feature wins.",
            "The detailed feature matrix shows where each tool differs.",
          ];

  return {
    winner,
    winnerName,
    loserName,
    aWins,
    bWins,
    ties,
    totalDecidable,
    aPercentage,
    bPercentage,
    reasons,
    aAdvantages,
    bAdvantages,
    tiedFeatures,
  };
}

export function getComparisonBySlug(
  slug: string
): undefined {
  return undefined;
}

export function getComparisonByTools(
  toolASlug: string,
  toolBSlug: string
): undefined {
  return undefined;
}