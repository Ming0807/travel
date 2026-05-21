/**
 * Pure storage helper functions extracted from private-files.ts for testability.
 * These functions have no dependencies on server-only modules.
 */

type CloudinaryResourceType = "image" | "raw";
type CloudinaryDeliveryType = "authenticated" | "upload";

interface CloudinaryReference {
  resourceType: CloudinaryResourceType;
  deliveryType: CloudinaryDeliveryType;
  version: number;
  format: string;
  publicId: string;
}

export function assertSafeStoragePath(path: string) {
  const normalized = path.trim();

  if (!normalized || normalized.includes("..") || normalized.startsWith("/") || /^https?:\/\//i.test(normalized)) {
    throw new Error("INVALID_STORAGE_PATH");
  }

  return normalized;
}

export function encodeCloudinaryReference(reference: CloudinaryReference) {
  return [
    "cloudinary",
    reference.resourceType,
    reference.deliveryType,
    `v${reference.version}`,
    reference.format,
    reference.publicId
  ].join(":");
}

export function parseCloudinaryReference(path: string): CloudinaryReference | null {
  if (!path.startsWith("cloudinary:")) {
    return null;
  }

  const [prefix, resourceType, deliveryType, versionToken, format, ...publicIdParts] = path.split(":");
  const version = Number(versionToken?.replace(/^v/, ""));
  const publicId = publicIdParts.join(":");

  if (
    prefix !== "cloudinary" ||
    (resourceType !== "image" && resourceType !== "raw") ||
    (deliveryType !== "authenticated" && deliveryType !== "upload") ||
    !Number.isFinite(version) ||
    !format ||
    !publicId
  ) {
    throw new Error("INVALID_CLOUDINARY_REFERENCE");
  }

  return {
    resourceType,
    deliveryType,
    version,
    format,
    publicId
  };
}
