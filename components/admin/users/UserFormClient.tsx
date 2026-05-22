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
    <form action={handleSubmit} className="mx-auto max-w-2xl space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <WarningCircle size={24} weight="fill" className="shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {initialData?.admin_id && <input type="hidden" name="id" value={initialData.admin_id} />}

      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
            Email Address
          </label>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={initialData?.email || ""}
              disabled={isEditing}
              required={!isEditing}
              className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#F3704C] disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm sm:leading-6 transition-all"
              placeholder="admin@example.com"
            />
          </div>
          {isEditing && (
            <p className="mt-2 text-xs text-slate-500">Email address cannot be changed.</p>
          )}
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold text-slate-900">
            Display Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="displayName"
              id="displayName"
              defaultValue={initialData?.display_name || ""}
              required
              minLength={2}
              className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#F3704C] sm:text-sm sm:leading-6 transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <fieldset>
            <legend className="text-sm font-semibold leading-6 text-slate-900">Assigned Roles</legend>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select one or more roles for this user.
            </p>
            <div className="mt-4 space-y-4">
              {roles.map((role) => (
                <div key={role.role_id} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id={`role-${role.role_id}`}
                      name="roleIds"
                      type="checkbox"
                      value={role.role_id}
                      defaultChecked={initialData?.roleIds?.includes(role.role_id)}
                      className="h-4 w-4 rounded border-slate-300 text-[#F3704C] focus:ring-[#F3704C]"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor={`role-${role.role_id}`} className="font-medium text-slate-900 flex items-center gap-2">
                      <Shield size={16} className="text-slate-400" />
                      {role.role_name}
                    </label>
                    <p className="text-slate-500">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Status</h3>
              <p className="text-sm text-slate-500">Allow user to sign in to the dashboard.</p>
            </div>
            <div className="relative flex items-center">
              <input
                type="hidden"
                name="isActive"
                value="false"
              />
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                value="true"
                defaultChecked={initialData ? initialData.is_active : true}
                className="h-5 w-5 rounded border-slate-300 text-[#F3704C] focus:ring-[#F3704C]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-4 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-700 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#F3704C] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3704C] disabled:opacity-50 transition-all"
        >
          {isPending ? "Saving..." : "Save User"}
        </button>
      </div>
    </form>
  );
}
