import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";

export function HomepageHero({
  title = "ค้นพบ ความมหัศจรรย์ ที่ซ่อนเร้น",
  subtitle = "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์",
  description = "ตามหาช่วงเวลาสุดพิเศษและสถานที่ที่ซ่อนเร้นเพื่อจุดประกายประสบการณ์ที่ไม่มีวันลืม ในยะลา ปัตตานี และนราธิวาส",
  images = [
    "",
    "",
    ""
  ]
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  images?: string[];
}) {
  const getImageUrl = (path: string | undefined) => {
    const value = path?.trim();
    if (!value) return "";
    if (value.startsWith("http")) return value;
    return `/api/media/image?path=${encodeURIComponent(value)}`;
  };

  const img0 = getImageUrl(images?.[0]);
  const img1 = getImageUrl(images?.[1]);
  const img2 = getImageUrl(images?.[2]);

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pb-40 text-ink">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#F2EFE8] rounded-full blur-[100px] -z-10 opacity-70"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Text Content (Col 1-6) */}
          <div className="lg:col-span-6 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-coral/20 text-coral text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-coral animate-pulse"></span>
              {subtitle}
            </div>
            
            <h1 className="text-5xl md:text-6xl xl:text-[5.5rem] font-black tracking-tight leading-[1.05] text-ink mb-6" dangerouslySetInnerHTML={{ __html: title.replace('ความมหัศจรรย์', `<span class="font-['Playfair_Display'] italic text-coral font-light">ความมหัศจรรย์</span>`).replace('\n', '<br />') }} />
            
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-muted max-w-lg font-medium">
              {description}
            </p>
            
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/attractions"
                className="group flex items-center justify-center gap-2 rounded-full bg-coral px-8 py-4 text-sm font-bold text-white shadow-lg shadow-coral/30 hover:bg-coral/90 hover:-translate-y-1 transition-all duration-300"
              >
                เริ่มวางแผนทริป
                <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/360-vista"
                className="flex items-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-bold text-ink shadow-sm border border-ink/5 hover:bg-cream transition-colors duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink">
                  <Play weight="fill" size={12} />
                </div>
                ชมบรรยากาศ 360°
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm font-bold text-muted">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-leaf text-white flex items-center justify-center text-xs font-black">SB</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-teal text-white flex items-center justify-center text-xs font-black">QR</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-gold text-ink flex items-center justify-center text-xs font-black">AI</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-coral text-white flex items-center justify-center text-xs font-black">+5k</div>
              </div>
              <p>นักเดินทางที่ร่วมค้นพบสิ่งใหม่ๆ กับเรา</p>
            </div>
          </div>

          {/* Right: Premium Image Collage (Col 7-12) */}
          <div className="lg:col-span-6 relative h-[500px] md:h-[600px] w-full mt-10 lg:mt-0">
            {/* Main Center Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80%] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white z-20 bg-cream">
              {img0 ? (
                <Image
                  src={img0}
                  alt="Highlight 1"
                  fill
                  priority
                  className="object-cover scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-sand text-center text-xs font-bold uppercase tracking-widest text-muted">
                  Hero image not added
                </div>
              )}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold shadow-sm">
                📍 จุดเช็กอินยอดฮิต
              </div>
            </div>
            
            {/* Top Right Floating Image */}
            <div className="absolute top-0 right-0 w-[40%] h-[45%] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-10 hidden md:block bg-cream">
              {img1 && <Image
                src={img1}
                alt="Highlight 2"
                fill
                className="object-cover"
                unoptimized
              />}
            </div>
            
            {/* Bottom Left Floating Image */}
            <div className="absolute bottom-0 left-0 w-[45%] h-[40%] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-30 hidden md:block bg-cream">
              {img2 && <Image
                src={img2}
                alt="Highlight 3"
                fill
                className="object-cover"
                unoptimized
              />}
            </div>
            
            {/* Decorative Element */}
            <div className="absolute top-1/4 -right-4 w-24 h-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNFMTg4NjgiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] z-0 hidden lg:block opacity-60"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
