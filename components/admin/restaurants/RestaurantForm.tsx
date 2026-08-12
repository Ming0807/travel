"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurantAction, updateRestaurantAction } from "@/app/actions/admin-restaurant-actions";
import type { AdminRestaurantRow } from "@/lib/repositories/admin-restaurant.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminFormSection, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { FormInput, FormTextarea, FormSelect, FormCheckbox, getFieldError } from "@/components/admin/forms/FormField";
import { Image, List } from "@phosphor-icons/react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { RestaurantCategoryPicker } from "@/components/admin/restaurants/RestaurantCategoryPicker";
import type { AdminRestaurantCategory } from "@/lib/repositories/admin-restaurant-category.repository";

export type AdminSelectOption = {
  id: number;
  label: string;
};

type RestaurantFormProps = {
  restaurant?: AdminRestaurantRow | null;
  provinces: AdminSelectOption[];
  categories: AdminRestaurantCategory[];
  submitLabel?: string;
};

type RestaurantFormState = {
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
  categoryIds: "หมวดหมู่ร้านอาหาร",
};

export function RestaurantForm({
  restaurant,
  provinces,
  categories,
  submitLabel = "บันทึกข้อมูล"
}: RestaurantFormProps) {
  const router = useRouter();
  const isEditing = !!restaurant;
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const action = isEditing ? updateRestaurantAction.bind(null, restaurant.restaurant_id) : createRestaurantAction;

  const [state, formAction, isPending] = useActionState<RestaurantFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const fe = (name: string) => getFieldError(state?.fieldErrors, name);

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/restaurants");
      router.refresh();
    }
  }, [state?.success, isEditing, router]);

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

  return (
    <form action={formAction} className="space-y-8">
      {restaurant?.restaurant_id ? <input name="restaurantId" type="hidden" value={restaurant.restaurant_id} /> : null}

      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column (Main Content) */}
        <div className="space-y-8 lg:col-span-7">
          <AdminFormSection title="ข้อมูลหลัก (Basic Info)">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput label="ชื่อภาษาไทย" name="nameTh" defaultValue={restaurant?.name_th ?? ""} maxLength={255} required error={fe("nameTh")} className="md:col-span-2" />
              <FormInput label="ชื่อภาษาอังกฤษ" name="nameEn" defaultValue={restaurant?.name_en ?? ""} maxLength={255} className="md:col-span-2" />
              <FormInput
                label="Slug (สำหรับ URL)"
                name="slug"
                defaultValue={restaurant?.slug ?? ""}
                maxLength={200}
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                placeholder="e.g. delicious-cafe"
                onChange={(e) => {
                  e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                }}
                error={fe("slug")}
                className="md:col-span-2"
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="เนื้อหาและรายละเอียด (Content)">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <p className="font-bold text-slate-800">เนื้อหาภาษาไทย</p>
                <FormTextarea label="รายละเอียด" name="descriptionTh" defaultValue={restaurant?.description_th ?? ""} maxLength={5000} />
              </div>
              <div className="space-y-4">
                <p className="font-bold text-slate-800">English Content</p>
                <FormTextarea label="Description" name="descriptionEn" defaultValue={restaurant?.description_en ?? ""} maxLength={5000} />
              </div>
            </div>
          </AdminFormSection>
        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="space-y-8 lg:sticky lg:top-8 lg:col-span-5 lg:self-start">
          {/* Status */}
          <AdminFormSection title="สถานะ (Status)">
            <div className="flex flex-col gap-3">
              <FormCheckbox label="เปิดใช้งาน (Active)" name="isActive" defaultChecked={restaurant?.is_active ?? true} accent="teal" />
              <FormCheckbox label="เผยแพร่ (Published)" name="isPublished" defaultChecked={restaurant?.is_published ?? false} accent="coral" />
            </div>
          </AdminFormSection>

          {/* Location & Type */}
          <AdminFormSection title="ที่ตั้งและประเภท">
            <div className="grid gap-4">
              <FormSelect
                label="จังหวัด"
                name="provinceId"
                defaultValue={restaurant?.province_id ?? ""}
                placeholder="เลือกจังหวัด"
                required
                options={provinces.map((p) => ({ value: p.id, label: p.label }))}
              />

              <RestaurantCategoryPicker
                categories={categories}
                selectedCategoryIds={restaurant?.category_ids ?? []}
                error={fe("categoryIds")}
              />

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
              </label>
            </div>
          </AdminFormSection>
        </div>
      </div>

      {/* Location & Contact - Bottom full width */}
      <AdminFormSection title="พิกัดและการติดต่อ (Location & Contact)">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormInput label="ที่อยู่" name="addressText" defaultValue={restaurant?.address_text ?? ""} maxLength={1000} className="md:col-span-2 lg:col-span-4" />
          <FormInput label="Latitude (ละติจูด)" name="latitude" defaultValue={restaurant?.latitude ?? ""} type="number" step="0.0000001" placeholder="เช่น 6.5233" className="lg:col-span-1" />
          <FormInput label="Longitude (ลองจิจูด)" name="longitude" defaultValue={restaurant?.longitude ?? ""} type="number" step="0.0000001" placeholder="เช่น 101.281" className="lg:col-span-1" />
          <FormInput label="เวลาเปิดทำการ" name="openingHours" defaultValue={restaurant?.opening_hours ?? ""} maxLength={255} placeholder="เช่น ทุกวัน 09:00 - 21:00 น." className="lg:col-span-1" />
          <FormInput label="ข้อมูลการติดต่อ" name="contactInfo" defaultValue={restaurant?.contact_info ?? ""} maxLength={255} placeholder="เช่น เบอร์โทรศัพท์, Facebook" className="lg:col-span-1" />
        </div>
      </AdminFormSection>

      <AdminSaveBar cancelHref="/admin/restaurants" isPending={isPending} submitLabel={submitLabel} />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const id = Number(asset.id);
          setCoverMediaId(id);
          setCoverPreviewUrl(asset.url);
        }}
        onSelect={(url) => setCoverPreviewUrl(url)}
        title="เลือกรูปภาพร้านอาหาร"
      />
    </form>
  );
}
