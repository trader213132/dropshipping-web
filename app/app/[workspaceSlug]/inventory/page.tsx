import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getSuppliers } from "@/server/suppliers";
import { hasRole } from "@/server/permissions";
import type { WorkspaceRole } from "@prisma/client";
import { Package2 } from "lucide-react";
import { SupplierCard } from "./_components/supplier-card";
import { AddSupplierDialog } from "./_components/add-supplier-dialog";

export const metadata: Metadata = { title: "Inventory & Suppliers" };

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function InventoryPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const suppliers = await getSuppliers(workspace.id);
  const canAdd = hasRole(membership.role as WorkspaceRole, "MEMBER");
  const canDelete = hasRole(membership.role as WorkspaceRole, "ADMIN");

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Inventory & Suppliers</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your supply chain, track costs, and link suppliers to products.
            </p>
          </div>
          {canAdd && <AddSupplierDialog workspaceSlug={workspaceSlug} />}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: "Total suppliers", value: suppliers.length },
            {
              label: "Linked products",
              value: new Set(suppliers.flatMap((s) => s.productLinks.map((l) => l.product.id))).size,
            },
            {
              label: "Countries sourced",
              value: new Set(suppliers.map((s) => s.country).filter(Boolean)).size,
            },
            {
              label: "Platforms",
              value: new Set(suppliers.map((s) => s.platform).filter(Boolean)).size,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Supplier grid */}
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <Package2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="font-medium text-slate-900 dark:text-white">No suppliers yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add your first supplier to start building your supply chain.
            </p>
            {canAdd && (
              <div className="mt-4">
                <AddSupplierDialog workspaceSlug={workspaceSlug} />
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                workspaceSlug={workspaceSlug}
                supplier={supplier}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
