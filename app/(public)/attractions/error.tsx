"use client";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";

export default function AttractionsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicPageFrame variant="listing" className="py-10 sm:py-14">
      <PublicErrorState
        title="โหลดสถานที่ท่องเที่ยวไม่สำเร็จ"
        description="ระบบยังดึงข้อมูลสถานที่ไม่ได้ในขณะนี้ กรุณาลองโหลดอีกครั้ง"
        action={(
          <PublicButton onClick={reset}>
            ลองโหลดอีกครั้ง
          </PublicButton>
        )}
      />
    </PublicPageFrame>
  );
}
