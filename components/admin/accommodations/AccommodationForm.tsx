"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAccommodationAction, updateAccommodationAction } from "@/app/actions/admin-accommodation-actions";
import type { AdminAccommodationRow } from "@/lib/repositories/admin-accommodation.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { Image, List } from "@phosphor-icons/react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

export type AdminSelectOption = {
  id: number;
  label: string;
};

type AccommodationFormProps = {
  accommodation?: AdminAccommodationRow | null;
  provinces: AdminSelectOption[];
  submitLabel?: string;
  coverMediaId?: number | null;
  coverPreviewUrl?: string | null;
};

type AdminFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: { id: number };
};

const FIELD_LABELS = {
  nameTh: "ชื่อภาษาไทย",
  slug: "Slug",
  provinceId: "จังหวัด",
  latitude: "Latitude",
  longitude: "Longitude",
  coverImageUrl: "รูปภาพปก",
  priceRange: "ช่วงราคา",
  accommodationType: "ประเภทที่พัก",
};

export function AccommodationForm({
  accommodation,
  provinces,
  submitLabel = "บันทึกข้อมูล",
  coverMediaId: initialMediaId,
  coverPreviewUrl: initialPreviewUrl,
}: AccommodationFormProps) {
  const router = useRouter();
  const isEditing = !!accommodation;
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(initialPreviewUrl ?? "");
  const [coverMediaId, setCoverMediaId] = useState<number | string | null>(initialMediaId ?? null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const action = isEditing ? updateAccommodationAction.bind(null, accommodation.accommodation_id) : createAccommodationAction;

  const [state, formAction, isPending] = useActionState<AdminFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/accommodations");
      router.refresh();
    }
  }, [state?.success, isEditing, router]);

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างที่พักสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลที่พักใหม่ของคุณเรียบร้อยแล้ว คุณสามารถจัดการรูปภาพหรือกลับไปยังหน้ารายการได้"
          actions={[
            { label: "อัปโหลดรูปภาพที่พัก", href: `/admin/accommodations/${newId}`, primary: true, icon: Image },
            { label: "กลับไปหน้ารายการ", href: "/admin/accommodations", primary: false, icon: List }
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
      {accommodation?.accommodation_id ? <input name="accommodationId" type="hidden" value={accommodation.accommodation_id} /> : null}

      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-7 space-y-8">

          {/* 1. Basic Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก (Basic Info)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={accommodation?.name_th ?? ""}
                  maxLength={255}
                  name="nameTh"
                  required
                />
                {fieldError("nameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameTh")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={accommodation?.name_en ?? ""}
                  maxLength={255}
                  name="nameEn"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={accommodation?.slug ?? ""}
                  maxLength={200}
                  name="slug"
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  placeholder="e.g. cozy-resort-yala"
                  onChange={(e) => {
                    e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  }}
                />
                {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
              </label>
            </div>
          </section>

          {/* 2. Content & Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">เนื้อหาและรายละเอียด (Content)</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">เนื้อหาภาษาไทย</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">รายละเอียด</span>
                  <textarea className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={accommodation?.description_th ?? ""} maxLength={5000} name="descriptionTh" />
                </label>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">English Content</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Description</span>
                  <textarea className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={accommodation?.description_en ?? ""} maxLength={5000} name="descriptionEn" />
                </label>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 lg:h-max lg:self-start">

          {/* Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สถานะ (Status)</h2>
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
                เปิดใช้งาน (Active)
                <input defaultChecked={accommodation?.is_active ?? true} name="isActive" type="checkbox" value="true" className="h-4 w-4 accent-teal-600" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                เผยแพร่ (Published)
                <input defaultChecked={accommodation?.is_published ?? false} name="isPublished" type="checkbox" value="true" className="h-4 w-4 accent-[#F3704C]" />
              </label>
            </div>
          </section>

          {/* Location & Type */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ที่ตั้งและประเภท</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">จังหวัด *</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={accommodation?.province_id ?? ""}
                  name="provinceId"
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">ประเภทที่พัก</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={accommodation?.accommodation_type ?? ""}
                  name="accommodationType"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="Hotel">Hotel / โรงแรม</option>
                  <option value="Resort">Resort / รีสอร์ท</option>
                  <option value="Homestay">Homestay / โฮมสเตย์</option>
                  <option value="Hostel">Hostel / โฮสเทล</option>
                  <option value="Guesthouse">Guesthouse / เกสต์เฮาส์</option>
                  <option value="Villa">Villa / วิลล่า</option>
                </select>
              </label>
              
              <label className="block">
                <span className="text-sm font-bold text-slate-700">ช่วงราคา (Price Range)</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={accommodation?.price_range ?? ""}
                  name="priceRange"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="฿">฿ (ราคาประหยัด)</option>
                  <option value="฿฿">฿฿ (ราคาปานกลาง)</option>
                  <option value="฿฿฿">฿฿฿ (ราคาสูง)</option>
                  <option value="฿฿฿฿">฿฿฿฿ (หรูหรา)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">รูปภาพปก (Cover Image)</span>
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
                <input type="hidden" name="coverMediaUrl" value={coverPreviewUrl ?? ""} />
              </label>
            </div>
          </section>

        </div>
      </div>

      {/* Location & Contact - Bottom full width */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#073F37]">พิกัดและการติดต่อ (Location & Contact)</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block md:col-span-2 lg:col-span-4">
            <span className="text-sm font-bold text-slate-700">ที่อยู่</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={accommodation?.address_text ?? ""} maxLength={1000} name="addressText" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">Latitude (ละติจูด)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={accommodation?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">Longitude (ลองจิจูด)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={accommodation?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-sm font-bold text-slate-700">ข้อมูลการติดต่อ (เบอร์โทร, เว็บไซต์)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={accommodation?.contact_info ?? ""} maxLength={255} name="contactInfo" placeholder="เช่น 081-xxx-xxxx, www.example.com" />
          </label>
        </div>
      </section>

      <AdminSaveBar cancelHref="/admin/accommodations" isPending={isPending} submitLabel={submitLabel} />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const id = Number(asset.id);
          setCoverMediaId(Number.isNaN(id) ? asset.id : id);
          setCoverPreviewUrl(asset.url);
        }}
        onSelect={(url) => setCoverPreviewUrl(url)}
        title="เลือกรูปภาพที่พัก"
      />
    </form>
  );
}
