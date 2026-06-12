import { Loader2 } from "lucide-react";

export default function SetupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-blue-700 dark:text-blue-450" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Setting up your session...</p>
      </div>
    </div>
  );
}
