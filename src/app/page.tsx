import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";
import { getCurrentContext } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollReveal } from "@/components/scroll-reveal";
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
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart, title: "Sales & POS",
    desc: "Fast checkout with barcode scanning, discounts, split payments, and instant receipt printing.",
    gradient: "linear-gradient(135deg,#2563eb,#06b6d4)",
    glow: "rgba(37,99,235,0.22)",
  },
  {
    icon: PackageCheck, title: "Inventory & FIFO",
    desc: "Multi-lot stock tracking with real cost valuation, low-stock alerts, and supplier management.",
    gradient: "linear-gradient(135deg,#059669,#14b8a6)",
    glow: "rgba(5,150,105,0.22)",
  },
  {
    icon: Wrench, title: "Repairs",
    desc: "Complete repair lifecycle: intake, diagnosis, parts tracking, status updates, and customer notifications.",
    gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
    glow: "rgba(124,58,237,0.22)",
  },
  {
    icon: ReceiptText, title: "Invoices & Returns",
    desc: "Professional A4 invoices, 80mm thermal receipts, credit notes, and seamless return-to-stock.",
    gradient: "linear-gradient(135deg,#0891b2,#22d3ee)",
    glow: "rgba(8,145,178,0.22)",
  },
  {
    icon: BadgeDollarSign, title: "Expenses",
    desc: "Track every expense by category and vendor with detailed reporting and daily closing summaries.",
    gradient: "linear-gradient(135deg,#d97706,#fbbf24)",
    glow: "rgba(217,119,6,0.22)",
  },
  {
    icon: BarChart3, title: "Reports",
    desc: "Daily closing, sales analytics, customer ledgers, and exportable business performance reports.",
    gradient: "linear-gradient(135deg,#e11d48,#f43f5e)",
    glow: "rgba(225,29,72,0.22)",
  },
  {
    icon: DatabaseBackup, title: "Backup & Restore",
    desc: "Offline ZIP and online JSON backup import with integrity checks, field mapping, and dry-run validation.",
    gradient: "linear-gradient(135deg,#475569,#64748b)",
    glow: "rgba(71,85,105,0.22)",
  },
  {
    icon: Store, title: "Multi-shop onboarding",
    desc: "Self-service shop setup wizard with branded colors, social links, map location, and Google/Facebook login.",
    gradient: "linear-gradient(135deg,#0d9488,#2dd4bf)",
    glow: "rgba(13,148,136,0.22)",
  },
  {
    icon: ShieldCheck, title: "Platform controls",
    desc: "Admin console for maintenance mode, sign-up toggles, audit logs, user management, and security settings.",
    gradient: "linear-gradient(135deg,#ea580c,#f97316)",
    glow: "rgba(234,88,12,0.22)",
  },
];

const securityItems = [
  {
    icon: Shield, title: "Tenant isolation",
    desc: "Each shop operates in a separate data partition with Row-Level Security. No shop can see another shop's data.",
    gradient: "linear-gradient(135deg,#0d9488,#059669)",
  },
  {
    icon: Users, title: "Role-based access",
    desc: "Owner, admin, staff — each role has granular permissions. Platform admins see only aggregate usage data.",
    gradient: "linear-gradient(135deg,#2563eb,#0891b2)",
  },
  {
    icon: DatabaseBackup, title: "Backup safety checks",
    desc: "Imported backups run integrity verification with field mapping, schema validation, and tamper detection before restoring.",
    gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)",
  },
  {
    icon: LockKeyhole, title: "Defensive hardening",
    desc: "Input sanitization, LIKE-escaping, SQL injection prevention, safe redirect validation, and XSS protection applied across all user inputs.",
    gradient: "linear-gradient(135deg,#b45309,#d97706)",
  },
];

const trustPills = [
  { label: "Inventory", color: "#10b981" },
  { label: "Repairs",   color: "#3b82f6" },
  { label: "Invoices",  color: "#8b5cf6" },
  { label: "Reports",   color: "#f59e0b" },
  { label: "Backups",   color: "#06b6d4" },
];

const kpiData = [
  { label: "Today Sales",      value: "Rs 47,280",  change: "+12%",        color: "#3b82f6" },
  { label: "Inventory Alerts", value: "3 items",    change: "low stock",   color: "#f59e0b" },
  { label: "Repairs Open",     value: "5 jobs",     change: "2 due today", color: "#8b5cf6" },
  { label: "Due Payments",     value: "Rs 18,500",  change: "4 customers", color: "#10b981" },
];

