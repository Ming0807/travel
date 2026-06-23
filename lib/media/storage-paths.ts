const SITE_MEDIA_PREFIX = "/site-media/";
const SITE_MEDIA_STORAGE_MARKER = "/storage/v1/object/public/site-media/";
const CONTENT_MEDIA_PREFIX = "content-media/";

function rejectUnsafeStoragePath(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("..")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("\\")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes(":")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("?") || trimmed.includes("#")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.startsWith("/")) throw new Error("INVALID_STORAGE_PATH");
  if (/^https?:\/\//i.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  if (/[\x00-\x1f\x7f]/.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  if (/%2[ef]/i.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");

  return trimmed;
}

export function normalizeSiteMediaStoragePath(raw: string): string {
  let value = raw.trim();

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    const markerIndex = url.pathname.indexOf(SITE_MEDIA_STORAGE_MARKER);
    if (markerIndex >= 0) {
      value = url.pathname.slice(markerIndex + SITE_MEDIA_STORAGE_MARKER.length);
    } else if (url.pathname.startsWith(SITE_MEDIA_PREFIX)) {
      value = url.pathname.slice(SITE_MEDIA_PREFIX.length);
    } else {
      throw new Error("INVALID_STORAGE_PATH");
    }
  }

  while (value.startsWith(SITE_MEDIA_PREFIX)) {
    value = value.slice(SITE_MEDIA_PREFIX.length);
  }

  while (value.startsWith("site-media/")) {
    value = value.slice("site-media/".length);
  }

  return rejectUnsafeStoragePath(value);
}

function cloudinaryPublicId(value: string) {
  if (!value.startsWith("cloudinary:")) return null;
  const parts = value.split(":");
  if (parts.length < 6) return null;
  return parts.slice(5).join(":");
}

export function isPublicContentMediaReference(raw: string | null | undefined): boolean {
  const value = raw?.trim();
  if (!value) return false;

  const cloudinaryId = cloudinaryPublicId(value);
  if (cloudinaryId) {
    return cloudinaryId.includes(`/${CONTENT_MEDIA_PREFIX}`) || cloudinaryId.startsWith(CONTENT_MEDIA_PREFIX);
  }

  try {
    return normalizeSiteMediaStoragePath(value).startsWith(CONTENT_MEDIA_PREFIX);
  } catch {
    return false;
  }
}

export function normalizePublicContentMediaReference(raw: string): string {
  const value = raw.trim();
  if (!value) throw new Error("INVALID_STORAGE_PATH");
  if (value.startsWith("cloudinary:")) {
    if (!isPublicContentMediaReference(value)) throw new Error("INVALID_STORAGE_PATH");
    return value;
  }

  const storagePath = normalizeSiteMediaStoragePath(value);
  if (!storagePath.startsWith(CONTENT_MEDIA_PREFIX)) throw new Error("INVALID_STORAGE_PATH");
  return storagePath;
}

export function mediaProxyImageUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    return `/api/media/image?path=${encodeURIComponent(normalizePublicContentMediaReference(value))}`;
  } catch {
    return null;
  }
}

export function adminMediaPreviewUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  if (isPublicContentMediaReference(value)) {
    return `/api/admin/media/preview?bucket=visit-photos&path=${encodeURIComponent(
      normalizePublicContentMediaReference(value),
    )}`;
  }

  return siteMediaImageUrl(value);
}

export function encodeStoragePathSegments(storagePath: string) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function inferImageContentTypeFromPath(path: string): string | null {
  const lower = path.toLowerCase().split("?")[0]?.split("#")[0] ?? "";
  const cloudinaryFormat = path.startsWith("cloudinary:") ? path.split(":")[4]?.toLowerCase() : null;
  const extension = cloudinaryFormat || lower.split(".").pop();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}

export function resolveSafeImageContentType(contentType: string | null, path: string): string | null {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalized.startsWith("image/") && normalized !== "image/svg+xml") {
    return normalized;
  }
  return inferImageContentTypeFromPath(path);
}

export function siteMediaImageUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (isPublicContentMediaReference(value)) return mediaProxyImageUrl(value);

  try {
    const storagePath = normalizeSiteMediaStoragePath(value);
    const encodedPath = encodeStoragePathSegments(storagePath);
    return `${SITE_MEDIA_PREFIX}${encodedPath}`;
  } catch {
    if (/^https?:\/\//i.test(value)) return value;
    return null;
  }
}
