"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageSquare, Trash } from "@phosphor-icons/react";
import { updateRestaurantAction } from "@/app/actions/admin-restaurant-actions";
import { AdminFormErrorSummary, AdminSaveBar, type AdminFormActionState } from "@/components/admin/forms/AdminFormUX";
import type { AdminRestaurantRow } from "@/lib/repositories/admin-restaurant.repository";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import type { AdminSelectOption } from "@/components/admin/restaurants/RestaurantForm";
import { RestaurantCategoryPicker } from "@/components/admin/restaurants/RestaurantCategoryPicker";
import type { AdminRestaurantCategory } from "@/lib/repositories/admin-restaurant-category.repository";

type SectionFormProps = {
  restaurant: AdminRestaurantRow;
  onClose: () => void;
  provinces?: AdminSelectOption[];
  categories?: AdminRestaurantCategory[];
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  onCoverChange?: (mediaId: number | null, mediaUrl: string | null) => void;
};

function CategoryInputs({ restaurant }: { restaurant: AdminRestaurantRow }) {
  return restaurant.category_ids.map((categoryId) => (
    <input key={categoryId} type="hidden" name="categoryIds" value={categoryId} />
  ));
}

function toFiniteMediaId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function SectionFooter({
  isPending,
  onClose,
  submitLabel,
}: {
  isPending: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="shrink-0 px-4 sm:px-6">
      <AdminSaveBar
        isPending={isPending}
        onCancel={onClose}
        submitLabel={submitLabel}
      />
    </div>
  );
}

