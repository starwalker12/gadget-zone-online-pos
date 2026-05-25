import { AppShell } from "@/components/layout/app-shell";
import { PageCard } from "@/components/ui/page-card";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageCard
        title="Settings"
        description="Organization profile, branch setup, roles, receipt branding, tax/currency preferences, and audit settings will be configured here."
      />
    </AppShell>
  );
}
