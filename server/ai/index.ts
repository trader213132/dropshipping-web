import { analyzeDemoProduct } from "./providers/demo";
import { analyzeWithAnthropic } from "./providers/anthropic";
import type { ProductAnalysis, ProductAnalysisInput } from "./types";
import { logger } from "@/lib/logger";

export type { ProductAnalysis, ProductAnalysisInput };
export { ANALYSIS_DISCLAIMER } from "./types";

export async function analyzeProduct(input: ProductAnalysisInput): Promise<ProductAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      logger.info({ productName: input.name }, "Running Anthropic product analysis");
      return await analyzeWithAnthropic(input, apiKey);
    } catch (err) {
      logger.warn({ err }, "Anthropic analysis failed; falling back to demo scores");
    }
  }

  logger.info({ productName: input.name }, "Using demo product analysis (no ANTHROPIC_API_KEY)");
  return analyzeDemoProduct(input);
}
