"use client";

import Image from "next/image";
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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
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
    <div className="bg-[#FAF8F5] min-h-screen text-ink pb-0">
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
            
            <div className="absolute top-4 right-32 w-64 h-72 rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#FAF8F5] z-10">
              <Image 
                src="https://images.unsplash.com/photo-1549488344-c184c7f1a307?auto=format&fit=crop&q=80&w=600" 
                alt="Yala mountain view" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
            
            <div className="absolute bottom-4 right-4 w-56 h-64 rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#FAF8F5] z-20">
              <Image 
                src="https://images.unsplash.com/photo-1583531061962-d3a9582d2fb4?auto=format&fit=crop&q=80&w=500" 
                alt="Pattani culture" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
            
            {/* Stamp Badge */}
            <div className="absolute top-12 right-4 z-30 transform rotate-12">
              <div className="w-24 h-24 rounded-full border border-dashed border-[#CBA07D] flex items-center justify-center bg-[#FAF8F5]/80 backdrop-blur-sm p-1">
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
            
            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold text-ink mb-2">ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  placeholder="e.g. สมชาย รักสงบ"
                  className="w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:border-teal outline-none transition-colors placeholder:text-muted/50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink mb-2">อีเมล</label>
                <input 
                  type="email" 
                  placeholder="e.g. somchai@example.com"
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
                  placeholder="e.g. สอบถามเส้นทาง, แจ้งปัญหาการสแกน QR"
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
              
              <p className="text-[11px] text-muted text-center flex items-center justify-center gap-2">
                <span className="opacity-70">🔒</span> ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยตามนโยบายความเป็นส่วนตัว
              </p>
            </form>
          </div>

          {/* Right: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-black text-ink mb-6">ช่องทางการติดต่อ</h2>
            
            {/* Contact Cards */}
            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-ink/5 flex items-start gap-4">
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

            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-ink/5 flex items-start gap-4">
              <div className="bg-[#FAF3EE] text-coral p-3 rounded-full shrink-0">
                <Phone size={24} weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink mb-1">โทรหาเรา</h3>
                <p className="text-sm text-ink font-semibold">+66 (0) 73 313 928</p>
                <p className="text-xs text-muted mt-1">จันทร์ - ศุกร์, 09:00 - 16:00 น.</p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-ink/10 p-5 rounded-[1.5rem] flex items-start gap-4">
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
                <a href="#" className="text-xs font-bold text-coral mt-2 inline-block hover:underline">
                  ดูบน Google Maps
                </a>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-ink/5 flex items-start gap-4">
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
            
            <div className="bg-white rounded-[2rem] overflow-hidden border border-ink/5 shadow-sm">
              <div className="p-8">
                <p className="text-sm text-muted leading-relaxed mb-6">
                  เรายินดีต้อนรับทุกคนที่สนใจโครงการ หรือต้องการพูดคุยเรื่องความร่วมมือในการพัฒนาแพลตฟอร์มการท่องเที่ยว
                </p>
                <button className="border border-ink/20 rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-ink hover:text-white transition-colors">
                  ดูเส้นทาง <PaperPlaneRight weight="bold" />
                </button>
              </div>
              <div className="h-64 bg-[#EBECE8] relative w-full border-t border-ink/5">
                {/* Simulated Map Background */}
                <Image 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                  alt="Map Placeholder" 
                  fill 
                  className="object-cover opacity-60 grayscale" 
                  unoptimized
                />
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
              <a href="#" className="text-xs font-bold text-ink hover:text-coral">ดูคำถามทั้งหมด &rarr;</a>
            </div>
            
            <div className="space-y-3 mb-10">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-[1.5rem] border border-ink/5 shadow-sm overflow-hidden transition-all">
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
                <a href="#" className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <InstagramLogo size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <FacebookLogo size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <YoutubeLogo size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <PinterestLogo size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors bg-white shadow-sm">
                  <Envelope size={18} />
                </a>
              </div>
            </div>
          </div>

        </section>

        {/* NEWSLETTER (Stay Inspired) */}
        <section className="mb-20">
          <div className="relative rounded-[2rem] overflow-hidden bg-ink py-16 px-8 md:px-16 flex flex-col justify-center shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1549488344-c184c7f1a307?auto=format&fit=crop&q=80&w=1200" 
              alt="Background" 
              fill 
              className="object-cover opacity-30" 
              unoptimized
            />
            <div className="relative z-10 max-w-md">
              <h2 className="text-3xl font-black text-white mb-3">รับแรงบันดาลใจใหม่ๆ</h2>
              <p className="text-white/80 text-sm mb-6">
                รับข่าวสารเกี่ยวกับการท่องเที่ยว โปรโมชัน และจุด Check-in ใหม่ๆ ในจังหวัดชายแดนใต้ ส่งตรงถึงอีเมลคุณ
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <input 
                  type="email" 
                  placeholder="กรอกอีเมลของคุณ"
                  className="flex-1 bg-white rounded-full px-5 py-3 text-sm text-ink outline-none"
                />
                <button className="bg-coral text-white font-bold rounded-full px-6 py-3 text-sm hover:bg-coral/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ติดตามข่าวสาร <PaperPlaneRight weight="fill" />
                </button>
              </div>
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
