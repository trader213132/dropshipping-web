import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getBrands } from "@/server/brands";
import { hasRole } from "@/server/permissions";
import type { WorkspaceRole } from "@prisma/client";
import { Palette } from "lucide-react";
import { BrandCard } from "./_components/brand-card";
import { CreateBrandDialog } from "./_components/create-brand-dialog";

export const metadata: Metadata = { title: "Brand Studio" };

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function BrandPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const brands = await getBrands(workspace.id);
  const canCreate = hasRole(membership.role as WorkspaceRole, "MEMBER");

  const activeBrands = brands.filter((b) => b.status !== "ARCHIVED");
  const archivedBrands = brands.filter((b) => b.status === "ARCHIVED");

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Brand Studio</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              AI-generated brand identities — names, colors, fonts, and voice.
            </p>
          </div>
          {canCreate && <CreateBrandDialog workspaceSlug={workspaceSlug} />}
        </div>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          Brand name availability requires trademark/legal review before commercial use. AI-generated names are suggestions only.
        </div>

        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <Palette className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="font-medium text-slate-900 dark:text-white">No brands yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Generate your first AI brand kit to get started.
            </p>
            {canCreate && (
              <div className="mt-4">
                <CreateBrandDialog workspaceSlug={workspaceSlug} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeBrands.map((brand) => (
                  <BrandCard key={brand.id} workspaceSlug={workspaceSlug} brand={brand} />
                ))}
              </div>
            </div>
            {archivedBrands.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Archived</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedBrands.map((brand) => (
                    <BrandCard key={brand.id} workspaceSlug={workspaceSlug} brand={brand} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
