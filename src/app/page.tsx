import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getCurrentContext } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { FaqSection } from "@/components/faq-section";
import { getServerDict } from "@/lib/i18n/server";

import { DashboardPreview } from "@/components/home/dashboard-preview";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { SecuritySection } from "@/components/home/security-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { CtaSection } from "@/components/home/cta-section";

import {
  ShoppingCart,
  PackageCheck,
  Wrench,
  ReceiptText,
  BadgeDollarSign,
  BarChart3,
  DatabaseBackup,
  Store,
  ShieldCheck,
  Shield,
  LockKeyhole,
  Users,
  Receipt,
  PackageSearch,
  CreditCard,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart, title: "Sales & POS",
    desc: "Fast checkout with barcode scanning, discounts, split payments, and instant receipt printing.",
    gradient: "linear-gradient(135deg,#1d4ed8,#0891b2)",
    glow: "rgba(29,78,216,0.18)",
    tags: ["Barcode scan", "Split payment", "Thermal receipt", "Discounts"],
  },
  {
    icon: PackageCheck, title: "Inventory & FIFO",
    desc: "Multi-lot stock tracking with real cost valuation, low-stock alerts, and supplier management.",
    gradient: "linear-gradient(135deg,#047857,#0d9488)",
    glow: "rgba(4,120,87,0.18)",
    tags: null,
  },
  {
    icon: Wrench, title: "Repairs",
    desc: "Complete repair lifecycle: intake, diagnosis, parts tracking, status updates, and customer notifications.",
    gradient: "linear-gradient(135deg,#6d28d9,#a21caf)",
    glow: "rgba(109,40,217,0.18)",
    tags: null,
  },
  {
    icon: ReceiptText, title: "Invoices & Returns",
    desc: "Professional A4 invoices, 80mm thermal receipts, credit notes, and seamless return-to-stock.",
    gradient: "linear-gradient(135deg,#0369a1,#0891b2)",
    glow: "rgba(3,105,161,0.18)",
    tags: null,
  },
  {
    icon: BadgeDollarSign, title: "Expenses",
    desc: "Track every expense by category and vendor with detailed reporting and daily closing summaries.",
    gradient: "linear-gradient(135deg,#b45309,#d97706)",
    glow: "rgba(180,83,9,0.18)",
    tags: null,
  },
  {
    icon: BarChart3, title: "Reports",
    desc: "Daily closing, sales analytics, customer ledgers, and exportable business performance reports.",
    gradient: "linear-gradient(135deg,#be123c,#e11d48)",
    glow: "rgba(190,18,60,0.18)",
    tags: null,
  },
  {
    icon: DatabaseBackup, title: "Backup & Restore",
    desc: "Offline ZIP and online JSON backup import with integrity checks, field mapping, and dry-run validation.",
    gradient: "linear-gradient(135deg,#334155,#475569)",
    glow: "rgba(51,65,85,0.18)",
    tags: null,
  },
  {
    icon: Store, title: "Multi-shop onboarding",
    desc: "Self-service shop setup wizard with branded colors, social links, map location, and Google/Facebook login.",
    gradient: "linear-gradient(135deg,#0f766e,#0d9488)",
    glow: "rgba(15,118,110,0.18)",
    tags: null,
  },
  {
    icon: ShieldCheck, title: "Platform controls",
    desc: "Admin console for maintenance mode, sign-up toggles, audit logs, user management, and security settings.",
    gradient: "linear-gradient(135deg,#c2410c,#ea580c)",
    glow: "rgba(194,65,12,0.18)",
    tags: null,
  },
];

const securityItems = [
  {
    icon: Shield, title: "Tenant isolation",
    desc: "Each shop operates in a separate data partition with Row-Level Security. No shop can see another shop's data.",
    gradient: "linear-gradient(135deg,#0f766e,#047857)",
  },
  {
    icon: Users, title: "Role-based access",
    desc: "Owner, admin, staff — each role has granular permissions. Platform admins see only aggregate usage data.",
    gradient: "linear-gradient(135deg,#1d4ed8,#0369a1)",
  },
  {
    icon: DatabaseBackup, title: "Backup safety checks",
    desc: "Imported backups run integrity verification with field mapping, schema validation, and tamper detection before restoring.",
    gradient: "linear-gradient(135deg,#6d28d9,#4c1d95)",
  },
  {
    icon: LockKeyhole, title: "Defensive hardening",
    desc: "Input sanitization, LIKE-escaping, SQL injection prevention, safe redirect validation, and XSS protection across all user inputs.",
    gradient: "linear-gradient(135deg,#92400e,#b45309)",
  },
];

const trustPills = [
  { label: "Inventory", color: "#10b981" },
  { label: "Repairs",   color: "#6d28d9" },
  { label: "Invoices",  color: "#0369a1" },
  { label: "Reports",   color: "#be123c" },
  { label: "Backups",   color: "#0d9488" },
];

const kpiData = [
  { label: "Today Sales",      value: "Rs 47,280", change: "+12%",        color: "#3b82f6" },
  { label: "Inventory Alerts", value: "3 items",   change: "low stock",   color: "#f59e0b" },
  { label: "Repairs Open",     value: "5 jobs",    change: "2 due today", color: "#8b5cf6" },
  { label: "Due Payments",     value: "Rs 18,500", change: "4 customers", color: "#10b981" },
];

