import Link from "next/link";

export type AdminSelectOption = {
  id: number;
  label: string;
};

export type AttractionFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type AttractionFormData = {
  attraction_id?: number;
  name_th?: string | null;
  name_en?: string | null;
  slug?: string | null;
  province_id?: number | null;
  district_id?: number | null;
  attraction_type_id?: number | null;
  short_description_th?: string | null;
  short_description_en?: string | null;
  description_th?: string | null;
  description_en?: string | null;
  address_text?: string | null;
  opening_hours?: string | null;
  contact_info?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sustainability_category?: string | null;
  estimated_capacity_per_day?: number | null;
  is_published?: boolean | null;
  is_active?: boolean | null;
};

type AttractionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  state: AttractionFormState;
  attraction?: AttractionFormData | null;
  provinces: AdminSelectOption[];
  districts: AdminSelectOption[];
  attractionTypes: AdminSelectOption[];
  submitLabel: string;
};

function fieldError(state: AttractionFormState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}

export function AttractionForm({
  action,
  state,
  attraction,
  provinces,
  districts,
  attractionTypes,
  submitLabel
}: AttractionFormProps) {
  return (
    <form action={action} className="space-y-6">
      {attraction?.attraction_id ? <input name="attractionId" type="hidden" value={attraction.attraction_id} /> : null}

      {state.message ? (
        <div className={`rounded-2xl p-4 text-sm font-bold ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {state.message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.name_th ?? ""}
              maxLength={255}
              name="nameTh"
              required
            />
            {fieldError(state, "nameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError(state, "nameTh")}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.name_en ?? ""}
              maxLength={255}
              name="nameEn"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.slug ?? ""}
              maxLength={200}
              name="slug"
              required
            />
            {fieldError(state, "slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError(state, "slug")}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัด *</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.province_id ?? ""}
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
            <span className="text-sm font-bold text-slate-700">อำเภอ</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.district_id ?? ""}
              name="districtId"
            >
              <option value="">ไม่ระบุ</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">ประเภทแหล่งท่องเที่ยว</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.attraction_type_id ?? ""}
              name="attractionTypeId"
            >
              <option value="">ไม่ระบุ</option>
              {attractionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-[#073F37]">เนื้อหาสาธารณะ</h2>
        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">คำอธิบายสั้นภาษาไทย</span>
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">คำอธิบายรายละเอียดภาษาไทย</span>
            <textarea className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.description_th ?? ""} maxLength={4000} name="descriptionTh" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">ที่อยู่/จุดสังเกต</span>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.address_text ?? ""} maxLength={1000} name="addressText" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ</span>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.opening_hours ?? ""} maxLength={255} name="openingHours" />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-[#073F37]">สถานะและพิกัด</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Latitude</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.latitude ?? ""} name="latitude" type="number" step="0.0000001" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Longitude</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.longitude ?? ""} name="longitude" type="number" step="0.0000001" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            <input defaultChecked={attraction?.is_active ?? true} name="isActive" type="checkbox" value="true" />
            Active
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            <input defaultChecked={attraction?.is_published ?? false} name="isPublished" type="checkbox" value="true" />
            Published
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-[#F4F8F6]/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700" href="/admin/attractions">
          ยกเลิก
        </Link>
        <button className="rounded-full bg-[#073F37] px-5 py-3 text-sm font-black text-white shadow-card hover:bg-[#0A6B62]" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
