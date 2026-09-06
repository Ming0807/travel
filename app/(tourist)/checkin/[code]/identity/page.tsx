import { redirect } from "next/navigation";

import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";

export default async function IdentitySelectionPage({
  params,
  searchParams = Promise.resolve({}),
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ flow?: string }>;
}) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  const query = await searchParams;
  redirect(`/checkin/${code}/start${query.flow ? `?flow=${encodeURIComponent(query.flow)}` : ""}`);
}
