"use client";

import Link from "next/link";
import type { Route } from "next";
import { Palette, Store, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandCardProps {
  workspaceSlug: string;
  brand: {
    id: string;
    name: string;
    tagline: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    accentColor: string | null;
    status: string;
    aiGenerated: boolean;
    niche: string | null;
    stores: Array<{ id: string; name: string; status: string }>;
  };
}

const STATUS_BADGE: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  ARCHIVED: "secondary",
};

export function BrandCard({ workspaceSlug, brand }: BrandCardProps) {
  const primary = brand.primaryColor ?? "#6366f1";
  const href = `/app/${workspaceSlug}/brand/${brand.id}` as Route;

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-violet-300 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700"
    >
      {/* Color bar */}
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(to right, ${primary}, ${brand.accentColor ?? primary})` }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-white truncate">{brand.name}</span>
              {brand.aiGenerated && (
                <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              )}
            </div>
            {brand.niche && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{brand.niche}</p>
            )}
          </div>
          <Badge variant={STATUS_BADGE[brand.status] ?? "secondary"} className="shrink-0 capitalize text-xs">
            {brand.status.toLowerCase()}
          </Badge>
        </div>

        {brand.tagline && (
          <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-2 mb-3">
            &ldquo;{brand.tagline}&rdquo;
          </p>
        )}

        {/* Swatch row */}
        <div className="flex items-center gap-2 mt-3">
          {[brand.primaryColor, brand.secondaryColor, brand.accentColor]
            .filter(Boolean)
            .map((color, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-full border border-black/10 shadow-sm"
                style={{ backgroundColor: color ?? undefined }}
                title={color ?? undefined}
              />
            ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Palette className="h-3.5 w-3.5" />
            <Palette className="sr-only" />
          </span>
        </div>

        {brand.stores.length > 0 && (
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <Store className="h-3.5 w-3.5" />
            {brand.stores.length} store{brand.stores.length !== 1 ? "s" : ""} connected
          </div>
        )}
      </div>
    </Link>
  );
}
