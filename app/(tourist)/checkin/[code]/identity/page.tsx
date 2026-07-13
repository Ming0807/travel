import { redirect } from "next/navigation";

import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";

export default async function IdentitySelectionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  redirect(`/checkin/${code}/start`);
}
