import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { adminReviewFiltersSchema } from "@/lib/validation/admin-review";
import { listAdminReviews } from "@/lib/repositories/admin-review.repository";

export async function POST(request: NextRequest) {
  try {
    await requirePermission("review.read");
    const formData = await request.formData();
    const parsed = adminReviewFiltersSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid filters." },
        { status: 400 }
      );
    }

    const result = await listAdminReviews(parsed.data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviews.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
