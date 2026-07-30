import "server-only";

import { createHmac } from "node:crypto";

type StoryEngagementOriginConfig = {
  appEnv: "local" | "staging" | "production" | "test";
  appUrl?: string;
  siteUrl?: string;
};

function exactOrigin(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isStoryEngagementOriginAllowed(
  origin: string | null,
  config: StoryEngagementOriginConfig,
): boolean {
  if (!origin) return false;

  const normalizedOrigin = exactOrigin(origin);
  if (!normalizedOrigin || normalizedOrigin !== origin) return false;

  const allowed = new Set(
    [exactOrigin(config.appUrl), exactOrigin(config.siteUrl)].filter(
      (value): value is string => Boolean(value),
    ),
  );

  if (config.appEnv === "local" || config.appEnv === "test") {
    allowed.add("http://localhost:3000");
    allowed.add("http://localhost:3001");
    allowed.add("http://127.0.0.1:3000");
    allowed.add("http://127.0.0.1:3001");
  }

  return allowed.has(normalizedOrigin);
}

export function createStoryEngagementDigest(
  secret: string,
  domain: "dedup" | "rate-limit",
  values: readonly string[],
): string {
  if (secret.length < 32) {
    throw new Error("CONTENT_ENGAGEMENT_HASH_SECRET must be at least 32 characters.");
  }

  const canonical = values
    .map((value) => `${Buffer.byteLength(value, "utf8")}:${value}`)
    .join("|");

  return createHmac("sha256", secret)
    .update(`story-engagement:v1:${domain}|${canonical}`)
    .digest("hex");
}
