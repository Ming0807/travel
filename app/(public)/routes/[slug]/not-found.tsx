import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicEmptyState } from "@/components/public/PublicStates";

export default function RouteDetailNotFound() {
  return (
    <PublicPageFrame variant="detail" className="py-10 sm:py-14">
      <PublicEmptyState
        title="ไม่พบเส้นทางนี้"
        description="เส้นทางอาจยังไม่เผยแพร่ มีจุดแวะที่ไม่พร้อมใช้งาน หรืออยู่นอกพื้นที่ที่เปิดให้บริการ"
        action={<PublicButton href="/routes">กลับไปดูเส้นทางแนะนำ</PublicButton>}
      />
    </PublicPageFrame>
  );
}
