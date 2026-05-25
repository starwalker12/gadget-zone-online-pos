import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function InvoicesPage() {
  return (
    <AppShell>
      <PageCard
        title="Invoices"
        description="Sales history, invoice status, payments, refunds, A4 output, and thermal output planning live here."
      />
    </AppShell>
  );
}
