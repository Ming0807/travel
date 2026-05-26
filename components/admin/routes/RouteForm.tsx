"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRouteAction, updateRouteAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { ArrowSquareOut, CheckCircle, MapPin, List, Plus, WarningCircle } from "@phosphor-icons/react";

interface RouteFormProps {
  initialData?: AdminRouteRow | null;
}

const FIELD_LABELS = {
  nameTh: "ชื่อเส้นทางภาษาไทย",
  slug: "Slug",
  nameEn: "ชื่อเส้นทางภาษาอังกฤษ",
  coverImagePath: "รูปภาพปก",
};

type ReadinessItem = {
  label: string;
  detail: string;
  isReady: boolean;
};

function hasText(value: string | null | undefined) {
  return !!value?.trim();
}

export function RouteForm({ initialData }: RouteFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateRouteAction.bind(null, initialData.route_id) : createRouteAction;
  const routeSlug = initialData?.slug ?? null;
  const publicHref = isEditing && routeSlug ? `/routes/${routeSlug}` : null;
  const readinessItems: ReadinessItem[] = [
    {
      label: "Name",
      detail: "Shown as the public route headline and listing title.",
      isReady: hasText(initialData?.name_th),
    },
    {
      label: "Slug",
      detail: publicHref ? publicHref : "Required for the public route URL.",
      isReady: !!routeSlug,
    },
    {
      label: "Cover image",
      detail: "Controls the route card and public route hero image.",
      isReady: hasText(initialData?.cover_image_path),
    },
    {
      label: "Publish status",
      detail: initialData?.is_published ? "Published for public route surfaces." : "Saved as draft until published.",
      isReady: !!initialData?.is_published,
    },
    {
      label: "Active status",
      detail: initialData?.is_active ? "Route is active in admin workflows." : "Inactive routes should not be promoted.",
      isReady: !!initialData?.is_active,
    },
    {
      label: "Stops",
      detail: initialData ? `${initialData.stop_count} saved stop${initialData.stop_count === 1 ? "" : "s"} linked to attractions.` : "Add route stops after creating the route.",
      isReady: (initialData?.stop_count ?? 0) > 0,
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
                <span className="text-sm font-bold text-slate-700">ชื่อเส้นทาง (TH) *</span>
                <input
                  type="text"
                  name="nameTh"
                  defaultValue={initialData?.name_th}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("nameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameTh")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                <input
                  type="text"
                  name="slug"
                  defaultValue={initialData?.slug ?? ""}
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  placeholder="e.g. betong-mist-wellness-route"
                  onChange={(e) => {
                    e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                <p className="mt-1 text-xs leading-5 text-slate-500">ใช้เป็น public URL เช่น /routes/betong-mist-wellness-route</p>
                {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อเส้นทาง (EN)</span>
                <input
                  type="text"
                  name="nameEn"
                  defaultValue={initialData?.name_en ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("nameEn") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameEn")}</span> : null}
              </label>
            </div>
          </section>

          {/* 2. Content */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">รายละเอียดเส้นทาง (Description)</h2>
            <div className="mt-5 space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">รายละเอียดเส้นทาง (TH)</span>
                <textarea
                  name="descriptionTh"
                  defaultValue={initialData?.description_th ?? ""}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">รายละเอียดเส้นทาง (EN)</span>
                <textarea
                  name="descriptionEn"
                  defaultValue={initialData?.description_en ?? ""}
                  rows={4}
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
                  title="Preview public route"
                >
                  <ArrowSquareOut size={17} weight="bold" />
                </Link>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              These checks show whether the saved route can work as a public curated path. Update and save the form to refresh this view.
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
            {isEditing ? (
              <Link
                href={`/admin/routes/${initialData.route_id}/stops`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#0A6B62] hover:text-[#0A6B62]"
              >
                <MapPin size={15} weight="bold" />
                Manage route stops
              </Link>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สถานะ (Status)</h2>
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
                เปิดใช้งาน (Active)
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={initialData?.is_active ?? true}
                  className="h-4 w-4 accent-teal-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                เผยแพร่ (Published)
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={initialData?.is_published ?? false}
                  className="h-4 w-4 accent-[#F3704C]"
                />
              </label>
            </div>
          </section>

          {/* Media */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สื่อ (Media)</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">รูปภาพปก (URL/Path)</span>
                <input
                  type="text"
                  name="coverImagePath"
                  defaultValue={initialData?.cover_image_path ?? ""}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </section>

        </div>
      </div>

      <AdminSaveBar
        cancelHref="/admin/routes"
        isPending={isPending}
        submitLabel={isEditing ? "บันทึกการแก้ไขเส้นทาง" : "สร้างเส้นทาง"}
      />
    </form>
  );
}
