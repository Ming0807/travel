"use client";

import Image from "next/image";
import { 
  Target,
  Eye,
  CheckCircle,
  MapPin,
  Camera,
  ShieldCheck,
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  Heart,
  Users,
  BookOpen,
  GlobeHemisphereEast
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { projectVision, teamMembers } from "@/lib/data/about";

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        
        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start mb-24">
          <div className="lg:w-1/2 pt-8">
            <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
              <span>หน้าแรก</span>
              <span>›</span>
              <span className="text-ink">เกี่ยวกับเรา</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-ink mb-6 leading-tight">
              เกี่ยวกับ <br className="hidden lg:block"/>ท่องเที่ยวชายแดนใต้
            </h1>
            <p className="text-muted leading-relaxed text-lg max-w-md mb-8">
              เราคือนักเล่าเรื่อง นักสำรวจ และผู้สร้างสรรค์แพลตฟอร์มที่มุ่งหวังจะเปิดมุมมองใหม่ของการท่องเที่ยวใน 3 จังหวัดชายแดนใต้ — หนึ่งการเดินทาง หนึ่งความประทับใจ
            </p>
            <button className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-coral/90 transition-all">
              ค้นพบเรื่องราวของเรา
            </button>
            
            {/* Dashed line decorative SVG */}
            <div className="mt-8 opacity-40">
              <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 59C20.5 59 40 45.5 54.5 35C74.3989 20.5901 95 10 120 10C148 10 170 25 190 40" stroke="#E18868" strokeWidth="2" strokeDasharray="6 6"/>
                <path d="M185 30L195 45L175 48" stroke="#E18868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative h-[500px] w-full">
            {/* Background Shape */}
            <div className="absolute top-10 left-10 w-[350px] h-[400px] bg-[#F2EFE8] rounded-[3rem] -z-10 opacity-70"></div>
            
            <div className="absolute top-0 left-0 w-64 h-80 rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#FAF8F5] z-10">
              <Image 
                src="https://images.unsplash.com/photo-1542640244-7e672d6cb466?q=80&w=600&auto=format&fit=crop" 
                alt="Sea of mist Aiyerweng" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
            
            <div className="absolute top-8 right-4 w-48 h-48 rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#FAF8F5] z-20">
              <Image 
                src="https://images.unsplash.com/photo-1587823527237-770498eb7909?q=80&w=500&auto=format&fit=crop" 
                alt="Pattani Central Mosque" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
            
            <div className="absolute bottom-4 right-12 w-56 h-40 rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#FAF8F5] z-30">
              <Image 
                src="https://images.unsplash.com/photo-1598444315278-651817551cc3?q=80&w=500&auto=format&fit=crop" 
                alt="Narathiwat beach" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 bg-[#F2EFE8] p-10 md:p-12 rounded-[2.5rem]">
          <div className="flex gap-6 items-start">
            <div className="bg-coral text-white p-4 rounded-full shrink-0 shadow-sm">
              <Target size={32} weight="fill" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink mb-3">พันธกิจของเรา</h2>
              <p className="text-muted text-sm leading-relaxed">
                เพื่อสร้างแรงบันดาลใจและมอบพลังให้นักเดินทางด้วยคำแนะนำที่เชื่อถือได้ เรื่องราวที่แท้จริง และสถานที่ที่เราคัดสรรมาอย่างดี เพื่อเปลี่ยนการเดินทางให้เป็นประสบการณ์ที่น่าจดจำใน 3 จังหวัดชายแดนใต้
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="bg-coral text-white p-4 rounded-full shrink-0 shadow-sm">
              <Eye size={32} weight="fill" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink mb-3">วิสัยทัศน์ของเรา</h2>
              <p className="text-muted text-sm leading-relaxed">
                {projectVision.content}
              </p>
            </div>
          </div>
        </section>

        {/* WHAT MAKES IT SPECIAL */}
        <section className="mb-24">
          <h2 className="text-3xl font-black text-ink mb-12">ความพิเศษของเรา</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="text-coral">
                <CheckCircle size={40} weight="light" />
              </div>
              <h3 className="font-bold text-ink">คัดสรรด้วยความใส่ใจ</h3>
              <p className="text-sm text-muted leading-relaxed">
                ทุกคำแนะนำและจุดหมายปลายทางถูกเลือกสรรจากประสบการณ์ตรงของนักเดินทางและผู้คนในพื้นที่
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="text-coral">
                <GlobeHemisphereEast size={40} weight="light" />
              </div>
              <h3 className="font-bold text-ink">สัมผัสวิถีท้องถิ่นแท้จริง</h3>
              <p className="text-sm text-muted leading-relaxed">
                พาคุณออกจากเส้นทางหลัก สู่สถานที่และเรื่องราวที่ผู้คนท้องถิ่นอยากนำเสนอ
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-coral">
                <Camera size={40} weight="light" />
              </div>
              <h3 className="font-bold text-ink">เรื่องราวสร้างแรงบันดาลใจ</h3>
              <p className="text-sm text-muted leading-relaxed">
                จากแหล่งท่องเที่ยวลับสู่เส้นทางใหม่ๆ ที่จะปลุกความเป็นนักสำรวจในตัวคุณ
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-coral">
                <ShieldCheck size={40} weight="light" />
              </div>
              <h3 className="font-bold text-ink">เชื่อถือได้ ปลอดภัย</h3>
              <p className="text-sm text-muted leading-relaxed">
                เนื้อหาอัปเดตตลอดเวลา พร้อมข้อแนะนำและระบบที่ดูแลข้อมูลให้คุณเดินทางอย่างมั่นใจ
              </p>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-center">
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-3xl font-black text-ink">เรื่องราวของเรา</h2>
            <div className="space-y-4 text-sm text-muted leading-relaxed">
              <p>
                แพลตฟอร์มนี้ถือกำเนิดขึ้นจากความรักในการเดินทางและความเชื่อที่ว่า การเดินทางที่ดีที่สุดคือการก้าวออกไปสัมผัสกับวิถีชีวิตจริงที่ซ่อนอยู่ในพื้นที่
              </p>
              <p>
                สิ่งที่เริ่มต้นจากโปรเจกต์วิจัยเล็กๆ ของกลุ่มนักวิชาการ ได้เติบโตเป็นแพลตฟอร์มการเก็บข้อมูลการท่องเที่ยวและ Digital Passport ที่เชื่อมต่อนักเดินทางหลายพันคน
              </p>
              <p>
                วันนี้ เราคือคอมมูนิตี้ที่เติบโตขึ้นเรื่อยๆ ซึ่งประกอบด้วยนักสำรวจ ครีเอเตอร์ และคนในพื้นที่ที่ทำงานร่วมกันเพื่อช่วยให้คุณเดินทางได้ลึกซึ้งขึ้น ชาญฉลาดขึ้น และมีจุดมุ่งหมาย
              </p>
            </div>
            <p className="text-coral font-['Playfair_Display'] italic text-xl pt-4">
              และการเดินทางยังคงดำเนินต่อไป...
            </p>
          </div>
          
          <div className="lg:col-span-8 relative h-[400px] rounded-[2rem] overflow-hidden shadow-lg border border-ink/5">
            <Image 
              src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1200&auto=format&fit=crop" 
              alt="Our Story Journey" 
              fill 
              className="object-cover" 
              unoptimized
            />
          </div>
        </section>

        {/* MEET THE TEAM */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-black text-ink">ทีมงานของเรา</h2>
            <button className="border border-ink/20 rounded-full px-5 py-2 text-xs font-bold hover:bg-ink hover:text-white transition-colors">
              ร่วมงานกับเรา
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-ink/5 flex flex-col items-center text-center">
                <div className="w-full h-48 relative rounded-xl overflow-hidden mb-4 bg-cream">
                  <Image 
                    src={member.imageUrl} 
                    alt={member.name} 
                    fill 
                    className="object-cover"
                    unoptimized 
                  />
                </div>
                <h3 className="font-black text-ink">{member.name}</h3>
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 mt-1">{member.role}</p>
                <p className="text-xs text-muted leading-relaxed mb-4 flex-1">
                  {idx === 0 ? "นักสำรวจโดยสายเลือด นักเล่าเรื่องโดยความหลงใหล" : 
                   idx === 1 ? "เปลี่ยนข้อมูลเป็นอินไซต์ที่สร้างแรงบันดาลใจ" : 
                   "เก็บบันทึกความงามของโลกผ่านสายตาที่แม่นยำ"}
                </p>
                <div className="flex gap-3 text-ink/40 mt-auto">
                  <InstagramLogo size={16} className="hover:text-coral cursor-pointer transition-colors" />
                  <FacebookLogo size={16} className="hover:text-coral cursor-pointer transition-colors" />
                  <LinkedinLogo size={16} className="hover:text-coral cursor-pointer transition-colors" />
                </div>
              </div>
            ))}
            
            {/* Mock 4th member to match layout */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-ink/5 flex flex-col items-center text-center">
              <div className="w-full h-48 relative rounded-xl overflow-hidden mb-4 bg-cream">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" 
                  alt="Amina" 
                  fill 
                  className="object-cover"
                  unoptimized 
                />
              </div>
              <h3 className="font-black text-ink">อามีนา สะมะแอ</h3>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 mt-1">Community Manager</p>
              <p className="text-xs text-muted leading-relaxed mb-4 flex-1">
                สร้างความเชื่อมโยงและคัดสรรประสบการณ์ร่วมกับชุมชน
              </p>
              <div className="flex gap-3 text-ink/40 mt-auto">
                <InstagramLogo size={16} className="hover:text-coral cursor-pointer transition-colors" />
                <FacebookLogo size={16} className="hover:text-coral cursor-pointer transition-colors" />
                <LinkedinLogo size={16} className="hover:text-coral cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </section>

        {/* STATS BANNER */}
        <section className="bg-white rounded-[2rem] border border-coral/20 shadow-sm p-12 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAF3EE] rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-ink/5">
            <div className="flex flex-col items-center">
              <div className="text-coral mb-3"><MapPin size={32} weight="light" /></div>
              <h3 className="text-3xl font-black text-ink mb-1">150+</h3>
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">สถานที่ท่องเที่ยว</p>
              <p className="text-xs text-muted">คัดสรรสถานที่เด่นๆ มาเพื่อคุณ</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-coral mb-3"><Users size={32} weight="light" /></div>
              <h3 className="text-3xl font-black text-ink mb-1">50K+</h3>
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">นักเดินทางผู้ร่วมสนุก</p>
              <p className="text-xs text-muted">มั่นใจด้วยคอมมูนิตี้ที่เติบโตต่อเนื่อง</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-coral mb-3"><BookOpen size={32} weight="light" /></div>
              <h3 className="text-3xl font-black text-ink mb-1">10K+</h3>
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">ตราประทับสะสม</p>
              <p className="text-xs text-muted">หลักฐานของความทรงจำดีๆ</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-coral mb-3"><GlobeHemisphereEast size={32} weight="light" /></div>
              <h3 className="text-3xl font-black text-ink mb-1">3</h3>
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">จังหวัดหลัก</p>
              <p className="text-xs text-muted">ยะลา, ปัตตานี, นราธิวาส</p>
            </div>
          </div>
        </section>

        {/* OUR VALUES */}
        <section className="mb-24">
          <h2 className="text-3xl font-black text-ink mb-12">คุณค่าของเรา</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-ink/5">
              <div className="text-coral mb-4"><Heart size={28} weight="light" /></div>
              <h3 className="font-bold text-ink mb-2">ประสบการณ์ที่แท้จริง</h3>
              <p className="text-xs text-muted leading-relaxed">
                เราเชื่อในเรื่องราวจริง ผู้คนจริง และช่วงเวลาแห่งความประทับใจ
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-ink/5">
              <div className="text-coral mb-4"><Users size={28} weight="light" /></div>
              <h3 className="font-bold text-ink mb-2">เคารพในวัฒนธรรมท้องถิ่น</h3>
              <p className="text-xs text-muted leading-relaxed">
                เราเดินทางอย่างมีความหมายและสนับสนุนชุมชนที่เราไปเยือน
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-ink/5">
              <div className="text-coral mb-4"><Target size={28} weight="light" /></div>
              <h3 className="font-bold text-ink mb-2">คัดสรรอย่างมีจุดมุ่งหมาย</h3>
              <p className="text-xs text-muted leading-relaxed">
                คุณภาพเหนือปริมาณ เราเลือกสิ่งที่มีค่าต่อเวลาของคุณอย่างแท้จริง
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-ink/5">
              <div className="text-coral mb-4"><ShieldCheck size={28} weight="light" /></div>
              <h3 className="font-bold text-ink mb-2">น่าเชื่อถือและโปร่งใส</h3>
              <p className="text-xs text-muted leading-relaxed">
                คำแนะนำที่จริงใจและข้อมูลที่ชัดเจนซึ่งคุณสามารถเชื่อถือได้
              </p>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="mb-20">
          <div className="relative w-full h-[300px] rounded-[2rem] overflow-hidden flex flex-col items-center justify-center text-center px-4 shadow-xl">
            <Image 
              src="https://images.unsplash.com/photo-1542640244-7e672d6cb466?q=80&w=1200&auto=format&fit=crop" 
              alt="CTA Background" 
              fill 
              className="object-cover brightness-50" 
              unoptimized
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-3">ออกเดินทางสำรวจโลกไปด้วยกัน</h2>
              <p className="text-white/90 mb-8">การผจญภัยครั้งยิ่งใหญ่ครั้งต่อไปของคุณเริ่มต้นจากเรื่องราวเหล่านี้</p>
              <button className="bg-coral text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-coral/90 transition-all">
                เริ่มต้นการสำรวจ
              </button>
            </div>
          </div>
        </section>
        
      </div>
      
      {/* SITE FOOTER */}
      <SiteFooter />
    </div>
  );
}
