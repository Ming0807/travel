"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createStoryAction, updateStoryAction } from "@/app/actions/admin-story-actions";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { ArrowSquareOut, CheckCircle, Image, List, Plus, WarningCircle } from "@phosphor-icons/react";

interface StoryFormProps {
  initialData?: AdminStoryRow | null;
  provinces: { province_id: number; province_name_th: string }[];
}

const FIELD_LABELS = {
  title: "ชื่อบทความ",
  slug: "Slug",
  provinceId: "จังหวัด",
  imageUrl: "รูปภาพปก",
};

type ReadinessItem = {
  label: string;
  detail: string;
  isReady: boolean;
};

function hasText(value: string | null | undefined) {
  return !!value?.trim();
}

export function StoryForm({ initialData, provinces }: StoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateStoryAction.bind(null, initialData.story_id) : createStoryAction;
  const publicHref = isEditing && initialData?.slug ? `/stories/${initialData.slug}` : null;
  const readinessItems: ReadinessItem[] = [
    {
      label: "Title",
      detail: "Shown as the public story headline.",
      isReady: hasText(initialData?.title),
    },
    {
      label: "Slug",
      detail: publicHref ? publicHref : "Needed for the public story URL.",
      isReady: hasText(initialData?.slug),
    },
    {
      label: "Excerpt",
      detail: "Used on story cards and near the story headline.",
      isReady: hasText(initialData?.excerpt),
    },
    {
      label: "Content",
      detail: "Rendered as the saved public article body.",
      isReady: hasText(initialData?.content),
    },
    {
      label: "Hero image",
      detail: "Controls the main image on the story detail page.",
      isReady: hasText(initialData?.image_url),
    },
    {
      label: "Province",
      detail: "Helps visitors and admins filter regional content.",
      isReady: initialData?.province_id != null,
    },
    {
      label: "Category",
      detail: "Shown as the story label on public pages.",
      isReady: hasText(initialData?.category),
    },
    {
      label: "Publish status",
      detail: initialData?.is_published ? "Currently visible on public story surfaces." : "Saved as draft until published.",
      isReady: !!initialData?.is_published,
    },
  ];
  const readyCount = readinessItems.filter((item) => item.isReady).length;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/stories");
      router.refresh();
    }
  }, [state?.success, isEditing, router]);

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
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#0A6B62]">Public page readiness</p>
                <h2 className="mt-1 text-lg font-black text-[#073F37]">
                  {readyCount}/{readinessItems.length} checks ready
                </h2>
              </div>
              {publicHref ? (
                <Link
                  href={publicHref}
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0A6B62] hover:text-[#0A6B62]"
                  title="Preview public story"
                >
                  <ArrowSquareOut size={17} weight="bold" />
                </Link>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              These checks map this editor to the public story page. Update and save the form to refresh this readiness view.
            </p>
            <div className="mt-4 space-y-2">
              {readinessItems.map((item) => (
                <div key={item.label} className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  {item.isReady ? (
                    <CheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={16} weight="fill" />
                  ) : (
                    <WarningCircle className="mt-0.5 shrink-0 text-amber-600" size={16} weight="fill" />
                  )}
                  <div>
                    <p className="text-xs font-black text-slate-700">{item.label}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

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

      <AdminSaveBar
        cancelHref="/admin/stories"
        isPending={isPending}
        submitLabel={isEditing ? "บันทึกการแก้ไขเรื่องราว" : "สร้างเรื่องราว"}
      />
    </form>
  );
}
