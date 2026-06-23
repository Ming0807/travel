import sharp from "sharp";

export const ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const CERTIFICATE_TEMPLATE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB = 10;

const DEFAULT_MAX_PIXELS = 64_000_000;
const ALLOWED_SHARP_FORMATS = ["jpeg", "png", "webp"] as const;

export type AdminImageMimeType = (typeof ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES)[number];

export type UploadableAdminImageFile = {
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type AdminImageUploadErrorCode =
  | "IMAGE_EMPTY"
  | "IMAGE_INVALID_TYPE"
  | "IMAGE_TOO_LARGE"
  | "IMAGE_TOO_MANY_PIXELS"
  | "IMAGE_INVALID";

export class AdminImageUploadError extends Error {
  constructor(
    public readonly code: AdminImageUploadErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "AdminImageUploadError";
  }
}

export type DecodedAdminImage = {
  inputBuffer: Buffer;
  originalWidth: number;
  originalHeight: number;
};

export type ProcessedAdminImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  sizeBytes: number;
  width: number;
  height: number;
};

export function validateAdminImageUploadFile(params: {
  mimeType: string;
  sizeBytes: number;
  allowedMimeTypes?: readonly string[];
  maxSizeMb?: number;
}) {
  const allowedMimeTypes = params.allowedMimeTypes ?? ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES;
  const maxSizeMb = params.maxSizeMb ?? ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB;

  if (params.sizeBytes <= 0) {
    throw new AdminImageUploadError("IMAGE_EMPTY", "The uploaded image is empty.");
  }

  if (!allowedMimeTypes.includes(params.mimeType)) {
    throw new AdminImageUploadError("IMAGE_INVALID_TYPE", "Only JPG, PNG, and WebP images are allowed.");
  }

  if (params.sizeBytes > maxSizeMb * 1024 * 1024) {
    throw new AdminImageUploadError("IMAGE_TOO_LARGE", `Image is larger than ${maxSizeMb}MB.`);
  }
}

export async function readAndValidateAdminImageFile(
  file: UploadableAdminImageFile,
  options: {
    allowedMimeTypes?: readonly string[];
    maxSizeMb?: number;
    maxPixels?: number;
  } = {},
): Promise<DecodedAdminImage> {
  validateAdminImageUploadFile({
    mimeType: file.type,
    sizeBytes: file.size,
    allowedMimeTypes: options.allowedMimeTypes,
    maxSizeMb: options.maxSizeMb,
  });

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const maxPixels = options.maxPixels ?? DEFAULT_MAX_PIXELS;

  try {
    const metadata = await sharp(inputBuffer, { failOn: "error" }).metadata();
    if (!metadata.format || !ALLOWED_SHARP_FORMATS.includes(metadata.format as (typeof ALLOWED_SHARP_FORMATS)[number])) {
      throw new AdminImageUploadError("IMAGE_INVALID", "The uploaded file is not a supported raster image.");
    }

    if (!metadata.width || !metadata.height) {
      throw new AdminImageUploadError("IMAGE_INVALID", "Image dimensions could not be read.");
    }

    if (metadata.width * metadata.height > maxPixels) {
      throw new AdminImageUploadError("IMAGE_TOO_MANY_PIXELS", "Image dimensions are too large.");
    }

    return {
      inputBuffer,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
    };
  } catch (error) {
    if (error instanceof AdminImageUploadError) throw error;
    throw new AdminImageUploadError("IMAGE_INVALID", "The uploaded file is not a valid image.");
  }
}

export async function renderAdminImageWebpVariant(
  inputBuffer: Buffer,
  options: {
    maxWidth: number;
    quality: number;
    maxPixels?: number;
  },
): Promise<ProcessedAdminImage> {
  try {
    const result = await sharp(inputBuffer, {
      failOn: "error",
      limitInputPixels: options.maxPixels ?? DEFAULT_MAX_PIXELS,
    })
      .rotate()
      .resize({
        width: options.maxWidth,
        height: options.maxWidth,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: options.quality })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: result.data,
      contentType: "image/webp",
      extension: "webp",
      sizeBytes: result.data.byteLength,
      width: result.info.width,
      height: result.info.height,
    };
  } catch {
    throw new AdminImageUploadError("IMAGE_INVALID", "The uploaded image could not be processed.");
  }
}

export async function processAdminImageToWebp(
  file: UploadableAdminImageFile,
  options: {
    allowedMimeTypes?: readonly string[];
    maxSizeMb?: number;
    maxPixels?: number;
    maxWidth: number;
    quality: number;
  },
) {
  const decoded = await readAndValidateAdminImageFile(file, options);
  return renderAdminImageWebpVariant(decoded.inputBuffer, options);
}
