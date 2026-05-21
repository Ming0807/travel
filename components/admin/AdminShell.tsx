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
    <div className="min-h-screen bg-[#FCFAF8] text-slate-800 font-sans">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1 flex flex-col">
          <AdminTopbar displayName={admin?.displayName} email={admin?.email} />
          <main className="px-4 py-6 md:px-6 lg:px-8 xl:px-10 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
