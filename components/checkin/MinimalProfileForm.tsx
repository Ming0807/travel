"use client";

import { useActionState, useState } from "react";
import { submitMinimalProfile } from "@/app/actions/checkin-actions";

interface Props {
  checkinCode: string;
  countries: { country_id: number; country_name_th: string }[];
  provinces: { province_id: number; province_name_th: string }[];
  defaultValues?: {
    displayName: string;
    ageGroup: string;
    originCountryId: string;
    originProvinceId: string;
  };
}

export function MinimalProfileForm({ checkinCode, countries, provinces, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(submitMinimalProfile, null);
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultValues?.originCountryId || "1"); // Default to previous or 1 (Thailand)


  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-[2rem] shadow-lg border border-ink/5 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
      {/* Left Column: Form */}
      <div className="w-full md:w-[55%] p-8 md:p-12">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="checkinCode" value={checkinCode} />
          
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-black text-ink">สร้างใบประกาศ</h2>
            <p className="text-sm text-muted">ใช้เวลาเพียงเล็กน้อยเพื่อเริ่มเก็บความทรงจำ</p>
          </div>

          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {state.error}
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-bold text-ink">
              ชื่อที่ต้องการให้แสดงบนใบประกาศ <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="displayName" 
              name="displayName" 
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all bg-white"
              placeholder="นามแฝง ชื่อเล่น หรือชื่อจริง"
              maxLength={150}
              defaultValue={defaultValues?.displayName}
              required
            />
            <p className="text-xs text-gray-400">ใช้ชื่อเล่น นามแฝง หรือชื่อจริงก็ได้</p>
          </div>

      {/* Origin Country */}
      <div className="space-y-2">
        <label htmlFor="originCountryId" className="block text-sm font-bold text-ink">
          ประเทศที่คุณเดินทางมา <span className="text-red-500">*</span>
        </label>
        <select 
          id="originCountryId" 
          name="originCountryId"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none bg-white"
        >
          <option value="">เลือกประเทศ...</option>
          {countries.map((c) => (
            <option key={c.country_id} value={c.country_id.toString()}>
              {c.country_name_th}
            </option>
          ))}
        </select>
      </div>

      {/* Origin Province (Only show if Thailand is selected. Assuming Thailand ID is 1 from our seed) */}
      {selectedCountry === "1" && (
        <div className="space-y-2">
          <label htmlFor="originProvinceId" className="block text-sm font-bold text-ink">
            จังหวัดที่คุณเดินทางมา <span className="text-red-500">*</span>
          </label>
          <select 
            id="originProvinceId" 
            name="originProvinceId"
            defaultValue={defaultValues?.originProvinceId}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none bg-white"
          >
            <option value="">เลือกจังหวัด...</option>
            {provinces.map((p) => (
              <option key={p.province_id} value={p.province_id.toString()}>
                {p.province_name_th}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Age Group */}
      <div className="space-y-2">
        <label htmlFor="ageGroup" className="block text-sm font-bold text-ink">
          ช่วงอายุ <span className="text-red-500">*</span>
        </label>
        <select 
          id="ageGroup" 
          name="ageGroup"
          defaultValue={defaultValues?.ageGroup}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none bg-white"
          required
        >
          <option value="">เลือกช่วงอายุ...</option>
          <option value="under_18">ต่ำกว่า 18 ปี</option>
          <option value="18_24">18 - 24 ปี</option>
          <option value="25_34">25 - 34 ปี</option>
          <option value="35_44">35 - 44 ปี</option>
          <option value="45_54">45 - 54 ปี</option>
          <option value="55_64">55 - 64 ปี</option>
          <option value="65_plus">65 ปีขึ้นไป</option>
          <option value="prefer_not_to_answer">ไม่ประสงค์ตอบ</option>
        </select>
      </div>

      {/* Consent */}
      <div className="pt-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex-shrink-0 pt-0.5">
            <input 
              type="checkbox" 
              name="hasConsented" 
              value="true"
              required
              className="w-5 h-5 rounded border-gray-300 text-coral focus:ring-coral cursor-pointer"
            />
          </div>
          <span className="text-xs text-muted leading-relaxed group-hover:text-ink transition-colors">
            ข้าพเจ้ายินยอมให้ระบบบันทึกข้อมูลเพื่อใช้ในการสร้างใบประกาศดิจิทัล และนำข้อมูลไปวิเคราะห์เพื่อพัฒนาการท่องเที่ยวในรูปแบบสถิติภาพรวม <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={pending}
          className="w-full flex items-center justify-center py-4 bg-coral text-white rounded-full font-bold text-base shadow-sm hover:bg-coral/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? "กำลังดำเนินการ..." : "ยืนยันและดำเนินการต่อ"}
        </button>
        <p className="text-center text-xs text-muted mt-3 flex items-center justify-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          ข้อมูลของคุณจะถูกเก็บเป็นความลับและปลอดภัย
        </p>
      </div>
        </form>
      </div>

      {/* Right Column: Illustration/Info */}
      <div className="w-full md:w-[45%] bg-[#FAF8F5] p-8 md:p-12 flex flex-col items-center justify-center border-l border-ink/5">
        <div className="max-w-xs w-full">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-coral">
              {/* Fallback illustration icon */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-ink mb-2">เริ่มต้นการเดินทางของคุณ</h3>
            <p className="text-sm text-muted">
              สร้างใบประกาศเพื่อเก็บเป็นความทรงจำและแบ่งปันประสบการณ์การเดินทางสุดพิเศษ
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">ปลอดภัยและเป็นส่วนตัว</h4>
                <p className="text-xs text-muted mt-1">ข้อมูลของคุณได้รับการปกป้องอย่างดี</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">สร้างได้ในไม่กี่ขั้นตอน</h4>
                <p className="text-xs text-muted mt-1">ใช้เวลาเพียง 1-2 นาทีเท่านั้น</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">ใบประกาศดิจิทัลสวยงาม</h4>
                <p className="text-xs text-muted mt-1">ออกแบบมาเพื่อการแบ่งปันและเก็บรักษา</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
