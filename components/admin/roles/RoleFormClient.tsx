"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { saveRoleAction } from "@/app/actions/admin-roles";
import { WarningCircle, ShieldCheck } from "@phosphor-icons/react";
import type { Permission } from "@/lib/repositories/permission.repository";

type RoleFormProps = {
  permissions: Permission[];
  initialData?: {
    role_id: number;
    role_name: string;
    description: string;
    is_active: boolean;
    permissionIds: number[];
  };
};

export function RoleFormClient({ permissions, initialData }: RoleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  
  const isEditing = !!initialData?.role_id;
  const isSuperAdmin = initialData?.role_name === "super_admin";
  const isProtectedRole = initialData ? ["super_admin", "admin", "province_admin", "attraction_manager", "viewer"].includes(initialData.role_name) : false;

  // Group permissions by resource prefix (e.g., "user.manage" -> "user")
  const permissionGroups = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const perm of permissions) {
      const parts = perm.permission_name.split(".");
      const groupName = parts.length > 1 ? parts[0] : "other";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(perm);
    }
    return groups;
  }, [permissions]);

  async function handleSubmit(formData: FormData) {
    setErrorMsg("");
    startTransition(async () => {
      const res = await saveRoleAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/admin/roles");
      }
    });
  }

  return (
    <form action={handleSubmit} className="mx-auto max-w-4xl space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <WarningCircle size={24} weight="fill" className="shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {isSuperAdmin && (
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-blue-800 border border-blue-100">
          <ShieldCheck size={24} weight="fill" className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Super Admin Role</p>
            <p className="mt-1">This core system role has full access to everything. Its permissions and status cannot be modified or reduced to prevent accidental system lockouts.</p>
          </div>
        </div>
      )}

      {initialData?.role_id && <input type="hidden" name="id" value={initialData.role_id} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Role Details */}
        <div className="space-y-6 lg:col-span-1">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">Role Details</h3>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="roleName" className="block text-sm font-semibold text-slate-900">
                  Role Name (ID)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="roleName"
                    id="roleName"
                    defaultValue={initialData?.role_name || ""}
                    disabled={isProtectedRole}
                    required
                    pattern="[a-z_]+"
                    title="Only lowercase letters and underscores are allowed"
                    className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#F3704C] disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm sm:leading-6 transition-all"
                    placeholder="e.g. content_editor"
                  />
                </div>
                {isProtectedRole && (
                  <p className="mt-2 text-xs text-slate-500">System role names cannot be changed.</p>
                )}
                {!isProtectedRole && (
                  <p className="mt-2 text-xs text-slate-500">Use lowercase letters and underscores only.</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    defaultValue={initialData?.description || ""}
                    disabled={isSuperAdmin}
                    required
                    className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#F3704C] disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm sm:leading-6 transition-all"
                    placeholder="Describes the purpose and access level of this role..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Active Status</h3>
                    <p className="text-xs text-slate-500 mt-1">Is this role available?</p>
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
                      disabled={isSuperAdmin}
                      defaultChecked={initialData ? initialData.is_active : true}
                      className="h-5 w-5 rounded border-slate-300 text-[#F3704C] focus:ring-[#F3704C] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Permissions Matrix */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">Permissions Matrix</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
            {Object.entries(permissionGroups).map(([group, perms]) => (
              <div key={group} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded-md inline-block">
                  {group}
                </h4>
                <div className="space-y-3 pl-1">
                  {perms.map(perm => {
                    const isChecked = isSuperAdmin || initialData?.permissionIds?.includes(perm.permission_id);
                    return (
                      <div key={perm.permission_id} className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id={`perm-${perm.permission_id}`}
                            name="permissionIds"
                            type="checkbox"
                            value={perm.permission_id}
                            defaultChecked={isChecked}
                            disabled={isSuperAdmin}
                            className="h-4 w-4 rounded border-slate-300 text-[#F3704C] focus:ring-[#F3704C] disabled:opacity-50 disabled:bg-slate-100"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor={`perm-${perm.permission_id}`} className="font-semibold text-slate-900 cursor-pointer">
                            {perm.permission_name}
                          </label>
                          <p className="text-xs text-slate-500">{perm.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
          disabled={isPending || isSuperAdmin}
          className="rounded-xl bg-[#F3704C] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3704C] disabled:opacity-50 transition-all"
        >
          {isPending ? "Saving..." : "Save Role"}
        </button>
      </div>
    </form>
  );
}
