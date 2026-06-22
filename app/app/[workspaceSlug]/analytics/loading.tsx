import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-14" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Portfolio scores */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-5 w-44 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