export function HeaderForm({
  restaurant,
  onClose,
  coverMediaId: initialCoverMediaId,
  coverMediaUrl: initialCoverMediaUrl,
  onCoverChange,
}: SectionFormProps) {
  const router = useRouter();
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, {
    success: false,
  });
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(initialCoverMediaUrl ?? "");
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(() => toFiniteMediaId(initialCoverMediaId));
  const [coverMediaAction, setCoverMediaAction] = useState<"none" | "set" | "clear">("none");
  const [coverStoragePath, setCoverStoragePath] = useState("");
  const [coverSelectionError, setCoverSelectionError] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!state?.success) return;
    onCoverChange?.(currentMediaId, coverPreviewUrl || null);
    router.refresh();
    onClose();
  }, [coverPreviewUrl, currentMediaId, onClose, onCoverChange, router, state?.success]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

        <input type="hidden" name="provinceId" value={restaurant.province_id} />
        <input type="hidden" name="isActive" value={restaurant.is_active ? "true" : "false"} />
        <input type="hidden" name="isPublished" value={restaurant.is_published ? "true" : "false"} />
        <input type="hidden" name="descriptionTh" value={restaurant.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={restaurant.description_en ?? ""} />
        <input type="hidden" name="addressText" value={restaurant.address_text ?? ""} />
        <input type="hidden" name="latitude" value={restaurant.latitude ?? ""} />
        <input type="hidden" name="longitude" value={restaurant.longitude ?? ""} />
        <input type="hidden" name="openingHours" value={restaurant.opening_hours ?? ""} />
        <input type="hidden" name="contactInfo" value={restaurant.contact_info ?? ""} />
        <CategoryInputs restaurant={restaurant} />
        <input type="hidden" name="coverMediaId" value={currentMediaId ?? ""} />
        <input type="hidden" name="coverMediaAction" value={coverMediaAction} />
        <input type="hidden" name="coverStoragePath" value={coverStoragePath} />

        <div className="space-y-5">
          <section aria-labelledby="restaurant-cover-heading">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="restaurant-cover-heading" className="text-sm font-black text-slate-800">รูปภาพปก</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">ภาพนี้จะแสดงด้านบนของหน้าร้านอาหาร เลือกภาพแนวนอนที่เห็นร้านหรืออาหารได้ชัดเจน</p>
              </div>
              <ImageSquare aria-hidden="true" className="shrink-0 text-[var(--admin-accent)]" size={22} weight="duotone" />
            </div>
            <div className="mt-3 overflow-hidden rounded-[var(--admin-radius-panel)] border border-slate-300 bg-slate-50">
              <div className="aspect-video bg-slate-100">
                {coverPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreviewUrl} alt="ตัวอย่างรูปภาพปกร้านอาหาร" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center text-sm font-bold text-slate-500">
                    <ImageSquare aria-hidden="true" size={28} weight="duotone" />
                    ยังไม่มีรูปภาพปก
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-200 bg-white p-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--admin-radius-control)] bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[var(--admin-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
                >
                  <ImageSquare aria-hidden="true" size={18} weight="bold" />
                  เลือกจาก Media Library
                </button>
                {coverPreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreviewUrl("");
                      setCurrentMediaId(null);
                      setCoverMediaAction("clear");
                      setCoverStoragePath("");
                      setCoverSelectionError("");
                    }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
                  >
                    <Trash aria-hidden="true" size={17} weight="bold" />
                    เอารูปออก
                  </button>
                ) : null}
              </div>
            </div>
            {coverSelectionError ? <p role="alert" className="mt-2 text-sm font-bold text-rose-700">{coverSelectionError}</p> : null}
          </section>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-black text-slate-800">ชื่อและลิงก์สาธารณะ</h3>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
            <input className="mt-2 min-h-11 w-full rounded-[var(--admin-radius-control)] border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm" defaultValue={restaurant.name_th ?? ""} name="nameTh" required />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
            <input className="mt-2 min-h-11 w-full rounded-[var(--admin-radius-control)] border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm" defaultValue={restaurant.name_en ?? ""} name="nameEn" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug *</span>
            <input className="mt-2 min-h-11 w-full rounded-[var(--admin-radius-control)] border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm" defaultValue={restaurant.slug ?? ""} name="slug" required />
            <p className="mt-1 text-xs leading-5 text-slate-500">ใช้ตัวอักษรอังกฤษตัวเล็ก ตัวเลข และขีดกลาง เช่น `lae-pha-ban-na-tham`</p>
          </label>
        </div>
      </div>
      <SectionFooter isPending={isPending} onClose={onClose} submitLabel="บันทึกข้อมูลหลักและรูปภาพ" />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const mediaId = toFiniteMediaId(asset.id);
          if (!asset.storage_path) {
            setCoverSelectionError("รูปนี้ไม่มีข้อมูลไฟล์ที่ใช้งานได้ กรุณาเลือกรูปอื่น");
            return;
          }
          setCurrentMediaId(mediaId);
          setCoverPreviewUrl(asset.url);
          setCoverStoragePath(asset.storage_path);
          setCoverMediaAction("set");
          setCoverSelectionError("");
        }}
        onSelect={() => {}}
        title="เลือกรูปภาพปกร้านอาหาร"
      />
    </form>
  );
}

export function ContentForm({ restaurant, onClose }: SectionFormProps) {
  const router = useRouter();
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });

  useEffect(() => {
    if (!state?.success) return;
    router.refresh();
    onClose();
  }, [onClose, router, state?.success]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden required fields */}
        <input type="hidden" name="nameTh" value={restaurant.name_th} />
        <input type="hidden" name="slug" value={restaurant.slug} />
        <input type="hidden" name="provinceId" value={restaurant.province_id} />
        <input type="hidden" name="isActive" value={restaurant.is_active ? "true" : "false"} />
        <input type="hidden" name="isPublished" value={restaurant.is_published ? "true" : "false"} />
        <input type="hidden" name="addressText" value={restaurant.address_text ?? ""} />
        <input type="hidden" name="latitude" value={restaurant.latitude ?? ""} />
        <input type="hidden" name="longitude" value={restaurant.longitude ?? ""} />
        <input type="hidden" name="openingHours" value={restaurant.opening_hours ?? ""} />
        <input type="hidden" name="contactInfo" value={restaurant.contact_info ?? ""} />
        <CategoryInputs restaurant={restaurant} />
        <input type="hidden" name="coverMediaId" value="" />
        <input type="hidden" name="nameEn" value={restaurant.name_en ?? ""} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">รายละเอียดภาษาไทย</span>
            <textarea className="mt-2 min-h-[150px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.description_th ?? ""} name="descriptionTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">รายละเอียดภาษาอังกฤษ</span>
            <textarea className="mt-2 min-h-[150px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.description_en ?? ""} name="descriptionEn" />
          </label>
        </div>
      </div>
      <SectionFooter isPending={isPending} onClose={onClose} submitLabel="บันทึกเนื้อหา" />
    </form>
  );
}