const dashboardRows = [
  { icon: Receipt,      left: "Sale completed — Receipt #1042",        right: "Rs 7,280",  color: "#3b82f6", bg: "rgba(59,130,246,0.18)"  },
  { icon: PackageSearch,left: "Low stock alert — USB-C cable",          right: "3 left",    color: "#f59e0b", bg: "rgba(245,158,11,0.18)"  },
  { icon: Wrench,       left: "Repair updated — Screen replacement",    right: "Ready",     color: "#8b5cf6", bg: "rgba(139,92,246,0.18)"  },
  { icon: CreditCard,   left: "Payment reminder — Sample customer due", right: "Rs 18,500", color: "#10b981", bg: "rgba(16,185,129,0.18)"  },
];

const salesChartBars = [
  { day: "M", value: 54 }, { day: "T", value: 70 }, { day: "W", value: 62 },
  { day: "T", value: 85 }, { day: "F", value: 96 }, { day: "S", value: 78 },
  { day: "S", value: 44 },
];

const sidebarIcons = [ShoppingCart, PackageCheck, Wrench, BarChart3, Receipt];

const shopDaySteps = [
  { icon: Clock,        time: "Opening",    title: "Start the register",   desc: "Cash count, opening summary, and daily targets set." },
  { icon: ShoppingCart, time: "Throughout", title: "Ring up sales",        desc: "Barcode scan, split payments, discounts, instant receipts." },
  { icon: Wrench,       time: "As needed",  title: "Handle repairs",       desc: "Check in devices, update job status, notify customers." },
  { icon: BarChart3,    time: "End of day", title: "Close & reconcile",    desc: "Daily closing report, cash count, and summary export." },
  { icon: Receipt,      time: "Evening",    title: "Review analytics",     desc: "Sales trends, top products, customer ledger, tomorrow's prep." },
];

const howItWorks = [
  { step: "1", title: "Create your account", desc: "Sign up with your email or Google/Facebook. Takes less than a minute." },
  { step: "2", title: "Set up your shop",     desc: "Name your shop, pick brand colors, add your location, and configure currency." },
  { step: "3", title: "Start selling",        desc: "Ring up sales, manage inventory, track repairs, and run reports from one dashboard." },
];

