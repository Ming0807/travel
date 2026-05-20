import { Stamp } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function PassportPage() {
  return (
    <PageShell
      description="A Phase 01 shell for the guest-first digital passport. Later phases will resolve the current anonymous guest identity or linked Google/LINE identity before showing real stamps."
      eyebrow="Tourist passport"
      title="My Passport"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["Yala", "Pattani", "Narathiwat"].map((province) => (
          <StatusCard
            description="Stamp progress will be loaded from tourist_stamps after certificate generation is implemented."
            icon={<Stamp aria-hidden="true" />}
            key={province}
            title={`${province} stamps`}
          />
        ))}
      </div>
      <div className="mt-6 rounded-[1.5rem] bg-[#FFF7E5] p-5 text-sm leading-6 text-[#735018]">
        Guest passports are planned to work on the same browser/device. Optional Google or LINE linking will
        support cross-device recovery after the reward.
      </div>
    </PageShell>
  );
}
