"use client";

import { 
  EnvelopeSimple, 
  Phone, 
  MapPin, 
  Clock, 
  PaperPlaneRight,
  Airplane,
  CaretDown,
  InstagramLogo,
  FacebookLogo,
  YoutubeLogo,
  PinterestLogo,
  Envelope
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useState } from "react";

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const faqs = [
    {
      question: "การรับใบประกาศดิจิทัลต้องทำอย่างไร?",
      answer: "คุณสามารถสแกน QR Code ตามจุดถ่ายภาพและแหล่งท่องเที่ยวต่างๆ แล้วเข้าสู่ระบบผ่าน LINE หรือ ใช้งานแบบ Guest เพื่ออัปโหลดรูปภาพ ระบบจะสร้างใบประกาศพร้อมชื่อของคุณให้ทันที"
    },
    {
      question: "หากสะสมตราประทับครบจะได้รางวัลอะไรไหม?",
      answer: "แน่นอน! เมื่อคุณสะสมตราประทับได้ครบตามเป้าหมายของแต่ละจังหวัด คุณสามารถนำไปแลกรับของที่ระลึกพิเศษได้ที่สำนักงานการท่องเที่ยวในจังหวัดนั้นๆ หรือร้านค้าที่ร่วมรายการ"
    },
    {
      question: "ต้องการติดต่อเรื่องการเพิ่มจุด Check-in ใหม่?",
      answer: "เรายินดีต้อนรับพันธมิตรใหม่เสมอ กรุณาส่งอีเมลถึงเราหรือติดต่อผ่านเบอร์โทรศัพท์ที่แสดงไว้ พร้อมแจ้งรายละเอียดสถานที่ของคุณให้เราทราบ"
    }
  ];

  return (
    <div className="bg-background min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        
        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start mb-24">
          <div className="lg:w-1/2 pt-8">
            <p className="text-coral font-bold tracking-widest text-xs uppercase mb-4">
              เรายินดีรับฟังจากคุณ
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-ink mb-6">ติดต่อเรา</h1>
            <p className="text-muted leading-relaxed text-lg max-w-md mb-8">
              มีข้อสงสัย ต้องการคำแนะนำเรื่องการท่องเที่ยว หรืออยากให้เราช่วยวางแผนทริปครั้งต่อไป? ทีมงานของเราพร้อมช่วยเหลือคุณเสมอ
            </p>
            <button className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-coral/90 transition-all">
              ส่งข้อความหาเรา <Airplane weight="fill" />
            </button>
            
            {/* Dashed line decorative SVG */}
            <div className="mt-8 opacity-40">
              <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 59C20.5 59 40 45.5 54.5 35C74.3989 20.5901 95 10 120 10C148 10 170 25 190 40" stroke="#E18868" strokeWidth="2" strokeDasharray="6 6"/>
                <path d="M185 30L195 45L175 48" stroke="#E18868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative h-[400px] w-full">
            {/* Background Map Graphic (Optional - simulated with light shape) */}
            <div className="absolute top-0 right-10 w-[400px] h-[350px] bg-[#F2EFE8] rounded-3xl -z-10 opacity-70" style={{ clipPath: 'polygon(10% 0, 100% 10%, 90% 100%, 0 90%)' }}></div>
            
            <div className="absolute top-4 right-32 w-64 h-72 rounded-2xl overflow-hidden shadow-xl border-4 border-background z-10 bg-white">
              <div className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,#F8EDE7_0%,#F7F3EA_55%,#E9F0EC_100%)] p-6">
                <EnvelopeSimple size={40} weight="fill" className="text-coral" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Contact desk</p>
                  <div className="mt-5 space-y-3">
                    <span className="block h-3 w-32 rounded-full bg-white/80" />
                    <span className="block h-3 w-24 rounded-full bg-white/60" />
                    <span className="block h-3 w-36 rounded-full bg-white/70" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 w-56 h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-background z-20 bg-[#EAF2F0] p-5">
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-teal/20 bg-white/55 text-center">
                <PaperPlaneRight size={42} weight="light" className="text-teal" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Route support</p>
              </div>
            </div>
            
            {/* Stamp Badge */}
            <div className="absolute top-12 right-4 z-30 transform rotate-12">
              <div className="w-24 h-24 rounded-full border border-dashed border-[#CBA07D] flex items-center justify-center bg-background/80 backdrop-blur-sm p-1">
                <div className="w-full h-full rounded-full border border-[#CBA07D] flex flex-col items-center justify-center text-center">
                  <span className="text-[#CBA07D] text-[10px] font-black leading-tight tracking-widest uppercase">
                    ท่องเที่ยว<br/>ชายแดนใต้
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-black text-ink mb-2">ส่งข้อความหาเรา</h2>
            <p className="text-muted text-sm mb-8">กรอกแบบฟอร์มด้านล่าง แล้วเราจะติดต่อกลับโดยเร็วที่สุด</p>
            
            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div>
                <label className="block text-xs font-bold text-ink mb-2">ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  placeholder="เช่น สมชาย รักสงบ"
                  className="w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:border-teal outline-none transition-colors placeholder:text-muted/50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink mb-2">อีเมล</label>
                <input 
                  type="email" 
                  placeholder="เช่น somchai@example.com"
                  className="w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:border-teal outline-none transition-colors placeholder:text-muted/50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink mb-2">จังหวัดที่สนใจ</label>
                <select defaultValue="" className="w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:border-teal outline-none transition-colors appearance-none ">
                  <option value="" disabled>เลือกจังหวัด</option>
                  <option value="yala">ยะลา (Yala)</option>
                  <option value="pattani">ปัตตานี (Pattani)</option>
                  <option value="narathiwat">นราธิวาส (Narathiwat)</option>
                  <option value="all">ทั้งสามจังหวัด</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-2">หัวเรื่อง</label>
                <input 
                  type="text" 
                  placeholder="เช่น สอบถามเส้นทาง หรือแจ้งปัญหาการสแกน QR"
                  className="w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:border-teal outline-none transition-colors placeholder:text-muted/50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink mb-2">ข้อความ</label>
                <textarea 
                  rows={4}
                  placeholder="บอกเราเพิ่มเติมเกี่ยวกับแผนการเดินทางหรือข้อสงสัยของคุณ..."
                  className="w-full bg-[#F4F1EA] rounded-2xl p-5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal/30 resize-none mt-2 placeholder:text-muted/50 border border-ink/5"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-coral text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-coral/90 transition-all shadow-sm"
              >
                ส่งข้อความ <PaperPlaneRight weight="fill" />
              </button>
              
              {isSubmitted && (
                <div className="bg-teal/10 text-teal p-3 rounded-xl text-sm text-center font-bold">
                  ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด
                </div>
              )}
              
              <p className="text-[11px] text-muted text-center flex items-center justify-center gap-2">
                <span className="opacity-70">🔒</span> ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยตามนโยบายความเป็นส่วนตัว
              </p>
            </form>
          </div>

          {/* Right: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-black text-ink mb-6">ช่องทางการติดต่อ</h2>
            
            {/* Contact Cards */}
            <div className="bg-white p-5 rounded-xl border border-ink/5 flex items-start gap-4">
              <div className="bg-[#FAF3EE] text-coral p-3 rounded-full shrink-0">
                <EnvelopeSimple size={24} weight="fill" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-ink mb-1">ส่งอีเมลหาเรา</h3>
                  <p className="text-sm text-ink font-semibold">contact@southerntourism.com</p>
                  <p className="text-xs text-muted mt-1">เราจะตอบกลับภายใน 24 ชั่วโมง</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-ink/5 flex items-start gap-4">
              <div className="bg-[#FAF3EE] text-coral p-3 rounded-full shrink-0">
                <Phone size={24} weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink mb-1">โทรหาเรา</h3>
                <p className="text-sm text-ink font-semibold">+66 (0) 73 313 928</p>
                <p className="text-xs text-muted mt-1">จันทร์ - ศุกร์, 09:00 - 16:00 น.</p>
              </div>
            </div>

            <div className="bg-background border border-ink/10 p-5 rounded-xl flex items-start gap-4">
              <div className="bg-[#EBECE8] text-ink p-3 rounded-full shrink-0">
                <MapPin size={24} weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink mb-1">สำนักงานของเรา</h3>
                <p className="text-sm font-semibold leading-relaxed">
                  มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตปัตตานี<br/>
                  181 ถ.เจริญประดิษฐ์ ต.รูสะมิแล<br/>
                  ปัตตานี 94000
                </p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-coral mt-2 inline-block hover:underline">
                  ดูบน Google Maps
                </a>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-ink/5 flex items-start gap-4">
              <div className="bg-[#FAF3EE] text-coral p-3 rounded-full shrink-0">
                <Clock size={24} weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink mb-1">เวลาทำการ</h3>
                <p className="text-xs text-muted leading-relaxed">
                  จันทร์ - ศุกร์: 09:00 - 18:00 น.<br/>
                  เสาร์ - อาทิตย์: 10:00 - 16:00 น.
                </p>
              </div>
            </div>
          </div>
          
        </section>

        {/* BOTTOM SECTION: Office & FAQ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-start">
          
          {/* Visit Our Office Map */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-ink">เยี่ยมชมสำนักงานของเรา</h2>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden border border-ink/5">
              <div className="p-8">
                <p className="text-sm text-muted leading-relaxed mb-6">
                  เรายินดีต้อนรับทุกคนที่สนใจโครงการ หรือต้องการพูดคุยเรื่องความร่วมมือในการพัฒนาแพลตฟอร์มการท่องเที่ยว
                </p>
                <button className="border border-ink/20 rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-ink hover:text-white transition-colors">
                  ดูเส้นทาง <PaperPlaneRight weight="bold" />
                </button>
              </div>
              <div className="h-64 bg-[#EBECE8] relative w-full border-t border-ink/5">
                <div className="absolute inset-0 bg-[#E8EEE9]" />
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(23,63,55,.12)_1px,transparent_1px),linear-gradient(rgba(23,63,55,.12)_1px,transparent_1px)] [background-size:36px_36px]" />
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-teal/20" />
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-teal/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-ink/5 flex items-center gap-2">
                    <MapPin size={20} weight="fill" className="text-coral" />
                    <span className="font-bold text-xs uppercase tracking-wider text-ink">PSU Pattani</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ & Connect */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-black text-ink">คำถามที่พบบ่อย</h2>
              <span className="text-xs font-bold text-ink hover:text-coral cursor-pointer">ดูคำถามทั้งหมด &rarr;</span>
            </div>
            
            <div className="space-y-3 mb-10">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-ink/5 overflow-hidden transition-all">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FAF3EE] text-coral flex items-center justify-center shrink-0">
                        <MapPin size={16} weight="fill" />
                      </div>
                      <span className="font-bold text-sm text-ink">{faq.question}</span>
                    </div>
                    <CaretDown 
                      size={16} 
                      className={`text-ink/40 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 pl-17 text-sm text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <h3 className="font-bold text-ink">ติดตามเรา</h3>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <InstagramLogo size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <FacebookLogo size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <YoutubeLogo size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <PinterestLogo size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <Envelope size={18} />
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* NEWSLETTER (Stay Inspired) */}
        <section className="mb-20">
          <div className="relative rounded-2xl overflow-hidden bg-ink py-16 px-8 md:px-16 flex flex-col justify-center shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#173F37_0%,#264D48_52%,#E18868_100%)] opacity-95" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:44px_44px]" />
            <div className="relative z-10 max-w-md">
              <h2 className="text-3xl font-black text-white mb-3">รับแรงบันดาลใจใหม่ๆ</h2>
              <p className="text-white/80 text-sm mb-6">
                รับข่าวสารเกี่ยวกับการท่องเที่ยว โปรโมชัน และจุด Check-in ใหม่ๆ ในจังหวัดชายแดนใต้ ส่งตรงถึงอีเมลคุณ
              </p>
              
              <form onSubmit={e => { e.preventDefault(); alert("ขอบคุณสำหรับการติดตามข่าวสาร!"); }} className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <input 
                  type="email" 
                  required
                  placeholder="กรอกอีเมลของคุณ"
                  className="flex-1 bg-white rounded-full px-5 py-3 text-sm text-ink outline-none placeholder:text-muted/70"
                />
                <button type="submit" className="bg-coral text-white font-bold rounded-full px-6 py-3 text-sm hover:bg-coral/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ติดตามข่าวสาร <PaperPlaneRight weight="fill" />
                </button>
              </form>
              <p className="text-[10px] text-white/50 mt-3 pl-2">เราไม่ส่งสแปม และคุณสามารถยกเลิกได้ตลอดเวลา</p>
            </div>
          </div>
        </section>
        
      </div>
      
      {/* SITE FOOTER */}
      <SiteFooter />
    </div>
  );
}
