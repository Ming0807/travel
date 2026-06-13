const SITE_MEDIA_PREFIX = "/site-media/";
const SITE_MEDIA_STORAGE_MARKER = "/storage/v1/object/public/site-media/";

function rejectUnsafeStoragePath(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("..")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("\\")) throw new Error("INVALID_STORAGE_PATH");
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

export function siteMediaImageUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value.startsWith("cloudinary:")) return `/api/media/image?path=${encodeURIComponent(value)}`;

  try {
    const storagePath = normalizeSiteMediaStoragePath(value);
    const encodedPath = storagePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${SITE_MEDIA_PREFIX}${encodedPath}`;
  } catch {
    if (/^https?:\/\//i.test(value)) return value;
    return null;
  }
}
