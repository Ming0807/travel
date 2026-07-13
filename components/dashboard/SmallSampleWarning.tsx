import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";

export function SmallSampleWarning({
  count,
  threshold = DASHBOARD_MIN_SAMPLE_SIZE,
  label = "คำตอบ",
}: {
  count: number;
  threshold?: number;
  label?: string;
}) {
  if (count >= threshold) return null;

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
      <div className="flex items-start gap-2.5">
        <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" weight="fill" />
        <div>
          <p className="font-bold text-amber-900">กลุ่มตัวอย่างยังน้อย</p>
          <p className="mt-0.5 leading-5 text-amber-700">
            สรุปจาก {count.toLocaleString("th-TH")} {label} แนวโน้มอาจเปลี่ยนเมื่อมีข้อมูลเพิ่ม
            {count === 0
              ? " จึงยังไม่ควรสรุปผล"
              : " โปรดใช้ประกอบการพิจารณาอย่างระมัดระวัง"}
          </p>
        </div>
      </div>
    </div>
  );
}
