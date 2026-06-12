import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#050c1a]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-blue-700 dark:text-cyan-400" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading SaleDock...</p>
      </div>
    </div>
  );
}
