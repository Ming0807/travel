"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRouteAction, updateRouteAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminFormSection, AdminReadinessPanel, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { FormInput, FormTextarea, getFieldError } from "@/components/admin/forms/FormField";
import { List, PencilSimple, Plus } from "@phosphor-icons/react";

interface RouteFormProps {
  initialData?: AdminRouteRow | null;
  coverMediaUrl?: string | null;
}

type RouteFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: { id: number; slug: string };
};

const FIELD_LABELS = {
  nameTh: "ชื่อเส้นทางภาษาไทย",
  slug: "Slug",
  nameEn: "ชื่อเส้นทางภาษาอังกฤษ",
  descriptionTh: "รายละเอียดภาษาไทย",
  descriptionEn: "รายละเอียดภาษาอังกฤษ",
};

function hasText(value: string | null | undefined) {
  return !!value?.trim();
}

export function RouteForm({ initialData, coverMediaUrl }: RouteFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateRouteAction.bind(null, initialData.route_id) : createRouteAction;
  const [state, formAction, isPending] = useActionState<RouteFormState, FormData>(action, {
    success: false,
  });

  const readinessItems = [
    { label: "ชื่อเส้นทาง", complete: hasText(initialData?.name_th), help: "ชื่อภาษาไทยที่แสดงบนหน้าเส้นทาง" },
    { label: "Slug (URL)", complete: hasText(initialData?.slug), help: initialData?.slug ? `/routes/${initialData.slug}` : "จำเป็นสำหรับ URL หน้าเส้นทาง" },
    {
      label: "รูปภาพปก",
      complete: !!coverMediaUrl,
      help: coverMediaUrl ? "มีรูปภาพปกที่เชื่อมโยงกับเส้นทางนี้" : "ยังไม่มีรูปภาพปกที่เชื่อมโยงกับเส้นทางนี้",
    },
  ];

  const fe = (name: string) => getFieldError(state?.fieldErrors, name);

  useEffect(() => {
    if (state?.success && isEditing) router.refresh();
  }, [state?.success, isEditing, router]);

  if (state?.success && !isEditing && state.data?.id) {
    return (
      <SuccessNextSteps
        title="สร้างฉบับร่างเส้นทางสำเร็จ"
        description="เส้นทางนี้ยังไม่เผยแพร่ ต่อไปเพิ่มจุดแวะ เลือกรูปภาพปก และตรวจเนื้อหาในหน้าแก้ไข"
        actions={[
          { label: "ไปต่อที่ตัวแก้ไขเส้นทาง", href: `/admin/routes/${state.data.id}/edit`, primary: true, icon: PencilSimple },
          { label: "สร้างเส้นทางใหม่", href: "/admin/routes/new", primary: false, icon: Plus },
          { label: "กลับไปหน้ารายการ", href: "/admin/routes", primary: false, icon: List },
        ]}
      />
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      {state?.success && isEditing ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          บันทึกข้อมูลพื้นฐานแล้ว
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)]">
        <div className="space-y-5">
          <AdminFormSection title="ข้อมูลหลัก" description="ตั้งชื่อและ URL สำหรับเส้นทางแนะนำ">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="ชื่อเส้นทาง (TH)" name="nameTh" defaultValue={initialData?.name_th} required error={fe("nameTh")} className="sm:col-span-2" />
              <FormInput
                label="Slug (สำหรับ URL)"
                name="slug"
                defaultValue={initialData?.slug ?? ""}
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                placeholder="e.g. betong-day-trip"
                onChange={(event) => {
                  event.target.value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                }}
                help="ใช้ใน URL เช่น /routes/betong-day-trip"
                error={fe("slug")}
                className="sm:col-span-2"
              />
              <FormInput label="ชื่อเส้นทาง (EN)" name="nameEn" defaultValue={initialData?.name_en ?? ""} error={fe("nameEn")} className="sm:col-span-2" />
            </div>
          </AdminFormSection>

          {isEditing ? (
            <AdminFormSection title="รายละเอียดเส้นทาง" description="คำอธิบายที่ช่วยให้นักท่องเที่ยวเข้าใจเส้นทาง">
              <div className="space-y-4">
                <FormTextarea label="รายละเอียดเส้นทาง (TH)" name="descriptionTh" defaultValue={initialData.description_th ?? ""} rows={4} error={fe("descriptionTh")} />
                <FormTextarea label="รายละเอียดเส้นทาง (EN)" name="descriptionEn" defaultValue={initialData.description_en ?? ""} rows={4} error={fe("descriptionEn")} />
              </div>
            </AdminFormSection>
          ) : (
            <input type="hidden" name="descriptionTh" value="" />
          )}
        </div>

        {isEditing ? (
          <div className="xl:sticky xl:top-24">
            <AdminReadinessPanel title="ข้อมูลที่บันทึกแล้ว" items={readinessItems} />
          </div>
        ) : (
          <AdminFormSection title="ฉบับร่าง">
            <p className="text-sm leading-6 text-slate-600">บันทึกชื่อเส้นทางก่อน แล้วค่อยเพิ่มจุดแวะและรูปภาพปกในตัวแก้ไข</p>
          </AdminFormSection>
        )}
      </div>

      <input type="hidden" name="isPublished" value={initialData?.is_published ? "true" : "false"} />
      <input type="hidden" name="isActive" value={initialData?.is_active ? "true" : "false"} />
      <input type="hidden" name="coverMediaId" value="" />

      <AdminSaveBar
        cancelHref={isEditing ? `/admin/routes/${initialData.route_id}/edit` : "/admin/routes"}
        isPending={isPending}
        submitLabel={isEditing ? "บันทึกข้อมูลพื้นฐาน" : "สร้างฉบับร่าง"}
      />
    </form>
  );
}
