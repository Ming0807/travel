export type Locale = "th" | "en";

export type ProvinceKey = "yala" | "pattani" | "narathiwat" | "songkhla" | "satun";

export type AttractionCard = {
  slug: string;
  name: string;
  province: string;
  category: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
};

export type DashboardMetricCard = {
  label: string;
  value: string;
  note: string;
};

export type PlaceholderPageStatus = "MVP placeholder" | "Planned" | "Future";
