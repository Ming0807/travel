import { NextRequest, NextResponse } from "next/server";
import { uploadPrivateFile } from "@/lib/storage/private-files";
import { getServerEnv } from "@/lib/config/server-env";
import { rateLimit } from "@/lib/utils/rate-limit";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip, 20, 60 * 1000);

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "Too many upload requests. Please wait." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const attractionId = formData.get("attractionId") as string | null;

    if (!file || !attractionId) {
      return NextResponse.json(
        { success: false, error: "Missing file or attraction ID" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} is not allowed. Use JPEG, PNG, or WebP.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_SIZE_MB}MB limit.` },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extensionMap[file.type] || "jpg";

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const logicalPath = `attraction-media/${year}/${month}/${attractionId}/${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadPrivateFile({
      bucket: "visit-photos", // Re-use existing bucket for attraction media
      path: logicalPath,
      data: buffer,
      contentType: file.type,
    });

    // For Cloudinary, the storagePath is the reference string
    // For Supabase, we need to build a public URL
    let displayUrl: string;
    const env = getServerEnv();

    if (env.STORAGE_PROVIDER === "cloudinary") {
      // For cloudinary references, we can't directly display them
      // Return the storage reference and let the frontend handle it
      displayUrl = uploaded.storagePath;
    } else {
      // For Supabase, construct a URL
      displayUrl = uploaded.storagePath;
    }

    return NextResponse.json({
      success: true,
      storagePath: uploaded.storagePath,
      displayUrl,
      contentType: uploaded.contentType,
      sizeBytes: uploaded.sizeBytes,
    });
  } catch (error: unknown) {
    console.error("Admin media upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
