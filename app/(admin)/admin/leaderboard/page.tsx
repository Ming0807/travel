export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";

export default async function AdminLeaderboardRedirectPage() {
  await requirePermission("leaderboard.read");
  redirect("/leaderboard");
}
