"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAttractionAction } from "@/app/actions/admin-attraction-actions";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import type { AdminSelectOption } from "@/components/admin/attractions/AttractionForm";
import { CheckCircle, FileText, ImageSquare, MapPinLine, QrCode } from "@phosphor-icons/react";

type AttractionQuickCreateProps = {
  provinces: AdminSelectOption[];
  attractionTypes: AdminSelectOption[];
};

export function AttractionQuickCreate({
  provinces,
  attractionTypes,
}: AttractionQuickCreateProps) {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(createAttractionAction, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (state?.success && state.data?.id) {
      router.push(`/admin/attractions/${state.data.id}/edit`);
    }
  }, [router, state?.data?.id, state?.success]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toLowerCase();
    val = val.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(val);
  };

  if (state?.success && state.data?.id) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal border-t-transparent"></div>
        <h2 className="mt-6 text-xl font-bold text-slate-800">กำลังเตรียมหน้าต่างแก้ไข (Visual Editor)...</h2>
        <p className="mt-2 text-sm text-slate-500">กรุณารอสักครู่ ระบบกำลังพาท่านไปสู่โหมดแก้ไขแบบเห็นภาพจริง</p>
      </div>
    );
  }

  function fieldError(name: string) {
    return state?.fieldErrors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="grid gap-6 pb-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:[&>div:last-child]:col-span-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <FileText size={32} weight="duotone" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-800">สร้างสถานที่ท่องเที่ยวใหม่</h2>
          <p className="mt-2 text-sm text-slate-500">
            กรอกข้อมูลพื้นฐานเพื่อสร้างฉบับร่าง (Draft) ก่อน จากนั้นระบบจะพาท่านไปยัง Visual Editor เพื่อใส่รูปและเนื้อหา
          </p>
        </div>

        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อสถานที่ (ภาษาไทย) *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              name="nameTh"
              maxLength={255}
              placeholder="เช่น บ่อน้ำร้อนเบตง"
              required
            />
            {fieldError("nameTh") && <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameTh")}</span>}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัด (Province) *</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              name="provinceId"
              required
            >
              <option value="">เลือกจังหวัด (Select province)</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.label}
                </option>
              ))}
            </select>
            {fieldError("provinceId") && <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("provinceId")}</span>}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">หมวดหมู่ (Attraction Category)</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              name="attractionTypeId"
            >
              <option value="">เลือกภายหลังใน Visual Editor (Choose later)</option>
              {attractionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">ลิงก์ URL (Slug) *</span>
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/10"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              maxLength={200}
              placeholder="เช่น betong-hot-spring"
              required
            />
            <p className="mt-1 text-xs text-slate-500">ใช้สำหรับสร้างลิงก์ (เฉพาะอักษรภาษาอังกฤษและเครื่องหมายขีดกลาง)</p>
            {fieldError("slug") && <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span>}
          </label>
        </div>

        {/* Hidden default fields required by schema */}
        <input type="hidden" name="districtId" value="" />
        <input type="hidden" name="isActive" value="true" />
        <input type="hidden" name="isPublished" value="false" />
        <input type="hidden" name="nameEn" value="" />
        <input type="hidden" name="shortDescriptionTh" value="" />
        <input type="hidden" name="shortDescriptionEn" value="" />
        <input type="hidden" name="descriptionTh" value="" />
        <input type="hidden" name="descriptionEn" value="" />
        <input type="hidden" name="historyTh" value="" />
        <input type="hidden" name="historyEn" value="" />
        <input type="hidden" name="latitude" value="" />
        <input type="hidden" name="longitude" value="" />
        <input type="hidden" name="addressText" value="" />
        <input type="hidden" name="openingHours" value="" />
        <input type="hidden" name="contactInfo" value="" />
        <input type="hidden" name="travelTipsTh" value="" />
        <input type="hidden" name="travelTipsEn" value="" />
        <input type="hidden" name="howToGetThereTh" value="" />
        <input type="hidden" name="howToGetThereEn" value="" />
        <input type="hidden" name="customSectionsJson" value="" />
        <input type="hidden" name="sustainabilityCategory" value="" />
        <input type="hidden" name="estimatedCapacityPerDay" value="" />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-coral">ขั้นตอนต่อไป</p>
          <h3 className="mt-2 text-base font-black text-slate-900">สร้างฉบับร่างก่อน ค่อยจัดหน้าทีหลัง</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            {[
              { icon: FileText, text: "เพิ่มรายละเอียด, คำอธิบายสั้น, ข้อแนะนำ และการเดินทาง" },
              { icon: ImageSquare, text: "อัปโหลดรูปภาพหน้าปกและแกลเลอรี" },
              { icon: MapPinLine, text: "ระบุพิกัดแผนที่ อำเภอ และข้อมูลความยั่งยืน" },
              { icon: QrCode, text: "สร้างจุดถ่ายรูปและ QR เช็คอิน เมื่อข้อมูลหลักพร้อม" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <Icon className="mt-0.5 shrink-0 text-teal" size={18} weight="duotone" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <CheckCircle className="mt-0.5 shrink-0 text-emerald-700" size={20} weight="fill" />
            <p className="text-sm font-bold leading-6 text-emerald-900">
              ระบบจะบันทึกเป็นฉบับร่าง (Draft) โดยอัตโนมัติ ข้อมูลนี้จะไม่เผยแพร่สู่สาธารณะจนกว่าแอดมินจะกดยืนยันการเผยแพร่ในหน้าถัดไป
            </p>
          </div>
        </div>
      </aside>

      <AdminSaveBar cancelHref="/admin/attractions" isPending={isPending} submitLabel="สร้างฉบับร่างและดำเนินการต่อ" />
    </form>
  );
}
