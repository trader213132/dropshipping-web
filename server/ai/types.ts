export interface ProductAnalysisInput {
  name: string;
  category: string;
  description?: string;
  costPrice?: number;
  imageUrl?: string;
}

export interface DemandForecast {
  trend: "rising" | "stable" | "declining";
  seasonality: string | null;
  nextQuarterOutlook: string;
  disclaimer: string;
}

export interface ProductAnalysis {
  trendScore: number;
  demandScore: number;
  competitionScore: number;
  opportunityScore: number;
  targetAudience: string;
  estimatedMarginRange: string;
  keyStrengths: string[];
  keyRisks: string[];
  reasoning: string;
  confidence: "high" | "medium" | "low";
  demandForecast: DemandForecast;
  disclaimer: string;
}

export const ANALYSIS_DISCLAIMER =
  "These scores are AI-generated estimates based on general market knowledge. " +
  "Product demand predictions are not certain and should not be used as the sole basis for purchasing decisions. " +
  "Always conduct your own market research before committing inventory.";

export const DEMAND_FORECAST_DISCLAIMER =
  "Demand forecasts are AI estimates based on general market trends. " +
  "Actual demand is inherently uncertain — these projections do not guarantee sales performance.";
