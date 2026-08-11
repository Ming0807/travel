import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";

export function selectFeaturedAttraction(items: PublicAttractionCard[]): PublicAttractionCard | null {
  return items.find((item) => Boolean(item.imageUrl?.trim())) ?? null;
}
