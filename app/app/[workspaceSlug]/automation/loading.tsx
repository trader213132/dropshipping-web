import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Rules list */}
          <div className="lg:col-span-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
