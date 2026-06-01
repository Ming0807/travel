export type AttractionContentLocale = "th" | "en";

export type AttractionSectionKey =
  | "overview"
  | "things_to_do"
  | "where_to_stay"
  | "food_drink"
  | "travel_tips"
  | "how_to_get_there"
  | "reviews"
  | "articles";

export type AttractionSectionDefinition = {
  key: AttractionSectionKey;
  id: string;
  required: boolean;
  labels: Record<AttractionContentLocale, string>;
  shortLabels: Record<AttractionContentLocale, string>;
};

export type AttractionSectionNavItem = AttractionSectionDefinition & {
  label: string;
  shortLabel: string;
};

type AttractionSectionContent = {
  description?: string | null;
  thingsToDo?: unknown[] | null;
  whereToStay?: unknown[] | null;
  foodAndDrink?: unknown[] | null;
  travelTips?: unknown[] | null;
  howToGetThere?: string | null;
  articles?: unknown[] | null;
};

type BuildAttractionSectionsOptions = {
  locale?: AttractionContentLocale;
  includeReviews?: boolean;
  includeMissingRequired?: boolean;
};

export const ATTRACTION_SECTION_DEFINITIONS: AttractionSectionDefinition[] = [
  {
    key: "overview",
    id: "overview",
    required: true,
    labels: { th: "ภาพรวม", en: "Overview" },
    shortLabels: { th: "ภาพรวม", en: "Overview" },
  },
  {
    key: "things_to_do",
    id: "things-to-do",
    required: false,
    labels: { th: "กิจกรรม", en: "Things to Do" },
    shortLabels: { th: "กิจกรรม", en: "Things" },
  },
  {
    key: "where_to_stay",
    id: "where-to-stay",
    required: false,
    labels: { th: "ที่พัก", en: "Where to Stay" },
    shortLabels: { th: "ที่พัก", en: "Stay" },
  },
  {
    key: "food_drink",
    id: "food",
    required: false,
    labels: { th: "อาหารและเครื่องดื่ม", en: "Food & Drink" },
    shortLabels: { th: "อาหาร", en: "Food" },
  },
  {
    key: "travel_tips",
    id: "tips",
    required: false,
    labels: { th: "คำแนะนำ", en: "Travel Tips" },
    shortLabels: { th: "คำแนะนำ", en: "Tips" },
  },
  {
    key: "how_to_get_there",
    id: "how-to-get-there",
    required: true,
    labels: { th: "การเดินทาง", en: "How to Get There" },
    shortLabels: { th: "การเดินทาง", en: "Getting There" },
  },
  {
    key: "reviews",
    id: "reviews",
    required: false,
    labels: { th: "รีวิว", en: "Reviews" },
    shortLabels: { th: "รีวิว", en: "Reviews" },
  },
  {
    key: "articles",
    id: "articles",
    required: false,
    labels: { th: "บทความแนะนำ", en: "Recommended Articles" },
    shortLabels: { th: "บทความ", en: "Articles" },
  },
];

export function getAttractionSectionDefinition(key: AttractionSectionKey) {
  return ATTRACTION_SECTION_DEFINITIONS.find((section) => section.key === key);
}

export function getAttractionSectionLabel(
  key: AttractionSectionKey,
  locale: AttractionContentLocale = "th",
  variant: "default" | "short" = "default"
) {
  const definition = getAttractionSectionDefinition(key);
  if (!definition) return key;
  return variant === "short" ? definition.shortLabels[locale] : definition.labels[locale];
}

export function buildAttractionSectionNavigation(
  content: AttractionSectionContent,
  options: BuildAttractionSectionsOptions = {}
): AttractionSectionNavItem[] {
  const locale = options.locale ?? "th";
  const includeMissingRequired = options.includeMissingRequired ?? true;

  return ATTRACTION_SECTION_DEFINITIONS.filter((section) => {
    if (section.required && includeMissingRequired) return true;

    switch (section.key) {
      case "overview":
        return Boolean(content.description?.trim());
      case "things_to_do":
        return Boolean(content.thingsToDo?.length);
      case "where_to_stay":
        return Boolean(content.whereToStay?.length);
      case "food_drink":
        return Boolean(content.foodAndDrink?.length);
      case "travel_tips":
        return Boolean(content.travelTips?.length);
      case "how_to_get_there":
        return Boolean(content.howToGetThere?.trim());
      case "reviews":
        return Boolean(options.includeReviews);
      case "articles":
        return Boolean(content.articles?.length);
      default:
        return false;
    }
  }).map((section) => ({
    ...section,
    label: section.labels[locale],
    shortLabel: section.shortLabels[locale],
  }));
}
