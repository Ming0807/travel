import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { z } from "zod";

export const CHECKIN_BROWSER_COOKIE = "sbtp_checkin_browser";
export const CHECKIN_BROWSER_MAX_AGE = 60 * 60 * 2;
const browserIdSchema = z.uuidv4();

export function createCheckinBrowserId(): string {
  return randomUUID();
}

export function resolveCheckinBrowserId(value: string | null | undefined): {
  browserId: string;
  wasCreated: boolean;
} {
  if (value && isCheckinBrowserId(value)) {
    return { browserId: value, wasCreated: false };
  }

  return { browserId: createCheckinBrowserId(), wasCreated: true };
}

export function isCheckinBrowserId(value: string): boolean {
  return browserIdSchema.safeParse(value).success;
}

export function hashCheckinBrowserId(browserId: string, secret: string): string {
  const parsedBrowserId = browserIdSchema.parse(browserId);
  if (secret.length < 32) throw new Error("CHECKIN_ENTRY_HASH_SECRET_INVALID");
  return createHmac("sha256", secret).update(parsedBrowserId).digest("hex");
}
