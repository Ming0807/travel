export function usePathname() { return "/stories"; }
export function useRouter() { return { push: (href: string) => window.history.pushState({}, "", href) }; }
