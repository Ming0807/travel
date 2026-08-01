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
      <div className="admin-app min-h-screen bg-[var(--admin-canvas)] font-sans text-[var(--admin-ink)]">
        <a
          href="#admin-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[4px] focus:bg-[#202020] focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-[#E77455] focus:ring-offset-2"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar displayName={admin?.displayName} email={admin?.email} />
            <main id="admin-main-content" className="flex-1 px-4 py-5 outline-none md:px-6 md:py-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminAccessProvider>
  );
}
