import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getProduct } from "@/server/products";
import { hasRole } from "@/server/permissions";
import { ScoreRing } from "../_components/score-ring";
import { ScoreBar } from "../_components/score-bar";
import { WatchlistButton } from "../_components/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ANALYSIS_DISCLAIMER } from "@/server/ai";
import type { WorkspaceRole } from "@prisma/client";
import { deleteProductAction } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string; productId: string }>;
}): Promise<Metadata> {
  const { workspaceSlug, productId } = await params;
  const user = await requireAuth();
  const r = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!r) return { title: "Product" };
  const product = await getProduct(r.workspace.id, productId);
  return { title: product?.name ?? "Product" };
}

const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS:       "Electronics & Gadgets",
  FASHION:           "Fashion & Apparel",
  BEAUTY:            "Beauty & Personal Care",
  HOME_GARDEN:       "Home & Garden",
  SPORTS_OUTDOORS:   "Sports & Outdoors",
  TOYS_GAMES:        "Toys & Games",
  PET_SUPPLIES:      "Pet Supplies",
  HEALTH_WELLNESS:   "Health & Wellness",
  OFFICE_STATIONERY: "Office & Stationery",
  AUTOMOTIVE:        "Automotive",
  KITCHEN_DINING:    "Kitchen & Dining",
  OTHER:             "Other",
};

interface ProductDetailPageProps {
  params: Promise<{ workspaceSlug: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { workspaceSlug, productId } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const product = await getProduct(workspace.id, productId);
  if (!product) notFound();

  type DemandForecast = {
    trend?: "rising" | "stable" | "declining";
    seasonality?: string | null;
    nextQuarterOutlook?: string;
    disclaimer?: string;
  };
  type AnalysisData = {
    confidence?: string;
    estimatedMarginRange?: string;
    reasoning?: string;
    keyStrengths?: string[];
    keyRisks?: string[];
    targetAudience?: string;
    demandForecast?: DemandForecast;
  };
  const analysisData = product.analysisData as AnalysisData | null;
  const forecast = analysisData?.demandForecast;
  const isWatchlisted = product.watchlistItems.length > 0;
  const canDelete = hasRole(membership.role as WorkspaceRole, "ADMIN");
  const backHref = `/app/${workspaceSlug}/research` as Route;

  async function deleteAction() {
    "use server";
    await deleteProductAction(workspaceSlug, productId);
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Back */}
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus-visible:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Product research
      </Link>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline">{CATEGORY_LABELS[product.category] ?? product.category}</Badge>
            {product.isDemo && <Badge variant="demo">Demo</Badge>}
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{product.name}</h1>
          {product.description && (
            <p className="mt-2 text-slate-500 dark:text-slate-400">{product.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/app/${workspaceSlug}/research/${productId}/copy` as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              Generate copy
            </Button>
          </Link>
          <WatchlistButton workspaceSlug={workspaceSlug} productId={product.id} watchlisted={isWatchlisted} />
        </div>
      </div>

      {product.analysisStatus === "COMPLETE" && product.opportunityScore !== null ? (
        <>
          {/* Opportunity score hero */}
          <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
            <ScoreRing score={Math.round(product.opportunityScore)} size={88} strokeWidth={8} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Opportunity score</p>
              <p className="mt-0.5 text-3xl font-bold text-slate-900 dark:text-white">
                {Math.round(product.opportunityScore)}<span className="text-base font-normal text-slate-400">/100</span>
              </p>
              {analysisData?.confidence && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Confidence: <span className="capitalize">{analysisData.confidence}</span>
                </p>
              )}
            </div>
            {analysisData?.estimatedMarginRange && (
              <div className="ml-auto text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Est. margin</p>
                <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
                  {analysisData.estimatedMarginRange}
                </p>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Score breakdown</h2>
            <ScoreBar label="Trend momentum"     score={Math.round(product.trendScore ?? 0)} />
            <ScoreBar label="Consumer demand"    score={Math.round(product.demandScore ?? 0)} />
            <ScoreBar label="Market competition" score={Math.round(product.competitionScore ?? 0)} invert />
          </div>

          {/* Demand forecast */}
          {forecast && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Demand forecast</h2>
              <div className="flex items-center gap-2 mb-3">
                {forecast.trend === "rising" && (
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" /> Rising demand
                  </span>
                )}
                {forecast.trend === "declining" && (
                  <span className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                    <TrendingDown className="h-4 w-4" /> Declining demand
                  </span>
                )}
                {forecast.trend === "stable" && (
                  <span className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Minus className="h-4 w-4" /> Stable demand
                  </span>
                )}
              </div>
              {forecast.nextQuarterOutlook && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {forecast.nextQuarterOutlook}
                </p>
              )}
              {forecast.seasonality && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Seasonality: </span>{forecast.seasonality}
                </p>
              )}
              {forecast.disclaimer && (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">
                  {forecast.disclaimer}
                </p>
              )}
            </div>
          )}

          {/* AI reasoning */}
          {analysisData?.reasoning && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Analysis</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {analysisData.reasoning}
              </p>

              {Array.isArray(analysisData.keyStrengths) && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1.5">Key strengths</p>
                    <ul className="space-y-1">
                      {(analysisData.keyStrengths ?? []).map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                          <span className="text-emerald-500 mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1.5">Key risks</p>
                    <ul className="space-y-1">
                      {(analysisData.keyRisks ?? []).map((r, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                          <span className="text-amber-500 mt-0.5">!</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {analysisData.targetAudience && (
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Target audience: </span>
                  {analysisData.targetAudience}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 mb-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">
            {product.analysisStatus === "ERROR"
              ? "Analysis failed. You can delete this product and try again."
              : "Analysis pending."}
          </p>
        </div>
      )}

      {/* Pricing */}
      {(product.costPrice !== null || product.suggestedRetailPrice !== null) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Pricing</h2>
          <div className="flex gap-8">
            {product.costPrice !== null && (
              <div>
                <p className="text-xs text-slate-500">Your cost price</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">${Number(product.costPrice).toFixed(2)}</p>
              </div>
            )}
            {product.suggestedRetailPrice !== null && (
              <div>
                <p className="text-xs text-slate-500">Suggested retail</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">${Number(product.suggestedRetailPrice).toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex gap-2 rounded-xl bg-amber-50 p-4 mb-6 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{ANALYSIS_DISCLAIMER}</p>
      </div>

      {/* Danger zone */}
      {canDelete && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Danger zone</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Permanently deletes this product and its analysis. Cannot be undone.
          </p>
          <form action={deleteAction}>
            <Button type="submit" variant="destructive" size="sm">Delete product</Button>
          </form>
        </div>
      )}
    </div>
  );
}
