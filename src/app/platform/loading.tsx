import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformLoading() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Overview cards */}
        <section>
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-1 h-8 w-16" />
              </div>
            ))}
          </div>
        </section>

        {/* Onboarding Funnel */}
        <section>
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="grid gap-4 sm:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="mx-auto h-7 w-12" />
                <Skeleton className="mx-auto mt-1 h-3 w-20" />
              </div>
            ))}
          </div>
        </section>

        {/* Platform forms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <Skeleton className="h-5 w-44" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <section>
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1 h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-1 h-8 w-12" />
              </div>
            ))}
          </div>
        </section>

        {/* Tenants table */}
        <section>
          <Skeleton className="mb-4 h-5 w-20" />
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-7 gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-3 w-16" />
                ))}
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                  {[...Array(7)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-20" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-1 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
