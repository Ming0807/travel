/* eslint-disable react/no-unescaped-entities */

import Image from "next/image";
import Link from "next/link";
import { 
  Export,
  BookmarkSimple,
  InstagramLogo,
  TwitterLogo,
  PinterestLogo,
  EnvelopeSimple,
  Quotes,
  PaperPlaneRight
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicStory } from "@/lib/repositories/public-content.repository";

export const dynamic = "force-dynamic";

export default async function StoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { story, relatedStories } = await getPublicStory(id);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        
        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-8">
            
            {/* Breadcrumbs */}
            <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
              <Link href="/" className="hover:text-ink transition-colors">Home</Link>
              <span>›</span>
              <Link href="/stories" className="hover:text-ink transition-colors">Stories</Link>
              <span>›</span>
              <span className="text-ink">{story.category}</span>
            </div>

            {/* Header info */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-wider mb-4">
              <span className="bg-[#E18868] text-white px-2 py-0.5 rounded-sm">{story.category}</span>
              <span>• 5 MIN READ</span>
            </div>

            {/* Title & Excerpt */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 leading-tight">
              {story.title}
            </h1>
            <p className="text-muted leading-relaxed text-lg mb-8">
              {story.excerpt} จากสถานที่ยอดฮิตสู่ดินแดนที่ซ่อนเร้น เราได้รวบรวมข้อมูลที่คุณต้องรู้ก่อนเก็บกระเป๋า
            </p>

            {/* Author & Share */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-ink/10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cream overflow-hidden relative border-2 border-white shadow-sm">
                  <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="Author" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <p className="font-black text-ink">ฟาติมา สุไลมาน</p>
                  <p className="text-xs text-muted">{story.date} • 5 min read</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-xs font-bold text-ink border border-ink/10 px-3 py-1.5 rounded-full hover:bg-cream transition-colors">
                  <Export size={14} /> Share
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-ink border border-ink/10 px-3 py-1.5 rounded-full hover:bg-cream transition-colors">
                  <BookmarkSimple size={14} /> Save
                </button>
                <button className="flex items-center justify-center w-8 h-8 text-ink border border-ink/10 rounded-full hover:bg-cream transition-colors">
                  <TwitterLogo size={14} weight="fill" />
                </button>
                <button className="flex items-center justify-center w-8 h-8 text-ink border border-ink/10 rounded-full hover:bg-cream transition-colors">
                  <PinterestLogo size={14} weight="fill" />
                </button>
                <button className="flex items-center justify-center w-8 h-8 text-ink border border-ink/10 rounded-full hover:bg-cream transition-colors">
                  <EnvelopeSimple size={14} weight="fill" />
                </button>
              </div>
            </div>

            {/* Main Hero Image */}
            <div className="relative w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden mb-12 shadow-sm border border-ink/5">
              <Image 
                src={story.imageUrl} 
                alt={story.title} 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>

            {/* Article Body */}
            <article className="prose prose-lg max-w-none text-ink/80 prose-headings:text-ink prose-headings:font-black prose-a:text-[#E18868]">
              <h2 className="text-3xl font-black text-ink mb-6 mt-12">Why These Destinations Stand Out</h2>
              <p className="mb-6 leading-relaxed">
                การเดินทางในแต่ละปีมอบโอกาสใหม่ๆ ให้เราได้สำรวจโลก และ 3 จังหวัดชายแดนใต้ก็เช่นกัน เราได้คัดสรรสถานที่เหล่านี้มาจากกระแสการท่องเที่ยวล่าสุด ความสวยงามของธรรมชาติ และประสบการณ์ที่ไม่มีวันลืม
              </p>
              
              <blockquote className="my-8 bg-[#FAF3EE] p-8 rounded-[2rem] border border-[#E18868]/20 relative">
                <Quotes size={32} weight="fill" className="text-[#E18868]/30 absolute top-6 left-6" />
                <p className="text-xl font-bold italic text-ink text-center relative z-10 mx-8">
                  โลกนี้เต็มไปด้วยสถานที่ที่จะทำให้คุณพูดไม่ออก – ให้การเดินทางครั้งนี้เป็นปีที่คุณได้เห็นมันด้วยตาตัวเอง
                </p>
                <div className="text-center mt-4">
                  <span className="text-[#E18868] text-sm font-bold">— Southern Border Explorer</span>
                </div>
              </blockquote>

              <h2 className="text-3xl font-black text-ink mb-8 mt-12">Top Places to Explore</h2>
              
              {/* Place 1 */}
              <div className="mb-12">
                <h3 className="text-2xl font-black text-ink mb-4">1. {story.province} - จุดเช็คอินสุดประทับใจ</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                  <div className="md:w-1/2">
                    <p className="leading-relaxed mb-4">
                      สถานที่แห่งนี้เปรียบเสมือนดินแดนในฝัน พื้นที่อันเป็นเอกลักษณ์นี้นำเสนอส่วนผสมที่ลงตัวของการผจญภัยและประวัติศาสตร์
                    </p>
                    <ul className="space-y-2 mb-0">
                      <li><strong>Must do:</strong> ถ่ายรูปรับใบประกาศดิจิทัลในช่วงเช้า</li>
                      <li><strong>Don't miss:</strong> พิพิธภัณฑ์กลางแจ้งและการเรียนรู้วัฒนธรรม</li>
                      <li><strong>Perfect for:</strong> คู่รัก, ช่างภาพ, ผู้แสวงหาการผจญภัย</li>
                    </ul>
                  </div>
                  <div className="md:w-1/2 relative h-48 w-full rounded-[1.5rem] overflow-hidden shadow-sm">
                    <Image 
                      src={story.imageUrl} 
                      alt="Detail view" 
                      fill 
                      className="object-cover" 
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Place 2 (Mock) */}
              <div className="mb-12">
                <h3 className="text-2xl font-black text-ink mb-4">2. วิถีชุมชนและอาหารพื้นถิ่น</h3>
                <p className="leading-relaxed mb-6">
                  นอกเหนือจากสถานที่สวยงามแล้ว สิ่งที่ขาดไม่ได้คือการสัมผัสวิถีชีวิตดั้งเดิมของชาวบ้าน ลองชิมอาหารท้องถิ่นที่หารับประทานยาก และพูดคุยกับผู้คนที่จะทำให้การเดินทางของคุณมีความหมายมากขึ้น
                </p>
                <div className="relative h-72 w-full rounded-[1.5rem] overflow-hidden shadow-sm">
                  <Image 
                    src="https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=1200" 
                    alt="Local food" 
                    fill 
                    className="object-cover" 
                    unoptimized
                  />
                </div>
              </div>

              <h2 className="text-3xl font-black text-ink mb-6 mt-12">Final Thoughts</h2>
              <p className="leading-relaxed mb-8">
                ไม่ว่าคุณจะเลือกเดินทางไปที่ไหนในพื้นที่ชายแดนใต้ สิ่งสำคัญคือการเปิดใจรับประสบการณ์ใหม่ๆ สนับสนุนเศรษฐกิจท้องถิ่น และเดินทางอย่างมีความรับผิดชอบ
              </p>
            </article>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Table of Contents */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-ink/5">
              <h3 className="font-black text-ink text-lg mb-4">Table of Contents</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3 text-muted hover:text-[#E18868] transition-colors cursor-pointer">
                  <span className="font-bold">01</span> <span>Why These Destinations Stand Out</span>
                </li>
                <li className="flex gap-3 text-ink font-bold cursor-pointer">
                  <span className="text-[#E18868]">02</span> <span>Top Places to Explore</span>
                </li>
                <li className="flex gap-3 text-muted hover:text-[#E18868] transition-colors cursor-pointer pl-7">
                  <span>•</span> <span>{story.province} - จุดเช็คอินสุดประทับใจ</span>
                </li>
                <li className="flex gap-3 text-muted hover:text-[#E18868] transition-colors cursor-pointer pl-7">
                  <span>•</span> <span>วิถีชุมชนและอาหารพื้นถิ่น</span>
                </li>
                <li className="flex gap-3 text-muted hover:text-[#E18868] transition-colors cursor-pointer">
                  <span className="font-bold">03</span> <span>Travel Tips</span>
                </li>
                <li className="flex gap-3 text-muted hover:text-[#E18868] transition-colors cursor-pointer">
                  <span className="font-bold">04</span> <span>Final Thoughts</span>
                </li>
              </ul>
            </div>

            {/* About the Author */}
            <div className="bg-[#F2EFE8] rounded-[2rem] p-6 shadow-sm border border-ink/5">
              <h3 className="font-black text-ink text-lg mb-4">About the Author</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden relative shrink-0">
                  <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="Author" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <p className="font-black text-ink">ฟาติมา สุไลมาน</p>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Travel Writer & Analyst</p>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                นักเดินทางและช่างภาพผู้หลงใหลในการค้นหาสถานที่ใหม่ๆ ในกว่า 20 จังหวัด แบ่งปันเรื่องราวและเคล็ดลับเพื่อเป็นแรงบันดาลใจให้ผู้อื่น
              </p>
              <div className="flex items-center justify-between">
                <a href="#" className="text-xs font-bold text-[#E18868] hover:underline">View all posts →</a>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-ink shadow-sm hover:text-[#E18868]">
                    <InstagramLogo size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-ink shadow-sm hover:text-[#E18868]">
                    <TwitterLogo size={14} weight="fill" />
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-ink/5">
              <h3 className="font-black text-ink text-lg mb-6">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["Europe", "Asia", "Adventure", "Solo Travel", "Budget Travel", "Photography", "Beach", "Hiking", "Food", "City Guide"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-[11px] font-medium text-ink bg-[#FAF8F5] border border-ink/5 hover:border-ink/20 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="text-[11px] font-bold text-[#E18868] mt-6 hover:underline">
                View all tags →
              </button>
            </div>

            {/* Newsletter */}
            <div className="bg-[#FAF3EE] rounded-[2rem] p-8 shadow-sm border border-[#E18868]/10 text-center">
              <h3 className="font-black text-ink text-xl mb-2">Never Miss a Story</h3>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                Get travel inspiration, tips, and exclusive offers straight to your inbox.
              </p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="w-full bg-white rounded-full px-5 py-3 text-sm text-ink outline-none border border-ink/5 focus:border-teal"
                />
                <button type="button" className="w-full bg-[#E18868] text-white font-bold rounded-full px-6 py-3 text-sm hover:bg-[#D07757] transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Subscribe <PaperPlaneRight weight="fill" />
                </button>
              </div>
              <p className="text-[9px] text-muted mt-3 flex items-center justify-center gap-1">
                <span>🔒</span> No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* MORE STORIES YOU MAY LOVE */}
        <section className="mb-20 pt-12 border-t border-ink/10">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-black text-ink">More Stories You May Love</h2>
            <Link href="/stories" className="text-sm font-bold text-[#E18868] hover:underline">View all articles →</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedStories.map((s) => (
              <Link href={`/stories/${s.id}`} key={s.id} className="group block">
                <article className="flex flex-col h-full rounded-[1.5rem] bg-white shadow-sm border border-ink/5 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="relative h-48 w-full overflow-hidden bg-cream">
                    <Image
                      src={s.imageUrl}
                      alt={s.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-wider mb-3">
                      <span className="text-[#E18868]">{s.category}</span>
                      <span>• 5 MIN READ</span>
                    </div>
                    <h3 className="text-lg font-black text-ink mb-2 group-hover:text-[#E18868] transition-colors line-clamp-2 leading-snug">
                      {s.title}
                    </h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
        
      </div>
      
      {/* SITE FOOTER */}
      <SiteFooter />
    </div>
  );
}
