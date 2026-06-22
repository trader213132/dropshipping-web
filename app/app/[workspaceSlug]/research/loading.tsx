import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>

        {/* Filter row */}
        <div className="mb-6 flex gap-3">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>

        {/* Product cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1.5 flex-1 mr-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
