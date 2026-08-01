import type { CertificateTemplateLayout } from "@/lib/certificate/certificate-template-layout";

export type PhotoAdjustment = {
  zoom: number;
  x: number;
  y: number;
};

export type CertificateTemplatePreviewOption = {
  templateId: number;
  templateName: string;
  attractionId: number | null;
  backgroundUrl: string;
  language: string;
  orientation: "landscape" | "portrait";
  layout: CertificateTemplateLayout;
};

export const DEFAULT_PHOTO_ADJUSTMENT: PhotoAdjustment = {
  zoom: 1,
  x: 50,
  y: 50,
};

function bounded(value: unknown, fallback: number, minimum: number, maximum: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export function normalizePhotoAdjustment(
  value: Partial<PhotoAdjustment> | null | undefined,
): PhotoAdjustment {
  return {
    zoom: bounded(value?.zoom, DEFAULT_PHOTO_ADJUSTMENT.zoom, 1, 2),
    x: bounded(value?.x, DEFAULT_PHOTO_ADJUSTMENT.x, 0, 100),
    y: bounded(value?.y, DEFAULT_PHOTO_ADJUSTMENT.y, 0, 100),
  };
}
