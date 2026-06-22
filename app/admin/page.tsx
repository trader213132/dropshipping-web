import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { requireAuth } from "@/server/auth/session";
import { getAllGlobalFlags, setGlobalFlag } from "@/server/feature-flags";
import { db } from "@/lib/db";
import { audit } from "@/server/audit";
import { Shield, ToggleLeft, ToggleRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — CommerceForge" };

export default async function AdminPage() {
  const user = await requireAuth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!adminEmails.includes(user.email ?? "")) {
    redirect("/" as Route);
  }

  const [flags, recentAudit] = await Promise.all([
    getAllGlobalFlags(),
    db.auditLog
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { workspace: { select: { name: true, slug: true } } },
      })
      .catch(() => []),
  ]);

  async function toggleFlag(key: string, enabled: boolean) {
    "use server";
    const u = await requireAuth();
    const adminList = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!adminList.includes(u.email ?? "")) return;
    await setGlobalFlag(key, enabled);
    await audit({ action: "admin.feature_flag_changed", userId: u.id, metadata: { key, enabled } });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-violet-600 p-2.5">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Platform-wide feature flags and audit logs
            </p>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="rounded-2xl border border-slate-200 bg-white mb-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Feature Flags</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Global platform flags. Workspace owners can override these per-workspace in Settings.
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {flags.map((flag) => {
              const enableAction = toggleFlag.bind(null, flag.key, !flag.enabled);
              return (
                <div key={flag.key} className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                        {flag.key}
                      </span>
                      <Badge variant={flag.enabled ? "success" : "secondary"} className="text-xs">
                        {flag.enabled ? "on" : "off"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {flag.description}
                    </p>
                  </div>
                  <form action={enableAction}>
                    <button
                      type="submit"
                      className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      aria-label={`${flag.enabled ? "Disable" : "Enable"} ${flag.key}`}
                    >
                      {flag.enabled ? (
                        <ToggleRight className="h-7 w-7 text-violet-600" />
                      ) : (
                        <ToggleLeft className="h-7 w-7" />
                      )}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Audit Activity</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAudit.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No audit entries yet.</p>
            ) : (
              recentAudit.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {entry.action}
                    </span>
                    {entry.workspace && (
                      <span className="ml-2 text-xs text-slate-400">
                        in {entry.workspace.name}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.userId && ` · user ${entry.userId.slice(-8)}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Access controlled by <code>ADMIN_EMAILS</code> environment variable.
        </p>
      </div>
    </div>
  );
}
