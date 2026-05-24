import { LockKey, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function PrivacyPage() {
  return (
    <PageShell
      description="A concise privacy placeholder for Phase 01. Full policy copy should be reviewed before real tourist data collection begins."
      eyebrow="Privacy by design"
      title="Privacy"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <StatusCard
          description="Before certificate generation, the platform should collect only display name, origin, age group, consent, and photo."
          icon={<ShieldCheck aria-hidden="true" />}
          title="Data minimization"
        />
        <StatusCard
          description="Guest identity uses an anonymous browser/device identifier. IP address is not the main tourist identity mechanism."
          icon={<LockKey size={24} aria-hidden="true" />}
          title="Anonymous guest mode"
        />
      </div>
    </PageShell>
  );
}
