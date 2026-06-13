import Image from "next/image";
import Link from "next/link";
import { Star, PlayCircle } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export function HomepageHighlights({
  title = "ประสบการณ์จากนักเดินทาง",
  authorName = "Maria Angelica",
  location = "มะนิลา, ฟิลิปปินส์",
  quote = "ฉันไม่เคยคาดคิดเลยว่าชายแดนใต้จะสวยงามขนาดนี้ ทะเลหมอกที่อัยเยอร์เวงนั้นน่าทึ่งมาก ใบประกาศดิจิทัลที่ได้ก็เป็นสิ่งที่ช่วยให้ความทรงจำครั้งนี้พิเศษยิ่งขึ้น แนะนำสุดๆ สำหรับคนที่ชอบการผจญภัย!",
  videoCover = "",
  imageCover = "",
  imageTitle = "ตลาดน้ำเมืองปัตตานี"
}: {
  title?: string;
  authorName?: string;
  location?: string;
  quote?: string;
  videoCover?: string;
  imageCover?: string;
  imageTitle?: string;
}) {
  const getImageUrl = (path?: string | null) => {
    return siteMediaImageUrl(path) ?? "";
  };

  const videoSrc = getImageUrl(videoCover);
  const imageSrc = getImageUrl(imageCover);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-ink/5 mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Testimonial Card */}
        <article className="flex flex-col justify-between bg-white rounded-2xl p-6 border border-ink/5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-leaf text-white overflow-hidden relative flex items-center justify-center text-sm font-black">
                {(authorName || "T").slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{authorName}</p>
                <p className="text-xs text-muted">{location}</p>
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
              {quote}
            </p>
          </div>
        </article>

        {/* Video Card */}
        <article className="relative bg-ink rounded-2xl overflow-hidden shadow-sm aspect-square md:aspect-auto">
          {videoSrc ? (
            <Image src={videoSrc} alt="" fill className="object-cover opacity-80" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="absolute inset-0 bg-slate-800 opacity-80" />
          )}
          <div className="absolute inset-0 grid place-items-center">
            <button className="text-white hover:scale-110 transition-transform">
              <PlayCircle weight="fill" size={64} />
            </button>
          </div>
        </article>

        {/* Image Card */}
        <article className="flex flex-col bg-white rounded-2xl p-4 border border-ink/5">
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-4 bg-slate-100">
            {imageSrc ? (
              <Image src={imageSrc} alt="Market" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-sand text-center text-xs font-bold uppercase tracking-widest text-muted">
                ยังไม่มีรูปภาพ
              </div>
            )}
          </div>
          <p className="text-sm font-bold text-ink text-center mt-1">{imageTitle}</p>
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
