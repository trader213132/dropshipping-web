import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getWorkspaceAnalytics } from "@/server/analytics";
import { notFound } from "next/navigation";
import {
  TrendingUp, Package, Palette, Store, Zap, BarChart3,
  Plug, Settings, ArrowRight, Bell, ShieldAlert, Info, AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const MODULES = (slug: string) => [
  { label: "Product Research", desc: "AI opportunity scoring",  href: `/app/${slug}/research`,     icon: TrendingUp, color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20" },
  { label: "Inventory",        desc: "Supplier management",    href: `/app/${slug}/inventory`,    icon: Package,    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20" },
  { label: "Brand Studio",     desc: "AI brand generation",    href: `/app/${slug}/brand`,        icon: Palette,    color: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20" },
  { label: "Store Builder",    desc: "Connect your stores",    href: `/app/${slug}/store`,        icon: Store,      color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20" },
  { label: "Automation",       desc: "Rules & alerts",         href: `/app/${slug}/automation`,   icon: Zap,        color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20" },
  { label: "Analytics",        desc: "Workspace insights",     href: `/app/${slug}/analytics`,    icon: BarChart3,  color: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20" },
  { label: "Integrations",     desc: "Third-party services",   href: `/app/${slug}/integrations`, icon: Plug,       color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
  { label: "Settings",         desc: "Workspace & team",       href: `/app/${slug}/settings`,     icon: Settings,   color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
];

const SEVERITY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  INFO: Info,
  WARNING: AlertTriangle,
  CRITICAL: ShieldAlert,
};

const SEVERITY_COLOR: Record<string, string> = {
  INFO: "text-blue-500",
  WARNING: "text-amber-500",
  CRITICAL: "text-red-500",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface DashboardPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;

  let analytics;
  try {
    analytics = await getWorkspaceAnalytics(workspace.id);
  } catch {
    analytics = null;
  }

  const firstName = user.name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Products",  value: analytics?.products.total   ?? "—", sub: analytics?.products.analysed ? `${analytics.products.analysed} analysed` : null },
    { label: "Brands",    value: analytics?.brands.active    ?? "—", sub: "active" },
    { label: "Stores",    value: analytics?.stores.connected ?? "—", sub: "connected" },
    { label: "Watchlist", value: analytics?.watchlistCount   ?? "—", sub: "saved" },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-8 py-8 text-white shadow-lg shadow-violet-900/20">
        <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-violet-300 blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-sm font-medium text-violet-200">
            {workspace.name} · <span className="capitalize">{membership.role.toLowerCase().replace("_", " ")}</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {greeting}{firstName ? `, ${firstName}` : ""}! 👋
          </h1>
          <p className="mt-1 text-sm text-violet-200">
            {analytics?.products.avgOpportunityScore
              ? `Portfolio average opportunity score: ${analytics.products.avgOpportunityScore}/100.`
              : "Add your first product to get an AI-powered opportunity score."}
          </p>
          {analytics && analytics.alerts.unread > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm">
              <Bell className="h-3.5 w-3.5 text-amber-300" />
              <span>{analytics.alerts.unread} unread alert{analytics.alerts.unread !== 1 ? "s" : ""}</span>
              <Link
                href={`/app/${workspaceSlug}/automation` as Route}
                className="ml-1 text-amber-300 underline-offset-2 hover:text-amber-200 hover:underline"
              >
                View →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{String(s.value)}</p>
            {s.sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Quick access modules */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Quick access</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MODULES(workspaceSlug).map(({ label, desc, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href as Route}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-400">
                  {label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {analytics && analytics.topProducts.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Top opportunities</h2>
              <Link
                href={`/app/${workspaceSlug}/research` as Route}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400"
              >
                All products <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {analytics.topProducts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/app/${workspaceSlug}/research/${p.id}` as Route}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                      {p.category.toLowerCase().replace(/_/g, " ")}
                    </p>
                  </div>
                  <div
                    className={`tabular-nums text-sm font-bold ${
                      (p.opportunityScore ?? 0) >= 75
                        ? "text-emerald-600 dark:text-emerald-400"
                        : (p.opportunityScore ?? 0) >= 55
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-500"
                    }`}
                  >
                    {p.opportunityScore !== null ? Math.round(p.opportunityScore) : "—"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {analytics && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent alerts</h2>
              <Link
                href={`/app/${workspaceSlug}/automation` as Route}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400"
              >
                All alerts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {analytics.alerts.recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-slate-200 dark:text-slate-700" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No alerts yet</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Set up automation rules to get notified
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.alerts.recent.map((alert) => {
                  const SeverityIcon = SEVERITY_ICON[alert.severity] ?? Info;
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 rounded-lg p-2 ${!alert.read ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
                    >
                      <SeverityIcon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${SEVERITY_COLOR[alert.severity] ?? "text-slate-400"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-800 dark:text-slate-200">{alert.title}</p>
                        <p className="text-xs text-slate-400">{timeAgo(alert.createdAt)}</p>
                      </div>
                      {!alert.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(!analytics || analytics.products.total === 0) && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-3 h-10 w-10 text-violet-200 dark:text-violet-900" />
              <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                Start with product research
              </h3>
              <p className="mx-auto mb-4 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Add your first product to get an AI-powered opportunity score — demand forecast,
                competition analysis, and margin estimates included.
              </p>
              <Link
                href={`/app/${workspaceSlug}/research` as Route}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Go to Product Research
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
