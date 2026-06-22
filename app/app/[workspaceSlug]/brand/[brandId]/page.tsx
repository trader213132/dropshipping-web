import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, AlertTriangle, Sparkles, Archive } from "lucide-react";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { getBrand } from "@/server/brands";
import { hasRole } from "@/server/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkspaceRole } from "@prisma/client";
import { archiveBrandAction } from "../actions";

interface Props {
  params: Promise<{ workspaceSlug: string; brandId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceSlug, brandId } = await params;
  const user = await requireAuth();
  const r = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!r) return { title: "Brand" };
  const brand = await getBrand(r.workspace.id, brandId);
  return { title: brand?.name ?? "Brand" };
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-lg border border-black/10 shadow-sm shrink-0"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-mono text-slate-900 dark:text-white">{color}</p>
      </div>
    </div>
  );
}

export default async function BrandDetailPage({ params }: Props) {
  const { workspaceSlug, brandId } = await params;
  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const brand = await getBrand(workspace.id, brandId);
  if (!brand) notFound();

  const canAdmin = hasRole(membership.role as WorkspaceRole, "ADMIN");
  const backHref = `/app/${workspaceSlug}/brand` as Route;

  async function doArchive() {
    "use server";
    await archiveBrandAction(workspaceSlug, brandId);
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus-visible:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Brand Studio
      </Link>

      {/* Hero */}
      <div
        className="h-3 rounded-t-2xl"
        style={{
          background: `linear-gradient(to right, ${brand.primaryColor ?? "#6366f1"}, ${brand.accentColor ?? "#f59e0b"})`,
        }}
      />
      <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {brand.aiGenerated && (
                <Badge variant="demo">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI generated
                </Badge>
              )}
              {brand.niche && <Badge variant="outline">{brand.niche}</Badge>}
              <Badge
                variant={brand.status === "ACTIVE" ? "success" : brand.status === "DRAFT" ? "warning" : "secondary"}
                className="capitalize"
              >
                {brand.status.toLowerCase()}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{brand.name}</h1>
            {brand.tagline && (
              <p className="mt-1 text-lg text-slate-500 dark:text-slate-400 italic">&ldquo;{brand.tagline}&rdquo;</p>
            )}
          </div>
        </div>
        {brand.description && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{brand.description}</p>
        )}
        {brand.targetAudience && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Target: </span>
            {brand.targetAudience}
          </p>
        )}
        {brand.voiceTone && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Voice: </span>
            {brand.voiceTone}
          </p>
        )}
      </div>

      {/* Color palette */}
      {(brand.primaryColor ?? brand.secondaryColor ?? brand.accentColor) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Color palette</h2>
          <div className="space-y-3">
            {brand.primaryColor && <ColorSwatch color={brand.primaryColor} label="Primary" />}
            {brand.secondaryColor && <ColorSwatch color={brand.secondaryColor} label="Secondary" />}
            {brand.accentColor && <ColorSwatch color={brand.accentColor} label="Accent" />}
          </div>
        </div>
      )}

      {/* Typography */}
      {(brand.fontDisplay ?? brand.fontBody) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Typography</h2>
          <div className="space-y-3">
            {brand.fontDisplay && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Display / heading</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{brand.fontDisplay}</span>
              </div>
            )}
            {brand.fontBody && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Body text</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{brand.fontBody}</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Use{" "}
            <a
              href="https://fonts.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-600 dark:hover:text-slate-300"
            >
              Google Fonts
            </a>{" "}
            to import these typefaces.
          </p>
        </div>
      )}

      {/* Connected stores */}
      {brand.stores.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Connected stores</h2>
          <ul className="space-y-2">
            {brand.stores.map((store) => (
              <li key={store.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{store.name}</span>
                <Badge
                  variant={store.status === "CONNECTED" ? "success" : "warning"}
                  className="capitalize text-xs"
                >
                  {store.status.toLowerCase()}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legal disclaimer */}
      <div className="flex gap-2 rounded-xl bg-amber-50 p-4 mb-6 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          {brand.legalNote ??
            "Brand name availability requires trademark/legal review before commercial use. AI-generated content is provided as inspiration only."}
        </p>
      </div>

      {/* Admin actions */}
      {canAdmin && brand.status !== "ARCHIVED" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Archive brand</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Move this brand to the archived state. It can be restored later.
          </p>
          <form action={doArchive}>
            <Button type="submit" variant="outline" size="sm">
              <Archive className="mr-1.5 h-4 w-4" />
              Archive brand
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
