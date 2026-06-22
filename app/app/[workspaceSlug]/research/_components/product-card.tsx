import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "./score-ring";
import { ScoreBar } from "./score-bar";
import { WatchlistButton } from "./watchlist-button";

const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS:       "Electronics",
  FASHION:           "Fashion",
  BEAUTY:            "Beauty",
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

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    opportunityScore: number | null;
    trendScore: number | null;
    demandScore: number | null;
    competitionScore: number | null;
    analysisStatus: string;
    isDemo: boolean;
    watchlistItems: { id: string }[];
  };
  workspaceSlug: string;
}

function scoreLabel(score: number): string {
  if (score >= 75) return "High opportunity";
  if (score >= 55) return "Moderate opportunity";
  return "Low opportunity";
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 55) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function accentBar(score: number): string {
  if (score >= 75) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
  if (score >= 55) return "bg-gradient-to-r from-amber-400 to-amber-500";
  return "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500";
}

export function ProductCard({ product, workspaceSlug }: ProductCardProps) {
  const isWatchlisted = product.watchlistItems.length > 0;
  const hasScores = product.analysisStatus === "COMPLETE";
  const href = `/app/${workspaceSlug}/research/${product.id}` as Route;
  const score = product.opportunityScore;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-violet-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800">
      {/* Score accent strip */}
      {hasScores && score !== null ? (
        <div className={`h-1 w-full shrink-0 ${accentBar(score)}`} aria-hidden="true" />
      ) : (
        <div className="h-1 w-full shrink-0 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="shrink-0 text-xs">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </Badge>
              {product.isDemo && (
                <Badge variant="demo" className="shrink-0 text-xs">Demo</Badge>
              )}
            </div>
            <Link
              href={href}
              className="mt-1.5 block line-clamp-2 leading-snug font-semibold text-slate-900 hover:text-violet-700 focus-visible:outline-none focus-visible:underline dark:text-white dark:hover:text-violet-400"
            >
              {product.name}
            </Link>
          </div>
          <WatchlistButton
            workspaceSlug={workspaceSlug}
            productId={product.id}
            watchlisted={isWatchlisted}
            size="sm"
          />
        </div>

        {/* Scores */}
        {hasScores && score !== null ? (
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-3">
              <ScoreRing score={Math.round(score)} size={60} label="" />
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold tabular-nums ${scoreColor(score)}`}>
                    {Math.round(score)}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
                <p className={`text-xs font-medium ${scoreColor(score)}`}>
                  {scoreLabel(score)}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="Trend"       score={Math.round(product.trendScore ?? 0)}       />
              <ScoreBar label="Demand"      score={Math.round(product.demandScore ?? 0)}      />
              <ScoreBar label="Competition" score={Math.round(product.competitionScore ?? 0)} invert />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex h-16 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
            <span className="text-sm text-slate-400">
              {product.analysisStatus === "ERROR" ? "Analysis failed" : "Pending analysis"}
            </span>
          </div>
        )}

        <Link
          href={href}
          className="mt-auto text-xs font-medium text-violet-600 hover:text-violet-700 focus-visible:outline-none focus-visible:underline dark:text-violet-400 dark:hover:text-violet-300"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
