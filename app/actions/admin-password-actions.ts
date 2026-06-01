"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { rateLimit } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Please enter your email address." };
  }

  // Rate limiting: max 3 password reset requests per email per hour
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const limit = rateLimit(`forgot:${email}:${ip}`, 3, 60 * 60 * 1000);
  if (!limit.success) {
    return { success: false, error: "Too many password reset requests. Please try again later." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/reset-password`,
  });

  if (error) {
    // Don't reveal whether email exists — only generic message
    console.error("forgotPasswordAction error:", error.message);
  }

  // Always return success to prevent email enumeration
  return {
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  // Rate limiting: max 5 password resets per IP per hour
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const limit = rateLimit(`reset:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.success) {
    return { success: false, error: "Too many password reset attempts. Please try again later." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: "Failed to reset password. The link may have expired." };
  }

  // Audit log password reset
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const serviceClient = createSupabaseServiceRoleClient();
      await serviceClient.from("audit_logs").insert({
        admin_id: null,
        action: "auth.password_reset",
        entity_type: "admin_user",
        entity_id: user.id,
        new_data: { method: "reset_link", ip },
        ip_address: ip,
      });
    }
  } catch {
    // Non-blocking
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Password has been reset successfully. Please sign in." };
}
