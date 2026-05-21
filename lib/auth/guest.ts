import "server-only";

import { cookies } from "next/headers";
import crypto from "crypto";

const GUEST_COOKIE_NAME = "sbtp_guest_id";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Retrieves the existing guest identity token from cookies, or creates a new one if it doesn't exist.
 * This function must be called in a Server Action or Route Handler if a new token needs to be SET.
 */
export async function getOrCreateGuestIdentity(): Promise<string> {
  const cookieStore = await cookies();
  const existingGuestToken = cookieStore.get(GUEST_COOKIE_NAME);

  if (existingGuestToken?.value) {
    return existingGuestToken.value;
  }

  // Create a new random UUID (does not use IP address or PII)
  const newGuestToken = crypto.randomUUID();

  // Set the cookie (requires Server Action or Route Handler context)
  cookieStore.set(GUEST_COOKIE_NAME, newGuestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GUEST_COOKIE_MAX_AGE,
    path: "/",
  });

  return newGuestToken;
}

/**
 * Retrieves the guest identity token without creating a new one.
 * Safe to call from Server Components.
 */
export async function getGuestIdentity(): Promise<string | null> {
  const cookieStore = await cookies();
  const existingGuestToken = cookieStore.get(GUEST_COOKIE_NAME);
  return existingGuestToken?.value || null;
}
