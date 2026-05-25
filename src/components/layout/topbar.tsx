import Link from "next/link";
import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-20 flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700">
            Cloud foundation
          </p>
          <h1 className="text-2xl font-black text-slate-950">
            Gadget Zone Online POS
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search className="size-4" />
            <span className="sr-only">Search</span>
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search foundation..."
            />
          </label>
          <button className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-600">
            <Bell className="size-4" />
          </button>
          <Link
            href="/pos"
            className="flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            Open POS
          </Link>
        </div>
      </div>
    </header>
  );
}
