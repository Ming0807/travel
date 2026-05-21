import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface Props {
  status: "not_found" | "inactive" | "expired" | "unavailable";
}

export function CheckinUnavailable({ status }: { status: Props["status"] }) {
  let title = "เกิดข้อผิดพลาด";
  let message = "ไม่สามารถดำเนินการได้ในขณะนี้";

  if (status === "not_found") {
    title = "ไม่พบ QR Code นี้";
    message = "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ";
  } else if (status === "inactive") {
    title = "QR Code ยังไม่เปิดใช้งาน";
    message = "รหัสนี้ยังไม่เปิดใช้งาน หรือถูกปิดใช้งานแล้ว";
  } else if (status === "expired") {
    title = "QR Code หมดอายุแล้ว";
    message = "ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป";
  } else if (status === "unavailable") {
    title = "สถานที่ยังไม่เปิดให้เช็กอิน";
    message = "สถานที่นี้ถูกระงับหรือยังไม่พร้อมสำหรับการเช็กอิน";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto w-full px-6 text-center animate-in fade-in duration-500">
      <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <WarningCircle size={40} weight="fill" />
      </div>
      <h1 className="text-2xl font-semibold text-ink mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">{message}</p>
      
      <Link 
        href="/"
        className="w-full flex items-center justify-center py-4 bg-gray-100 text-ink rounded-2xl font-medium hover:bg-gray-200 transition-colors"
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
}
