"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CheckCircle,
  Compass,
  LockKey,
  NotePencil,
  Spinner,
} from "@phosphor-icons/react";

import { initiateCheckin, type MinimalFormState } from "@/app/actions/checkin-actions";
import {
  SearchableProvinceField,
  type ProvinceOption,
} from "@/components/checkin/SearchableProvinceField";
import { AGE_GROUP_OPTIONS, normalizeAgeGroup } from "@/lib/validation/checkin";

export type CountryOption = {
  id: number;
  labelTh: string;
  labelEn: string;
  iso2Code: string | null;
};

export type CheckinProfileDefaults = {
  displayName: string;
  originCountryId: number | null;
  originProvinceId: number | null;
  ageGroup: string | null;
  hasCurrentConsent: boolean;
};

type MinimalFormProps = {
  checkinCode: string;
  countries: CountryOption[];
  provinces: ProvinceOption[];
  initialProfile?: CheckinProfileDefaults | null;
};

const initialFormState: MinimalFormState = {};

export function MinimalForm({
  checkinCode,
  countries,
  provinces,
  initialProfile,
}: MinimalFormProps) {
  const [state, formAction, isPending] = useActionState(
    initiateCheckin.bind(null, checkinCode),
    initialFormState,
  );
  const defaultCountryId = useMemo(
    () => initialProfile?.originCountryId ?? countries.find((country) => country.iso2Code === "TH")?.id ?? countries[0]?.id ?? null,
    [countries, initialProfile?.originCountryId],
  );
  const [isEditing, setIsEditing] = useState(!initialProfile);
  const [countryId, setCountryId] = useState<number | null>(defaultCountryId);
  const [provinceId, setProvinceId] = useState<number | null>(initialProfile?.originProvinceId ?? null);
  const selectedCountry = countries.find((country) => country.id === countryId) ?? null;
  const isThailand = selectedCountry?.iso2Code === "TH";
  const currentProvince = provinces.find((province) => province.id === provinceId) ?? null;
  const normalizedInitialAgeGroup = normalizeAgeGroup(initialProfile?.ageGroup ?? null);

  const consentField = initialProfile?.hasCurrentConsent ? (
    <>
      <input type="hidden" name="hasConsented" value="true" />
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle aria-hidden="true" className="mt-0.5 shrink-0" size={20} weight="fill" />
        <div>
          <p className="font-bold">คุณเคยให้ความยินยอมสำหรับการใช้งานนี้แล้ว</p>
          <p className="mt-1 text-xs text-emerald-700">จึงไม่ต้องยืนยันข้อตกลงฉบับเดิมซ้ำ</p>
        </div>
      </div>
    </>
  ) : (
    <div>
      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-teal/40">
        <input
          type="checkbox"
          name="hasConsented"
          value="true"
          className="mt-0.5 size-5 shrink-0 rounded border-2 border-slate-300 text-teal focus:ring-teal/20"
          required
        />
        <span>
          <span className="text-sm font-semibold leading-6 text-ink">
            ยินยอมให้ใช้ข้อมูลเพื่อสร้างใบประกาศและวิเคราะห์ภาพรวมการท่องเที่ยว
            <span className="text-coral"> *</span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            เราไม่ขอเลขบัตร ที่อยู่ หรือข้อมูลส่วนตัวที่ไม่จำเป็น
          </span>
        </span>
      </label>
      {state.errors?.hasConsented?.[0] ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{state.errors.hasConsented[0]}</p>
      ) : null}
    </div>
  );

  return (
    <form action={formAction} className="w-full space-y-5 animate-fade-in-up delay-200">
      {state.message || state.errors?._form?.[0] ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {state.errors?._form?.[0] ?? state.message}
        </div>
      ) : null}

      {initialProfile && !isEditing ? (
        <>
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-teal">ยินดีต้อนรับกลับ</p>
                <p className="mt-1 text-xl font-black text-ink">{initialProfile.displayName}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedCountry?.labelTh ?? "ยังไม่ระบุประเทศ"}
                  {currentProvince ? ` · ${currentProvince.labelTh}` : ""}
                  {normalizedInitialAgeGroup
                    ? ` · ${AGE_GROUP_OPTIONS.find((option) => option.value === normalizedInitialAgeGroup)?.label ?? ""}`
                    : ""}
                </p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                <Compass aria-hidden="true" size={22} weight="fill" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              ใช้ข้อมูลเดิมได้ทันที หรือแก้ไขก่อนสร้างความทรงจำของทริปนี้
            </p>
          </div>

          <input type="hidden" name="displayName" value={initialProfile.displayName} />
          <input type="hidden" name="originCountryId" value={countryId ?? ""} />
          <input type="hidden" name="originProvinceId" value={provinceId ?? ""} />
          <input type="hidden" name="ageGroup" value={normalizedInitialAgeGroup ?? ""} />
          {consentField}

          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-base font-bold text-white transition-colors hover:bg-teal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <Spinner aria-hidden="true" className="animate-spin" size={20} /> : <CheckCircle aria-hidden="true" size={21} weight="bold" />}
            {isPending ? "กำลังเตรียมขั้นตอนถัดไป..." : "ใช้ข้อมูลเดิมและดำเนินการต่อ"}
          </button>
          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-teal hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            onClick={() => setIsEditing(true)}
          >
            <NotePencil aria-hidden="true" size={19} />
            แก้ไขข้อมูล
          </button>
        </>
      ) : (
        <>
          {initialProfile ? (
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-base font-black text-ink">แก้ไขข้อมูลสำหรับครั้งต่อไป</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">ใบประกาศที่สร้างไว้ก่อนหน้านี้จะไม่ถูกเปลี่ยนย้อนหลัง</p>
              </div>
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
                onClick={() => {
                  setCountryId(initialProfile.originCountryId ?? defaultCountryId);
                  setProvinceId(initialProfile.originProvinceId);
                  setIsEditing(false);
                }}
              >
                ยกเลิก
              </button>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-bold text-ink">
              ชื่อที่แสดงบนใบประกาศ <span className="text-coral">*</span>
            </label>
            <input
              id="displayName"
              name="displayName"
              aria-label="ชื่อที่แสดงบนใบประกาศ"
              type="text"
              defaultValue={initialProfile?.displayName ?? ""}
              placeholder="ใช้ชื่อเล่น นามแฝง หรือชื่อจริงก็ได้"
              maxLength={100}
              className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/15"
              required
            />
            <p className="text-xs leading-5 text-slate-500">ไม่จำเป็นต้องใช้ชื่อจริงตามบัตรประชาชน</p>
            {state.errors?.displayName?.[0] ? <p className="text-xs font-medium text-rose-600">{state.errors.displayName[0]}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="originCountryId" className="block text-sm font-bold text-ink">
              ประเทศที่เดินทางมา <span className="text-coral">*</span>
            </label>
            <select
              id="originCountryId"
              name="originCountryId"
              aria-label="ประเทศที่เดินทางมา"
              value={countryId ?? ""}
              className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
              required
              onChange={(event) => {
                const nextCountryId = Number(event.target.value) || null;
                setCountryId(nextCountryId);
                const nextCountry = countries.find((country) => country.id === nextCountryId);
                if (nextCountry?.iso2Code !== "TH") setProvinceId(null);
              }}
            >
              <option value="">เลือกประเทศ</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.labelTh || country.labelEn}
                </option>
              ))}
            </select>
            {state.errors?.originCountryId?.[0] ? <p className="text-xs font-medium text-rose-600">{state.errors.originCountryId[0]}</p> : null}
          </div>

          {isThailand ? (
            <SearchableProvinceField
              options={provinces}
              selectedId={provinceId}
              onSelect={setProvinceId}
              error={state.errors?.originProvinceId?.[0]}
            />
          ) : (
            <input type="hidden" name="originProvinceId" value="" />
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-ink">ช่วงอายุ <span className="text-coral">*</span></legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AGE_GROUP_OPTIONS.map((age) => (
                <label
                  key={age.value}
                  className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-sm font-semibold text-slate-700 transition-colors has-[:checked]:border-teal has-[:checked]:bg-teal/8 has-[:checked]:text-teal hover:border-slate-300"
                >
                  <input
                    type="radio"
                    name="ageGroup"
                    value={age.value}
                    defaultChecked={normalizedInitialAgeGroup === age.value}
                    className="sr-only"
                    required
                  />
                  {age.label}
                </label>
              ))}
            </div>
            {state.errors?.ageGroup?.[0] ? <p className="text-xs font-medium text-rose-600">{state.errors.ageGroup[0]}</p> : null}
          </fieldset>

          {consentField}

          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-base font-bold text-white transition-colors hover:bg-teal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <Spinner aria-hidden="true" className="animate-spin" size={20} /> : <CheckCircle aria-hidden="true" size={21} weight="bold" />}
            {isPending ? "กำลังบันทึกข้อมูล..." : "บันทึกและไปเลือกรูปภาพ"}
          </button>
        </>
      )}

      <div className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
        <LockKey aria-hidden="true" size={15} weight="fill" />
        <span>ข้อมูลถูกเก็บอย่างปลอดภัยและใช้เพื่อการท่องเที่ยวในภาพรวม</span>
      </div>
    </form>
  );
}
