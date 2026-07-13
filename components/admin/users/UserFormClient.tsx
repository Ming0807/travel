"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAdminUserAction } from "@/app/actions/admin-users";
import { Shield, WarningCircle } from "@phosphor-icons/react";
import type { Role } from "@/lib/repositories/role.repository";

type UserFormProps = {
  roles: Role[];
  initialData?: {
    admin_id: string;
    email: string;
    display_name: string;
    is_active: boolean;
    roleIds: number[];
  };
};

export function UserFormClient({ roles, initialData }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  
  const isEditing = !!initialData?.admin_id;

  async function handleSubmit(formData: FormData) {
    setErrorMsg("");
    startTransition(async () => {
      const res = await saveAdminUserAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/admin/users");
      }
    });
  }

  return (
    <form action={handleSubmit} className="mx-auto w-full max-w-6xl">
      
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <WarningCircle size={24} weight="fill" className="shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {initialData?.admin_id && <input type="hidden" name="id" value={initialData.admin_id} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: User Details & Status */}
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-8">
            {/* User Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">ข้อมูลผู้ดูแล</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
                    อีเมลสำหรับเข้าสู่ระบบ
                  </label>
                  <div className="mt-2">
                    {isEditing && (
                      <input type="hidden" name="email" value={initialData?.email || ""} />
                    )}
                    <input
                      type="email"
                      name={isEditing ? "_email" : "email"}
                      id="email"
                      defaultValue={initialData?.email || ""}
                      disabled={isEditing}
                      required={!isEditing}
                      className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm sm:leading-6 transition-all"
                      placeholder="admin@example.com"
                    />
                  </div>
                  {isEditing && (
                    <p className="mt-2 text-xs text-slate-500">ไม่สามารถเปลี่ยนอีเมลจากหน้านี้ได้</p>
                  )}
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-slate-900">
                    ชื่อที่แสดง
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="displayName"
                      id="displayName"
                      defaultValue={initialData?.display_name || ""}
                      required
                      minLength={2}
                      className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal sm:text-sm sm:leading-6 transition-all"
                      placeholder="ชื่อผู้ดูแลระบบ"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Status Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">สถานะการเข้าใช้งาน</h3>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">เปิดใช้งานบัญชี</h4>
                  <p className="text-sm text-slate-500 mt-0.5">อนุญาตให้บัญชีนี้เข้าสู่ระบบหลังบ้าน</p>
                </div>
                <div className="relative flex items-center">
                  <input type="hidden" name="isActive" value="false" />
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    value="true"
                    defaultChecked={initialData ? initialData.is_active : true}
                    className="h-6 w-6 rounded border-slate-300 text-teal focus:ring-teal cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roles */}
        <div className="lg:col-span-5 space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">บทบาทที่ได้รับ</h3>
            <p className="text-sm leading-6 text-slate-500 mb-4">
              เลือกบทบาทตามหน้าที่ของผู้ดูแล สิทธิ์ทั้งหมดจะอ้างอิงจากบทบาทที่เลือก
            </p>
            
            <div className="flex flex-col gap-3">
              {roles.map((role) => {
                const isChecked = initialData?.roleIds?.includes(role.role_id);
                return (
                  <label key={role.role_id} htmlFor={`role-${role.role_id}`} className={`flex flex-col gap-2 rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer transition-colors hover:bg-slate-50 ${isChecked ? 'bg-slate-50 ring-1 ring-slate-300' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <Shield size={18} className={isChecked ? 'text-teal' : 'text-slate-400'} weight={isChecked ? 'fill' : 'regular'} />
                        {role.role_name}
                      </div>
                      <input
                        id={`role-${role.role_id}`}
                        name="roleIds"
                        type="checkbox"
                        value={role.role_id}
                        defaultChecked={isChecked}
                        className="h-5 w-5 rounded border-slate-300 text-teal focus:ring-teal"
                      />
                    </div>
                    <p className="text-xs text-slate-500 pl-7">{role.description}</p>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action Bar for Mobile */}
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-8 flex items-center justify-end gap-x-4 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] sm:static sm:mx-0 sm:mb-0 sm:mt-8 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-6 sm:shadow-none">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-700 transition"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-teal px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-50 transition-all"
        >
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มผู้ดูแลระบบ"}
        </button>
      </div>
    </form>
  );
}
