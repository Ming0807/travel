"use client";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";

export default function RestaurantDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PublicPageFrame variant="detail" className="py-10 sm:py-14">
      <PublicErrorState
        title="โหลดข้อมูลร้านอาหารไม่สำเร็จ"
        description="ระบบยังดึงข้อมูลร้านอาหารไม่ได้ในขณะนี้ กรุณาลองอีกครั้ง"
        action={<PublicButton onClick={reset}>ลองโหลดอีกครั้ง</PublicButton>}
      />
    </PublicPageFrame>
  );
}
