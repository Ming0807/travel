import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

type AdminShellProps = {
  children: ReactNode;
  admin?: {
    displayName?: string | null;
    email?: string | null;
  } | null;
};

export function AdminShell({ children, admin }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#073F37] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1 flex flex-col">
          <AdminTopbar displayName={admin?.displayName} email={admin?.email} />
          <main id="admin-main-content" className="px-4 py-6 md:px-6 lg:px-8 xl:px-10 flex-1 outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
