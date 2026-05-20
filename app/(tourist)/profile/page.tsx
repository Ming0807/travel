import { UserRound } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function ProfilePage() {
  return (
    <PageShell
      description="A Phase 01 placeholder for future tourist profile history. The QR-to-certificate flow must work as guest first, and profile recovery through Google or LINE remains optional."
      eyebrow="Tourist profile"
      title="Profile"
    >
      <StatusCard
        description="Future profile screens should show display name, origin, age group, passport summary, and certificate history without exposing guest tokens, provider IDs, Google subject, LINE user ID, or internal IDs."
        icon={<UserRound aria-hidden="true" />}
        title="Privacy-safe profile shell"
      />
    </PageShell>
  );
}
