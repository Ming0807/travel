import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getServerEnv, type ServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type PrivateBucketName = "visit-photos" | "certificate-files" | "export-files" | "southern-border-tourism";

type CloudinaryResourceType = "image" | "raw";
type CloudinaryDeliveryType = "authenticated" | "upload";

interface UploadPrivateFileParams {
  bucket: PrivateBucketName;
  path: string;
  data: Buffer;
  contentType: string;
}

interface DeletePrivateFileParams {
  bucket: PrivateBucketName;
  path: string;
}

interface CloudinaryReference {
  resourceType: CloudinaryResourceType;
  deliveryType: CloudinaryDeliveryType;
  version: number;
  format: string;
  publicId: string;
}

export interface UploadedPrivateFile {
  provider: ServerEnv["STORAGE_PROVIDER"];
  bucket: PrivateBucketName;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
}

function assertSafeStoragePath(path: string) {
  const normalized = path.trim();

  if (!normalized || normalized.includes("..") || normalized.startsWith("/") || /^https?:\/\//i.test(normalized)) {
    throw new Error("INVALID_STORAGE_PATH");
  }

  return normalized;
}

function configureCloudinary(env = getServerEnv()) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function stripExtension(path: string) {
  return path.replace(/\.[a-z0-9]+$/i, "");
}

function normalizeCloudinaryFolder(folder: string) {
  return folder
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

function buildCloudinaryPublicId(path: string, env = getServerEnv()) {
  const folder = normalizeCloudinaryFolder(env.CLOUDINARY_UPLOAD_FOLDER);
  return [folder, stripExtension(path)].filter(Boolean).join("/");
}

function encodeCloudinaryReference(reference: CloudinaryReference) {
  return [
    "cloudinary",
    reference.resourceType,
    reference.deliveryType,
    `v${reference.version}`,
    reference.format,
    reference.publicId
  ].join(":");
}

function parseCloudinaryReference(path: string): CloudinaryReference | null {
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

async function uploadSupabasePrivateFile(params: UploadPrivateFileParams): Promise<UploadedPrivateFile> {
  const safePath = assertSafeStoragePath(params.path);
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.storage.from(params.bucket).upload(safePath, params.data, {
    contentType: params.contentType,
    upsert: false
  });

  if (error) {
    throw new Error("STORAGE_UPLOAD_FAILED");
  }

  return {
    provider: "supabase",
    bucket: params.bucket,
    storagePath: safePath,
    contentType: params.contentType,
    sizeBytes: params.data.byteLength
  };
}

async function uploadCloudinaryPrivateFile(params: UploadPrivateFileParams): Promise<UploadedPrivateFile> {
  const safePath = assertSafeStoragePath(params.path);
  const env = getServerEnv();
  configureCloudinary(env);

  const deliveryType = env.CLOUDINARY_DELIVERY_TYPE;
  const publicId = buildCloudinaryPublicId(safePath, env);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "image",
        type: deliveryType,
        overwrite: false,
        unique_filename: false,
        use_filename: false,
        tags: ["southern-border-tourism", params.bucket],
        context: {
          logical_bucket: params.bucket
        }
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(new Error("STORAGE_UPLOAD_FAILED"));
          return;
        }
        resolve(uploadResult);
      }
    );

    uploadStream.end(params.data);
  });

  return {
    provider: "cloudinary",
    bucket: params.bucket,
    storagePath: encodeCloudinaryReference({
      resourceType: result.resource_type === "raw" ? "raw" : "image",
      deliveryType,
      version: result.version,
      format: result.format,
      publicId: result.public_id
    }),
    contentType: params.contentType,
    sizeBytes: result.bytes || params.data.byteLength
  };
}

export async function uploadPrivateFile(params: UploadPrivateFileParams): Promise<UploadedPrivateFile> {
  const provider = getServerEnv().STORAGE_PROVIDER;

  if (provider === "cloudinary") {
    return uploadCloudinaryPrivateFile(params);
  }

  if (provider === "university_server") {
    throw new Error("UNIVERSITY_STORAGE_NOT_IMPLEMENTED");
  }

  return uploadSupabasePrivateFile(params);
}

export async function deletePrivateFile(params: DeletePrivateFileParams) {
  const cloudinaryReference = parseCloudinaryReference(params.path);

  if (cloudinaryReference) {
    configureCloudinary();
    await cloudinary.uploader.destroy(cloudinaryReference.publicId, {
      resource_type: cloudinaryReference.resourceType,
      type: cloudinaryReference.deliveryType,
      invalidate: true
    });
    return;
  }

  const safePath = assertSafeStoragePath(params.path);
  const supabase = createSupabaseServiceRoleClient();
  await supabase.storage.from(params.bucket).remove([safePath]);
}

export async function createPrivateFileSignedUrl(
  bucket: PrivateBucketName,
  path: string,
  ttlSeconds = getServerEnv().CERTIFICATE_SIGNED_URL_TTL_SECONDS
) {
  const cloudinaryReference = parseCloudinaryReference(path);

  if (cloudinaryReference) {
    configureCloudinary();
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

    if (cloudinaryReference.deliveryType === "authenticated") {
      return cloudinary.utils.private_download_url(cloudinaryReference.publicId, cloudinaryReference.format, {
        resource_type: cloudinaryReference.resourceType,
        type: cloudinaryReference.deliveryType,
        expires_at: expiresAt,
        attachment: false
      });
    }

    return cloudinary.url(cloudinaryReference.publicId, {
      resource_type: cloudinaryReference.resourceType,
      type: cloudinaryReference.deliveryType,
      version: cloudinaryReference.version,
      format: cloudinaryReference.format,
      secure: true,
      sign_url: true
    });
  }

  const safePath = assertSafeStoragePath(path);
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(safePath, ttlSeconds);

  if (error || !data?.signedUrl) {
    throw new Error("SIGNED_URL_CREATE_FAILED");
  }

  return data.signedUrl;
}
