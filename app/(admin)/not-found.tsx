import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader eyebrow="404" title="Page Not Found" description="The requested admin page does not exist." />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <span className="text-2xl font-black">?</span>
          </div>
          <h3 className="mt-4 text-lg font-black text-[#073F37]">Not Found</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Could not find the requested resource in the admin portal. Please check the URL or use the navigation menu.
          </p>
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-xl bg-[#0A6B62] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#085A53]"
            >
              Return to Overview
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
