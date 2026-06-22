import Anthropic from "@anthropic-ai/sdk";
import type { ProductAnalysis, ProductAnalysisInput } from "../types";
import { ANALYSIS_DISCLAIMER, DEMAND_FORECAST_DISCLAIMER } from "../types";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT = `You are a product market analyst for e-commerce dropshipping businesses.
Analyse the product provided and return ONLY a valid JSON object — no markdown, no explanation outside the JSON.

The JSON must have exactly these fields:
{
  "trendScore": number (0-100, current market momentum),
  "demandScore": number (0-100, estimated consumer demand),
  "competitionScore": number (0-100, market saturation — higher means more competitors),
  "opportunityScore": number (0-100, overall business opportunity composite),
  "targetAudience": string (one sentence describing the ideal customer),
  "estimatedMarginRange": string (e.g. "25–45%"),
  "keyStrengths": string[] (exactly 3 items),
  "keyRisks": string[] (exactly 3 items),
  "reasoning": string (2–4 sentences explaining the scores),
  "confidence": "high" | "medium" | "low",
  "demandForecast": {
    "trend": "rising" | "stable" | "declining",
    "seasonality": string or null,
    "nextQuarterOutlook": string (1-2 sentences, measured tone — demand is not certain)
  }
}

Critical rules:
- Opportunity scores must not imply certainty about demand. Use measured, analytical language.
- demandForecast.nextQuarterOutlook must not state demand as certain — use "suggests", "indicates", "may".
- If an image is provided, use visual product attributes to refine scores.`;

export async function analyzeWithAnthropic(
  input: ProductAnalysisInput,
  apiKey: string,
): Promise<ProductAnalysis> {
  const client = new Anthropic({ apiKey });

  const textContent = [
    `Product name: ${input.name}`,
    `Category: ${input.category.replace(/_/g, " ")}`,
    input.description ? `Description: ${input.description}` : null,
    input.costPrice ? `Cost price: $${input.costPrice.toFixed(2)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Append image URL as text context for visual reference
  const userContent = input.imageUrl
    ? `${textContent}\nProduct image URL (for visual reference): ${input.imageUrl}`
    : textContent;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    logger.error({ text }, "Anthropic returned non-JSON product analysis");
    throw new Error("AI analysis returned an unexpected format. Please try again.");
  }

  const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  const rawForecast = parsed.demandForecast as Record<string, unknown> | undefined;
  const trendRaw = String(rawForecast?.trend ?? "stable");
  const trend = (["rising", "stable", "declining"].includes(trendRaw)
    ? trendRaw
    : "stable") as "rising" | "stable" | "declining";

  return {
    trendScore:       clamp(parsed.trendScore),
    demandScore:      clamp(parsed.demandScore),
    competitionScore: clamp(parsed.competitionScore),
    opportunityScore: clamp(parsed.opportunityScore),
    targetAudience:   String(parsed.targetAudience ?? "General consumers"),
    estimatedMarginRange: String(parsed.estimatedMarginRange ?? "Unknown"),
    keyStrengths: Array.isArray(parsed.keyStrengths)
      ? parsed.keyStrengths.slice(0, 3).map(String)
      : ["—", "—", "—"],
    keyRisks: Array.isArray(parsed.keyRisks)
      ? parsed.keyRisks.slice(0, 3).map(String)
      : ["—", "—", "—"],
    reasoning:  String(parsed.reasoning ?? ""),
    confidence: (["high", "medium", "low"].includes(parsed.confidence as string)
      ? parsed.confidence
      : "medium") as ProductAnalysis["confidence"],
    demandForecast: {
      trend,
      seasonality: typeof rawForecast?.seasonality === "string" ? rawForecast.seasonality : null,
      nextQuarterOutlook: String(rawForecast?.nextQuarterOutlook ?? ""),
      disclaimer: DEMAND_FORECAST_DISCLAIMER,
    },
    disclaimer: ANALYSIS_DISCLAIMER,
  };
}
