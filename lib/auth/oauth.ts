export type TouristAuthProvider = "google" | "line" | "email";

const BLOCKED_DESTINATION_PREFIXES = ["/admin", "/api", "/_next", "/auth/callback"];

export function resolveTouristAuthProvider(value: unknown): TouristAuthProvider | null {
  return value === "google" || value === "line" || value === "email" ? value : null;
}

export function resolveSafeAuthDestination(value: string | null | undefined): string {
  const fallback = "/profile";
  const candidate = value?.trim();

  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate, "https://tourism.local");
  } catch {
    return fallback;
  }

  if (parsed.origin !== "https://tourism.local") return fallback;

  const isBlocked = BLOCKED_DESTINATION_PREFIXES.some(
    (prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
  );

  if (isBlocked) return fallback;
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
