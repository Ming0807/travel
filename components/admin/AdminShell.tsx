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
    <div className="min-h-screen bg-[#F4F8F6]">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminTopbar displayName={admin?.displayName} email={admin?.email} />
          <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
