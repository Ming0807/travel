"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArrowCounterClockwise, CaretDown, CaretUp, MagnifyingGlass, Plus, Trash } from "@phosphor-icons/react";
import {
  createRestaurantCategoryAction,
  deleteRestaurantCategoryAction,
  setRestaurantCategoryActiveAction,
  updateRestaurantCategoryAction,
  type RestaurantCategoryActionState,
} from "@/app/actions/admin-restaurant-category-actions";
import type { AdminRestaurantCategory } from "@/lib/repositories/admin-restaurant-category.repository";

const sections = [
  { value: "local", label: "รสชาติท้องถิ่น" },
  { value: "meals", label: "มื้ออาหาร" },
  { value: "cafes", label: "คาเฟ่และของหวาน" },
  { value: "other", label: "อื่น ๆ" },
] as const;

const initialState: RestaurantCategoryActionState = { success: false };

function SubmitButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled} className="min-h-11 bg-[#073F37] px-4 text-sm font-bold text-white transition hover:bg-[#0A6B62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#073F37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
      {label}
    </button>
  );
}

function CategoryFields({ category }: { category?: AdminRestaurantCategory }) {
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? 0);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_0.8fr_0.55fr]">
      <label className="block">
        <span className="text-xs font-bold text-slate-600">ชื่อภาษาไทย</span>
        <input name="nameTh" required maxLength={120} defaultValue={category?.nameTh ?? ""} className="mt-1 min-h-11 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-slate-600">ชื่อภาษาอังกฤษ</span>
        <input name="nameEn" maxLength={120} defaultValue={category?.nameEn ?? ""} className="mt-1 min-h-11 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-slate-600">Slug</span>
        <input name="slug" required maxLength={100} pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" defaultValue={category?.slug ?? ""} className="mt-1 min-h-11 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-slate-600">กลุ่มเมนู</span>
        <select name="sectionKey" defaultValue={category?.sectionKey ?? "other"} className="mt-1 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100">
          {sections.map((section) => <option key={section.value} value={section.value}>{section.label}</option>)}
        </select>
      </label>
      <div>
        <span className="text-xs font-bold text-slate-600">ลำดับ</span>
        <div className="mt-1 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem]">
          <button type="button" aria-label="ลดลำดับ" onClick={() => setDisplayOrder((value) => Math.max(0, value - 10))} className="grid min-h-11 place-items-center border border-r-0 border-slate-300 bg-white hover:bg-slate-50"><CaretUp size={16} /></button>
          <input name="displayOrder" aria-label="ลำดับหมวดหมู่" type="number" min={0} max={10000} value={displayOrder} onChange={(event) => setDisplayOrder(Math.max(0, Number(event.target.value) || 0))} className="min-h-11 min-w-0 border border-slate-300 px-2 text-center text-sm outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100" />
          <button type="button" aria-label="เพิ่มลำดับ" onClick={() => setDisplayOrder((value) => Math.min(10000, value + 10))} className="grid min-h-11 place-items-center border border-l-0 border-slate-300 bg-white hover:bg-slate-50"><CaretDown size={16} /></button>
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="isFeatured" type="checkbox" value="true" defaultChecked={category?.isFeatured ?? false} className="h-4 w-4 accent-[#073F37]" />
        แสดงในเมนูหลัก
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="isActive" type="checkbox" value="true" defaultChecked={category?.isActive ?? true} className="h-4 w-4 accent-[#073F37]" />
        เปิดใช้งาน
      </label>
    </div>
  );
}

