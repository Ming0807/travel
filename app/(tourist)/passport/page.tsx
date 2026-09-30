import { Suspense } from "react";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { PassportCollection } from "@/components/passport/PassportCollection";
import { PassportLoading, PassportPageShell } from "@/components/passport/PassportPageShell";
import { PassportState } from "@/components/passport/PassportState";
import { LineRecoveryPanel } from "@/components/account/LineRecoveryPanel";
import { getCurrentTouristPassport, type PassportViewModel } from "@/lib/services/passport.service";
import { TouristAccessError } from "@/lib/auth/guards";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const dynamic = "force-dynamic";

type PassportResult =
  | { kind: "ready"; passport: PassportViewModel }
  | { kind: "no_identity" }
  | { kind: "error" };

async function loadPassport(): Promise<PassportResult> {
  try {
    return { kind: "ready", passport: await getCurrentTouristPassport() };
  } catch (error) {
    if (error instanceof TouristAccessError && error.code === "TOURIST_IDENTITY_NOT_FOUND") {
      return { kind: "no_identity" };
    }
    return { kind: "error" };
  }
}

async function PassportContent() {
  const result = await loadPassport();
  if (result.kind === "no_identity") {
    return <><PassportState /><div className="passport-linking"><LineRecoveryPanel /></div></>;
  }
  if (result.kind === "error") return <PassportState error />;
  return (
    <>
      <PassportCollection passport={result.passport} />
      <div className="passport-linking"><AccountLinkingTeaser isGuest={result.passport.isGuest} /></div>
    </>
  );
}

export default function PassportPage() {
  return (
    <>
      <PassportPageShell>
        <Suspense fallback={<PassportLoading />}><PassportContent /></Suspense>
      </PassportPageShell>
      <SiteFooter />
    </>
  );
}
