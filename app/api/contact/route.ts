import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/utils/rate-limit";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 messages per hour per IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip + "_contact", 5, 60 * 60 * 1000);

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed", 
          details: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Use Service Role to insert since public anonymous users can't write to table directly without an insert policy
    const supabase = createSupabaseServiceRoleClient();
    
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
        status: "unread",
        is_replied: false,
      });

    if (error) {
      console.error("Contact form insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
