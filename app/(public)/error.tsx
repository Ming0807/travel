"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicEdgePage } from "@/components/public/PublicEdgePage";

export default function PublicError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicEdgePage
      code="500"
      tone="error"
      title="เปิดหน้านี้ไม่สำเร็จ"
      description="ระบบยังโหลดข้อมูลหน้านี้ไม่สำเร็จ คุณสามารถลองโหลดอีกครั้ง หรือกลับไปเริ่มจากหน้าแรกได้โดยข้อมูลที่บันทึกไว้ก่อนหน้านี้จะไม่ถูกเปิดเผยบนหน้านี้"
      icon={<WarningCircle size={24} weight="fill" aria-hidden="true" />}
      actions={
        <>
          <PublicButton onClick={reset}>ลองโหลดอีกครั้ง</PublicButton>
          <PublicButton href="/" variant="quiet">กลับหน้าแรก</PublicButton>
        </>
      }
    />
  );
}
