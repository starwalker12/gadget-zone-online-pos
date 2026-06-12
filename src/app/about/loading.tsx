import { PublicPageHeader } from "@/components/layout/public-page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-900">
      <article className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-[#fff] p-6 shadow-xl sm:p-10 dark:border-slate-700 dark:bg-slate-800">
        <PublicPageHeader />
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-2 h-10 w-40" />
        </div>

        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-6 h-4 w-32" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-8 h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </article>
    </main>
  );
}
