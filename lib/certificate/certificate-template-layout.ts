import { z } from "zod";

export const certificateOrientationSchema = z.enum(["landscape", "portrait"]);
export const certificateThemeSchema = z.enum([
  "emerald-gold",
  "blue-silver",
  "coral-white",
]);
export const certificatePhotoShapeSchema = z.enum(["circle", "rounded", "square"]);
export const certificateTextAlignSchema = z.enum(["left", "center", "right"]);

export type CertificateOrientation = z.infer<typeof certificateOrientationSchema>;
export type CertificateTheme = z.infer<typeof certificateThemeSchema>;

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

function numberField(defaultValue: number, minimum: number, maximum: number) {
  return z.coerce.number().min(minimum).max(maximum).catch(defaultValue);
}

function layoutSchemaFor(orientation: CertificateOrientation, theme: CertificateTheme) {
  const portrait = orientation === "portrait";
  return z.object({
    version: z.literal(1).catch(1),
    orientation: certificateOrientationSchema.catch(orientation),
    theme: certificateThemeSchema.catch(theme),
    photoShape: certificatePhotoShapeSchema.catch("circle"),
    photoX: numberField(portrait ? 50 : 27, 10, 90),
    photoY: numberField(portrait ? 35 : 52, 12, 88),
    photoSize: numberField(portrait ? 34 : 30, 16, 44),
    contentX: numberField(portrait ? 50 : 68, 15, 85),
    contentY: numberField(portrait ? 70 : 52, 18, 82),
    contentWidth: numberField(portrait ? 76 : 48, 28, 82),
    textAlign: certificateTextAlignSchema.catch(portrait ? "center" : "left"),
    overlayOpacity: numberField(10, 0, 70),
    textColor: colorSchema.catch("#173F37"),
    accentColor: colorSchema.catch("#0A6B62"),
    titleScale: numberField(100, 80, 130),
    safeMargin: numberField(6, 4, 12),
    showProvince: z.boolean().catch(true),
    showDate: z.boolean().catch(true),
  });
}

export type CertificateTemplateLayout = z.infer<ReturnType<typeof layoutSchemaFor>>;

export const certificateTemplateLayoutInputSchema = z
  .object({
    version: z.literal(1),
    orientation: certificateOrientationSchema,
    theme: certificateThemeSchema,
    photoShape: certificatePhotoShapeSchema,
    photoX: z.number().min(10).max(90),
    photoY: z.number().min(12).max(88),
    photoSize: z.number().min(16).max(44),
    contentX: z.number().min(15).max(85),
    contentY: z.number().min(18).max(82),
    contentWidth: z.number().min(28).max(82),
    textAlign: certificateTextAlignSchema,
    overlayOpacity: z.number().min(0).max(70),
    textColor: colorSchema,
    accentColor: colorSchema,
    titleScale: z.number().min(80).max(130),
    safeMargin: z.number().min(4).max(12),
    showProvince: z.boolean(),
    showDate: z.boolean(),
  })
  .strict();

export function createDefaultCertificateLayout(
  orientation: CertificateOrientation,
  theme: CertificateTheme
): CertificateTemplateLayout {
  return layoutSchemaFor(orientation, theme).parse({ orientation, theme });
}

export function normalizeCertificateTemplateLayout(
  value: unknown,
  fallbackOrientation: CertificateOrientation = "landscape",
  fallbackTheme: CertificateTheme = "emerald-gold"
): CertificateTemplateLayout {
  const source = value && typeof value === "object" ? value : {};
  const orientation = certificateOrientationSchema.catch(fallbackOrientation).parse(
    "orientation" in source ? source.orientation : fallbackOrientation
  );
  const theme = certificateThemeSchema.catch(fallbackTheme).parse(
    "theme" in source ? source.theme : fallbackTheme
  );
  return layoutSchemaFor(orientation, theme).parse(source);
}

export type CertificateLayoutWarning =
  | "PHOTO_CONTENT_OVERLAP"
  | "PHOTO_OUTSIDE_SAFE_ZONE"
  | "CONTENT_OUTSIDE_SAFE_ZONE";

export function getCertificateLayoutWarnings(
  layout: CertificateTemplateLayout
): CertificateLayoutWarning[] {
  const warnings: CertificateLayoutWarning[] = [];
  const photoRadius = layout.photoSize / 2;
  const photoBounds = {
    left: layout.photoX - photoRadius,
    right: layout.photoX + photoRadius,
    top: layout.photoY - photoRadius,
    bottom: layout.photoY + photoRadius,
  };
  const contentBounds = {
    left: layout.contentX - layout.contentWidth / 2,
    right: layout.contentX + layout.contentWidth / 2,
    top: layout.contentY - 11,
    bottom: layout.contentY + 11,
  };

  const overlaps =
    photoBounds.left < contentBounds.right &&
    photoBounds.right > contentBounds.left &&
    photoBounds.top < contentBounds.bottom &&
    photoBounds.bottom > contentBounds.top;
  if (overlaps) warnings.push("PHOTO_CONTENT_OVERLAP");

  if (
    photoBounds.left < layout.safeMargin ||
    photoBounds.right > 100 - layout.safeMargin ||
    photoBounds.top < layout.safeMargin ||
    photoBounds.bottom > 100 - layout.safeMargin
  ) {
    warnings.push("PHOTO_OUTSIDE_SAFE_ZONE");
  }

  if (
    contentBounds.left < layout.safeMargin ||
    contentBounds.right > 100 - layout.safeMargin ||
    contentBounds.top < layout.safeMargin ||
    contentBounds.bottom > 100 - layout.safeMargin
  ) {
    warnings.push("CONTENT_OUTSIDE_SAFE_ZONE");
  }

  return warnings;
}
