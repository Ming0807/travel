"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurantAction, updateRestaurantAction } from "@/app/actions/admin-restaurant-actions";
import type { AdminRestaurantRow } from "@/lib/repositories/admin-restaurant.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { Image, List } from "@phosphor-icons/react";

export type AdminSelectOption = {
  id: number;
  label: string;
};

type RestaurantFormProps = {
  restaurant?: AdminRestaurantRow | null;
  provinces: AdminSelectOption[];
  submitLabel?: string;
};

export function RestaurantForm({
  restaurant,
  provinces,
  submitLabel = "บันทึกข้อมูล"
}: RestaurantFormProps) {
  const router = useRouter();
  const isEditing = !!restaurant;
  const action = isEditing ? updateRestaurantAction.bind(null, restaurant.restaurant_id) : createRestaurantAction;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  if (state?.success && isEditing) {
    router.push("/admin/restaurants");
    router.refresh();
  }

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างร้านอาหารสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลร้านอาหารใหม่ของคุณเรียบร้อยแล้ว คุณสามารถจัดการรูปภาพหรือกลับไปยังหน้ารายการได้"
          actions={[
            { label: "อัปโหลดรูปภาพร้านอาหาร", href: `/admin/restaurants/${newId}`, primary: true, icon: Image },
            { label: "กลับไปหน้ารายการ", href: "/admin/restaurants", primary: false, icon: List }
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
      {restaurant?.restaurant_id ? <input name="restaurantId" type="hidden" value={restaurant.restaurant_id} /> : null}

      {state?.error ? (
        <div className="rounded-2xl p-4 text-sm font-bold bg-rose-50 text-rose-700">
          {state.error}
        </div>
      ) : null}

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
                  defaultValue={restaurant?.name_th ?? ""}
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
                  defaultValue={restaurant?.name_en ?? ""}
                  maxLength={255}
                  name="nameEn"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={restaurant?.slug ?? ""}
                  maxLength={200}
                  name="slug"
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  placeholder="e.g. delicious-cafe"
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
                  <textarea className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.description_th ?? ""} maxLength={5000} name="descriptionTh" />
                </label>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">English Content</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Description</span>
                  <textarea className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.description_en ?? ""} maxLength={5000} name="descriptionEn" />
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
                <input defaultChecked={restaurant?.is_active ?? true} name="isActive" type="checkbox" value="true" className="h-4 w-4 accent-teal-600" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                เผยแพร่ (Published)
                <input defaultChecked={restaurant?.is_published ?? false} name="isPublished" type="checkbox" value="true" className="h-4 w-4 accent-[#F3704C]" />
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
                  defaultValue={restaurant?.province_id ?? ""}
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
                <span className="text-sm font-bold text-slate-700">ประเภทอาหาร</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={restaurant?.food_type ?? ""}
                  name="foodType"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="Thai">Thai / อาหารไทย</option>
                  <option value="Malay">Malay / อาหารมาเลย์</option>
                  <option value="International">International / นานาชาติ</option>
                  <option value="Coffee">Coffee / คาเฟ่</option>
                  <option value="Bakery">Bakery / เบเกอรี่</option>
                  <option value="Halal">Halal / ฮาลาล</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">รูปภาพปก (Cover Image URL)</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={restaurant?.cover_image_url ?? ""}
                  maxLength={500}
                  name="coverImageUrl"
                  placeholder="https://example.com/image.jpg"
                />
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
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.address_text ?? ""} maxLength={1000} name="addressText" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">Latitude (ละติจูด)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">Longitude (ลองจิจูด)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.opening_hours ?? ""} maxLength={255} name="openingHours" placeholder="เช่น ทุกวัน 09:00 - 21:00 น." />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">ข้อมูลการติดต่อ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={restaurant?.contact_info ?? ""} maxLength={255} name="contactInfo" placeholder="เช่น เบอร์โทรศัพท์, Facebook" />
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition" href="/admin/restaurants">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-[#F3704C] px-8 py-3 text-sm font-black text-white shadow-card hover:bg-[#E55A35] disabled:opacity-50 transition" type="submit">
          {isPending ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
