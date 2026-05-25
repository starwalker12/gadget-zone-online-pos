import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function PosPage() {
  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PageCard
          title="Product Catalogue"
          description="Foundation for searchable products, services, categories, and barcode entry."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {["Accessories", "Phones", "Digital services", "Repair charges"].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{item}</p>
                <p className="mt-1 text-sm text-slate-500">Supabase data pending.</p>
              </div>
            ))}
          </div>
        </PageCard>
        <PageCard
          title="Active Bill"
          description="The cashier cart will support discounts, partial payments, customer credit, service commission, and receipts."
        >
          <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
            Cart foundation ready. Full checkout comes next.
          </div>
        </PageCard>
      </div>
    </AppShell>
  );
}
