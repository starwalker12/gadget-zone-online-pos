import { Boxes, ReceiptText, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";
import { StatCard } from "@/components/ui/stat-card";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today sales"
          value="Rs. 0"
          detail="Ready for Supabase-backed invoices."
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          label="Bills"
          value="0"
          detail="Draft, paid, partial, and unpaid states planned."
          icon={<ReceiptText className="size-5" />}
        />
        <StatCard
          label="Products"
          value="0"
          detail="Products, services, stock levels, and categories."
          icon={<Boxes className="size-5" />}
        />
        <StatCard
          label="Customers"
          value="0"
          detail="Ledger and credit balances will live here."
          icon={<Users className="size-5" />}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PageCard
          title="Online POS foundation"
          description="This is the cloud dashboard shell. The first milestone sets up navigation, auth helpers, schema, and deployment checks before building the full cashier workflow."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {["Multi-branch", "Supabase RLS", "Vercel-ready"].map((item) => (
              <div key={item} className="rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                {item}
              </div>
            ))}
          </div>
        </PageCard>
        <PageCard
          title="Next build phase"
          description="Connect Supabase authentication, create organization onboarding, then implement the real POS checkout flow."
        />
      </div>
    </AppShell>
  );
}
