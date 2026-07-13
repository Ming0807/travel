import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET() {
  const guard = await requireAdmin();

  return NextResponse.json(
    {
      adminId: guard.adminId,
      displayName: guard.displayName,
      email: guard.email,
      roleNames: guard.roleNames,
      permissions: guard.permissions,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}
