"use client";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";

export default function Vista360Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PublicPageFrame variant="listing" className="py-10 sm:py-14">
      <PublicErrorState
        title="โหลดรายการ 360° ไม่สำเร็จ"
        description="ระบบยังตรวจสอบสื่อที่เผยแพร่ไม่ได้ในขณะนี้ กรุณาลองโหลดอีกครั้ง"
        action={<PublicButton onClick={reset}>ลองโหลดอีกครั้ง</PublicButton>}
      />
    </PublicPageFrame>
  );
}
