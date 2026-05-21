import "server-only";

import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type PrivateBucketName = "visit-photos" | "certificate-files" | "export-files";

function assertSafeStoragePath(path: string) {
  const normalized = path.trim();

  if (!normalized || normalized.includes("..") || normalized.startsWith("/") || /^https?:\/\//i.test(normalized)) {
    throw new Error("INVALID_STORAGE_PATH");
  }

  return normalized;
}

export async function createPrivateFileSignedUrl(
  bucket: PrivateBucketName,
  path: string,
  ttlSeconds = getServerEnv().CERTIFICATE_SIGNED_URL_TTL_SECONDS
) {
  const safePath = assertSafeStoragePath(path);
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(safePath, ttlSeconds);

  if (error || !data?.signedUrl) {
    throw new Error("SIGNED_URL_CREATE_FAILED");
  }

  return data.signedUrl;
}
