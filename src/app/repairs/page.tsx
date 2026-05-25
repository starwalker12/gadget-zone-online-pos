import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function RepairsPage() {
  return (
    <AppShell pageTitle="Repairs">
      <PageCard
        title="Repairs"
        description="Repair jobs will track customer device details, problem notes, advance paid, status history, and delivery."
      />
    </AppShell>
  );
}
