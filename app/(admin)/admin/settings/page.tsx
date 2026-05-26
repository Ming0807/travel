import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsClient } from "@/components/admin/settings/SettingsClient";
import { requirePermission } from "@/lib/auth/guards";
import { SettingsService } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings | Admin",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const guard = await requirePermission("system.settings_read");
  const settingsService = new SettingsService();
  const settings = await settingsService.getAllSettings();
  const resolvedSearchParams = await searchParams;

  return (
    <AdminShell admin={guard.actor}>
      <SettingsClient initialSettings={settings} initialGroup={resolvedSearchParams?.tab} />
    </AdminShell>
  );
}
