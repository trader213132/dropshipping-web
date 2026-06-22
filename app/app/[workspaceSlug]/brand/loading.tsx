import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <Skeleton className="h-4 w-3/4 bg-amber-200 dark:bg-amber-900" />
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-2 w-full rounded-none" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-5 w-5 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
