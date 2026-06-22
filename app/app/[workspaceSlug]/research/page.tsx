import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getProducts, getWorkspaceProductStats } from "@/server/products";
import { ProductCard } from "./_components/product-card";
import { AddProductDialog } from "./_components/add-product-dialog";
import { TrendingUp } from "lucide-react";
import type { ProductCategory } from "@prisma/client";

export const metadata: Metadata = { title: "Product Research" };

interface ResearchPageProps {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; watchlist?: string }>;
}

export default async function ResearchPage({ params, searchParams }: ResearchPageProps) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace } = result;

  const [products, stats] = await Promise.all([
    getProducts(workspace.id, {
      query:         sp.q,
      category:      sp.category as ProductCategory | undefined,
      watchlistOnly: sp.watchlist === "1",
      sortBy:        sp.sort === "trend"   ? "trendScore"
                   : sp.sort === "created" ? "createdAt"
                   :                         "opportunityScore",
    }),
    getWorkspaceProductStats(workspace.id),
  ]);

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Product Research</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            AI-powered opportunity scoring for dropshipping products
          </p>
        </div>
        <AddProductDialog workspaceSlug={workspaceSlug} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Products", value: stats.total },
          { label: "Analysed", value: stats.analysed },
          { label: "On watchlist", value: stats.watchlisted },
          { label: "Avg opportunity", value: stats.avgOpportunityScore !== null ? `${stats.avgOpportunityScore}/100` : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search products…"
            className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <select
          name="sort"
          defaultValue={sp.sort ?? "opportunityScore"}
          className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="opportunityScore">Best opportunity</option>
          <option value="trend">Trending</option>
          <option value="created">Recently added</option>
        </select>
        <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800">
          <input
            type="checkbox"
            name="watchlist"
            value="1"
            defaultChecked={sp.watchlist === "1"}
            className="rounded border-slate-300 accent-violet-600"
          />
          Watchlist only
        </label>
        <button
          type="submit"
          className="h-9 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
        >
          Filter
        </button>
      </form>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
          <TrendingUp className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="font-medium text-slate-900 dark:text-white">No products yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add a product to get an AI-powered opportunity score.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} workspaceSlug={workspaceSlug} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 dark:text-slate-600 max-w-2xl">
        ⚠ AI scores are estimates based on general market knowledge. Product demand predictions are not certain
        and should not be used as the sole basis for purchasing decisions.
      </p>
    </div>
  );
}
