"use client";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";

export default function RouteDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PublicPageFrame variant="detail" className="py-10 sm:py-14">
      <PublicErrorState
        title="โหลดรายละเอียดเส้นทางไม่สำเร็จ"
        description="ระบบยังดึงจุดแวะและแผนการเดินทางไม่ได้ในขณะนี้ กรุณาลองอีกครั้ง"
        action={<PublicButton onClick={reset}>ลองโหลดอีกครั้ง</PublicButton>}
      />
    </PublicPageFrame>
  );
}
