import { Suspense, type ReactNode } from "react";
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

function AdminSidebarFallback() {
  return <aside aria-hidden="true" data-admin-chrome className="sticky top-0 hidden h-screen w-[236px] shrink-0 border-r border-[var(--admin-border)] bg-[#FBFBFA] lg:block" />;
}

function AdminTopbarFallback() {
  return <div aria-hidden="true" data-admin-chrome className="h-16 shrink-0 border-b border-[var(--admin-border)] bg-white" />;
}

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
          <Suspense fallback={<AdminSidebarFallback />}>
            <AdminSidebar />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col">
            <Suspense fallback={<AdminTopbarFallback />}>
              <AdminTopbar displayName={admin?.displayName} email={admin?.email} />
            </Suspense>
            <main id="admin-main-content" className="flex-1 px-4 py-5 outline-none md:px-5 lg:px-6 xl:px-7">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminAccessProvider>
  );
}
