import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getAutomationRules, getAlerts } from "@/server/automation";
import { hasRole } from "@/server/permissions";
import type { WorkspaceRole } from "@prisma/client";
import { Zap, Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteRuleAction, toggleRuleAction, markAllAlertsReadAction } from "./actions";
import { CreateRuleDialog } from "./_components/create-rule-dialog";

export const metadata: Metadata = { title: "Automation" };

const TRIGGER_LABELS: Record<string, string> = {
  PRICE_DROP: "Price drop detected",
  STOCK_LOW: "Stock running low",
  STOCK_OUT: "Out of stock",
  TREND_SPIKE: "Trend spike",
  OPPORTUNITY_SCORE_THRESHOLD: "Opportunity score threshold",
};

const ACTION_LABELS: Record<string, string> = {
  SEND_EMAIL: "Send email notification",
  CREATE_ALERT: "Create in-app alert",
  PAUSE_PRODUCT: "Pause product listing",
  NOTIFY_WEBHOOK: "POST to webhook",
};

const SEVERITY_CONFIG = {
  INFO: { icon: Info, variant: "secondary" as const },
  WARNING: { icon: AlertTriangle, variant: "warning" as const },
  CRITICAL: { icon: ShieldAlert, variant: "destructive" as const },
};

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function AutomationPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const [rules, alerts] = await Promise.all([
    getAutomationRules(workspace.id),
    getAlerts(workspace.id),
  ]);

  const isAdmin = hasRole(membership.role as WorkspaceRole, "ADMIN");
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Automation</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Set rules that trigger actions automatically based on product and market events.
            </p>
          </div>
          {isAdmin && <CreateRuleDialog workspaceSlug={workspaceSlug} />}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Rules */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automation rules
            </h2>
            {rules.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-12 text-center">
                <Zap className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No rules yet. {isAdmin ? "Create one above." : "Ask an admin to add rules."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => {
                  async function doDelete() {
                    "use server";
                    await deleteRuleAction(workspaceSlug, rule.id);
                  }
                  async function doToggle(fd: FormData) {
                    "use server";
                    const enabled = fd.get("enabled") === "on";
                    await toggleRuleAction(workspaceSlug, rule.id, enabled);
                  }

                  return (
                    <div
                      key={rule.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">{rule.name}</span>
                            {!rule.enabled && (
                              <Badge variant="secondary" className="text-xs">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            When: {TRIGGER_LABELS[rule.trigger] ?? rule.trigger} → {ACTION_LABELS[rule.action] ?? rule.action}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2 shrink-0">
                            <form action={doToggle}>
                              <input type="hidden" name="enabled" value={rule.enabled ? "" : "on"} />
                              <button type="submit" aria-label="Toggle rule">
                                <Switch checked={rule.enabled} aria-label="Rule enabled" tabIndex={-1} />
                              </button>
                            </form>
                            <form action={doDelete}>
                              <Button type="submit" variant="ghost" size="sm" className="text-slate-400 hover:text-red-500 text-xs h-7 px-2">
                                Delete
                              </Button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Recent alerts
                {unreadAlerts.length > 0 && (
                  <span className="ml-1 rounded-full bg-violet-600 text-white text-xs px-2 py-0.5 font-semibold">
                    {unreadAlerts.length}
                  </span>
                )}
              </h2>
              {unreadAlerts.length > 0 && (
                <form
                  action={async () => {
                    "use server";
                    await markAllAlertsReadAction(workspaceSlug, unreadAlerts.map((a) => a.id));
                  }}
                >
                  <Button type="submit" variant="ghost" size="sm" className="text-xs h-7 px-2">
                    Mark all read
                  </Button>
                </form>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-8 text-center">
                <CheckCircle2 className="h-7 w-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No alerts yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.INFO;
                  const SeverityIcon = cfg.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-xl border p-3 text-sm ${
                        alert.read
                          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                          : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <SeverityIcon className={`h-4 w-4 shrink-0 mt-0.5 ${
                          alert.severity === "CRITICAL" ? "text-red-500" :
                          alert.severity === "WARNING" ? "text-amber-500" : "text-slate-400"
                        }`} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-xs">{alert.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{alert.message}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
