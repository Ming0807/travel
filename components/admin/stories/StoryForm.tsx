"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createStoryAction, updateStoryAction } from "@/app/actions/admin-story-actions";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

interface StoryFormProps {
  initialData?: AdminStoryRow | null;
  provinces: { province_id: number; province_name_th: string }[];
}

export function StoryForm({ initialData, provinces }: StoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateStoryAction.bind(null, initialData.story_id) : createStoryAction;
  
  // Use generic any for now since React 19 useActionState typings can be tricky with Server Actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  if (state?.success) {
    router.push("/admin/stories");
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
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
              ชื่อบทความ *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={initialData?.title}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            />
            {state?.fieldErrors?.title && (
              <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium text-slate-700">
              Slug (URL) *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              defaultValue={initialData?.slug}
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
              placeholder="e.g. pattani-central-mosque"
            />
            {state?.fieldErrors?.slug && (
              <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="provinceId" className="mb-1 block text-sm font-medium text-slate-700">
              จังหวัด
            </label>
            <select
              id="provinceId"
              name="provinceId"
              defaultValue={initialData?.province_id ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            >
              <option value="">-- ไม่ระบุ --</option>
              {provinces.map((p) => (
                <option key={p.province_id} value={p.province_id}>
                  {p.province_name_th}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
              หมวดหมู่
            </label>
            <input
              type="text"
              id="category"
              name="category"
              defaultValue={initialData?.category ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
              placeholder="e.g. วัฒนธรรม, ธรรมชาติ"
            />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-slate-700">
            เกริ่นนำ (Excerpt)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            defaultValue={initialData?.excerpt ?? ""}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-slate-700">
            เนื้อหาบทความ
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={initialData?.content ?? ""}
            rows={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-slate-700">
            รูปภาพปก (URL)
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            defaultValue={initialData?.image_url ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
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
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างบทความ"}
        </button>
      </div>
    </form>
  );
}
