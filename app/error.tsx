"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicEdgePage } from "@/components/public/PublicEdgePage";

export default function GlobalError({
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
      title="ระบบขัดข้องชั่วคราว"
      description="ระบบไม่สามารถดำเนินการตามคำขอได้ในขณะนี้ กรุณาลองอีกครั้ง หากยังพบปัญหาให้กลับหน้าแรกแล้วเริ่มใหม่"
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
