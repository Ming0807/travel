import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminAccessProvider } from "@/components/admin/AdminAccessContext";

export type AdminShellAdmin = {
  adminId?: string | null;
  displayName?: string | null;
  email?: string | null;
  roleNames?: string[];
  permissions?: string[];
};

type AdminShellProps = {
  children: ReactNode;
  admin?: AdminShellAdmin | null;
};

export function AdminShell({ children, admin }: AdminShellProps) {
  return (
    <AdminAccessProvider initialAdmin={admin}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <a
          href="#admin-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#073F37] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar displayName={admin?.displayName} email={admin?.email} />
            <main id="admin-main-content" className="flex-1 px-4 py-6 outline-none md:px-6 lg:px-8 xl:px-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminAccessProvider>
  );
}
