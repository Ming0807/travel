export const RICH_IMAGE_SIZES = ["full", "large", "medium", "small"] as const;
export const RICH_IMAGE_ALIGNS = ["left", "center", "right"] as const;

export type RichImageSize = (typeof RICH_IMAGE_SIZES)[number];
export type RichImageAlign = (typeof RICH_IMAGE_ALIGNS)[number];

export function normalizeRichImageSize(value: unknown): RichImageSize {
  return typeof value === "string" && RICH_IMAGE_SIZES.includes(value as RichImageSize)
    ? (value as RichImageSize)
    : "full";
}

export function normalizeRichImageAlign(value: unknown): RichImageAlign {
  return typeof value === "string" && RICH_IMAGE_ALIGNS.includes(value as RichImageAlign)
    ? (value as RichImageAlign)
    : "center";
}
