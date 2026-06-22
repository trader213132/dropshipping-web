import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* Settings card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-4 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Team table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
