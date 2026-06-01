"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRouteAction, updateRouteAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminFormSection, AdminReadinessPanel, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { FormInput, FormTextarea, FormCheckbox, getFieldError } from "@/components/admin/forms/FormField";
import { ArrowSquareOut, MapPin, List, Plus } from "@phosphor-icons/react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

interface RouteFormProps {
  initialData?: AdminRouteRow | null;
}

const FIELD_LABELS = {
  nameTh: "ชื่อเส้นทางภาษาไทย",
  slug: "Slug",
  nameEn: "ชื่อเส้นทางภาษาอังกฤษ",
};

function hasText(value: string | null | undefined) {
  return !!value?.trim();
}

export function RouteForm({ initialData }: RouteFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const action = isEditing ? updateRouteAction.bind(null, initialData.route_id) : createRouteAction;
  const routeSlug = initialData?.slug ?? null;
  const publicHref = isEditing && routeSlug ? `/routes/${routeSlug}` : null;

  const readinessItems = [
    { label: "ชื่อเส้นทาง", complete: hasText(initialData?.name_th), help: "แสดงเป็นหัวข้อเส้นทางบนหน้า public" },
    { label: "Slug (URL)", complete: !!routeSlug, help: publicHref ? publicHref : "จำเป็นสำหรับ URL หน้าเส้นทาง" },
    { label: "รูปภาพปก", complete: !!initialData?.slug, help: "จัดการรูปภาพปกผ่าน Media Library ในหน้าแก้ไขเส้นทาง" },
    { label: "สถานะเผยแพร่", complete: !!initialData?.is_published, help: initialData?.is_published ? "แสดงบนหน้า public แล้ว" : "บันทึกเป็นร่างจนกว่าจะเผยแพร่" },
    { label: "สถานะเปิดใช้งาน", complete: !!initialData?.is_active, help: initialData?.is_active ? "เปิดใช้งานในระบบหลังบ้าน" : "เส้นทางที่ปิดใช้งานไม่ควรโปรโมท" },
    { label: "จุดแวะพัก", complete: (initialData?.stop_count ?? 0) > 0, help: `${initialData?.stop_count ?? 0} จุดแวะพักที่เชื่อมโยงกับสถานที่ท่องเที่ยว` },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const fe = (name: string) => getFieldError(state?.fieldErrors, name);

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/routes");
      router.refresh();
    }
  }, [state?.success, isEditing, router]);

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างเส้นทางท่องเที่ยวสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลเส้นทางท่องเที่ยวใหม่ของคุณเรียบร้อยแล้ว ขั้นตอนต่อไปคือการเพิ่มจุดแวะพักเข้าสู่เส้นทาง"
          actions={[
            { label: "เพิ่มจุดแวะพัก (Stops) ลงในเส้นทาง", href: `/admin/routes/${newId}/stops`, primary: true, icon: MapPin },
            { label: "สร้างเส้นทางใหม่", href: "/admin/routes/new", primary: false, icon: Plus },
            { label: "กลับไปหน้ารายการ", href: "/admin/routes", primary: false, icon: List }
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
              <FormInput label="ชื่อเส้นทาง (TH)" name="nameTh" defaultValue={initialData?.name_th} required error={fe("nameTh")} className="md:col-span-2" />
              <FormInput
                label="Slug (สำหรับ URL)"
                name="slug"
                defaultValue={initialData?.slug ?? ""}
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                placeholder="e.g. betong-mist-wellness-route"
                onChange={(e) => {
                  e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                }}
                help="ใช้เป็น public URL เช่น /routes/betong-mist-wellness-route"
                error={fe("slug")}
                className="md:col-span-2"
              />
              <FormInput label="ชื่อเส้นทาง (EN)" name="nameEn" defaultValue={initialData?.name_en ?? ""} error={fe("nameEn")} className="md:col-span-2" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="รายละเอียดเส้นทาง (Description)">
            <div className="space-y-6">
              <FormTextarea label="รายละเอียดเส้นทาง (TH)" name="descriptionTh" defaultValue={initialData?.description_th ?? ""} rows={4} />
              <FormTextarea label="รายละเอียดเส้นทาง (EN)" name="descriptionEn" defaultValue={initialData?.description_en ?? ""} rows={4} />
            </div>
          </AdminFormSection>
        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="space-y-8 lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
          {/* Readiness */}
          {initialData ? (
            <AdminReadinessPanel title="ความพร้อมหน้าเส้นทาง" items={readinessItems} />
          ) : (
            <AdminFormSection title="ความพร้อมหน้าเส้นทาง">
              <p className="text-xs leading-5 text-slate-500">บันทึกเส้นทางก่อน การตรวจสอบความพร้อมและการจัดการจุดแวะพักจะแสดงที่นี่</p>
            </AdminFormSection>
          )}

          {isEditing ? (
            <Link
              href={`/admin/routes/${initialData.route_id}/stops`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-[#0A6B62] hover:text-[#0A6B62]"
            >
              <MapPin size={15} weight="bold" />
              Manage route stops
            </Link>
          ) : null}

          {/* Status */}
          <AdminFormSection title="สถานะ (Status)">
            <div className="flex flex-col gap-3">
              <FormCheckbox label="เปิดใช้งาน (Active)" name="isActive" defaultChecked={initialData?.is_active ?? true} accent="teal" />
              <FormCheckbox label="เผยแพร่ (Published)" name="isPublished" defaultChecked={initialData?.is_published ?? false} accent="coral" />
            </div>
          </AdminFormSection>

          {/* Media */}
          <AdminFormSection title="สื่อ (Media)" aside={
            publicHref ? (
              <Link
                href={publicHref}
                target="_blank"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0A6B62] hover:text-[#0A6B62]"
                title="Preview public route"
              >
                <ArrowSquareOut size={17} weight="bold" />
              </Link>
            ) : null
          }>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="aspect-video bg-slate-100">
                {coverPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                    ยังไม่ได้เลือกรูปภาพ
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 p-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="min-h-10 flex-1 rounded-lg bg-[#073F37] px-3 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62]"
                >
                  เลือกจาก Media Library
                </button>
                {coverPreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreviewUrl("");
                      setCoverMediaId(null);
                    }}
                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    เอาออก
                  </button>
                ) : null}
              </div>
            </div>
            <input type="hidden" name="coverMediaId" value={coverMediaId ?? ""} />
          </AdminFormSection>
        </div>
      </div>

      <AdminSaveBar
        cancelHref="/admin/routes"
        isPending={isPending}
        submitLabel={isEditing ? "บันทึกการแก้ไขเส้นทาง" : "สร้างเส้นทาง"}
      />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const id = Number(asset.id);
          setCoverMediaId(id);
          setCoverPreviewUrl(asset.url);
        }}
        onSelect={(url) => setCoverPreviewUrl(url)}
        title="เลือกรูปภาพเส้นทาง"
      />
    </form>
  );
}
