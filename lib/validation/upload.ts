const MIME_EXTENSION_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

export type AllowedTouristImageMimeType = keyof typeof MIME_EXTENSION_MAP;

export function parseAllowedTouristImageMimeTypes(rawValue: string) {
  const configured = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configured.filter((value): value is AllowedTouristImageMimeType => value in MIME_EXTENSION_MAP);
}

export function getExtensionForTouristImageMimeType(mimeType: string) {
  return MIME_EXTENSION_MAP[mimeType as AllowedTouristImageMimeType] ?? null;
}

export function validateTouristImageFile(params: {
  mimeType: string;
  sizeBytes: number;
  allowedMimeTypes: readonly AllowedTouristImageMimeType[];
  maxSizeMb: number;
}) {
  if (params.sizeBytes <= 0) {
    return {
      success: false as const,
      code: "PHOTO_EMPTY",
      message: "The uploaded image is empty."
    };
  }

  if (!params.allowedMimeTypes.includes(params.mimeType as AllowedTouristImageMimeType)) {
    return {
      success: false as const,
      code: "PHOTO_INVALID_TYPE",
      message: "Only JPG, PNG, and WebP images are allowed."
    };
  }

  const maxSizeBytes = params.maxSizeMb * 1024 * 1024;
  if (params.sizeBytes > maxSizeBytes) {
    return {
      success: false as const,
      code: "PHOTO_TOO_LARGE",
      message: `Image is too large. Maximum size is ${params.maxSizeMb}MB.`
    };
  }

  const extension = getExtensionForTouristImageMimeType(params.mimeType);
  if (!extension) {
    return {
      success: false as const,
      code: "PHOTO_INVALID_TYPE",
      message: "Only JPG, PNG, and WebP images are allowed."
    };
  }

  return {
    success: true as const,
    extension
  };
}
