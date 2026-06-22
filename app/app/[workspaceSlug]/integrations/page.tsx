import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getIntegrations } from "@/server/integrations";
import { hasRole } from "@/server/permissions";
import type { WorkspaceRole } from "@prisma/client";
import { CheckCircle2, XCircle, AlertCircle, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Integrations" };

const STATUS_CONFIG = {
  CONNECTED: { icon: CheckCircle2, color: "text-emerald-500", badge: "success" as const, label: "Connected" },
  NOT_CONNECTED: { icon: Plug, color: "text-slate-400", badge: "secondary" as const, label: "Not connected" },
  ERROR: { icon: AlertCircle, color: "text-red-500", badge: "destructive" as const, label: "Error" },
  REVOKED: { icon: XCircle, color: "text-slate-400", badge: "secondary" as const, label: "Disconnected" },
};

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function IntegrationsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const integrations = await getIntegrations(workspace.id);
  const isAdmin = hasRole(membership.role as WorkspaceRole, "ADMIN");

  const connected = integrations.filter((i) => i.record?.status === "CONNECTED").length;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Integrations</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Connect external services to extend CommerceForge AI.{" "}
              {connected > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{connected} active</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map(({ provider, meta, record }) => {
            const status = record?.status ?? "NOT_CONNECTED";
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_CONNECTED;
            const StatusIcon = cfg.icon;
            const isConnected = status === "CONNECTED";

            return (
              <div
                key={provider}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{meta.label}</h3>
                  <Badge variant={cfg.badge} className="flex items-center gap-1 text-xs shrink-0">
                    <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {meta.description}
                </p>
                {isAdmin && (
                  <Button
                    variant={isConnected ? "outline" : "forge"}
                    size="sm"
                    className="w-full"
                    disabled
                  >
                    {isConnected ? "Manage" : "Connect"}
                  </Button>
                )}
                {isConnected && record?.connectedAt && (
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Connected {new Date(record.connectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">OAuth integrations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shopify and Stripe OAuth flows require setting up app credentials in those platforms&apos; developer portals, then configuring{" "}
            <code className="font-mono">SHOPIFY_CLIENT_ID</code>,{" "}
            <code className="font-mono">SHOPIFY_CLIENT_SECRET</code>,{" "}
            <code className="font-mono">STRIPE_SECRET_KEY</code>, and{" "}
            <code className="font-mono">STRIPE_WEBHOOK_SECRET</code>{" "}
            environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}
