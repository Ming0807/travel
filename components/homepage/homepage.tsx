import Link from "next/link";
import Image from "next/image";
import {
  Sparkle,
  Heart,
  MapPin,
  AddressBook,
  QrCode,
  Certificate,
  Stamp,
  ChartLineUp,
  SquaresFour,
  Mountains,
  Mosque,
  TreeStructure,
  Compass,
  GlobeHemisphereEast,
  Gift,
  ShieldCheck,
  DeviceMobile,
  DownloadSimple,
  ShareNetwork,
  UsersThree,
  MapPinLine,
  Star,
  UserFocus,
  IdentificationCard,
  SignIn,
  ChartPieSlice,
  NewspaperClipping,
  ArrowRight,
  AirplaneTilt
} from "@phosphor-icons/react/dist/ssr";
import { homepageAttractions, dashboardPreviewMetrics, travelStories } from "./homepage-data";

export function Homepage() {
  return (
    <>
      {/* =========================
           DECORATIVE BACKGROUND
      ========================== */}
      <div className="fixed inset-0 -z-10 overflow-hidden soft-pattern">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#EFCB93]/35 blur-3xl"></div>
        <div className="absolute top-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-[#BFE4DE]/45 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#F2D8C8]/45 blur-3xl"></div>
      </div>

      {/* =========================
           HERO + RIGHT PANEL
      ========================== */}
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

      {/* =========================
           PROVINCE CHIPS
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-6">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          <button className="active-chip shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
            <SquaresFour className="mr-1 inline-block" size={16} /> ทั้งหมด
          </button>
          <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
            <Mountains className="mr-1 inline-block text-leaf" size={16} /> ยะลา
          </button>
          <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
            <Mosque className="mr-1 inline-block text-coral" size={16} /> ปัตตานี
          </button>
          <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
            <TreeStructure className="mr-1 inline-block text-blue-600" size={16} /> นราธิวาส
          </button>
          <button className="shrink-0 rounded-full bg-white/70 px-5 py-3 text-sm font-bold text-muted shadow-sm">
            <Compass className="mr-1 inline-block" size={16} /> เส้นทางแนะนำ
          </button>
        </div>
      </section>

      {/* =========================
           MASONRY FEED
      ========================== */}
      <section id="attractions" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-6 lg:py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-coral">Explore Feed</p>
            <h2 className="text-2xl font-extrabold lg:text-3xl">แรงบันดาลใจการท่องเที่ยว</h2>
          </div>
          <Link
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-teal shadow-sm hover:bg-teal hover:text-white sm:block"
            href="/attractions"
          >
            ดูทั้งหมด
          </Link>
        </div>

        <div className="masonry-feed">
          {homepageAttractions.map((attraction) => (
            <article
              key={attraction.slug}
              className="masonry-card overflow-hidden rounded-[1.5rem] bg-white shadow-card"
            >
              <div className="relative">
                <Image
                  src={attraction.imageUrl}
                  alt={attraction.imageAlt}
                  width={700}
                  height={500}
                  className="h-auto w-full"
                  unoptimized
                />
                {attraction.category === "Virtual tour" && (
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-teal shadow">
                    360°
                  </span>
                )}
                <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink backdrop-blur">
                  <Heart size={16} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-extrabold">{attraction.name}</h3>
                <p
                  className={`body-text text-xs ${
                    attraction.province === "ยะลา"
                      ? "text-leaf"
                      : attraction.province === "ปัตตานี"
                        ? "text-coral"
                        : "text-blue-600"
                  }`}
                >
                  {attraction.province}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================
           HOW IT WORKS
      ========================== */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="section-label">
              <Sparkle weight="fill" /> How it works
            </span>
            <h2 className="mt-4 text-3xl font-extrabold lg:text-4xl">
              ใช้งานง่ายเหมือนแอป แต่ไม่ต้องโหลดแอป
            </h2>
            <p className="body-text mt-3 max-w-2xl text-muted">
              ระบบออกแบบให้เริ่มจากการให้คุณค่าก่อน นักท่องเที่ยวกรอกน้อยที่สุด รับใบประกาศก่อน
              แล้วค่อยตอบข้อมูลเพิ่มเติมแบบสมัครใจ
            </p>
          </div>
          <button className="rounded-full bg-white px-5 py-3 text-sm font-bold text-teal shadow-sm hover:bg-teal hover:text-white">
            ดูตัวอย่าง Flow
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-card backdrop-blur-xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-tealSoft text-teal">
              <QrCode size={28} />
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">Step 01</p>
            <h3 className="mt-1 text-xl font-extrabold">Scan QR</h3>
            <p className="body-text mt-2 text-sm leading-6 text-muted">
              สแกน QR ที่จุดถ่ายรูป ระบบรู้ทันทีว่าอยู่จังหวัด สถานที่ และจุดเช็กอินใด
            </p>
          </article>

          <article className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-card backdrop-blur-xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF0E8] text-coral">
              <Image src="/camera-icon-placeholder" width={28} height={28} alt="" className="hidden" /> {/* Using Phosphor Image equivalent isn't perfect, I'll use another appropriate icon */}
              <DeviceMobile size={28} />
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">Step 02</p>
            <h3 className="mt-1 text-xl font-extrabold">Upload Photo</h3>
            <p className="body-text mt-2 text-sm leading-6 text-muted">
              กรอกชื่อที่ต้องการแสดง จังหวัด/ประเทศ ช่วงอายุ และอัปโหลดรูปสำหรับบัตรที่ระลึก
            </p>
          </article>

          <article className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-card backdrop-blur-xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF7E5] text-gold">
              <Certificate size={28} />
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">Step 03</p>
            <h3 className="mt-1 text-xl font-extrabold">Get Certificate</h3>
            <p className="body-text mt-2 text-sm leading-6 text-muted">
              ระบบสร้างใบประกาศดิจิทัลให้ดาวน์โหลดและแชร์ได้ โดยไม่บังคับ Login ก่อน
            </p>
          </article>

          <article className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-card backdrop-blur-xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-skySoft text-blue-600">
              <Stamp size={28} />
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-coral">Step 04</p>
            <h3 className="mt-1 text-xl font-extrabold">Collect Stamp</h3>
            <p className="body-text mt-2 text-sm leading-6 text-muted">
              รับตราประทับในพาสปอร์ต แล้วเลือกตอบ Micro Survey เพิ่มเติมเพื่อช่วยพัฒนาพื้นที่
            </p>
          </article>
        </div>
      </section>

      {/* =========================
           PROJECT OVERVIEW
      ========================== */}
      <section id="overview" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[2.4rem] bg-ink shadow-soft">
            <Image
              className="h-[420px] w-full object-cover opacity-80"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=85"
              alt="Map concept"
              width={1200}
              height={420}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-6 rounded-[1.6rem] border border-white/20 bg-white/15 p-5 text-white backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD7B5]">Project Area</p>
              <h3 className="mt-1 text-2xl font-extrabold">Yala · Pattani · Narathiwat</h3>
              <p className="body-text mt-2 text-sm leading-6 text-white/80">
                เชื่อมโยงข้อมูลจากจุดท่องเที่ยวจริง เพื่อใช้วางแผนพัฒนาการท่องเที่ยวชายแดนใต้อย่างยั่งยืน
              </p>
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-white bg-white/80 p-6 shadow-card backdrop-blur-xl lg:p-9">
            <span className="section-label">
              <GlobeHemisphereEast size={16} /> Why this platform matters
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight lg:text-5xl">
              เว็บท่องเที่ยวที่ไม่ได้แค่สวย<br className="hidden lg:block" />
              แต่สร้างฐานข้อมูลได้จริง
            </h2>
            <p className="body-text mt-5 text-base leading-8 text-muted">
              จุดแข็งของระบบคือเปลี่ยนการเก็บข้อมูลจาก “แบบสอบถามที่ผู้ใช้ไม่อยากกรอก”
              ให้กลายเป็นประสบการณ์ท่องเที่ยวที่นักท่องเที่ยวอยากทำ
              เพราะเขาได้รับใบประกาศและตราประทับเป็นของที่ระลึก
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-cream p-4">
                <Gift size={24} className="text-gold" />
                <h4 className="mt-2 font-extrabold">Reward-first</h4>
                <p className="body-text mt-1 text-sm text-muted">ให้คุณค่าก่อน แล้วค่อยชวนตอบข้อมูลเพิ่มเติม</p>
              </div>
              <div className="rounded-3xl bg-tealSoft p-4">
                <ShieldCheck size={24} className="text-teal" />
                <h4 className="mt-2 font-extrabold">Privacy-aware</h4>
                <p className="body-text mt-1 text-sm text-muted">ไม่ขอชื่อจริง เบอร์โทร หรือข้อมูลอ่อนไหวโดยไม่จำเป็น</p>
              </div>
              <div className="rounded-3xl bg-[#FFF0E8] p-4">
                <ChartLineUp size={24} className="text-coral" />
                <h4 className="mt-2 font-extrabold">Planning Data</h4>
                <p className="body-text mt-1 text-sm text-muted">ข้อมูลต่อยอดเป็น Dashboard และรายงานเชิงนโยบาย</p>
              </div>
              <div className="rounded-3xl bg-skySoft p-4">
                <DeviceMobile size={24} className="text-blue-600" />
                <h4 className="mt-2 font-extrabold">No App Install</h4>
                <p className="body-text mt-1 text-sm text-muted">ใช้ผ่านเว็บ/PWA เหมือนแอปบนมือถือ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           CERTIFICATE CTA
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-6">
        <div className="grid overflow-hidden rounded-[2rem] bg-teal shadow-soft lg:grid-cols-[1fr_0.8fr] lg:rounded-[2.7rem]">
          <div className="relative p-7 text-white lg:p-12">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
            <p className="relative inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-[#FFD7B5]">
              Reward-first Experience
            </p>
            <h2 className="relative mt-5 text-3xl font-extrabold leading-tight lg:text-5xl">
              สแกน QR รับใบประกาศ<br className="hidden sm:block" />และเริ่มสะสมตราประทับ
            </h2>
            <p className="body-text relative mt-5 max-w-xl text-base leading-7 text-white/80">
              ผู้ใช้ไม่ต้องโหลดแอป ไม่ต้อง Login ก่อน และไม่ต้องกรอกข้อมูลยาว ๆ เริ่มจากรับคุณค่าก่อน
              แล้วค่อยตอบแบบสอบถามเพิ่มเติมแบบสมัครใจ
            </p>

            <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-teal shadow-card hover:scale-[1.02]">
                จำลองดาวน์โหลดใบประกาศ
                <DownloadSimple size={20} />
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/15 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-xl hover:bg-white/25">
                แชร์ความทรงจำ
                <ShareNetwork size={20} />
              </button>
            </div>
          </div>

          <div className="relative grid place-items-center p-7 lg:p-12">
            <div className="relative w-full max-w-[310px] rotate-2 rounded-[2rem] bg-white p-4 shadow-soft transition hover:rotate-0">
              <div className="text-center">
                <Certificate weight="fill" size={36} className="mx-auto text-gold" />
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-coral">Travel Memory</p>
                <h3 className="text-xl font-extrabold text-teal">Digital Certificate</h3>
              </div>
              <div className="mt-4 overflow-hidden rounded-3xl">
                <Image
                  className="h-44 w-full object-cover"
                  src="https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?auto=format&fit=crop&w=600&q=85"
                  alt="Certificate image"
                  width={600}
                  height={200}
                  unoptimized
                />
              </div>
              <div className="p-4 text-center">
                <p className="body-text text-xs text-muted">This certifies that</p>
                <p className="mt-1 text-2xl font-extrabold">นักเดินทาง</p>
                <p className="body-text mt-1 text-xs text-muted">has visited</p>
                <p className="mt-1 font-bold text-teal">จุดชมวิวทะเลหมอกอัยเยอร์เวง</p>
                <p className="body-text mt-2 text-xs text-muted">Yala · 20 May 2026</p>
              </div>
              <div className="absolute -bottom-5 -right-5 grid h-20 w-20 place-items-center rounded-full bg-gold text-white shadow-card ring-4 ring-white">
                <div className="text-center">
                  <Stamp weight="fill" size={24} className="mx-auto" />
                  <p className="text-[10px] font-extrabold">YALA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           DASHBOARD PREVIEW
      ========================== */}
      <section id="dashboard" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-6 lg:py-16">
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold text-coral">Analytics Preview</p>
            <h2 className="text-3xl font-extrabold lg:text-4xl">ข้อมูลสำหรับวางแผนการท่องเที่ยว</h2>
            <p className="body-text mt-3 max-w-2xl text-muted">
              Dashboard ใช้ข้อมูลแบบรวม ไม่แสดงตัวตนส่วนบุคคล เพื่อช่วยวิเคราะห์นักท่องเที่ยว รูปแบบการเดินทาง
              ค่าใช้จ่าย ความพึงพอใจ และ funnel การใช้งาน
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block rounded-full border border-teal px-5 py-3 text-sm font-bold text-teal hover:bg-teal hover:text-white"
          >
            ดู Dashboard
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
            <UsersThree size={32} className="text-teal" />
            <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[0].label}</p>
            <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[0].value}</h3>
            <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[0].note}</p>
          </div>
          <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
            <MapPinLine size={32} className="text-coral" />
            <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[1].label}</p>
            <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[1].value}</h3>
            <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[1].note}</p>
          </div>
          <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
            <Certificate size={32} className="text-gold" />
            <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[2].label}</p>
            <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[2].value}</h3>
            <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[2].note}</p>
          </div>
          <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
            <Star size={32} className="text-leaf" />
            <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[3].label}</p>
            <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[3].value}</h3>
            <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[3].note}</p>
          </div>
        </div>
      </section>

      {/* =========================
           PRIVACY & TRUST
      ========================== */}
      <section id="privacy" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
        <div className="overflow-hidden rounded-[2.4rem] border border-white bg-white/80 shadow-card backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative bg-teal p-7 text-white lg:p-10 woven-pattern">
              <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold text-[#FFD7B5]">
                Privacy by Design
              </p>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight lg:text-4xl">
                กรอกน้อย ปลอดภัย<br />และเป็นทางเลือก
              </h2>
              <p className="body-text mt-4 text-base leading-7 text-white/80">
                ระบบใช้ชื่อที่ต้องการแสดงบนใบประกาศ ไม่บังคับชื่อจริง ไม่บังคับ LINE/Gmail
                และแบบสอบถามเป็น optional หลังได้รับรางวัลแล้ว
              </p>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:p-7">
              <div className="rounded-3xl bg-cream p-5">
                <UserFocus size={32} className="text-teal" />
                <h3 className="mt-3 font-extrabold">Display Name</h3>
                <p className="body-text mt-1 text-sm text-muted">ใช้ชื่อเล่น นามแฝง หรือชื่อจริงก็ได้</p>
              </div>
              <div className="rounded-3xl bg-cream p-5">
                <IdentificationCard size={32} className="text-coral" />
                <h3 className="mt-3 font-extrabold">No Sensitive ID</h3>
                <p className="body-text mt-1 text-sm text-muted">ไม่ขอเลขบัตรประชาชน พาสปอร์ต หรือที่อยู่เต็ม</p>
              </div>
              <div className="rounded-3xl bg-cream p-5">
                <SignIn size={32} className="text-gold" />
                <h3 className="mt-3 font-extrabold">Login Optional</h3>
                <p className="body-text mt-1 text-sm text-muted">
                  Guest ใช้งานได้ทันที Google/LINE ใช้เพื่อบันทึกพาสปอร์ต
                </p>
              </div>
              <div className="rounded-3xl bg-cream p-5">
                <ChartPieSlice size={32} className="text-leaf" />
                <h3 className="mt-3 font-extrabold">Aggregated Dashboard</h3>
                <p className="body-text mt-1 text-sm text-muted">
                  Dashboard ใช้ข้อมูลแบบรวม ไม่เปิดเผยข้อมูลส่วนตัว
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           TRAVEL STORIES
      ========================== */}
      <section id="stories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="section-label">
              <NewspaperClipping size={16} /> Travel Stories
            </span>
            <h2 className="mt-4 text-3xl font-extrabold lg:text-4xl">เรื่องเล่า เส้นทาง และแรงบันดาลใจ</h2>
            <p className="body-text mt-3 max-w-2xl text-muted">
              พื้นที่สำหรับบทความท่องเที่ยว เส้นทางแนะนำ อาหาร วัฒนธรรม และ 360° experience ที่เชื่อมกับสถานที่จริง
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {travelStories.map((story) => (
            <article key={story.slug} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
              <Image
                src={story.imageUrl}
                alt={story.imageAlt}
                width={800}
                height={200}
                className="h-52 w-full object-cover"
                unoptimized
              />
              <div className="p-5">
                <p className="text-xs font-extrabold text-coral">{story.category}</p>
                <h3 className="mt-2 text-lg font-extrabold">{story.title}</h3>
                <p className="body-text mt-2 text-sm text-muted">
                  รวมสถานที่และกิจกรรมที่น่าสนใจ ให้คุณวางแผนการเดินทางได้ง่ายขึ้น
                </p>
                <Link
                  href="#"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline"
                >
                  อ่านต่อ <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================
           DATA FLOW (from mockup lines 775-804)
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
        <div className="rounded-[2.4rem] bg-ink p-8 text-white shadow-soft lg:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold lg:text-4xl">The Data Journey</h2>
            <p className="body-text mt-3 text-white/70">
              ทุกขั้นตอนออกแบบมาเพื่อให้คุณค่าแก่นักท่องเที่ยวก่อน และสร้างข้อมูลที่เป็นประโยชน์ต่อพื้นที่
            </p>
          </div>
          
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-tealSoft">
                <QrCode size={32} />
              </div>
              <h3 className="mt-4 font-extrabold">1. QR Scan</h3>
              <p className="body-text mt-1 text-sm text-white/70">เข้าถึงง่ายจากจุดท่องเที่ยวจริง ไม่ต้องโหลดแอป</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-gold">
                <Certificate size={32} />
              </div>
              <h3 className="mt-4 font-extrabold">2. Certificate</h3>
              <p className="body-text mt-1 text-sm text-white/70">ของที่ระลึกดิจิทัลที่แชร์ได้ทันที</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-coral">
                <Stamp size={32} />
              </div>
              <h3 className="mt-4 font-extrabold">3. Stamp</h3>
              <p className="body-text mt-1 text-sm text-white/70">สะสมในพาสปอร์ตส่วนตัว</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-leaf">
                <ChartLineUp size={32} />
              </div>
              <h3 className="mt-4 font-extrabold">4. Survey</h3>
              <p className="body-text mt-1 text-sm text-white/70">ตอบแบบสอบถามสั้นๆ ช่วยพัฒนาพื้นที่</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           FOOTER
      ========================== */}
      <footer className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-6 lg:pb-10">
        <div className="overflow-hidden rounded-[2.4rem] bg-ink text-white shadow-soft">
          <div className="grid gap-8 p-7 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:p-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                  <Compass weight="fill" size={24} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FFD7B5]">
                    Southern Border
                  </p>
                  <h3 className="text-xl font-extrabold">Explorer</h3>
                </div>
              </div>
              <p className="body-text mt-5 max-w-md text-sm leading-7 text-white/70">
                แพลตฟอร์มข้อมูลนักท่องเที่ยวชายแดนใต้สำหรับการเก็บข้อมูลแบบ reward-first
                และการวิเคราะห์เพื่อพัฒนาการท่องเที่ยวอย่างยั่งยืน
              </p>
            </div>

            <div>
              <h4 className="font-extrabold">Explore</h4>
              <ul className="body-text mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <Link className="hover:text-white" href="#attractions">
                    สถานที่ท่องเที่ยว
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="#how-it-works">
                    วิธีใช้งาน
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="#stories">
                    เรื่องเล่า
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold">Platform</h4>
              <ul className="body-text mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <Link className="hover:text-white" href="#passport">
                    Digital Passport
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="#dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="#privacy">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold">Contact</h4>
              <ul className="body-text mt-4 space-y-3 text-sm text-white/70">
                <li>contact@southernborder.tourism</li>
                <li>Yala · Pattani · Narathiwat</li>
                <li>
                  <Link className="hover:text-white" href="/admin">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 px-7 py-5 lg:px-10">
            <div className="flex flex-col justify-between gap-3 text-xs text-white/55 sm:flex-row">
              <p>© 2026 Southern Border Tourism Data & Intelligence Platform.</p>
              <p>Privacy-first · QR Check-in · Digital Passport</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
