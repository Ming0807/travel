"use client";

import { useActionState, useState } from "react";
import { submitMinimalProfile } from "@/app/actions/checkin-actions";

interface Props {
  checkinCode: string;
  countries: { country_id: number; country_name_th: string }[];
  provinces: { province_id: number; province_name_th: string }[];
}

export function MinimalProfileForm({ checkinCode, countries, provinces }: Props) {
  const [state, formAction, pending] = useActionState(submitMinimalProfile, null);
  const [selectedCountry, setSelectedCountry] = useState<string>("1"); // Default to 1 (Thailand) if it exists

  return (
    <form action={formAction} className="space-y-6 w-full max-w-md mx-auto px-6 py-8">
      <input type="hidden" name="checkinCode" value={checkinCode} />
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-ink">สร้างใบประกาศ</h2>
        <p className="text-sm text-gray-500">ใช้เวลาเพียงเล็กน้อยเพื่อเริ่มเก็บความทรงจำ</p>
      </div>

      {state?.error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
          {state.error}
        </div>
      )}

      {/* Display Name */}
      <div className="space-y-1">
        <label htmlFor="displayName" className="block text-sm font-medium text-ink">
          ชื่อที่ต้องการให้แสดงบนใบประกาศ <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          id="displayName" 
          name="displayName" 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all bg-white"
          placeholder="นามแฝง ชื่อเล่น หรือชื่อจริง"
          maxLength={150}
          required
        />
        <p className="text-xs text-gray-400">ใช้ชื่อเล่น นามแฝง หรือชื่อจริงก็ได้</p>
      </div>

      {/* Origin Country */}
      <div className="space-y-1">
        <label htmlFor="originCountryId" className="block text-sm font-medium text-ink">
          ประเทศที่คุณเดินทางมา <span className="text-red-500">*</span>
        </label>
        <select 
          id="originCountryId" 
          name="originCountryId"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal outline-none bg-white"
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
        <div className="space-y-1">
          <label htmlFor="originProvinceId" className="block text-sm font-medium text-ink">
            จังหวัดที่คุณเดินทางมา <span className="text-red-500">*</span>
          </label>
          <select 
            id="originProvinceId" 
            name="originProvinceId"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal outline-none bg-white"
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
      <div className="space-y-1">
        <label htmlFor="ageGroup" className="block text-sm font-medium text-ink">
          ช่วงอายุ <span className="text-red-500">*</span>
        </label>
        <select 
          id="ageGroup" 
          name="ageGroup"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal outline-none bg-white"
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
      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex-shrink-0 pt-1">
            <input 
              type="checkbox" 
              name="hasConsented" 
              value="true"
              required
              className="w-5 h-5 rounded border-gray-300 text-teal focus:ring-teal cursor-pointer"
            />
          </div>
          <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
            ข้าพเจ้ายินยอมให้ระบบบันทึกข้อมูลเพื่อใช้ในการสร้างใบประกาศดิจิทัล และนำข้อมูลไปวิเคราะห์เพื่อพัฒนาการท่องเที่ยวในรูปแบบสถิติภาพรวม <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button 
          type="submit" 
          disabled={pending}
          className="w-full flex items-center justify-center py-4 bg-teal text-white rounded-2xl font-medium text-lg shadow-sm hover:bg-teal-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? "กำลังดำเนินการ..." : "ยืนยันและดำเนินการต่อ"}
        </button>
      </div>
    </form>
  );
}
