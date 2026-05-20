export const PUBLIC_ROUTES = {
  home: "/",
  attractions: "/attractions",
  passport: "/passport",
  profile: "/profile",
  privacy: "/privacy"
} as const;

export const TOURIST_ROUTES = {
  checkin: "/checkin/demo-code",
  shortCheckin: "/c/demo-code",
  passport: "/passport",
  profile: "/profile"
} as const;

export const ADMIN_ROUTES = {
  admin: "/admin",
  dashboard: "/dashboard"
} as const;

export const PLACEHOLDER_ROUTES = [
  "/",
  "/attractions",
  "/attractions/[slug]",
  "/checkin/[code]",
  "/c/[code]",
  "/passport",
  "/profile",
  "/dashboard",
  "/admin",
  "/privacy"
] as const;