export default async function HomePage() {
  let signedInUser: { name: string; needsOnboarding: boolean } | null = null;

  if (env.isSupabaseConfigured) {
    const { user, profile, organization } = await getCurrentContext();
    if (user) {
      const needsOnboarding =
        !profile?.organization_id || !profile?.onboarding_completed || !organization?.onboarding_completed;
      signedInUser = {
        name: profile?.full_name ?? user.email ?? "User",
        needsOnboarding,
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#070b16]">

      {/* ═══════════════════════════════════════════════════════════════════════
          DARK HERO WRAPPER — always deep navy, command-center atmosphere
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-[#040d1c]">

        {/* Orbital ring decorations */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {[380, 600, 840, 1100].map((size, i) => (
            <div
              key={size}
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow-pulse"
              style={{
                width: size,
                height: size,
                border: `1px solid rgba(0,212,200,${0.14 - i * 0.03})`,
                animationDelay: `${i * 0.9}s`,
                animationDuration: `${5 + i * 1.5}s`,
              }}
            />
          ))}
        </div>

        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: "radial-gradient(circle,#94a3b8 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Teal radial glow centred on hero text */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,212,200,0.1) 0%,transparent 70%)",
          }}
        />

        {/* ── STICKY NAV ── */}
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#040d1c]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="group flex shrink-0 items-center">
              <Image
                src="/saledock-logo-full.png"
                alt="SaleDock Cloud POS"
                width={1095}
                height={336}
                className="h-10 w-auto object-contain brightness-0 invert transition-opacity duration-200 group-hover:opacity-80"
                priority
              />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {signedInUser ? (
                <Link
                  href={signedInUser.needsOnboarding ? "/onboarding" : "/dashboard"}
                  className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 text-xs font-bold text-[#040d1c] shadow-lg shadow-teal-500/25 transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:-translate-y-0.5 sm:text-sm"
                >
                  {signedInUser.needsOnboarding ? "Continue setup" : "Dashboard"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 sm:flex sm:text-sm"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login?signup=1"
                    className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 text-xs font-bold text-[#040d1c] shadow-lg shadow-teal-500/25 transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:-translate-y-0.5 sm:text-sm"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO CONTENT ── */}
        <section className="relative px-4 pb-10 pt-16 text-center sm:pb-14 sm:pt-24">
          <div className="relative mx-auto max-w-4xl">

            {/* Logo mark above heading */}
            <div
              className="animate-fade-in-up mx-auto mb-6 flex items-center justify-center"
              style={{ animationDelay: "0.05s" }}
            >
              <Image
                src="/saledock-logo-full.png"
                alt="SaleDock Cloud POS"
                width={1095}
                height={336}
                className="h-16 w-auto max-w-[240px] object-contain brightness-0 invert opacity-90 drop-shadow-lg sm:h-20 sm:max-w-[300px]"
                priority
              />
            </div>

            {/* Badge pill */}
            <div
              className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3.5 py-1.5 backdrop-blur-sm"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="font-display text-xs font-semibold tracking-widest text-teal-300 uppercase">Cloud POS Platform</span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-in-up font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animationDelay: "0.15s" }}
            >
              Run your shop smarter
            </h1>

            {/* Sub-headline */}
            <p
              className="animate-fade-in-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
              style={{ animationDelay: "0.25s" }}
            >
              A modern cloud POS platform for shops to manage sales, inventory, repairs,
              invoices, expenses, and reports — all from one place.
            </p>

            {/* CTAs */}
            <div
              className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "0.35s" }}
            >
              {signedInUser ? (
                <Link
                  href={signedInUser.needsOnboarding ? "/onboarding" : "/dashboard"}
                  className="group flex h-13 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 text-sm font-bold text-[#040d1c] shadow-lg shadow-teal-500/30 transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:shadow-xl hover:-translate-y-0.5 sm:w-auto"
                >
                  {signedInUser.needsOnboarding ? "Continue setup" : "Go to dashboard"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login?signup=1"
                    className="group flex h-12 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 text-sm font-bold text-[#040d1c] shadow-lg shadow-teal-500/30 transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:shadow-xl hover:-translate-y-0.5 sm:w-auto"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="flex h-12 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 sm:w-auto"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {/* Trust line */}
            <p
              className="animate-fade-in-up mt-3 text-xs text-slate-500"
              style={{ animationDelay: "0.4s" }}
            >
              No credit card required · Free to start
            </p>

            {!env.isSupabaseConfigured && (
              <p className="mx-auto mt-5 max-w-lg rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300">
                Supabase is not configured yet. Add credentials to{" "}
                <code className="text-xs">.env.local</code>.
              </p>
            )}

            {/* Trust pills */}
            <div
              className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-2"
              style={{ animationDelay: "0.45s" }}
            >
              {trustPills.map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm"
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: pill.color }}
                  />
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW (integrated in dark hero) ── */}
        <section className="relative mx-auto w-full max-w-5xl px-4 pb-16 sm:pb-24">
          <div className="animate-float-gentle overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60 ring-1 ring-white/5"
            style={{ background: "linear-gradient(135deg,rgba(10,22,50,0.95),rgba(5,18,40,0.98))" }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500/70" />
              <span className="inline-block h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="ml-2 truncate rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-400">
                saledock-cloud-pos.vercel.app/dashboard
              </span>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="hidden border-r border-white/[0.07] bg-white/[0.02] p-2 sm:flex sm:flex-col sm:gap-1">
                {sidebarIcons.map((Icon, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150"
                    style={
                      i === 0
                        ? { background: "linear-gradient(135deg,#0891b2,#06b6d4)", color: "#040d1c" }
                        : { color: "rgba(148,163,184,0.5)" }
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4">
                {/* KPI row */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {kpiData.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3.5 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">{kpi.label}</span>
                        <span
                          className="inline-block h-2 w-2 rounded-full animate-pulse"
                          style={{ backgroundColor: kpi.color }}
                        />
                      </div>
                      <p className="mt-2 font-display text-base font-bold text-white">{kpi.value}</p>
                      <p
                        className="mt-0.5 text-[11px] font-semibold"
                        style={{ color: kpi.color }}
                      >
                        {kpi.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart + activity two-column on larger screens */}
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px]">
                  {/* Activity feed */}
                  <div className="space-y-1.5">
                    {dashboardRows.map((row) => {
                      const Icon = row.icon;
                      return (
                        <div
                          key={row.left}
                          className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.03] p-2.5 transition-all duration-200 hover:bg-white/[0.06]"
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: row.bg, color: row.color }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate text-xs font-semibold text-slate-300">{row.left}</span>
                          <span
                            className="ml-auto shrink-0 text-xs font-bold"
                            style={{ color: row.color }}
                          >
                            {row.right}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mini bar chart */}
                  <div className="hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 lg:block">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Weekly sales</p>
                    <div className="flex items-end gap-1" style={{ height: "60px" }}>
                      {salesChartBars.map((bar, i) => (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1">
                          <div className="flex h-[52px] w-full items-end">
                            <div
                              className="w-full rounded-t-sm animate-bar-grow"
                              style={{
                                height: `${bar.value}%`,
                                background:
                                  i >= 3 && i <= 4
                                    ? "linear-gradient(to top,#0891b2,#06b6d4)"
                                    : "rgba(8,145,178,0.32)",
                                animationDelay: `${i * 0.08}s`,
                              }}
                            />
                          </div>
                          <span className="text-[8px] font-medium text-slate-500">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* ── END DARK HERO WRAPPER ── */}

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative border-t border-slate-200/60 bg-slate-50 px-4 py-16 sm:py-24 dark:border-slate-700/30 dark:bg-[#0b1220]">
        <div className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="flex flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1.5 dark:border-blue-800/40 dark:bg-blue-950/30">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">Features</span>
              </div>
              <h2 className="font-display text-center text-2xl font-extrabold text-slate-950 sm:text-3xl dark:text-white">
                Everything your shop needs
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-slate-500 dark:text-slate-400">
                From ringing up sales to managing repairs and generating reports — SaleDock ships with a complete toolkit for modern retail.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <ScrollReveal key={f.title} delay={i * 70}>
                  <div
                    className="group relative cursor-default rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 dark:border-slate-700/60 dark:bg-slate-900"
                    style={{ "--feature-glow": f.glow } as React.CSSProperties}
                  >
                    {/* Top accent bar — animates in on hover */}
                    <div
                      className="absolute inset-x-0 -top-px h-0.5 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: f.gradient }}
                    />
                    {/* Hover glow shadow */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ boxShadow: `0 12px 32px ${f.glow}` }}
                    />

                    <span
                      className="relative flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300 group-hover:shadow-lg"
                      style={{ background: f.gradient }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="relative mt-5 font-display text-base font-bold text-slate-950 dark:text-white">{f.title}</h3>
                    <p className="relative mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{f.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECURITY / TRUST
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative border-t border-slate-200/60 bg-white px-4 py-16 sm:py-24 dark:border-slate-700/30 dark:bg-[#070b16]">
        <div className="pointer-events-none absolute right-0 top-0 h-px w-1/3 bg-gradient-to-l from-transparent via-teal-500/30 to-transparent" />

        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="flex flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3.5 py-1.5 dark:border-teal-800/40 dark:bg-teal-950/30">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">Security</span>
              </div>
              <h2 className="font-display text-center text-2xl font-extrabold text-slate-950 sm:text-3xl dark:text-white">
                Built with security first
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-slate-500 dark:text-slate-400">
                Your data stays yours. SaleDock is designed with tenant isolation, role-based access, and defensive coding from day one.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {securityItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={i * 100}>
                  <div className="group relative cursor-default rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/60 dark:bg-slate-900 dark:hover:shadow-slate-900/60">
                    <div
                      className="absolute inset-x-0 -top-px h-0.5 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: item.gradient }}
                    />
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300 group-hover:shadow-lg"
                      style={{ background: item.gradient }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-display text-base font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SHOP DAY WORKFLOW (new section)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative border-t border-slate-200/60 bg-slate-50 px-4 py-16 sm:py-24 dark:border-slate-700/30 dark:bg-[#0b1220]">
        <div className="pointer-events-none absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/25 to-transparent" />

        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="flex flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50 px-3.5 py-1.5 dark:border-cyan-800/40 dark:bg-cyan-950/30">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">Daily workflow</span>
              </div>
              <h2 className="font-display text-center text-2xl font-extrabold text-slate-950 sm:text-3xl dark:text-white">
                Built for the full shop day
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-base leading-relaxed text-slate-500 dark:text-slate-400">
                From opening the register to reviewing tonight&apos;s analytics — SaleDock covers every moment.
              </p>
            </div>
          </ScrollReveal>

          {/* Steps */}
          <div className="relative mt-14">
            {/* Connector line — desktop only */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[calc(100%/10)] right-[calc(100%/10)] top-[22px] hidden border-t-2 border-dashed border-slate-200 dark:border-slate-700 sm:block"
            />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-5">
              {shopDaySteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <ScrollReveal key={step.title} delay={i * 100}>
                    <div className="group flex flex-col items-center text-center sm:items-center">
                      {/* Time badge */}
                      <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {step.time}
                      </div>
                      {/* Icon node */}
                      <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-600/25 group-hover:-translate-y-0.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-sm font-bold text-slate-950 dark:text-white">{step.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.desc}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative border-t border-slate-200/60 bg-white px-4 py-16 sm:py-24 dark:border-slate-700/30 dark:bg-[#070b16]">
        <div className="pointer-events-none absolute left-1/3 right-1/3 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="flex flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-3.5 py-1.5 dark:border-violet-800/40 dark:bg-violet-950/30">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-400">Getting started</span>
              </div>
              <h2 className="font-display text-center text-2xl font-extrabold text-slate-950 sm:text-3xl dark:text-white">
                Get started in minutes
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-base leading-relaxed text-slate-500 dark:text-slate-400">
                No credit card required. No complicated setup. Just three simple steps.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="pointer-events-none absolute left-[calc(100%/6)] right-[calc(100%/6)] top-7 hidden border-t-2 border-dashed border-slate-200 dark:border-slate-700 sm:block"
            />
            {howItWorks.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 120}>
                <div className="group text-center">
                  <span className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 font-display text-xl font-black text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-600/25 group-hover:-translate-y-0.5">
                    {item.step}
                  </span>
                  <h3 className="mt-6 font-display text-base font-bold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA — deep navy gradient, always dark
      ═══════════════════════════════════════════════════════════════════════ */}
      <ScrollReveal delay={100}>
        <section className="relative overflow-hidden border-t border-slate-200/60 bg-[#040d1c] px-4 py-16 text-center sm:py-24 dark:border-slate-700/30">
          {/* Background gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(135deg,#040d1c 0%,#0a2040 45%,#083040 100%)" }}
          />
          {/* Dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle,#94a3b8 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Teal radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%,rgba(0,212,200,0.12) 0%,transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-2xl">
            <ScrollReveal delay={150}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-teal-400 shadow-lg backdrop-blur-sm">
                <CheckCircle className="h-8 w-8" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                Launch your shop on SaleDock Cloud POS
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate-400">
                Join shops that trust SaleDock for their daily operations. Free to start, no commitment.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              {signedInUser ? (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link
                    href={signedInUser.needsOnboarding ? "/onboarding" : "/dashboard"}
                    className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 text-sm font-bold text-[#040d1c] shadow-lg shadow-teal-500/30 transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {signedInUser.needsOnboarding ? "Continue setup" : "Go to dashboard"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/login?signup=1"
                    className="group inline-flex h-12 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 text-sm font-bold text-[#040d1c] shadow-lg shadow-teal-500/30 transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:shadow-xl hover:-translate-y-0.5 sm:w-auto"
                  >
                    Create your account
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/8 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5 sm:w-auto"
                  >
                    Sign in
                  </Link>
                </div>
              )}
              <p className="mt-4 text-xs text-slate-600">No credit card required · Free to start</p>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12 dark:border-slate-700/60 dark:bg-[#0b1220]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center">
            <Image
              src="/saledock-logo-full.png"
              alt="SaleDock Cloud POS"
              width={1095}
              height={336}
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert dark:opacity-60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <Link href="/privacy"       className="transition-colors duration-200 hover:text-teal-600 dark:hover:text-teal-400">Privacy Policy</Link>
            <Link href="/terms"         className="transition-colors duration-200 hover:text-teal-600 dark:hover:text-teal-400">Terms of Service</Link>
            <Link href="/data-deletion" className="transition-colors duration-200 hover:text-teal-600 dark:hover:text-teal-400">Data Deletion</Link>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <a href="mailto:fardan.aatir@outlook.com" className="transition-colors duration-200 hover:text-teal-600 dark:hover:text-teal-400">fardan.aatir@outlook.com</a>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} SaleDock Cloud POS
          </p>
        </div>
      </footer>
    </div>
  );
}
