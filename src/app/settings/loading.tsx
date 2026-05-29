import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <AppShell pageTitle="Settings">
      <div className="w-full space-y-5">
        {/* Tab bar skeleton */}
        <div className="flex gap-1 border-b border-slate-200 pb-px dark:border-slate-800">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className={`h-10 rounded-t-lg ${i === 0 ? "w-32" : i === 1 ? "w-44" : i === 2 ? "w-36" : i === 3 ? "w-28" : "w-40"}`}
            />
          ))}
        </div>

        {/* Active tab content skeleton */}
        <div className="space-y-5">
          {/* Section card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          </div>

          {/* Section card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Connected Accounts section card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
