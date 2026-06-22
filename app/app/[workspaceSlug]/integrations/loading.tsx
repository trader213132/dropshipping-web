import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5 mb-4" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
