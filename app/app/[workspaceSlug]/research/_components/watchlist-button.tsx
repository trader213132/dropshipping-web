"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWatchlistAction } from "../actions";
import { toast } from "sonner";

interface WatchlistButtonProps {
  workspaceSlug: string;
  productId: string;
  watchlisted: boolean;
  size?: "sm" | "md";
}

export function WatchlistButton({ workspaceSlug, productId, watchlisted, size = "md" }: WatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleWatchlistAction(workspaceSlug, productId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.watchlisted ? "Added to watchlist" : "Removed from watchlist");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={watchlisted ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={watchlisted}
      className={cn(
        "rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        size === "sm" ? "p-1" : "p-2",
        watchlisted
          ? "text-rose-500 hover:text-rose-600"
          : "text-slate-300 hover:text-rose-400 dark:text-slate-600 dark:hover:text-rose-400",
        isPending && "opacity-50 cursor-wait",
      )}
    >
      <Heart className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", watchlisted && "fill-current")} />
    </button>
  );
}
