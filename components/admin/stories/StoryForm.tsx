"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createStoryAction, updateStoryAction } from "@/app/actions/admin-story-actions";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { Image, List, Plus } from "@phosphor-icons/react";

interface StoryFormProps {
  initialData?: AdminStoryRow | null;
  provinces: { province_id: number; province_name_th: string }[];
}

export function StoryForm({ initialData, provinces }: StoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateStoryAction.bind(null, initialData.story_id) : createStoryAction;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  if (state?.success && isEditing) {
    router.push("/admin/stories");
    router.refresh();
  }

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างบทความสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลบทความใหม่ของคุณเรียบร้อยแล้ว คุณสามารถจัดการรูปภาพหน้าปก หรือกลับไปยังหน้ารายการได้"
          actions={[
            { label: "จัดการรูปภาพของบทความ", href: `/admin/stories/${newId}/edit`, primary: true, icon: Image },
            { label: "เขียนบทความใหม่", href: "/admin/stories/new", primary: false, icon: Plus },
            { label: "กลับไปหน้ารายการ", href: "/admin/stories", primary: false, icon: List }
          ]}
        />
      );
    }
  }

  function fieldError(name: string) {
    return state?.fieldErrors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-2xl p-4 text-sm font-bold bg-rose-50 text-rose-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Basic Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก (Basic Info)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อบทความ *</span>
                <input
                  type="text"
                  name="title"
                  defaultValue={initialData?.title}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("title") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("title")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                <input
                  type="text"
                  name="slug"
                  defaultValue={initialData?.slug}
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  placeholder="e.g. pattani-central-mosque"
                  onChange={(e) => {
                    e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
              </label>
            </div>
          </section>

          {/* 2. Content */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">เนื้อหาบทความ (Content)</h2>
            <div className="mt-5 space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">เกริ่นนำ (Excerpt)</span>
                <textarea
                  name="excerpt"
                  defaultValue={initialData?.excerpt ?? ""}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">เนื้อหาฉบับเต็ม</span>
                <textarea
                  name="content"
                  defaultValue={initialData?.content ?? ""}
                  rows={15}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </section>

        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 lg:h-max lg:self-start">
          
          {/* Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สถานะ (Status)</h2>
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                เผยแพร่สู่สาธารณะ
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={initialData?.is_published ?? false}
                  className="h-4 w-4 accent-[#F3704C]"
                />
              </label>
            </div>
          </section>

          {/* Classification */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">การจัดหมวดหมู่</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">หมวดหมู่</span>
                <input
                  type="text"
                  name="category"
                  defaultValue={initialData?.category ?? ""}
                  placeholder="e.g. วัฒนธรรม, ธรรมชาติ"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">จังหวัดที่เกี่ยวข้อง</span>
                <select
                  name="provinceId"
                  defaultValue={initialData?.province_id ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  {provinces.map((p) => (
                    <option key={p.province_id} value={p.province_id}>
                      {p.province_name_th}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Media */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สื่อ (Media)</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">รูปภาพปก (URL)</span>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={initialData?.image_url ?? ""}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </section>

        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition" href="/admin/stories">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-[#F3704C] px-8 py-3 text-sm font-black text-white shadow-card hover:bg-[#E55A35] disabled:opacity-50 transition" type="submit">
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างบทความ"}
        </button>
      </div>
    </form>
  );
}
