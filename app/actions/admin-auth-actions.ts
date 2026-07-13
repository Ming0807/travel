"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { normalizeAdminLoginIdentifier } from "@/lib/auth/admin-login";
import { rateLimit } from "@/lib/utils/rate-limit";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function loginAdminAction(formData: FormData) {
  const email = normalizeAdminLoginIdentifier(formData.get("email"));
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter both username/email and password." };
  }

  // Rate limiting: max 5 attempts per IP per 15-minute window
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.success) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: "Invalid email or password." };
  }

  // Audit log successful login
  try {
    const serviceClient = createSupabaseServiceRoleClient();
    await serviceClient.from("audit_logs").insert({
      admin_id: null, // Unknown until we look up admin_users
      action: "auth.login",
      entity_type: "admin_session",
      entity_id: data.user?.id ?? null,
      new_data: { email, ip, method: "password" },
      ip_address: ip,
    });
  } catch {
    // Non-blocking — login succeeds even if audit log fails
  }

  // Update last_login_at in admin_users
  try {
    const serviceClient = createSupabaseServiceRoleClient();
    await serviceClient
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("auth_user_id", data.user?.id);
  } catch {
    // Non-blocking
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAdminAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";

  const supabase = await createSupabaseServerClient();
  
  // Get user before signout for audit log
  const { data: { user } } = await supabase.auth.getUser();

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    return { success: false, error: "ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง" };
  }

  // Audit log logout
  if (user) {
    try {
      const serviceClient = createSupabaseServiceRoleClient();
      await serviceClient.from("audit_logs").insert({
        admin_id: null,
        action: "auth.logout",
        entity_type: "admin_session",
        entity_id: user.id,
        new_data: { ip },
        ip_address: ip,
      });
    } catch {
      // Non-blocking
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}
