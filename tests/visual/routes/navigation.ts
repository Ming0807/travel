const router = {
  push: (href: string) => window.history.pushState({}, "", href),
  refresh: () => undefined,
};

export function useRouter() { return router; }
