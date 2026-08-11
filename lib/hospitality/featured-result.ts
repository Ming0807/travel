export function selectFeaturedHospitality<T extends { imageUrl: string | null }>(items: T[]): T | null {
  return items.find((item) => Boolean(item.imageUrl?.trim())) ?? null;
}
