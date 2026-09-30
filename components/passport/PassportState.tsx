import { Compass, MapPin, Warning } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";

export function PassportState({ error = false }: { error?: boolean }) {
  return (
    <section className="passport-state" aria-labelledby="passport-state-heading">
      {error ? <Warning size={36} aria-hidden="true" /> : <Compass size={40} weight="duotone" aria-hidden="true" />}
      <p className="passport-eyebrow">{error ? "ลองอีกครั้งได้" : "ความทรงจำบทแรก"}</p>
      <h2 id="passport-state-heading">{error ? "ยังเปิดพาสปอร์ตไม่ได้" : "เริ่มสะสมความทรงจำจากยะลา"}</h2>
      <p>{error ? "ระบบอาจขัดข้องชั่วคราว ลองโหลดพาสปอร์ตอีกครั้ง" : "สแกน QR ที่จุดท่องเที่ยวที่เข้าร่วม บันทึกการเดินทางและสร้างใบประกาศเพื่อรับตราประทับ คุณเริ่มต้นแบบผู้เยี่ยมชมได้"}</p>
      <div className="passport-state-actions">
        <PublicButton href={error ? "/passport" : "/attractions"}>{error ? "ลองเปิดพาสปอร์ตอีกครั้ง" : <><MapPin size={18} aria-hidden="true" /> ดูจุดท่องเที่ยว</>}</PublicButton>
        <PublicButton href={error ? "/" : "/checkin/try"} variant="secondary">{error ? "กลับหน้าหลัก" : "วิธีสะสมตราประทับ"}</PublicButton>
      </div>
    </section>
  );
}
