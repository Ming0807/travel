import Image from "next/image";

export function HomepageCertificateCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-ink shadow-sm w-full h-[400px] flex items-center justify-center text-center px-4">
        <Image
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80"
          alt="Landscape"
          fill
          unoptimized
        />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl leading-tight">
            รับแรงบันดาลใจการเดินทาง<br />ส่งตรงถึงคุณ
          </h2>
          <p className="mt-4 text-white/90 text-sm md:text-base">
            สมัครรับข่าวสารเพื่อค้นพบสถานที่ใหม่ๆ โปรโมชั่นพิเศษ และเรื่องเล่าสุดเอ็กซ์คลูซีฟ
          </p>
          
          <form className="mt-8 flex items-center justify-center max-w-md mx-auto gap-2 bg-white p-1.5 rounded-full shadow-lg">
            <input 
              type="email" 
              placeholder="กรอกอีเมลของคุณ" 
              className="flex-1 bg-transparent px-4 py-2 text-sm text-ink outline-none border-none placeholder:text-muted focus:ring-0"
              required
            />
            <button 
              type="submit"
              className="rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white hover:bg-[#D46549] transition-colors"
            >
              ติดตามข่าวสาร
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
