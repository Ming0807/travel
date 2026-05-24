export const PUBLIC_ROUTES = {
  home: "/",
  attractions: "/attractions",
  restaurants: "/restaurants",
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
  dashboard: "/admin/dashboard",
  restaurants: "/admin/restaurants"
} as const;

export const PLACEHOLDER_ROUTES = [
  "/",
  "/attractions",
  "/attractions/[slug]",
  "/restaurants",
  "/restaurants/[slug]",
  "/checkin/[code]",
  "/c/[code]",
  "/passport",
  "/profile",
  "/360-vista",
  "/leaderboard",
  "/admin/dashboard",
  "/admin",
  "/admin/restaurants",
  "/admin/restaurants/new",
  "/admin/restaurants/[id]",
  "/admin/badges",
  "/admin/badges/new",
  "/admin/badges/[id]",
  "/privacy"
] as const;
