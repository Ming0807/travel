const FOCUSED_PUBLIC_ROUTE_ROOTS = [
  "/c",
  "/checkin",
  "/visit",
  "/research",
  "/auth",
  "/account",
] as const;

function matchesRouteRoot(pathname: string, root: string) {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function isFocusedPublicRoute(pathname: string) {
  return FOCUSED_PUBLIC_ROUTE_ROOTS.some((root) => matchesRouteRoot(pathname, root));
}

export function isAdminRoute(pathname: string) {
  return matchesRouteRoot(pathname, "/admin");
}

export function shouldHidePublicChrome(pathname: string) {
  return isFocusedPublicRoute(pathname) || isAdminRoute(pathname);
}
