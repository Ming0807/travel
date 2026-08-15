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

const PREPARED_FILE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

function exportCanvas(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("ไม่สามารถย่อรูปนี้ได้ กรุณาเลือกรูปอื่น"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function encodeCanvas(canvas: HTMLCanvasElement, quality: number) {
  const preferred = await exportCanvas(canvas, "image/webp", quality);
  if (preferred.type === "image/webp") return preferred;

  // Browsers may legally return PNG when the requested encoder is unavailable.
  // JPEG is universally suitable for camera photos and avoids oversized PNG
  // fallbacks seen in iOS WebKit while keeping the upload below platform limits.
  const fallback = await exportCanvas(canvas, "image/jpeg", quality);
  if (PREPARED_FILE_EXTENSIONS[fallback.type]) return fallback;

  throw new Error("เบราว์เซอร์ไม่สามารถเตรียมรูปสำหรับอัปโหลดได้ กรุณาลองใช้ Safari เวอร์ชันล่าสุดหรือเลือกรูป JPG");
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

      try {
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("เบราว์เซอร์ไม่รองรับการย่อรูป กรุณาลองเปิดด้วย Safari หรือ Chrome เวอร์ชันล่าสุด");

        context.drawImage(drawable.source, 0, 0, dimensions.width, dimensions.height);
        const blob = await encodeCanvas(canvas, attempt.quality);
        const extension = PREPARED_FILE_EXTENSIONS[blob.type];
        if (!extension) {
          throw new Error("เบราว์เซอร์สร้างไฟล์รูปที่ระบบไม่รองรับ กรุณาเลือกรูป JPG");
        }

        const prepared = new File([blob], `visit-photo.${extension}`, {
          type: blob.type,
          lastModified: Date.now(),
        });

        if (prepared.size <= VISIT_PHOTO_UPLOAD_TARGET_BYTES) {
          return {
            file: prepared,
            originalBytes: file.size,
            uploadBytes: prepared.size,
          };
        }
      } finally {
        // Release backing pixels between attempts. WebKit does not always
        // collect discarded canvases promptly on memory-constrained iPhones.
        canvas.width = 1;
        canvas.height = 1;
      }
    }

    throw new Error("รูปยังมีขนาดใหญ่เกินไปหลังปรับขนาด กรุณาเลือกรูปอื่นหรือถ่ายใหม่ด้วยโหมดปกติ");
  } finally {
    drawable.release();
  }
}
