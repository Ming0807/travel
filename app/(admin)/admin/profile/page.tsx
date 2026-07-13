import Link from "next/link";
import type { Metadata } from "next";
import { IdentificationCard, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasPermission, requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "โปรไฟล์ผู้ดูแลระบบ | Southern Border Tourism",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "ผู้ดูแลระบบสูงสุด",
  admin: "ผู้ดูแลระบบ",
  province_admin: "ผู้ดูแลระดับจังหวัด",
  attraction_manager: "ผู้จัดการสถานที่",
  viewer: "ผู้ดูข้อมูล",
};

export default async function AdminProfilePage() {
  const guard = await requireAdmin();
  const canManageUsers = hasPermission(guard.actor, "user.manage");
  const canManageRoles = hasPermission(guard.actor, "role.manage");

  return (
    <AdminShell admin={guard.actor}>
      <div className="mx-auto max-w-4xl space-y-6">
        <AdminPageHeader
          eyebrow="บัญชีของฉัน"
          title="โปรไฟล์ผู้ดูแลระบบ"
          description="ตรวจสอบบัญชี บทบาท และขอบเขตการเข้าถึงระบบของคุณ"
        />

        <section className="border-y border-slate-200 bg-white py-6 sm:px-6" aria-labelledby="admin-profile-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#0A6B62]">
              <IdentificationCard size={32} weight="duotone" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="admin-profile-heading" className="text-lg font-bold text-slate-900">
                {guard.displayName || "ผู้ดูแลระบบ"}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-600">{guard.email}</p>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-slate-500">บทบาทที่ได้รับ</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {guard.roleNames.length ? (
                      guard.roleNames.map((role) => (
                        <span key={role} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {ROLE_LABELS[role] ?? role}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">ยังไม่ได้กำหนดบทบาท</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">สิทธิ์ที่ใช้งานได้</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">{guard.permissions.length} สิทธิ์</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2" aria-label="การจัดการบัญชีและสิทธิ์">
          <div className="border-b border-slate-200 bg-white px-1 py-5 sm:px-5">
            <ShieldCheck size={24} className="text-[#0A6B62]" aria-hidden="true" />
            <h2 className="mt-3 text-base font-bold text-slate-900">ความปลอดภัยของบัญชี</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ระบบจะไม่แสดงรหัสผ่านเดิม หากต้องการเปลี่ยนรหัสผ่านให้ใช้ขั้นตอนรีเซ็ตรหัสผ่านที่หน้าเข้าสู่ระบบ
            </p>
          </div>
          <div className="border-b border-slate-200 bg-white px-1 py-5 sm:px-5">
            <UsersThree size={24} className="text-[#0A6B62]" aria-hidden="true" />
            <h2 className="mt-3 text-base font-bold text-slate-900">การจัดการสิทธิ์</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              การเปลี่ยนข้อมูลบัญชีและบทบาทต้องทำผ่านผู้ดูแลที่มีสิทธิ์ เพื่อให้ทุกการเปลี่ยนแปลงตรวจสอบย้อนหลังได้
            </p>
            {canManageUsers || canManageRoles ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {canManageUsers ? (
                  <Link href="/admin/users" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    จัดการผู้ดูแลระบบ
                  </Link>
                ) : null}
                {canManageRoles ? (
                  <Link href="/admin/roles" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    จัดการบทบาทและสิทธิ์
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
