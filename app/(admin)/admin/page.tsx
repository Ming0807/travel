import { LockKeyhole, Settings, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function AdminPage() {
  return (
    <PageShell
      description="A Phase 01 admin shell. Phase 03 will add real admin authentication and permission guards before admin data is connected."
      eyebrow="Admin back office"
      title="Admin"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          description="Supabase Auth and an admin user/role lookup will be required before protected workflows are implemented."
          icon={<LockKeyhole aria-hidden="true" />}
          title="Authentication planned"
        />
        <StatusCard
          description="Attraction, photo spot, and QR management will use server-side validation, guards, services, and repositories."
          icon={<Settings aria-hidden="true" />}
          title="CMS boundary ready"
        />
        <StatusCard
          description="Admin operations must not rely on hidden UI controls. Backend permission checks are mandatory."
          icon={<ShieldCheck aria-hidden="true" />}
          title="Permission-safe design"
        />
      </div>
    </PageShell>
  );
}
