import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";

export const RESTAURANT_DIRECTORY_SECTIONS = [
  {
    key: "local",
    title: "อาหารพื้นถิ่น",
    description: "อาหารไทย มลายู และรสชาติท้องถิ่นของพื้นที่",
    foodTypes: ["Thai", "Malay", "Thai-Chinese"],
  },
  {
    key: "meals",
    title: "ร้านอาหารและสตรีทฟู้ด",
    description: "ร้านอาหารฮาลาล อาหารจานด่วน ติ่มซำ และอาหารนานาชาติ",
    foodTypes: ["Halal", "Street Food", "Dimsum", "International"],
  },
  {
    key: "cafes",
    title: "คาเฟ่ เบเกอรี่ และของหวาน",
    description: "กาแฟ เครื่องดื่ม เบเกอรี่ และร้านของหวาน",
    foodTypes: ["Dessert/Cafe", "Coffee", "Bakery"],
  },
] as const;

export type RestaurantDirectorySectionKey = typeof RESTAURANT_DIRECTORY_SECTIONS[number]["key"] | "other";

export type RestaurantDirectoryGroup = {
  key: RestaurantDirectorySectionKey;
  title: string;
  description: string;
  items: PublicRestaurantCard[];
};

function normalizeFoodType(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function filterRestaurantFoodTypeOptions<T extends { value: string }>(
  options: readonly T[],
  availableFoodTypes: readonly string[] | null,
): T[] {
  if (availableFoodTypes === null) return [...options];

  const normalizedAvailableTypes = availableFoodTypes
    .map(normalizeFoodType)
    .filter(Boolean);

  return options.filter((option) => {
    const normalizedOption = normalizeFoodType(option.value);
    return normalizedAvailableTypes.some((foodType) => foodType.includes(normalizedOption));
  });
}

export function groupRestaurantsForDirectory(
  items: PublicRestaurantCard[],
): RestaurantDirectoryGroup[] {
  const assigned = new Set<string>();
  const groups: RestaurantDirectoryGroup[] = RESTAURANT_DIRECTORY_SECTIONS.flatMap((section) => {
    const acceptedTypes = new Set(section.foodTypes.map(normalizeFoodType));
    const sectionItems = items.filter((item) => {
      const accepted = acceptedTypes.has(normalizeFoodType(item.foodType));
      if (accepted) assigned.add(item.slug);
      return accepted;
    });

    return sectionItems.length > 0
      ? [{
        key: section.key,
        title: section.title,
        description: section.description,
        items: sectionItems,
      }]
      : [];
  });

  const otherItems = items.filter((item) => !assigned.has(item.slug));
  if (otherItems.length > 0) {
    groups.push({
      key: "other",
      title: "ร้านอาหารประเภทอื่น ๆ",
      description: "ร้านอาหารที่เผยแพร่ในระบบและยังไม่อยู่ในหมวดหลัก",
      items: otherItems,
    });
  }

  return groups;
}
