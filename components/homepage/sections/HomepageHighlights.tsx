import Image from "next/image";
import Link from "next/link";
import { Star, PlayCircle } from "@phosphor-icons/react/dist/ssr";

export function HomepageHighlights() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-ink/5 mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink">ประสบการณ์จากนักเดินทาง</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Testimonial Card */}
        <article className="flex flex-col justify-between bg-white rounded-3xl p-6 shadow-sm border border-ink/5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-sand overflow-hidden relative">
                <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" fill className="object-cover" unoptimized />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Maria Angelica</p>
                <p className="text-xs text-muted">มะนิลา, ฟิลิปปินส์</p>
              </div>
            </div>
            <div className="flex gap-1 text-gold mb-3">
              <Star weight="fill" size={14} />
              <Star weight="fill" size={14} />
              <Star weight="fill" size={14} />
              <Star weight="fill" size={14} />
              <Star weight="fill" size={14} />
            </div>
            <h3 className="text-sm font-bold text-ink mb-2">การเดินทางที่ลืมไม่ลงในยะลา</h3>
            <p className="body-text text-sm text-muted leading-relaxed line-clamp-5">
              ฉันไม่เคยคาดคิดเลยว่าชายแดนใต้จะสวยงามขนาดนี้ ทะเลหมอกที่อัยเยอร์เวงนั้นน่าทึ่งมาก ใบประกาศดิจิทัลที่ได้ก็เป็นสิ่งที่ช่วยให้ความทรงจำครั้งนี้พิเศษยิ่งขึ้น แนะนำสุดๆ สำหรับคนที่ชอบการผจญภัย!
            </p>
          </div>
        </article>

        {/* Video Card */}
        <article className="relative bg-ink rounded-3xl overflow-hidden shadow-sm aspect-square md:aspect-auto">
          <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" alt="Video cover" fill className="object-cover opacity-80" unoptimized />
          <div className="absolute inset-0 grid place-items-center">
            <button className="text-white hover:scale-110 transition-transform">
              <PlayCircle weight="fill" size={64} />
            </button>
          </div>
        </article>

        {/* Image Card */}
        <article className="flex flex-col bg-white rounded-3xl p-4 shadow-sm border border-ink/5">
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-4">
            <Image src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80" alt="Market" fill className="object-cover" unoptimized />
          </div>
          <p className="text-sm font-bold text-ink text-center mt-1">ตลาดน้ำเมืองปัตตานี</p>
          <div className="mt-4 flex justify-center pb-2">
            <Link href="/attractions" className="inline-flex rounded-full border border-ink/20 px-5 py-2 text-xs font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
              ดูไฮไลท์เพิ่มเติม
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
