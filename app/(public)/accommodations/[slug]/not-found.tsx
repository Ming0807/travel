import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicEmptyState } from "@/components/public/PublicStates";

export default function AccommodationDetailNotFound() {
  return (
    <PublicPageFrame variant="detail" className="py-10 sm:py-14">
      <PublicEmptyState
        title="ไม่พบที่พักนี้"
        description="ที่พักอาจยังไม่เผยแพร่ ถูกปิดใช้งาน หรืออยู่นอกพื้นที่ที่เปิดให้บริการ"
        action={<PublicButton href="/accommodations">กลับไปดูที่พัก</PublicButton>}
      />
    </PublicPageFrame>
  );
}
