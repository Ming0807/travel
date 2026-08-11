import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicEmptyState } from "@/components/public/PublicStates";

export default function RestaurantDetailNotFound() {
  return (
    <PublicPageFrame variant="detail" className="py-10 sm:py-14">
      <PublicEmptyState
        title="ไม่พบร้านอาหารนี้"
        description="ร้านอาจยังไม่เผยแพร่ ถูกปิดใช้งาน หรืออยู่นอกพื้นที่ที่เปิดให้บริการ"
        action={<PublicButton href="/restaurants">กลับไปดูร้านอาหาร</PublicButton>}
      />
    </PublicPageFrame>
  );
}
