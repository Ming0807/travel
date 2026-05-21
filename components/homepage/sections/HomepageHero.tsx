import Image from "next/image";
import Link from "next/link";

export function HomepageHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 pb-16 lg:pb-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        {/* Left: Text */}
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-[4.5rem] leading-[1.1]">
            ค้นพบความมหัศจรรย์<br />
            ที่ซ่อนเร้นแห่งชายแดนใต้<br />
            <span className="font-serif italic text-coral relative inline-block mt-2">
              Hidden
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-sand/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span> Wonders
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted body-text max-w-lg">
            ตามหาช่วงเวลาสุดพิเศษและสถานที่ที่ซ่อนเร้นเพื่อจุดประกายประสบการณ์ที่ไม่มีวันลืม จากการพบปะผู้คนไปจนถึงจุดหมายที่โดดเด่น เราจะช่วยให้คุณค้นพบเรื่องราวดีๆ ใน ยะลา ปัตตานี และนราธิวาส
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/attractions"
              className="rounded-full bg-coral px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#D46549] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
            >
              วางแผนการเดินทาง
            </Link>
          </div>
        </div>

        {/* Right: Image Collage */}
        <div className="relative flex justify-center lg:justify-end gap-4 h-[500px]">
          {/* Faint map background lines can be added here if needed via an SVG background, omitting for simplicity/cleanliness */}
          
          <div className="w-1/2 max-w-[240px] h-full relative overflow-hidden rounded-[2rem] shadow-card mt-8">
            <Image
              src="https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?auto=format&fit=crop&w=800&q=85"
              alt="Aiyerweng Skywalk"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          
          <div className="flex flex-col gap-4 w-1/2 max-w-[240px] h-full">
            <div className="relative h-[55%] w-full overflow-hidden rounded-[2rem] shadow-card">
              <Image
                src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=85"
                alt="Pattani Mosque"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative h-[45%] w-full overflow-hidden rounded-[2rem] shadow-card">
              <Image
                src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=85"
                alt="Yala Waterfall"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
