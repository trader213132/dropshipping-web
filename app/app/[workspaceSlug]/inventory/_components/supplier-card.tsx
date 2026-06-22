"use client";

import { useTransition } from "react";
import { Globe, Package, Trash2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSupplierAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SupplierCardProps {
  workspaceSlug: string;
  supplier: {
    id: string;
    name: string;
    country: string | null;
    website: string | null;
    platform: string | null;
    rating: number | null;
    notes: string | null;
    productLinks: Array<{
      product: { id: string; name: string };
    }>;
  };
  canDelete: boolean;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-slate-300 dark:text-slate-600",
          )}
        />
      ))}
      <span className="ml-1 text-xs text-slate-500">{rating.toFixed(1)}</span>
    </div>
  );
}

export function SupplierCard({ workspaceSlug, supplier, canDelete }: SupplierCardProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteSupplierAction(workspaceSlug, supplier.id);
      toast.success("Supplier removed");
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{supplier.name}</h3>
          {supplier.rating !== null && (
            <div className="mt-1">
              <RatingStars rating={supplier.rating} />
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {supplier.country && (
              <Badge variant="outline" className="text-xs">{supplier.country}</Badge>
            )}
            {supplier.platform && (
              <Badge variant="secondary" className="capitalize text-xs">{supplier.platform}</Badge>
            )}
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-400 hover:text-red-500"
            onClick={handleDelete}
            disabled={pending}
            aria-label="Delete supplier"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {supplier.notes && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{supplier.notes}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Package className="h-3.5 w-3.5" />
          <span>{supplier.productLinks.length} product{supplier.productLinks.length !== 1 ? "s" : ""}</span>
        </div>
        {supplier.website && (
          <a
            href={supplier.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            <Globe className="h-3.5 w-3.5" />
            Visit
          </a>
        )}
      </div>
    </div>
  );
}
