import Image from "next/image";
import Link from "next/link";
import { Sparkle, Heart, MapPin, AddressBook, QrCode, Certificate, Stamp, ChartLineUp, AirplaneTilt } from "@phosphor-icons/react/dist/ssr";

export function HomepageHero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 pt-5 sm:px-6 lg:grid-cols-[1.65fr_0.85fr] lg:px-6 lg:pt-8">
      {/* Hero */}
      <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-ink shadow-soft lg:min-h-[520px] lg:rounded-[2.5rem]">
        <Image
          className="absolute inset-0 h-full w-full object-cover opacity-75"
          src="https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1800&q=85"
          alt="Southern Thailand coast"
          fill
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10"></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent"></div>

        <div className="relative flex h-full min-h-[380px] flex-col justify-between p-6 lg:min-h-[520px] lg:p-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
              <Sparkle weight="fill" className="text-gold" />
              Tourism Passport · ไม่ต้องโหลดแอป
            </span>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-xl hover:bg-white/25">
              <Heart size={20} />
            </button>
          </div>

          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-7xl">
              Discover the<br />
              <span className="text-[#BDE7D7]">Southern Border</span>
            </h2>
            <p className="mt-3 text-lg font-semibold text-[#FFD7B5] lg:text-2xl">
              Yala · Pattani · Narathiwat
            </p>
            <p className="body-text mt-4 max-w-xl text-base leading-7 text-white/85 lg:text-lg">
              สำรวจธรรมชาติ วัฒนธรรม อาหาร และเรื่องราวท้องถิ่น
              พร้อมรับใบประกาศดิจิทัลและสะสมตราประทับจากทุกจุดที่คุณไปเยือน
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#attractions"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-teal shadow-card hover:scale-[1.02]"
              >
                สำรวจสถานที่
                <MapPin size={20} />
              </Link>
              <button
                id="heroPassportBtn"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl hover:bg-white/25"
              >
                ดูพาสปอร์ต
                <AddressBook size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side cards */}
      <aside className="grid gap-5">
        <div className="rounded-[2rem] border border-white bg-white/80 p-5 shadow-card backdrop-blur-xl">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-coral">Scan QR to get your</p>
              <h3 className="mt-1 text-2xl font-extrabold text-teal">Digital Certificate</h3>
              <p className="body-text mt-2 text-sm text-muted">
                สแกน QR ณ จุดถ่ายรูป แล้วรับบัตรที่ระลึกของคุณได้ทันที
              </p>
              <Link
                href="/checkin/demo-code"
                className="mt-4 inline-block rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-glow hover:bg-[#064E52]"
              >
                Scan Now
              </Link>
            </div>
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl border border-[#EADBC5] bg-cream p-3">
              <div className="grid h-full w-full place-items-center rounded-2xl bg-white text-5xl text-ink">
                <QrCode size={48} />
              </div>
            </div>
          </div>
        </div>

        <div
          id="passport"
          className="rounded-[2rem] border border-white bg-white/80 p-5 shadow-card backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold">My Passport</h3>
              <p className="body-text text-sm text-muted">สะสมความทรงจำ หนึ่งตราต่อหนึ่งสถานที่</p>
            </div>
            <span className="rounded-full bg-tealSoft px-3 py-1 text-sm font-bold text-teal">
              7 / 45
            </span>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F7EAD5] text-gold ring-4 ring-white">
                <Stamp weight="fill" size={24} />
              </div>
              <p className="mt-2 text-xs font-bold">Yala</p>
              <p className="text-[11px] text-muted">3/15</p>
            </div>
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FFE6DD] text-coral ring-4 ring-white">
                <Stamp weight="fill" size={24} />
              </div>
              <p className="mt-2 text-xs font-bold">Pattani</p>
              <p className="text-[11px] text-muted">2/15</p>
            </div>
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-skySoft text-blue-600 ring-4 ring-white">
                <Stamp weight="fill" size={24} />
              </div>
              <p className="mt-2 text-xs font-bold">Narathiwat</p>
              <p className="text-[11px] text-muted">2/15</p>
            </div>
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-dashed border-slate-300 bg-white text-muted">
                <AirplaneTilt size={24} />
              </div>
              <p className="mt-2 text-xs font-bold">Next</p>
              <p className="text-[11px] text-muted">ดูทั้งหมด</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-[2rem] border border-white bg-white/80 p-4 shadow-card backdrop-blur-xl">
          <div className="text-center">
            <QrCode size={24} className="mx-auto text-teal" />
            <p className="mt-1 text-[11px] font-bold">Check-in</p>
            <p className="body-text text-[10px] text-muted">ง่าย รวดเร็ว</p>
          </div>
          <div className="text-center">
            <Certificate size={24} className="mx-auto text-gold" />
            <p className="mt-1 text-[11px] font-bold">Certificate</p>
            <p className="body-text text-[10px] text-muted">ได้ทันที</p>
          </div>
          <div className="text-center">
            <Stamp size={24} className="mx-auto text-coral" />
            <p className="mt-1 text-[11px] font-bold">Stamps</p>
            <p className="body-text text-[10px] text-muted">สะสมได้</p>
          </div>
          <div className="text-center">
            <ChartLineUp size={24} className="mx-auto text-leaf" />
            <p className="mt-1 text-[11px] font-bold">Survey</p>
            <p className="body-text text-[10px] text-muted">สมัครใจ</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