function EditCategoryForm({ category }: { category: AdminRestaurantCategory }) {
  const router = useRouter();
  const action = updateRestaurantCategoryAction.bind(null, category.categoryId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isMutating, startTransition] = useTransition();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const busy = isPending || isMutating;

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  function runAction(actionPromise: Promise<RestaurantCategoryActionState>) {
    startTransition(async () => {
      const result = await actionPromise;
      if (!result.success) setMutationError(result.error ?? "ดำเนินการไม่สำเร็จ");
      else {
        setMutationError(null);
        router.refresh();
      }
    });
  }

  return (
    <form action={formAction} className={`border-b border-slate-200 px-5 py-5 ${category.isActive ? "bg-white" : "bg-slate-50"}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-black text-slate-900">#{category.categoryId}</span>
          <span className={`px-2 py-1 text-xs font-bold ${category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-[#334155]"}`}>
            {category.isActive ? "เปิดใช้งาน" : "เก็บถาวร"}
          </span>
          <span className="px-2 py-1 text-xs font-bold text-slate-600">{category.restaurantCount} ร้าน</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => runAction(setRestaurantCategoryActiveAction(category.categoryId, !category.isActive))} className="inline-flex min-h-10 items-center gap-2 border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {category.isActive ? <Archive size={16} /> : <ArrowCounterClockwise size={16} />}
            {category.isActive ? "ปิดใช้งาน" : "เปิดใช้งานอีกครั้ง"}
          </button>
          {category.restaurantCount === 0 ? (
            <button type="button" disabled={busy} onClick={() => window.confirm("ลบหมวดหมู่นี้ถาวรหรือไม่?") && runAction(deleteRestaurantCategoryAction(category.categoryId))} className="inline-flex min-h-10 items-center gap-2 border border-red-200 bg-white px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
              <Trash size={16} /> ลบ
            </button>
          ) : null}
        </div>
      </div>
      <CategoryFields category={category} />
      {state.error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{state.error}</p> : null}
      {mutationError ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{mutationError}</p> : null}
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={busy} className="min-h-10 bg-[#202020] px-4 text-sm font-bold text-white hover:bg-black disabled:opacity-50">
          {isPending ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}
        </button>
      </div>
    </form>
  );
}

export function RestaurantCategoryManager({ categories }: { categories: AdminRestaurantCategory[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "archived">("all");
  const [createState, createAction, isCreating] = useActionState(createRestaurantCategoryAction, initialState);
  const normalized = query.trim().toLocaleLowerCase("th-TH");
  const filtered = useMemo(() => categories.filter((category) => (
    (status === "all" || (status === "active" ? category.isActive : !category.isActive))
    && (!normalized || [category.nameTh, category.nameEn ?? "", category.slug]
      .some((value) => value.toLocaleLowerCase("th-TH").includes(normalized)))
  )), [categories, normalized, status]);

  useEffect(() => {
    if (createState.success) router.refresh();
  }, [createState.success, router]);

  return (
    <div className="space-y-6">
      <form action={createAction} className="border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={20} className="text-[#B94727]" weight="bold" />
          <h2 className="text-base font-black text-slate-900">เพิ่มหมวดหมู่ใหม่</h2>
        </div>
        <CategoryFields />
        {createState.error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{createState.error}</p> : null}
        <div className="mt-4 flex justify-end">
          <SubmitButton disabled={isCreating} label={isCreating ? "กำลังเพิ่ม..." : "เพิ่มหมวดหมู่"} />
        </div>
      </form>

      <section className="border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">หมวดหมู่ทั้งหมด</h2>
            <p className="mt-1 text-sm text-slate-600">หมวดที่มีร้านใช้งานอยู่ควรปิดใช้งานแทนการลบ เพื่อรักษาประวัติข้อมูล</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label className="relative w-full sm:w-72">
            <span className="sr-only">ค้นหาหมวดหมู่</span>
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อหรือ slug" className="min-h-11 w-full border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100" />
          </label>
          <label>
            <span className="sr-only">กรองสถานะหมวดหมู่</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 w-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073F37] focus:ring-2 focus:ring-teal-100 sm:w-40">
              <option value="all">ทุกสถานะ</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="archived">เก็บถาวร</option>
            </select>
          </label>
          </div>
        </div>
        {filtered.length > 0 ? filtered.map((category) => <EditCategoryForm key={category.categoryId} category={category} />) : (
          <p className="p-8 text-center text-sm text-slate-600">ไม่พบหมวดหมู่ที่ค้นหา</p>
        )}
      </section>
    </div>
  );
}
