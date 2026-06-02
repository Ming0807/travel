import Link from "next/link";
import { submitPostCertificateSurveyAction } from "@/app/actions/survey-actions";

type Option = {
  [key: string]: unknown;
  display_order?: number | null;
};

type SurveyOptions = {
  travelCompanions: Option[];
  transportModes: Option[];
  travelPurposes: Option[];
  expenseCategories: Option[];
  spendingRanges: Option[];
};

function optionLabel(option: Option, thKey = "name_th", enKey = "name_en") {
  return String(option[thKey] || option[enKey] || "ตัวเลือก");
}

function optionValue(option: Option, key: string) {
  return String(option[key] || "");
}

function OptionGrid({
  name,
  options,
  valueKey,
  thKey,
  enKey
}: {
  name: string;
  options: Option[];
  valueKey: string;
  thKey?: string;
  enKey?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <label
          key={optionValue(option, valueKey)}
          className="cursor-pointer rounded-2xl border border-white bg-white px-3 py-3 text-center text-sm font-semibold text-ink shadow-sm has-[:checked]:border-teal has-[:checked]:bg-teal has-[:checked]:text-white"
        >
          <input className="sr-only" type="radio" name={name} value={optionValue(option, valueKey)} />
          {optionLabel(option, thKey, enKey)}
        </label>
      ))}
    </div>
  );
}

function RatingGroup({ name, label }: { name: string; label: string }) {
  return (
    <fieldset className="rounded-3xl bg-white p-4 shadow-sm">
      <legend className="mb-3 text-sm font-bold text-ink">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <label
            key={score}
            className="cursor-pointer rounded-2xl border border-teal/10 bg-tealSoft px-2 py-3 text-center text-sm font-black text-teal has-[:checked]:border-gold has-[:checked]:bg-gold has-[:checked]:text-ink"
          >
            <input className="sr-only" type="radio" name={name} value={score} />
            {score}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MicroSurveyForm({
  visitId,
  options,
  error
}: {
  visitId: string;
  options: SurveyOptions;
  error?: string;
}) {
  return (
    <form action={submitPostCertificateSurveyAction} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <input type="hidden" name="visitId" value={visitId} />

      {error ? (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-medium text-coral">
          ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง หรือเลือกข้ามแบบสอบถาม
        </div>
      ) : null}

      <section className="rounded-2xl bg-white/70 p-4 shadow-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <h2 className="text-lg font-black text-ink">การเดินทาง</h2>
        <p className="mt-1 text-sm text-muted">ตอบเท่าที่สะดวก ข้อมูลนี้ช่วยวางแผนการท่องเที่ยวภาพรวม</p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold text-ink">เดินทางมากับใคร</p>
            <OptionGrid name="travelCompanionId" options={options.travelCompanions} valueKey="travel_companion_id" />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">จำนวนคนในกลุ่ม</span>
            <input
              name="groupSize"
              inputMode="numeric"
              min={1}
              max={100}
              type="number"
              className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-ink shadow-sm outline-none focus:border-teal"
              placeholder="เช่น 2"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">เดินทางมาด้วยวิธีใด</p>
            <OptionGrid name="transportModeId" options={options.transportModes} valueKey="transport_mode_id" />
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">วัตถุประสงค์หลัก</p>
            <OptionGrid name="travelPurposeId" options={options.travelPurposes} valueKey="travel_purpose_id" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/70 p-4 shadow-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <h2 className="text-lg font-black text-ink">การพักค้างและค่าใช้จ่าย</h2>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold text-ink">ทริปนี้พักค้างคืนหรือไม่</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["same_day", "ไป-กลับ"],
                ["overnight", "ค้างคืน"],
                ["unknown", "ไม่ระบุ"]
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-2xl border border-white bg-white px-3 py-3 text-center text-sm font-semibold text-ink shadow-sm has-[:checked]:border-teal has-[:checked]:bg-teal has-[:checked]:text-white"
                >
                  <input className="sr-only" type="radio" name="overnightStatus" value={value} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">จำนวนคืน (ถ้ามี)</span>
            <input
              name="nightsCount"
              inputMode="numeric"
              min={0}
              max={60}
              type="number"
              className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-ink shadow-sm outline-none focus:border-teal"
              placeholder="เช่น 1"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">ค่าใช้จ่ายโดยประมาณ</p>
            <OptionGrid
              name="spendingRangeId"
              options={options.spendingRanges}
              valueKey="spending_range_id"
              thKey="range_label_th"
              enKey="range_label_en"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">ใช้จ่ายกับหมวดใดมากที่สุด</p>
            <OptionGrid name="expenseCategoryId" options={options.expenseCategories} valueKey="expense_category_id" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/70 p-4 shadow-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
        <h2 className="text-lg font-black text-ink">ความพึงพอใจ</h2>
        <p className="mt-1 text-sm text-muted">คะแนนที่ไม่ตอบจะถูกเก็บเป็น No data ไม่ใช่ 0</p>

        <div className="mt-4 space-y-3">
          <RatingGroup name="overallSatisfaction" label="ความพึงพอใจโดยรวม" />
          <RatingGroup name="safetyScore" label="ความรู้สึกปลอดภัย" />
          <RatingGroup name="cleanlinessScore" label="ความสะอาด" />
          <RatingGroup name="accessibilityScore" label="การเข้าถึง/เดินทางสะดวก" />
          <RatingGroup name="informationScore" label="ข้อมูลและป้ายบอกทาง" />
          <RatingGroup name="valueScore" label="ความคุ้มค่า" />

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["revisitIntention", "อยากกลับมาอีกไหม"],
              ["recommendIntention", "จะแนะนำให้ผู้อื่นไหม"]
            ].map(([name, label]) => (
              <fieldset key={name} className="rounded-3xl bg-white p-4 shadow-sm">
                <legend className="mb-3 text-sm font-bold text-ink">{label}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["yes", "ใช่"],
                    ["maybe", "ไม่แน่ใจ"],
                    ["no", "ไม่"]
                  ].map(([value, text]) => (
                    <label
                      key={value}
                      className="cursor-pointer rounded-2xl border border-teal/10 bg-tealSoft px-2 py-3 text-center text-xs font-bold text-teal has-[:checked]:border-gold has-[:checked]:bg-gold has-[:checked]:text-ink"
                    >
                      <input className="sr-only" type="radio" name={name} value={value} />
                      {text}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">ความคิดเห็นเพิ่มเติม (ไม่บังคับ)</span>
            <textarea
              name="optionalComment"
              maxLength={1000}
              rows={4}
              className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-ink shadow-sm outline-none focus:border-teal"
              placeholder="ข้อเสนอแนะสั้น ๆ สำหรับการพัฒนาสถานที่"
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-[calc(92px+env(safe-area-inset-bottom))] z-20 rounded-xl bg-white/90 p-3 shadow-soft backdrop-blur lg:static lg:shadow-none">
        <button
          type="submit"
          className="w-full rounded-full bg-teal px-5 py-4 font-black text-white shadow-lg shadow-teal/20"
        >
          ส่งคำตอบ
        </button>
        <Link href={`/visit/${visitId}/certificate/success`} className="mt-3 block text-center text-sm font-bold text-teal">
          กลับไปหน้าใบประกาศ
        </Link>
      </div>
    </form>
  );
}
