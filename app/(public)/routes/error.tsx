"use client";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";

export default function RoutesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PublicPageFrame variant="listing" className="py-10 sm:py-14">
      <PublicErrorState
        title="โหลดเส้นทางท่องเที่ยวไม่สำเร็จ"
        description="ระบบยังดึงข้อมูลเส้นทางไม่ได้ในขณะนี้ ข้อมูลไม่ได้ถูกแสดงเป็นรายการว่างเพื่อป้องกันความเข้าใจผิด"
        action={<PublicButton onClick={reset}>ลองโหลดอีกครั้ง</PublicButton>}
      />
    </PublicPageFrame>
  );
}
