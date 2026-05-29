import Link from "next/link";
import { getCurrentContext } from "@/lib/auth/session";
import { canManageUsers, canViewAuditLog, canManageSupplierPurchases } from "@/lib/permissions";
import { isPlatformAdmin } from "@/lib/platform/admin";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/pos", label: "POS", icon: "pos" },
  { href: "/products", label: "Products", icon: "products" },
  { href: "/customers", label: "Customers", icon: "customers" },
  { href: "/invoices", label: "Invoices", icon: "invoices" },
  { href: "/returns", label: "Returns", icon: "returns" },
  { href: "/repairs", label: "Repairs", icon: "repairs" },
  { href: "/expenses", label: "Expenses", icon: "expenses" },
  { href: "/daily-closing", label: "Daily Closing", icon: "dailyClosing" },
  { href: "/reports", label: "Reports", icon: "reports" },
];

export async function Sidebar() {
  const { profile } = await getCurrentContext();
  const [platformAdmin] = await Promise.all([isPlatformAdmin()]);
  const visibleItems: NavItem[] = [
    ...items,
    ...(canManageSupplierPurchases(profile?.role)
      ? [{ href: "/suppliers/purchases", label: "Purchases", icon: "purchases" }]
      : []),
    ...(canViewAuditLog(profile?.role) ? [{ href: "/audit-log", label: "Audit Log", icon: "auditLog" }] : []),
    ...(canManageUsers(profile?.role) ? [{ href: "/users", label: "Users", icon: "users" }] : []),
    { href: "/settings", label: "Settings", icon: "settings" },
    ...(platformAdmin ? [{ href: "/platform", label: "Platform", icon: "platform" }] : []),
  ];

  return (
    // h-dvh + flex column so the header stays fixed and the nav scrolls
    // internally when the list is taller than the viewport. The outer shell
    // is overflow-hidden, so this sidebar never moves when main scrolls.
    <aside className="hidden h-dvh w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <Link href="/dashboard" className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/saledock-logo-full.png"
          alt="SaleDock Cloud POS"
          className="h-9 w-auto max-w-[160px] object-contain brightness-0 dark:invert"
        />
      </Link>
      <SidebarNav items={visibleItems} />
    </aside>
  );
}
