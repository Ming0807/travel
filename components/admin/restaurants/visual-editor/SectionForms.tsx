"use client";

import { useActionState, useEffect, useState } from "react";
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

export function HeaderForm({ restaurant, onClose }: SectionFormProps) {
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* We must pass hidden fields for ALL other required data so it doesn't get erased by the updateAction (since it expects a full schema or we use a partial update). 
            Wait, updateRestaurantAction expects the full schema. So we MUST include all fields as hidden if we only show partial forms. */}
        <input type="hidden" name="provinceId" value={restaurant.province_id} />
        <input type="hidden" name="isActive" value={restaurant.is_active ? "true" : "false"} />
        <input type="hidden" name="isPublished" value={restaurant.is_published ? "true" : "false"} />
        <input type="hidden" name="slug" value={restaurant.slug} />

        {/* Instead of passing all hidden fields, it's better to render them or assume the action allows partial. Wait, adminRestaurantMutationSchema uses .partial()? No, it's a full schema. We must include everything! */}
        <input type="hidden" name="descriptionTh" value={restaurant.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={restaurant.description_en ?? ""} />
        <input type="hidden" name="addressText" value={restaurant.address_text ?? ""} />
        <input type="hidden" name="latitude" value={restaurant.latitude ?? ""} />
        <input type="hidden" name="longitude" value={restaurant.longitude ?? ""} />
        <input type="hidden" name="openingHours" value={restaurant.opening_hours ?? ""} />
        <input type="hidden" name="contactInfo" value={restaurant.contact_info ?? ""} />
        <CategoryInputs restaurant={restaurant} />
        <input type="hidden" name="coverMediaId" value="" />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.name_th ?? ""} name="nameTh" required />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.name_en ?? ""} name="nameEn" />
          </label>
          {/* Allow editing Slug here too because it's part of Header/Identity */}
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug *</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={restaurant.slug ?? ""} name="slug" required />
          </label>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกข้อมูลหลัก" />
      </div>
    </form>
  );
}

export function ContentForm({ restaurant, onClose }: SectionFormProps) {
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
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
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกเนื้อหา" />
      </div>
    </form>
  );
}

export function LocationForm({ restaurant, onClose }: SectionFormProps) {
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
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
          <div className="grid grid-cols-2 gap-4">
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
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกพิกัด" />
      </div>
    </form>
  );
}

export function SettingsForm({ restaurant, provinces = [], categories = [], onClose, coverMediaId: cmId, coverMediaUrl: cmUrl, onCoverChange }: SectionFormProps) {
  const action = updateRestaurantAction.bind(null, restaurant.restaurant_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(cmUrl ?? "");
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(() => toFiniteMediaId(cmId));
  const [coverMediaAction, setCoverMediaAction] = useState<"none" | "set" | "clear">("none");
  const [coverStoragePath, setCoverStoragePath] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      if (onCoverChange) onCoverChange(currentMediaId, coverPreviewUrl || null);
      onClose();
    }
  }, [coverPreviewUrl, currentMediaId, onClose, onCoverChange, state?.success]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
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
          
          <label className="block">
            <span className="text-sm font-bold text-slate-700">รูปภาพปก (Cover Image)</span>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="aspect-video bg-slate-100">
                {coverPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreviewUrl} alt="Cover preview" className="h-full w-full object-cover" />
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
                       setCurrentMediaId(null);
                       setCoverMediaAction("clear");
                       setCoverStoragePath("");
                     }}
                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    เอาออก
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              ใช้ปุ่ม &ldquo;เลือกจาก Media Library&rdquo; ด้านบนเพื่อเลือกรูปภาพ การวาง URL ด้วยตนเองไม่รองรับในระบบปัจจุบัน
            </div>
          </label>

          <input type="hidden" name="coverMediaId" value={currentMediaId ? String(currentMediaId) : ""} />
          <input type="hidden" name="coverMediaAction" value={coverMediaAction} />
          <input type="hidden" name="coverStoragePath" value={coverStoragePath} />
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกการตั้งค่า" />
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const mediaId = toFiniteMediaId(asset.id);
          setCurrentMediaId(mediaId);
          setCoverPreviewUrl(asset.url);
          setCoverStoragePath(asset.storage_path);
          setCoverMediaAction("set");
        }}
        onSelect={() => {}}
        title="เลือกรูปภาพปก"
      />
    </form>
  );
}
