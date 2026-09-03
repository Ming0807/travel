import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NoDataState } from "@/components/dashboard/NoDataState";

type FailureCode = "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "QUERY_FAILED";

const FAILURE_COPY: Record<FailureCode, { title: string; description: string; detail: string }> = {
  VALIDATION_ERROR: {
    title: "ตัวกรองไม่ถูกต้อง",
    description: "ระบบไม่ได้เปลี่ยนขอบเขตข้อมูล กรุณาตรวจสอบค่าที่เลือก",
    detail: "กรุณาตรวจสอบช่วงวันที่และค่าตัวกรอง แล้วลองอัปเดตข้อมูลอีกครั้ง",
  },
  UNAUTHORIZED: {
    title: "กรุณาเข้าสู่ระบบอีกครั้ง",
    description: "เซสชันผู้ดูแลระบบไม่พร้อมสำหรับเปิดข้อมูลวิเคราะห์",
    detail: "เข้าสู่ระบบด้วยบัญชีผู้ดูแล แล้วกลับมาเปิดหน้าวิเคราะห์อีกครั้ง",
  },
  FORBIDDEN: {
    title: "ไม่มีสิทธิ์ดูข้อมูลส่วนนี้",
    description: "บัญชีนี้ไม่มีสิทธิ์อ่าน Dashboard ตามบทบาทที่กำหนด",
    detail: "ติดต่อผู้ดูแลสิทธิ์หากหน้าที่ของคุณจำเป็นต้องใช้ข้อมูลส่วนนี้",
  },
  QUERY_FAILED: {
    title: "ข้อมูลวิเคราะห์ไม่พร้อมใช้งานชั่วคราว",
    description: "ระบบยังเปิดผลวิเคราะห์รอบนี้ไม่ได้ แต่ข้อมูลเดิมไม่ได้ถูกลบ",
    detail: "ลองรีเฟรชอีกครั้ง หากยังไม่สำเร็จให้ตรวจสถานะฐานข้อมูลและช่วงวันที่ที่เลือก",
  },
};

function failureCode(error: unknown): FailureCode {
  if (error && typeof error === "object" && "code" in error) {
    const code = String(error.code);
    if (code in FAILURE_COPY) return code as FailureCode;
  }
  return "QUERY_FAILED";
}

export function DashboardPageFailure({ error }: { error: unknown }) {
  const copy = FAILURE_COPY[failureCode(error)];

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="ศูนย์วิเคราะห์ข้อมูล" title={copy.title} description={copy.description} />
      <NoDataState title="วิธีดำเนินการ" description={copy.detail} />
    </div>
  );
}