const dashboardRows = [
  { icon: Receipt,       left: "Sale completed — Receipt #1042",        right: "Rs 7,280",  color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  { icon: PackageSearch, left: "Low stock alert — USB-C cable",          right: "3 left",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  { icon: Wrench,        left: "Repair — Screen replacement",            right: "Ready",     color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  { icon: CreditCard,    left: "Payment reminder — Sample customer due", right: "Rs 18,500", color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
];

const salesChartBars = [
  { day: "M", v: 52 }, { day: "T", v: 68 }, { day: "W", v: 60 },
  { day: "T", v: 82 }, { day: "F", v: 95 }, { day: "S", v: 75 },
  { day: "S", v: 41 },
];

const sidebarIcons = [ShoppingCart, PackageCheck, Wrench, BarChart3, Receipt];

const shopDaySteps = [
  { icon: Clock,        time: "Opening",    title: "Start the register", desc: "Cash count, opening summary, daily targets." },
  { icon: ShoppingCart, time: "Throughout", title: "Ring up sales",      desc: "Barcode scan, split payments, instant receipts." },
  { icon: Wrench,       time: "As needed",  title: "Handle repairs",     desc: "Check-in, update status, notify customers." },
  { icon: BarChart3,    time: "End of day", title: "Close & reconcile",  desc: "Daily closing report and cash reconciliation." },
  { icon: Receipt,      time: "Evening",    title: "Review analytics",   desc: "Sales trends, ledger, and tomorrow's prep." },
];

const howItWorks = [
  { step: "1", title: "Create your account", desc: "Sign up with email or Google/Facebook. Takes less than a minute." },
  { step: "2", title: "Set up your shop",    desc: "Name your shop, pick brand colors, add location, and configure currency." },
  { step: "3", title: "Start selling",       desc: "Ring up sales, manage inventory, track repairs, and run reports from one dashboard." },
];


export default async function HomePage() {
  const { dict } = await getServerDict();
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const d = dict as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (env.isSupabaseConfigured) {
    const { user, profile, organization } = await getCurrentContext();
    if (user) {
      const needsOnboarding =
        !profile?.organization_id || !profile?.onboarding_completed || !organization?.onboarding_completed;
      if (needsOnboarding) redirect("/onboarding");
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#050c1a]">

      {/* ── STICKY NAV ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-[#0b2f6f] to-[#0d9488] shadow-lg shadow-blue-900/20 dark:border-white/[0.06] dark:bg-[#050c1a]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center rounded-2xl bg-white/95 px-4 py-2 shadow-sm ring-1 ring-white/40 dark:bg-white/95">
            <Image src="/saledock-logo-full.png" alt="SaleDock Cloud POS" width={488} height={178}
              className="h-8 w-auto object-contain sm:h-9" priority />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <>
              <Link href="/login"
                className="hidden h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5 sm:flex sm:text-sm">
                {d.nav?.signIn || "Sign in"}
              </Link>
              <Link href="/login?signup=1"
                className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-[#fff] px-4 text-xs font-bold text-[#0b2f6f] shadow-lg shadow-black/10 transition-all duration-200 hover:bg-[#fff]/90 hover:-translate-y-0.5 sm:text-sm dark:bg-cyan-300 dark:text-[#020617] dark:hover:bg-cyan-200">
                {d.nav?.startFree || "Start free"}
              </Link>
            </>
          </div>
        </div>
      </nav>

      <HeroSection
        d={d}
        trustPills={trustPills}
        kpiData={kpiData}
        dashboardRows={dashboardRows}
        salesChartBars={salesChartBars}
        sidebarIcons={sidebarIcons}
      />

      {/* Dashboard on mobile (below hero text, no tilt) */}
      <section className="block px-4 pb-12 lg:hidden">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 dark:border-white/[0.07] dark:shadow-black/50">
          <div className="dark:hidden"><DashboardPreview kpi={kpiData} rows={dashboardRows} bars={salesChartBars} icons={sidebarIcons} dark={false} /></div>
          <div className="hidden dark:block"><DashboardPreview kpi={kpiData} rows={dashboardRows} bars={salesChartBars} icons={sidebarIcons} dark={true} /></div>
        </div>
      </section>

      <FeaturesSection features={features} />

      <SecuritySection securityItems={securityItems} />

      <WorkflowSection shopDaySteps={shopDaySteps} />

      <HowItWorksSection howItWorks={howItWorks} />

      <CtaSection d={d} />

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12 dark:border-white/[0.05] dark:bg-[#070b16]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center">
            <Image src="/saledock-logo-full.png" alt="SaleDock Cloud POS" width={488} height={178}
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <Link href="/privacy"       className="transition-colors duration-200 hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms"         className="transition-colors duration-200 hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</Link>
            <Link href="/data-deletion" className="transition-colors duration-200 hover:text-slate-700 dark:hover:text-slate-300">Data Deletion</Link>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <a href="mailto:fardan.aatir@outlook.com" className="transition-colors duration-200 hover:text-slate-700 dark:hover:text-slate-300">fardan.aatir@outlook.com</a>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} SaleDock Cloud POS
          </p>
        </div>
      </footer>
    </div>
  );
}
