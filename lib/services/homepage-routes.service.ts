import "server-only";
import { listPublicRoutes, type PublicRouteCard } from "@/lib/repositories/public-content.repository";

/** Apply Home selection without weakening the public repository's publishing gates. */
export async function loadHomepageRoutes(
  requestedLimit: number,
  slugs: string[],
  list: typeof listPublicRoutes = listPublicRoutes,
): Promise<{ items: PublicRouteCard[]; unavailable: boolean }> {
  const limit = Math.max(1, Math.min(3, requestedLimit));
  async function fill(selected: PublicRouteCard[]) {
    const seen = new Set(selected.map((item) => item.slug));
    const recent = await list(12);
    let items = [...selected, ...recent.filter((item) => !seen.has(item.slug))].slice(0, limit);
    if (items.length >= limit) return items;
    try {
      const broader = await list(60);
      const found = new Set(items.map((item) => item.slug));
      items = [...items, ...broader.filter((item) => !found.has(item.slug))].slice(0, limit);
    } catch (error) {
      if (!items.length) throw error;
    }
    return items;
  }
  try {
    if (!slugs.length) return { items: await fill([]), unavailable: false };
    const selected = await list(limit, slugs);
    if (selected.length >= limit) return { items: selected.slice(0, limit), unavailable: false };
    try {
      const items = await fill(selected);
      return { items, unavailable: false };
    } catch {
      return { items: selected, unavailable: selected.length === 0 };
    }
  } catch {
    return { items: [], unavailable: true };
  }
}
