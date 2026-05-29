import Link from "next/link";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  ReceiptText,
  RotateCcw,
  Settings,
  ShoppingCart,
  Users,
  CalendarCheck,
  Wallet,
  Wrench,
  UserCog,
  ScrollText,
  Truck,
  MonitorCog,
} from "lucide-react";
import { getCurrentContext } from "@/lib/auth/session";
import { canManageUsers, canViewAuditLog, canManageSupplierPurchases } from "@/lib/permissions";
import { isPlatformAdmin } from "@/lib/platform/admin";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/returns", label: "Returns", icon: RotateCcw },
  { href: "/repairs", label: "Repairs", icon: Wrench },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/daily-closing", label: "Daily Closing", icon: CalendarCheck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export async function Sidebar() {
  const { profile } = await getCurrentContext();
  const [platformAdmin] = await Promise.all([isPlatformAdmin()]);
  const visibleItems: NavItem[] = [
    ...items,
    ...(canManageSupplierPurchases(profile?.role)
      ? [{ href: "/suppliers/purchases", label: "Purchases", icon: Truck }]
      : []),
    ...(canViewAuditLog(profile?.role) ? [{ href: "/audit-log", label: "Audit Log", icon: ScrollText }] : []),
    ...(canManageUsers(profile?.role) ? [{ href: "/users", label: "Users", icon: UserCog }] : []),
    { href: "/settings", label: "Settings", icon: Settings },
    ...(platformAdmin ? [{ href: "/platform", label: "Platform", icon: MonitorCog }] : []),
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
