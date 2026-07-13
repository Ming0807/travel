import "server-only";

import { cookies } from "next/headers";

export const CHECKIN_SESSION_COOKIE = "sbtp_checkin_session";
export const CHECKIN_SESSION_MAX_AGE = 60 * 60 * 2;

export async function getCheckinSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CHECKIN_SESSION_COOKIE)?.value ?? null;
}
