import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
  return (
    <AppShell pageTitle="Invoices">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-6 rounded-lg" />
            </div>
            <Skeleton className="mt-2 h-7 w-20" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Filter + Action bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-6 gap-4 border-b border-slate-100 pb-2 dark:border-slate-800">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20 justify-self-end" />
            <Skeleton className="h-3 w-16 justify-self-end" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
              <Skeleton className="h-4 w-20 font-mono" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20 justify-self-end" />
              <Skeleton className="h-4 w-20 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
