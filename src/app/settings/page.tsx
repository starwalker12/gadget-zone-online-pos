import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentContext } from "@/lib/auth/session";
import { getBrandingSettings } from "@/lib/data/settings";
import { env } from "@/lib/env";
import { canManageSettings } from "@/lib/permissions";
import { getPublicPlatformSetting } from "@/lib/platform/admin";
import { SettingsForm } from "./settings-form";
import { DemoTab } from "./demo-tab";
import { BackupTab } from "./backup-tab";
import { ConnectedAccounts } from "./connected-accounts";
import { PrivacyCenter } from "./privacy-center";
import { getLinkedProviders } from "@/lib/auth/identities";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Settings, Database, Archive, ShieldCheck, UserCircle, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = {
  tab?: string;
  link?: string;
  provider?: string;
  error_code?: string;
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (!env.isSupabaseConfigured) redirect("/login");

  const { user, profile } = await getCurrentContext();
  if (!user) redirect("/login");
  if (!profile?.organization_id) redirect("/setup");

  const params = await searchParams;
  const currentTab = params.tab ?? "general";
  const linkParam = params.link ?? null;

  // Fetch fresh auth user for linked provider detection (server-side has full identities)
  const supabase = await createClient();
  const { data: { user: freshUser } } = await supabase.auth.getUser();
  const linkedProviders = getLinkedProviders(freshUser);

  const settings = await getBrandingSettings(profile.organization_id, profile.branch_id);
  const profilePictureUrl = profile?.profile_picture_url ?? profile?.avatar_url ?? null;
  const canEdit = canManageSettings(profile.role);
  const isPrivileged = profile.role === "owner" || profile.role === "admin";

  const demoDataEnabled = (await getPublicPlatformSetting("demo_data_enabled")) !== false;
  const backupImportEnabled = (await getPublicPlatformSetting("backup_import_enabled")) !== false;
  const factoryResetEnabled = (await getPublicPlatformSetting("factory_reset_enabled")) !== false;

  // Tab configurations
  const tabs = [
    { id: "general", label: "Shop Profile", icon: Settings },
    { id: "accounts", label: "Connected Accounts", icon: UserCircle },
    { id: "privacy", label: "Privacy Center", icon: Shield },
    ...(isPrivileged ? [
      { id: "demo-data", label: "Demo Data", icon: Database },
      { id: "backup", label: "Backup & Restore", icon: Archive },
      { id: "security", label: "Security", icon: ShieldCheck }
    ] : [])
  ];

  return (
    <AppShell pageTitle="Settings">
      <div className="w-full space-y-6">
        {/* Page Heading and Tabs Navigation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-slate-50">Settings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Configure organizational credentials, manage demonstration databases, or package offline backup archives.
            </p>
          </div>

          {/* Premium Tab bar navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/settings?tab=${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition duration-200 shrink-0 ${
                    isActive
                      ? "border-blue-700 text-blue-700 bg-blue-50/50 rounded-t-xl dark:border-slate-100 dark:text-slate-100 dark:bg-slate-900/40"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:border-slate-700"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tab Render Content with Suspense boundaries */}
        <Suspense key={`tab-${currentTab}`} fallback={<TabSkeleton tabId={currentTab} />}>
          {currentTab === "general" && (
            <SettingsForm
              settings={settings}
              canEdit={canEdit}
              organizationId={profile.organization_id}
              branchId={profile.branch_id}
              userId={user.id}
              profilePictureUrl={profilePictureUrl}
            />
          )}

          {currentTab === "demo-data" && (
            isPrivileged ? (
              <DemoTab demoDataEnabled={demoDataEnabled} />
            ) : (
              <AccessDeniedView />
            )
          )}

          {currentTab === "backup" && (
            isPrivileged ? (
              <BackupTab backupImportEnabled={backupImportEnabled} factoryResetEnabled={factoryResetEnabled} />
            ) : (
              <AccessDeniedView />
            )
          )}

          {currentTab === "accounts" && (
            <ConnectedAccounts linkParam={linkParam} providerParam={params.provider} linkedProviders={linkedProviders} />
          )}

          {currentTab === "privacy" && (
            <PrivacyCenter />
          )}

          {currentTab === "security" && (
            isPrivileged ? <SecurityChecklist /> : <AccessDeniedView />
          )}
        </Suspense>
      </div>
    </AppShell>
  );
}

function SecurityChecklist() {
  const inCode = [
    "RLS enabled on every business table",
    "RPC EXECUTE grants restricted to authenticated + service_role (migration 0012)",
    "Function search_path hardened on set_updated_at, current_organization_id, current_user_role (0010)",
    "Service role key is server-only — never bundled to the browser",
    "POS checkout is atomic, security invoker, server-side total recompute",
    "Strict service required-field enforcement at the database layer (0013)",
    "Loss-prevention events table populated via audit_logs trigger (0013)",
  ];
  const manual = [
    {
      title: "Enable leaked password protection",
      path: "Authentication → Providers → Email → Password security → toggle on",
      explainer: "Blocks newly created or rotated passwords found in breach corpora (HaveIBeenPwned).",
    },
    {
      title: "(Optional) Disable open email signups",
      path: "Authentication → Providers → Email → toggle off",
      explainer: "Belt-and-braces alongside the app's signup lock. Use /users to invite staff instead.",
    },
    {
      title: "(Optional) Configure email templates",
      path: "Authentication → Email Templates",
      explainer: "Required for /users staff invites to actually be delivered.",
    },
  ];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <header className="mb-5">
        <h3 className="text-base font-black text-slate-950">Security Checklist</h3>
        <p className="text-xs text-slate-500">
          A snapshot of the security posture. Done items are enforced in code; manual items
          require a one-time Supabase dashboard action by the owner.
        </p>
      </header>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700">Done in code</h4>
        <ul className="space-y-1.5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          {inCode.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-emerald-900">
              <span className="mt-0.5 inline-block size-1.5 shrink-0 rounded-full bg-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-amber-700">Manual dashboard actions</h4>
        <ul className="space-y-2 rounded-xl border border-amber-100 bg-amber-50/40 p-3">
          {manual.map((m) => (
            <li key={m.title}>
              <p className="text-sm font-semibold text-amber-900">{m.title}</p>
              <p className="text-xs text-amber-700">{m.path}</p>
              <p className="text-xs text-amber-800/80">{m.explainer}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        Full write-up in <code>docs/security-hardening.md</code>.
      </p>
    </section>
  );
}

function TabSkeleton({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "general":
      return (
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-64" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "accounts":
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-72" />
          <div className="mt-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      );
    case "privacy":
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-3 w-56" />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-6 w-12" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-4 h-10 w-32 rounded-lg" />
          </div>
        </div>
      );
    case "demo-data":
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3 w-48" />
          <Skeleton className="mt-4 h-10 w-full rounded-xl" />
          <Skeleton className="mt-3 h-10 w-full rounded-xl" />
        </div>
      );
    case "backup":
      return (
        <div className="space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-2 h-3 w-56" />
              <Skeleton className="mt-4 h-10 w-full rounded-xl" />
              <Skeleton className="mt-3 h-10 w-40 rounded-lg" />
            </div>
          ))}
        </div>
      );
    case "security":
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3 w-64" />
          <div className="mt-5 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />
          <div className="mt-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      );
  }
}

function AccessDeniedView() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
      <AlertTriangle className="mx-auto size-12 text-amber-500" />
      <h3 className="text-lg font-black text-slate-950">Access Denied</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto leading-6">
        This configuration module requires Owner or Administrator permissions.
        Authorized operations like seeder deployment or database restoration are locked.
      </p>
    </div>
  );
}
