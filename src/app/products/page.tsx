import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function ProductsPage() {
  return (
    <AppShell>
      <PageCard
        title="Products & Inventory"
        description="Products, services, suppliers, low-stock thresholds, and stock movement history will be managed here."
      />
    </AppShell>
  );
}
