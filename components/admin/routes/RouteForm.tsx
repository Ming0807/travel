"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createRouteAction, updateRouteAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";

interface RouteFormProps {
  initialData?: AdminRouteRow | null;
}

export function RouteForm({ initialData }: RouteFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateRouteAction.bind(null, initialData.route_id) : createRouteAction;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  if (state?.success) {
    router.push("/admin/routes");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {state?.error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
          {state.error}
        </div>
      )}

      <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nameTh" className="mb-1 block text-sm font-medium text-slate-700">
              ชื่อเส้นทาง (TH) *
            </label>
            <input
              type="text"
              id="nameTh"
              name="nameTh"
              defaultValue={initialData?.name_th}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            />
            {state?.fieldErrors?.nameTh && (
              <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.nameTh[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="nameEn" className="mb-1 block text-sm font-medium text-slate-700">
              ชื่อเส้นทาง (EN)
            </label>
            <input
              type="text"
              id="nameEn"
              name="nameEn"
              defaultValue={initialData?.name_en ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            />
            {state?.fieldErrors?.nameEn && (
              <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.nameEn[0]}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="descriptionTh" className="mb-1 block text-sm font-medium text-slate-700">
            รายละเอียดเส้นทาง (TH)
          </label>
          <textarea
            id="descriptionTh"
            name="descriptionTh"
            defaultValue={initialData?.description_th ?? ""}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div>
          <label htmlFor="descriptionEn" className="mb-1 block text-sm font-medium text-slate-700">
            รายละเอียดเส้นทาง (EN)
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            defaultValue={initialData?.description_en ?? ""}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div>
          <label htmlFor="coverImagePath" className="mb-1 block text-sm font-medium text-slate-700">
            รูปภาพปก (URL/Path)
          </label>
          <input
            type="text"
            id="coverImagePath"
            name="coverImagePath"
            defaultValue={initialData?.cover_image_path ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              defaultChecked={initialData?.is_published ?? false}
              className="h-4 w-4 rounded border-slate-300 text-[#0A6B62] focus:ring-[#0A6B62]"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
              เผยแพร่สู่สาธารณะ
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={initialData?.is_active ?? true}
              className="h-4 w-4 rounded border-slate-300 text-[#0A6B62] focus:ring-[#0A6B62]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              เปิดใช้งาน (Active)
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-[#0A6B62] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างเส้นทาง"}
        </button>
      </div>
    </form>
  );
}
