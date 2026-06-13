import Image from "next/image";

export function HomepageCertificateCta({
  title = "รับแรงบันดาลใจการเดินทาง",
  subtitle = "ส่งตรงถึงคุณ",
  description = "สมัครรับข่าวสารเพื่อค้นพบสถานที่ใหม่ๆ โปรโมชั่นพิเศษ และเรื่องเล่าสุดเอ็กซ์คลูซีฟจากชายแดนใต้",
  bgImage = ""
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  bgImage?: string;
}) {
  const getImageUrl = (path?: string | null) => {
    const value = path?.trim();
    if (!value) return "";
    if (value.startsWith("http")) return value;
    if (value.startsWith("cloudinary:")) return `/api/media/image?path=${encodeURIComponent(value)}`;
    return `/site-media/${value}`;
  };

  const imgSrc = getImageUrl(bgImage);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-ink shadow-xl w-full h-[450px] flex items-center justify-center text-center px-4">
        {/* Background Image */}
        {imgSrc && (
          <Image
            className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-overlay"
            src={imgSrc}
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}

        {/* Decorative Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent opacity-80"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
            <span className="text-coral">✦</span> จดหมายข่าวสาร
          </div>

          <h2 className="text-4xl font-black text-white sm:text-5xl leading-[1.1] mb-6">
            {title}<br />
            {subtitle && <span className="font-['Playfair_Display'] italic font-normal text-coral">{subtitle}</span>}
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>

          <form className="flex flex-col sm:flex-row items-center justify-center w-full max-w-md mx-auto gap-3 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-2xl">
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              className="flex-1 w-full bg-white rounded-full px-6 py-3.5 text-sm text-ink outline-none border-none placeholder:text-muted/70 focus:ring-2 focus:ring-coral/50"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto rounded-full bg-coral px-8 py-3.5 text-sm font-bold text-white hover:bg-coral/90 transition-all shadow-md hover:-translate-y-0.5"
            >
              ติดตามเลย
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
