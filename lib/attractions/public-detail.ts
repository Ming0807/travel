import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export type PublicAttractionMediaRow = {
  storage_path: string | null;
  media_type: "image" | "panorama" | "video360" | "embed" | "external_url" | string;
  is_cover: boolean | null;
  is_active: boolean | null;
  lifecycle_status: string | null;
  display_order: number | null;
  alt_text_th: string | null;
  alt_text_en: string | null;
};

export type PublicAttractionImage = {
  url: string;
  alt: string;
};

export type PublicAttractionVirtualTour = {
  type: "panorama" | "video360" | "external_url";
  url: string;
};

function isActiveMedia(item: PublicAttractionMediaRow) {
  return item.is_active !== false && (!item.lifecycle_status || item.lifecycle_status === "active");
}

function mediaOrder(item: PublicAttractionMediaRow) {
  return Number.isFinite(Number(item.display_order)) ? Number(item.display_order) : 0;
}

function safeExternalUrl(value: string | null) {
  if (!value || !/^https?:\/\//i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function selectPublicAttractionMedia(rows: PublicAttractionMediaRow[]) {
  const active = rows.filter(isActiveMedia).sort((a, b) => mediaOrder(a) - mediaOrder(b));
  const visual = active.filter((item) => item.media_type === "image" || item.media_type === "panorama");
  const cover = visual.find((item) => item.is_cover === true) ?? visual[0] ?? null;
  const orderedVisual = cover ? [cover, ...visual.filter((item) => item !== cover)] : visual;
  const gallery = orderedVisual.flatMap<PublicAttractionImage>((item) => {
    const url = siteMediaImageUrl(item.storage_path);
    return url ? [{ url, alt: item.alt_text_th?.trim() || item.alt_text_en?.trim() || "" }] : [];
  });

  const linkedTour = active.find((item) =>
    (item.media_type === "video360" || item.media_type === "external_url")
    && safeExternalUrl(item.storage_path),
  );
  const panorama = active.find((item) => item.media_type === "panorama" && siteMediaImageUrl(item.storage_path));
  const tourSource = linkedTour ?? panorama ?? null;
  const tourUrl = tourSource
    ? (tourSource.media_type === "panorama"
        ? siteMediaImageUrl(tourSource.storage_path)
        : safeExternalUrl(tourSource.storage_path))
    : null;

  return {
    mainImage: gallery[0] ?? null,
    gallery,
    virtualTour: tourSource && tourUrl
      ? {
          type: tourSource.media_type as PublicAttractionVirtualTour["type"],
          url: tourUrl,
        }
      : null,
  };
}
