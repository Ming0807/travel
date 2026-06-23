import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  AdminImageUploadError,
  ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES,
  ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
  processAdminImageToWebp,
  readAndValidateAdminImageFile,
  renderAdminImageWebpVariant,
  validateAdminImageUploadFile,
} from "@/lib/services/admin-image-processing.service";

type TestFile = {
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

async function makeRasterBuffer(format: "jpeg" | "png" | "webp", width = 32, height = 24) {
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#0A6B62",
    },
  });

  if (format === "jpeg") return image.jpeg().toBuffer();
  if (format === "webp") return image.webp().toBuffer();
  return image.png().toBuffer();
}

function makeFile(buffer: Buffer, type: string): TestFile {
  return {
    type,
    size: buffer.byteLength,
    arrayBuffer: async () => {
      const arrayBuffer = new ArrayBuffer(buffer.byteLength);
      new Uint8Array(arrayBuffer).set(buffer);
      return arrayBuffer;
    },
  };
}

describe("admin image upload processing", () => {
  it("accepts the configured raster image MIME types", () => {
    for (const mimeType of ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES) {
      expect(() => validateAdminImageUploadFile({
        mimeType,
        sizeBytes: 1024,
      })).not.toThrow();
    }
  });

  it("rejects unsupported MIME types before decoding", () => {
    expect(() => validateAdminImageUploadFile({
      mimeType: "image/svg+xml",
      sizeBytes: 1024,
    })).toThrow(expect.objectContaining({ code: "IMAGE_INVALID_TYPE" }));
  });

  it("rejects empty images", () => {
    expect(() => validateAdminImageUploadFile({
      mimeType: "image/png",
      sizeBytes: 0,
    })).toThrow(expect.objectContaining({ code: "IMAGE_EMPTY" }));
  });

  it("rejects images over the configured max size", () => {
    expect(() => validateAdminImageUploadFile({
      mimeType: "image/jpeg",
      sizeBytes: ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB * 1024 * 1024 + 1,
    })).toThrow(expect.objectContaining({ code: "IMAGE_TOO_LARGE" }));
  });

  it("rejects invalid bytes even when the MIME type looks valid", async () => {
    const file = makeFile(Buffer.from("not an image"), "image/png");

    await expect(readAndValidateAdminImageFile(file)).rejects.toMatchObject({
      code: "IMAGE_INVALID",
    });
  });

  it("rejects SVG bytes spoofed as PNG instead of rasterizing them", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><script>alert(1)</script></svg>');
    const file = makeFile(svg, "image/png");

    await expect(readAndValidateAdminImageFile(file)).rejects.toMatchObject({
      code: "IMAGE_INVALID",
    });
  });

  it("rejects images whose decoded dimensions exceed the pixel limit", async () => {
    const image = await makeRasterBuffer("png", 32, 32);
    const file = makeFile(image, "image/png");

    await expect(readAndValidateAdminImageFile(file, { maxPixels: 100 })).rejects.toMatchObject({
      code: "IMAGE_TOO_MANY_PIXELS",
    });
  });

  it("converts a valid PNG to a resized WebP variant", async () => {
    const input = await makeRasterBuffer("png", 800, 600);
    const file = makeFile(input, "image/png");

    const processed = await processAdminImageToWebp(file, {
      maxWidth: 200,
      quality: 80,
    });

    expect(processed.contentType).toBe("image/webp");
    expect(processed.extension).toBe("webp");
    expect(processed.width).toBe(200);
    expect(processed.height).toBe(150);
    expect(processed.sizeBytes).toBeGreaterThan(0);

    const outputMetadata = await sharp(processed.buffer).metadata();
    expect(outputMetadata.format).toBe("webp");
    expect(outputMetadata.width).toBe(200);
  });

  it("can create a separate thumbnail from a decoded source buffer", async () => {
    const input = await makeRasterBuffer("jpeg", 600, 300);
    const decoded = await readAndValidateAdminImageFile(makeFile(input, "image/jpeg"));

    const thumbnail = await renderAdminImageWebpVariant(decoded.inputBuffer, {
      maxWidth: 80,
      quality: 70,
    });

    expect(thumbnail.contentType).toBe("image/webp");
    expect(thumbnail.width).toBe(80);
    expect(thumbnail.height).toBe(40);
  });

  it("uses typed upload errors", async () => {
    const file = makeFile(Buffer.from("bad"), "image/png");

    await expect(readAndValidateAdminImageFile(file)).rejects.toBeInstanceOf(AdminImageUploadError);
  });
});