export function LocationForm({ restaurant, onClose }: SectionFormProps) {
  const router = useRouter();
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });

  useEffect(() => {
    if (!state?.success) return;
    router.refresh();
    onClose();
  }, [onClose, router, state?.success]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden fields */}
        <input type="hidden" name="nameTh" value={restaurant.name_th} />
        <input type="hidden" name="slug" value={restaurant.slug} />
        <input type="hidden" name="provinceId" value={restaurant.province_id} />
        <input type="hidden" name="isActive" value={restaurant.is_active ? "true" : "false"} />
        <input type="hidden" name="isPublished" value={restaurant.is_published ? "true" : "false"} />
        <input type="hidden" name="descriptionTh" value={restaurant.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={restaurant.description_en ?? ""} />
        <CategoryInputs restaurant={restaurant} />
        <input type="hidden" name="coverMediaId" value="" />
        <input type="hidden" name="nameEn" value={restaurant.name_en ?? ""} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ที่อยู่</span>
            <textarea className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.address_text ?? ""} name="addressText" rows={3} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Latitude</span>
              <input type="number" step="0.0000001" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.latitude ?? ""} name="latitude" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Longitude</span>
              <input type="number" step="0.0000001" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.longitude ?? ""} name="longitude" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.opening_hours ?? ""} name="openingHours" placeholder="เช่น ทุกวัน 09:00 - 21:00 น." />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ข้อมูลติดต่อ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.contact_info ?? ""} name="contactInfo" placeholder="โทรศัพท์, Facebook" />
          </label>
        </div>
      </div>
      <SectionFooter isPending={isPending} onClose={onClose} submitLabel="บันทึกพิกัด" />
    </form>
  );
}

export function SettingsForm({ restaurant, provinces = [], categories = [], onClose }: SectionFormProps) {
  const router = useRouter();
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });

  useEffect(() => {
    if (!state?.success) return;
    router.refresh();
    onClose();
  }, [onClose, router, state?.success]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden fields */}
        <input type="hidden" name="nameTh" value={restaurant.name_th} />
        <input type="hidden" name="slug" value={restaurant.slug} />
        <input type="hidden" name="descriptionTh" value={restaurant.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={restaurant.description_en ?? ""} />
        <input type="hidden" name="addressText" value={restaurant.address_text ?? ""} />
        <input type="hidden" name="latitude" value={restaurant.latitude ?? ""} />
        <input type="hidden" name="longitude" value={restaurant.longitude ?? ""} />
        <input type="hidden" name="openingHours" value={restaurant.opening_hours ?? ""} />
        <input type="hidden" name="contactInfo" value={restaurant.contact_info ?? ""} />
        <input type="hidden" name="nameEn" value={restaurant.name_en ?? ""} />

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              เปิดใช้งาน (Active)
              <input defaultChecked={restaurant.is_active} name="isActive" type="checkbox" value="true" className="h-4 w-4 accent-teal-600" />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              เผยแพร่ (Published)
              <input defaultChecked={restaurant.is_published} name="isPublished" type="checkbox" value="true" className="h-4 w-4 accent-[#F3704C]" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัด *</span>
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.province_id} name="provinceId" required>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>

          <RestaurantCategoryPicker
            categories={categories}
            selectedCategoryIds={restaurant.category_ids}
            error={state.fieldErrors?.categoryIds?.[0]}
          />
          <input type="hidden" name="coverMediaId" value="" />
          <input type="hidden" name="coverMediaAction" value="none" />
        </div>
      </div>
      <SectionFooter isPending={isPending} onClose={onClose} submitLabel="บันทึกการตั้งค่า" />
    </form>
  );
}
