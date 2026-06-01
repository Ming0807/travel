import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentHealthDashboard } from "@/components/admin/content-health/ContentHealthDashboard";
import { requireAnyPermission } from "@/lib/auth/guards";
import { getContentHealth } from "@/lib/repositories/content-health.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content Health | Admin",
};

export default async function ContentHealthPage() {
  await requireAnyPermission([
    "attraction.read",
    "story.read",
    "route.read",
    "restaurant.read",
    "photo_spot.read",
  ]);

  const report = await getContentHealth();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Quality"
          title="Content Health Dashboard"
          description="Monitor content completeness across all content types — draft/published status, English translations, media coverage, and overall health."
          actions={
            <Link
              href="/admin/content"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0A6B62] hover:text-[#0A6B62]"
            >
              <ArrowSquareOut size={15} weight="bold" />
              Content Hub
            </Link>
          }
        />

        <ContentHealthDashboard report={report} />
      </div>
    </AdminShell>
  );
}
