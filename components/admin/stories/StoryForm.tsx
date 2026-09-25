"use client";

/* eslint-disable react/no-unescaped-entities */

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createStoryAction, updateStoryAction } from "@/app/actions/admin-story-actions";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminFormSection, AdminReadinessPanel, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { FormInput, FormTextarea, FormSelect, getFieldError } from "@/components/admin/forms/FormField";
import { FormRichText } from "@/components/admin/forms/FormRichText";
import { storyDocumentSchema, type StoryDocument } from "@/lib/content/story-document";
import { ArrowSquareOut, Image, List, Plus, MapPin } from "@phosphor-icons/react";

interface StoryFormProps {
  initialData?: AdminStoryRow | null;
  provinces: { province_id: number; province_name_th: string }[];
}

type StoryFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: { id: number; slug: string };
};

const FIELD_LABELS = {
  title: "ชื่อบทความ",
  slug: "Slug",
  provinceId: "จังหวัด",
};

function hasText(value: string | null | undefined) {
  return !!value?.trim();
}

export function StoryForm({ initialData, provinces }: StoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateStoryAction.bind(null, initialData.story_id) : createStoryAction;
  const publicHref = isEditing && initialData?.slug ? `/stories/${initialData.slug}` : null;
  const parsedDocument = storyDocumentSchema.safeParse(initialData?.content_document);

  const readinessItems = [
    { label: "ชื่อบทความ", complete: hasText(initialData?.title), help: "แสดงเป็นหัวข้อข่าวบนหน้า public" },
    { label: "Slug (URL)", complete: hasText(initialData?.slug), help: publicHref ? publicHref : "จำเป็นสำหรับ URL หน้า public" },
    { label: "เกริ่นนำ", complete: hasText(initialData?.excerpt), help: "ใช้บนการ์ดบทความและใกล้หัวข้อข่าว" },
    { label: "เนื้อหา", complete: hasText(initialData?.content), help: "เนื้อหาบทความที่บันทึกแล้ว" },
    { label: "รูปภาพปก", complete: !!initialData?.cover_media, help: "จัดการรูปภาพปกผ่าน Media Library ในหน้าแก้ไขเรื่องราว" },
    { label: "จังหวัด", complete: initialData?.province_id != null, help: "ช่วยผู้เยี่ยมชมและผู้ดูแลระบบกรองเนื้อหา" },
    { label: "หมวดหมู่", complete: hasText(initialData?.category), help: "ป้ายกำกับบทความบนหน้า public" },
    { label: "สถานะเผยแพร่", complete: !!initialData?.is_published, help: initialData?.is_published ? "ปัจจุบันแสดงบนหน้า public" : "บันทึกเป็นร่างจนกว่าจะเผยแพร่" },
  ];

  const [state, formAction, isPending] = useActionState<StoryFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const fe = (name: string) => getFieldError(state?.fieldErrors, name);

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/stories");
      router.refresh();
    }
  }, [state?.success, isEditing, router]);

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    const slug = state.data?.slug;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างบทความสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลบทความใหม่ของคุณเรียบร้อยแล้ว ขั้นตอนต่อไปคือการจัดการรูปภาพและเนื้อหาที่เกี่ยวข้อง"
          actions={[
            { label: "จัดการรูปภาพของบทความ", href: `/admin/stories/${newId}/edit`, primary: true, icon: Image },
            ...(slug ? [{ label: "แสดงตัวอย่างหน้า Public", href: `/stories/${slug}`, primary: false, icon: ArrowSquareOut }] : []),
            { label: "จัดการเนื้อหาที่เกี่ยวข้อง", href: `/admin/stories/${newId}/edit`, primary: false, icon: MapPin },
            { label: "เขียนบทความใหม่", href: "/admin/stories/new", primary: false, icon: Plus },
            { label: "กลับไปหน้ารายการ", href: "/admin/stories", primary: false, icon: List }
          ]}
        />
      );
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column (Main Content) */}
        <div className="space-y-8 lg:col-span-8">
          <AdminFormSection title="ข้อมูลหลัก (Basic Info)">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput label="ชื่อบทความ" name="title" defaultValue={initialData?.title} required error={fe("title")} className="md:col-span-2" />
              <FormInput
                label="Slug (สำหรับ URL)"
                name="slug"
                defaultValue={initialData?.slug}
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                placeholder="e.g. pattani-central-mosque"
                onChange={(e) => {
                  e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                }}
                error={fe("slug")}
                className="md:col-span-2"
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="เนื้อหาบทความ (Content)">
            <div className="space-y-6">
              <FormTextarea label="เกริ่นนำ (Excerpt)" name="excerpt" defaultValue={initialData?.excerpt ?? ""} rows={3} />
              <FormRichText label="เนื้อหาฉบับเต็ม" name="content" documentName="contentDocument" defaultDocument={parsedDocument.success ? (parsedDocument.data as StoryDocument) : null} defaultValue={initialData?.content ?? ""} error={fe("contentDocument")} imageLayoutControls minHeight={400} placeholder="เริ่มเขียนเนื้อหาบทความ..." />
            </div>
          </AdminFormSection>
        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="space-y-8 lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
          {/* Readiness */}
          <AdminReadinessPanel title="ความพร้อมหน้าเรื่องราว" items={readinessItems} />
          {publicHref ? (
            <Link
              href={publicHref}
              target="_blank"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-[#0A6B62] hover:text-[#0A6B62]"
            >
              <ArrowSquareOut size={15} weight="bold" />
              Preview public story
            </Link>
          ) : null}

          {/* Status */}
          <AdminFormSection title="สถานะ">
            <p className="text-sm leading-6 text-slate-700">เรื่องราวใหม่จะบันทึกเป็นฉบับร่าง หลังจากตรวจรูปปกและข้อมูลประกอบแล้วจึงเผยแพร่ในหน้าแก้ไข</p>
            <input type="hidden" name="isPublished" value="false" />
          </AdminFormSection>

          {/* Classification */}
          <AdminFormSection title="การจัดหมวดหมู่">
            <div className="space-y-4">
              <FormInput label="หมวดหมู่" name="category" defaultValue={initialData?.category ?? ""} placeholder="e.g. วัฒนธรรม, ธรรมชาติ" />
              <FormSelect
                label="จังหวัดที่เกี่ยวข้อง"
                name="provinceId"
                defaultValue={initialData?.province_id ?? ""}
                placeholder="-- ไม่ระบุ --"
                options={provinces.map((p) => ({ value: p.province_id, label: p.province_name_th }))}
              />
            </div>
          </AdminFormSection>

          {/* Related Content */}
          <AdminFormSection title="เนื้อหาที่เกี่ยวข้อง">
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-700">เชื่อมโยงสถานที่ท่องเที่ยว</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                เนื้อหาที่เกี่ยวข้อง (Related content) สามารถจัดการได้จากหน้าแก้ไขสถานที่ท่องเที่ยว (Attraction edit)
                ในส่วน "Attractions → Related stories" ซึ่งจะเชื่อม story นี้เข้ากับ attraction ที่ต้องการ
              </p>
            </div>
          </AdminFormSection>

          {/* Media */}
          <AdminFormSection title="สื่อ (Media)">
            <p className="text-sm leading-6 text-slate-700">บันทึกเรื่องราวเป็นฉบับร่างก่อน แล้วเลือกรูปปกพร้อมคำอธิบายในหน้าแก้ไขได้ทันที รูปประกอบในเนื้อหาเพิ่มได้จากตัวแก้ไขด้านซ้าย</p>
          </AdminFormSection>
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
