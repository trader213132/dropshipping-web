import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getWorkspaceAnalytics } from "@/server/analytics";
import { BarChart3, Package, Palette, ShoppingBag, Package2, Bell, Star, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Analytics" };

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-violet-600" : score >= 55 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums w-6 text-right">
        {Math.round(score)}
      </span>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: "Electronics",
  FASHION: "Fashion",
  BEAUTY: "Beauty",
  HOME_GARDEN: "Home & Garden",
  SPORTS_OUTDOORS: "Sports",
  TOYS_GAMES: "Toys",
  PET_SUPPLIES: "Pets",
  HEALTH_WELLNESS: "Wellness",
  OFFICE_STATIONERY: "Office",
  AUTOMOTIVE: "Auto",
  KITCHEN_DINING: "Kitchen",
  OTHER: "Other",
};

const SEVERITY_BADGE: Record<string, "destructive" | "warning" | "secondary"> = {
  CRITICAL: "destructive",
  WARNING: "warning",
  INFO: "secondary",
};

export default async function AnalyticsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const analytics = await getWorkspaceAnalytics(result.workspace.id);

  const hasData = analytics.products.total > 0;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Portfolio overview and performance insights for {result.workspace.name}.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Products"
            value={analytics.products.total}
            sub={`${analytics.products.analysed} analysed`}
            icon={Package}
          />
          <StatCard
            label="Active brands"
            value={analytics.brands.active}
            icon={Palette}
          />
          <StatCard
            label="Connected stores"
            value={analytics.stores.connected}
            icon={ShoppingBag}
          />
          <StatCard
            label="Suppliers"
            value={analytics.suppliers.total}
            icon={Package2}
          />
        </div>

        {hasData ? (
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Avg scores */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Portfolio score averages
              </h2>
              <div className="space-y-4">
                {analytics.products.avgOpportunityScore !== null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Avg opportunity</span>
                    </div>
                    <MiniBar score={analytics.products.avgOpportunityScore} />
                  </div>
                )}
                {analytics.products.avgTrendScore !== null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Avg trend momentum</span>
                    </div>
                    <MiniBar score={analytics.products.avgTrendScore} />
                  </div>
                )}
                {analytics.products.avgDemandScore !== null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Avg demand</span>
                    </div>
                    <MiniBar score={analytics.products.avgDemandScore} />
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-500">Watchlisted products</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{analytics.watchlistCount}</span>
                </div>
              </div>
            </div>

            {/* Top products */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Top products by opportunity
              </h2>
              {analytics.topProducts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No analysed products yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.topProducts.map((product, i) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4 shrink-0">#{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs text-slate-400">{CATEGORY_LABELS[product.category] ?? product.category}</p>
                      </div>
                      {product.opportunityScore !== null && (
                        <span className={`text-sm font-bold shrink-0 ${
                          product.opportunityScore >= 75 ? "text-violet-600" :
                          product.opportunityScore >= 55 ? "text-amber-500" : "text-red-500"
                        }`}>
                          {Math.round(product.opportunityScore)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-12 text-center mb-8">
            <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900 dark:text-white">No data yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add and analyse products in Product Research to see analytics here.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent alerts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent alerts
              {analytics.alerts.unread > 0 && (
                <span className="ml-1 rounded-full bg-violet-600 text-white text-xs px-2 py-0.5 font-semibold">
                  {analytics.alerts.unread} unread
                </span>
              )}
            </h2>
            {analytics.alerts.recent.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No alerts</p>
            ) : (
              <div className="space-y-2">
                {analytics.alerts.recent.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 truncate">{alert.title}</span>
                    <Badge variant={SEVERITY_BADGE[alert.severity] ?? "secondary"} className="text-xs shrink-0 ml-2">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent activity
            </h2>
            {analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-600 dark:text-slate-400 font-mono truncate">{log.action}</span>
                    <span className="text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center">
          Scores are AI estimates and do not constitute financial advice. Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  );
}
