import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function ReportsPage() {
  return (
    <AppShell>
      <PageCard
        title="Reports"
        description="Sales, profit, expenses, payment methods, stock value, staff performance, and daily closing reports will be built here."
      />
    </AppShell>
  );
}
