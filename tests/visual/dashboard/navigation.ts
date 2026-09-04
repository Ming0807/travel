export function usePathname() { return "/admin/dashboard"; }
export function useSearchParams() { return new URLSearchParams(window.location.search); }
export function useRouter() { return { push: (href: string) => window.history.pushState({}, "", href) }; }
