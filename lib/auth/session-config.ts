/**
 * Admin session configuration.
 *
 * Session lifetime and refresh settings for the admin dashboard.
 * The Supabase SSR client handles token refresh automatically;
 * these values configure the maximum session duration and when
 * the middleware should force a re-login.
 */

/** Maximum session age in seconds (24 hours) */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

/** Sessions are considered "expiring soon" within this window (30 minutes) */
export const ADMIN_SESSION_REFRESH_WINDOW_SECONDS = 30 * 60;

/** Middleware cookie prefix used by Supabase SSR */
export const SUPABASE_ACCESS_TOKEN_COOKIE = "sb-access-token";
export const SUPABASE_REFRESH_TOKEN_COOKIE = "sb-refresh-token";

/**
 * Extracts the JWT payload from a Supabase session cookie value.
 * Returns null if the token cannot be decoded.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

/**
 * Checks whether a JWT `exp` claim (Unix seconds) indicates the session
 * has exceeded the maximum allowed age.
 */
export function isSessionExpired(exp: number): boolean {
  return Date.now() >= exp * 1000;
}

/**
 * Checks whether a JWT `exp` claim is within the refresh window.
 */
export function isSessionExpiringSoon(exp: number): boolean {
  const remainingMs = exp * 1000 - Date.now();
  return remainingMs > 0 && remainingMs <= ADMIN_SESSION_REFRESH_WINDOW_SECONDS * 1000;
}
