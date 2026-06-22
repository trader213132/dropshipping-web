import type { ProductAnalysis, ProductAnalysisInput } from "../types";
import { ANALYSIS_DISCLAIMER, DEMAND_FORECAST_DISCLAIMER } from "../types";

function deterministicHash(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function scoreInRange(seed: string, salt: string, min: number, max: number): number {
  const h = deterministicHash(seed + salt);
  return Math.round(min + (h % (max - min + 1)));
}

const CATEGORY_BIAS: Record<string, { trend: [number, number]; demand: [number, number]; competition: [number, number] }> = {
  ELECTRONICS:       { trend: [65, 88], demand: [60, 85], competition: [55, 80] },
  FASHION:           { trend: [68, 90], demand: [62, 86], competition: [60, 85] },
  BEAUTY:            { trend: [72, 92], demand: [65, 88], competition: [58, 82] },
  HOME_GARDEN:       { trend: [52, 76], demand: [50, 74], competition: [45, 70] },
  SPORTS_OUTDOORS:   { trend: [60, 82], demand: [55, 78], competition: [48, 72] },
  TOYS_GAMES:        { trend: [55, 78], demand: [50, 73], competition: [50, 75] },
  PET_SUPPLIES:      { trend: [70, 88], demand: [65, 86], competition: [50, 74] },
  HEALTH_WELLNESS:   { trend: [74, 92], demand: [68, 88], competition: [55, 78] },
  OFFICE_STATIONERY: { trend: [48, 70], demand: [45, 68], competition: [40, 65] },
  AUTOMOTIVE:        { trend: [55, 75], demand: [52, 72], competition: [48, 70] },
  KITCHEN_DINING:    { trend: [58, 80], demand: [55, 76], competition: [50, 72] },
  OTHER:             { trend: [50, 75], demand: [45, 70], competition: [40, 68] },
};

const TARGET_AUDIENCES: Record<string, string> = {
  ELECTRONICS:       "Tech enthusiasts, remote workers, and gadget collectors aged 18–45",
  FASHION:           "Style-conscious consumers aged 20–40 seeking affordable trends",
  BEAUTY:            "Skincare and beauty enthusiasts, primarily women aged 18–45",
  HOME_GARDEN:       "Homeowners and renters aged 25–55 focused on comfort and aesthetics",
  SPORTS_OUTDOORS:   "Active adults aged 20–50 pursuing fitness and outdoor activities",
  TOYS_GAMES:        "Parents of children aged 3–12, and hobbyist gamers",
  PET_SUPPLIES:      "Pet owners aged 22–55 prioritising animal welfare",
  HEALTH_WELLNESS:   "Health-conscious adults aged 25–55 focused on self-care",
  OFFICE_STATIONERY: "Students, freelancers, and office professionals aged 18–45",
  AUTOMOTIVE:        "Car owners and enthusiasts aged 25–55",
  KITCHEN_DINING:    "Home cooks and entertaining enthusiasts aged 25–60",
  OTHER:             "General consumers across demographics",
};

const SEASONALITY: Record<string, string | null> = {
  ELECTRONICS:       "Peaks in Q4 (holiday season) and back-to-school periods",
  FASHION:           "Seasonal peaks in spring and autumn collections",
  BEAUTY:            "Relatively stable with slight peaks around Valentine's Day and holidays",
  HOME_GARDEN:       "Spring and summer peaks for outdoor; Q4 for indoor",
  SPORTS_OUTDOORS:   "Peaks in spring/summer; winter sports spike in Q4",
  TOYS_GAMES:        "Strong Q4 peak (holiday gifting); secondary spike in summer",
  PET_SUPPLIES:      "Consistent year-round demand with slight holiday spikes",
  HEALTH_WELLNESS:   "January spike (New Year resolutions); otherwise stable",
  OFFICE_STATIONERY: "Back-to-school peaks in Q3; stable otherwise",
  AUTOMOTIVE:        "Spring and summer peaks for maintenance products",
  KITCHEN_DINING:    "Holiday spikes in Q4; stable year-round baseline",
  OTHER:             null,
};

function getTrend(score: number, seed: number): "rising" | "stable" | "declining" {
  if (score >= 75) return seed % 5 === 0 ? "stable" : "rising";
  if (score >= 55) return seed % 4 === 0 ? "declining" : "stable";
  return seed % 3 === 0 ? "stable" : "declining";
}

export async function analyzeDemoProduct(input: ProductAnalysisInput): Promise<ProductAnalysis> {
  const bias = CATEGORY_BIAS[input.category] ?? CATEGORY_BIAS.OTHER!;
  const seed = `${input.name}::${input.category}`;
  const hashNum = deterministicHash(seed);

  const trendScore       = scoreInRange(seed, "trend",   bias.trend[0],       bias.trend[1]);
  const demandScore      = scoreInRange(seed, "demand",  bias.demand[0],      bias.demand[1]);
  const competitionScore = scoreInRange(seed, "comp",    bias.competition[0], bias.competition[1]);
  const opportunityScore = Math.round(
    trendScore * 0.30 + demandScore * 0.35 + (100 - competitionScore) * 0.35,
  );

  const margin = scoreInRange(seed, "margin", 18, 55);
  const marginHigh = Math.min(margin + 20, 70);

  const trend = getTrend(trendScore, hashNum);
  const trendText = trend === "rising" ? "upward" : trend === "declining" ? "downward" : "stable";
  const nextQuarterOutlook =
    `Demand signals point ${trendText} for the next quarter. ` +
    (trend === "rising"
      ? "Increasing consumer interest suggests this may be a good time to build inventory."
      : trend === "declining"
        ? "Monitor closely — reduced demand may warrant a cautious approach to stock levels."
        : "Stable conditions suggest predictable sales patterns with no major disruption expected.");

  return {
    trendScore,
    demandScore,
    competitionScore,
    opportunityScore,
    targetAudience: TARGET_AUDIENCES[input.category] ?? TARGET_AUDIENCES.OTHER!,
    estimatedMarginRange: `${margin}–${marginHigh}%`,
    keyStrengths: [
      `Strong consumer interest in ${input.category.replace(/_/g, " ").toLowerCase()} category`,
      "Low barrier to entry with dropshipping model",
      "Good repeat-purchase potential",
    ],
    keyRisks: [
      "Market conditions may shift — scores reflect current estimates only",
      "Competitor saturation could increase over time",
      "Supplier reliability and lead times require independent verification",
    ],
    reasoning:
      `Based on general market trends for ${input.category.replace(/_/g, " ").toLowerCase()} products, ` +
      `"${input.name}" shows ${opportunityScore >= 65 ? "promising" : "moderate"} potential. ` +
      `The demand signal (${demandScore}/100) suggests ${demandScore >= 70 ? "healthy" : "moderate"} consumer interest, ` +
      `while competition (${competitionScore}/100) indicates ${competitionScore >= 70 ? "a crowded" : "a manageable"} market. ` +
      `Estimated gross margin of ${margin}–${marginHigh}% assumes standard dropshipping pricing.`,
    confidence: "medium",
    demandForecast: {
      trend,
      seasonality: SEASONALITY[input.category] ?? null,
      nextQuarterOutlook,
      disclaimer: DEMAND_FORECAST_DISCLAIMER,
    },
    disclaimer: ANALYSIS_DISCLAIMER,
  };
}
