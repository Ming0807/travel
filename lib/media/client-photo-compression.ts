const MEBIBYTE = 1024 * 1024;

export const VISIT_PHOTO_MAX_SOURCE_BYTES = 50 * MEBIBYTE;
export const VISIT_PHOTO_UPLOAD_TARGET_BYTES = 3.5 * MEBIBYTE;

const ACCEPTED_SOURCE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const COMPRESSION_ATTEMPTS = [
  { maxDimension: 1920, quality: 0.82 },
  { maxDimension: 1600, quality: 0.76 },
  { maxDimension: 1280, quality: 0.68 },
  { maxDimension: 1080, quality: 0.6 },
] as const;

type DrawablePhoto = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

export type PreparedVisitPhoto = {
  file: File;
  originalBytes: number;
  uploadBytes: number;
};

export function formatPhotoBytes(bytes: number) {
  if (bytes < MEBIBYTE) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / MEBIBYTE).toFixed(1)}MB`;
}

export function validateVisitPhotoSource(file: File) {
  const normalizedType = file.type.toLowerCase();
  const extensionAllowed = /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

  if (!ACCEPTED_SOURCE_TYPES.has(normalizedType) && !extensionAllowed) {
    return "รองรับเฉพาะรูป JPG, PNG, WebP หรือ HEIC เท่านั้น";
  }

  if (file.size <= 0) {
    return "ไฟล์รูปภาพว่างเปล่า กรุณาเลือกรูปใหม่";
  }

  if (file.size > VISIT_PHOTO_MAX_SOURCE_BYTES) {
    return "รูปมีขนาดใหญ่เกิน 50MB กรุณาใช้โหมดถ่ายภาพปกติหรือเลือกรูปอื่น";
  }

  return null;
}

export function assertPreparedVisitPhoto(file: File) {
  if (file.size > VISIT_PHOTO_UPLOAD_TARGET_BYTES) {
    throw new Error("รูปยังมีขนาดใหญ่เกินไปหลังปรับขนาด กรุณาเลือกรูปอื่นหรือถ่ายใหม่ด้วยโหมดปกติ");
  }
}

function calculateDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) return { width, height };

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

async function loadDrawablePhoto(file: File): Promise<DrawablePhoto> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Safari can decode some HEIC files through an image element even when
      // createImageBitmap cannot, so continue to the compatible path below.
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        release: () => URL.revokeObjectURL(objectUrl),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("อุปกรณ์นี้ไม่สามารถเปิดรูปดังกล่าวได้ กรุณาถ่ายใหม่หรือเลือกไฟล์ JPG"));
    };
    image.src = objectUrl;
  });
}

function encodeCanvas(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("ไม่สามารถย่อรูปนี้ได้ กรุณาเลือกรูปอื่น"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

export async function prepareVisitPhotoForUpload(file: File): Promise<PreparedVisitPhoto> {
  const validationError = validateVisitPhotoSource(file);
  if (validationError) throw new Error(validationError);

  const drawable = await loadDrawablePhoto(file);

  try {
    if (!drawable.width || !drawable.height) {
      throw new Error("ไม่สามารถอ่านขนาดรูปนี้ได้ กรุณาเลือกรูปอื่น");
    }

    for (const attempt of COMPRESSION_ATTEMPTS) {
      const dimensions = calculateDimensions(drawable.width, drawable.height, attempt.maxDimension);
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("เบราว์เซอร์ไม่รองรับการย่อรูป กรุณาลองเปิดด้วย Safari หรือ Chrome เวอร์ชันล่าสุด");

      context.drawImage(drawable.source, 0, 0, dimensions.width, dimensions.height);
      const blob = await encodeCanvas(canvas, attempt.quality);
      const prepared = new File([blob], "visit-photo.webp", {
        type: blob.type === "image/webp" ? "image/webp" : blob.type,
        lastModified: Date.now(),
      });

      if (prepared.type === "image/webp" && prepared.size <= VISIT_PHOTO_UPLOAD_TARGET_BYTES) {
        return {
          file: prepared,
          originalBytes: file.size,
          uploadBytes: prepared.size,
        };
      }
    }

    throw new Error("รูปยังมีขนาดใหญ่เกินไปหลังปรับขนาด กรุณาเลือกรูปอื่นหรือถ่ายใหม่ด้วยโหมดปกติ");
  } finally {
    drawable.release();
  }
}
