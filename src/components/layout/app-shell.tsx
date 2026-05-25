import type { ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const mobileLinks = [
  ["Dashboard", "/dashboard"],
  ["POS", "/pos"],
  ["Products", "/products"],
  ["Customers", "/customers"],
  ["Reports", "/reports"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto">
              {mobileLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
