import { redirect } from "next/navigation";
import { AlertTriangle, Boxes, ReceiptText, Tag, TrendingUp, Truck, Users, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { catalogCounts } from "@/lib/data/catalog";
import { formatNumber } from "@/lib/formatters";

async function countRows(table: string, organizationId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
}

export default async function DashboardPage() {
  if (!env.isSupabaseConfigured) {
    return (
      <AppShell>
        <PageCard
          title="Supabase not configured"
          description="Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY to .env.local, then restart the dev server."
        />
      </AppShell>
    );
  }

  const { user, profile, organization, branch } = await getCurrentContext();
  if (!user) redirect("/login");
  if (!profile?.organization_id) redirect("/setup");

  const orgId = profile.organization_id;
  const [catalog, customersCount, invoicesCount, repairsCount] = await Promise.all([
    catalogCounts(orgId),
    countRows("customers", orgId),
    countRows("invoices", orgId),
    countRows("repairs", orgId),
  ]);

  return (
    <AppShell>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700">
          {organization?.name ?? "Organization"}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-950">
          Welcome, {profile.full_name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Branch: <strong>{branch?.name ?? "—"}</strong> · Role: <strong>{profile.role}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active products"
          value={formatNumber(catalog.productsActive)}
          detail={catalog.productsActive === 0 ? "No active products yet." : `${formatNumber(catalog.productsTotal)} total including archived.`}
          icon={<Boxes className="size-5" />}
        />
        <StatCard
          label="Low stock"
          value={formatNumber(catalog.lowStock)}
          detail={catalog.lowStock === 0 ? "All stock above reorder level." : "At or below reorder level."}
          icon={<AlertTriangle className="size-5" />}
        />
        <StatCard
          label="Categories"
          value={formatNumber(catalog.categories)}
          detail={catalog.categories === 0 ? "Add your first category." : "Active categories."}
          icon={<Tag className="size-5" />}
        />
        <StatCard
          label="Suppliers"
          value={formatNumber(catalog.suppliers)}
          detail={catalog.suppliers === 0 ? "Add suppliers for restocking." : "Active suppliers."}
          icon={<Truck className="size-5" />}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Customers"
          value={formatNumber(customersCount)}
          detail={customersCount === 0 ? "No customers yet." : "Total customers."}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Invoices"
          value={formatNumber(invoicesCount)}
          detail={invoicesCount === 0 ? "No invoices yet." : "Total invoices to date."}
          icon={<ReceiptText className="size-5" />}
        />
        <StatCard
          label="Repairs"
          value={formatNumber(repairsCount)}
          detail={repairsCount === 0 ? "No repair jobs yet." : "Repair jobs on record."}
          icon={<Wrench className="size-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PageCard
          title="Next: build the cashier POS flow"
          description="Authentication and onboarding are now live. The next milestone is product/category CRUD and the POS checkout workflow."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {["Auth ready", "RLS enforced", "Owner setup"].map((item) => (
              <div key={item} className="rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                {item}
              </div>
            ))}
          </div>
        </PageCard>
        <PageCard
          title="Today sales"
          description="Sales analytics will populate as invoices and payments are recorded."
        >
          <p className="text-3xl font-black text-slate-950">
            {organization?.currency_code ?? "PKR"} 0
          </p>
          <p className="mt-1 text-sm text-slate-500">
            <TrendingUp className="mr-1 inline size-4 text-emerald-600" />
            No sales recorded yet.
          </p>
        </PageCard>
      </div>
    </AppShell>
  );
}
