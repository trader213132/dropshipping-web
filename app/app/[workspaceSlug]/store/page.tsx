import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getStores } from "@/server/stores";
import { hasRole } from "@/server/permissions";
import type { WorkspaceRole } from "@prisma/client";
import { ShoppingBag, CheckCircle2, AlertCircle, Clock, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddStoreDialog } from "./_components/add-store-dialog";
import { deleteStoreAction } from "./actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Store Builder" };

const STATUS_CONFIG = {
  CONNECTED: { icon: CheckCircle2, variant: "success" as const, label: "Connected" },
  PENDING: { icon: Clock, variant: "warning" as const, label: "Pending" },
  ERROR: { icon: AlertCircle, variant: "destructive" as const, label: "Error" },
  DISCONNECTED: { icon: WifiOff, variant: "secondary" as const, label: "Disconnected" },
};

const PLATFORM_LABELS: Record<string, string> = {
  SHOPIFY: "Shopify",
  WOOCOMMERCE: "WooCommerce",
  MANUAL: "Manual",
};

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function StorePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const stores = await getStores(workspace.id);
  const canAdd = hasRole(membership.role as WorkspaceRole, "MEMBER");
  const canDelete = hasRole(membership.role as WorkspaceRole, "ADMIN");

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Store Builder</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your e-commerce stores and sync products.
            </p>
          </div>
          {canAdd && <AddStoreDialog workspaceSlug={workspaceSlug} />}
        </div>

        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <ShoppingBag className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="font-medium text-slate-900 dark:text-white">No stores yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add your first store to start syncing products.
            </p>
            {canAdd && (
              <div className="mt-4">
                <AddStoreDialog workspaceSlug={workspaceSlug} />
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => {
              const status = STATUS_CONFIG[store.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = status.icon;

              async function doDelete() {
                "use server";
                await deleteStoreAction(workspaceSlug, store.id);
              }

              return (
                <div
                  key={store.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{store.name}</h3>
                      {store.domain && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{store.domain}</p>
                      )}
                    </div>
                    <Badge variant={status.variant} className="shrink-0 flex items-center gap-1 text-xs">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                      {PLATFORM_LABELS[store.platform] ?? store.platform}
                    </span>
                    <span>{store.currency}</span>
                  </div>

                  {store.brand && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Brand: <span className="text-slate-700 dark:text-slate-300">{store.brand.name}</span>
                    </p>
                  )}

                  {store.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{store.description}</p>
                  )}

                  {canDelete && (
                    <form action={doDelete} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs h-7 px-2">
                        Remove store
                      </Button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Shopify connection note */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Connect Shopify</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Full Shopify OAuth integration is available via the Integrations page. Once connected, products and inventory sync automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
