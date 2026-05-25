import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function CustomersPage() {
  return (
    <AppShell>
      <PageCard
        title="Customers & Ledger"
        description="Customer profiles, balances, manual ledger entries, credit payments, and settlements will be managed here."
      />
    </AppShell>
  );
}
