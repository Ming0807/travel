import Image from "next/image";
import Link from "next/link";
import { 
  MagnifyingGlass, 
  PaperPlaneRight, 
  Star,
  Clock
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { listPublicStories } from "@/lib/repositories/public-content.repository";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const allStories = await listPublicStories(12);
  const featuredStory = allStories[0];
  const editorPicks = allStories.slice(1, 4);

  const categories = ["All", "Destinations", "Food & Drink", "Culture", "Nature", "History"];

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        
        {/* HERO SECTION */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <span>Home</span>
          <span>›</span>
          <span className="text-ink">Stories</span>
        </div>
        
        <section className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start mb-20">
          <div className="lg:w-5/12 pt-4">
            <h1 className="text-5xl md:text-6xl font-black text-ink mb-6 leading-tight">
              Stories & Inspiration <br className="hidden lg:block"/>for Every Journey
            </h1>
            <p className="text-muted leading-relaxed text-lg max-w-md mb-8">
              เรื่องราวจริง เคล็ดลับที่มีประโยชน์ และแรงบันดาลใจจากนักเดินทางใน 3 จังหวัดชายแดนใต้ ค้นหาไอเดียสำหรับการผจญภัยครั้งต่อไปของคุณ
            </p>
            
            {/* Dashed line decorative SVG */}
            <div className="mt-8 opacity-40">
              <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 59C20.5 59 40 45.5 54.5 35C74.3989 20.5901 95 10 120 10C148 10 170 25 190 40" stroke="#E18868" strokeWidth="2" strokeDasharray="6 6"/>
                <path d="M185 30L195 45L175 48" stroke="#E18868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          {/* Featured Article */}
          <div className="lg:w-7/12 w-full">
            <Link href={`/stories/${featuredStory.id}`} className="group block relative rounded-[2rem] bg-white shadow-sm border border-ink/5 overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-64 md:h-80 md:w-1/2 overflow-hidden bg-cream">
                  <Image 
                    src={featuredStory.imageUrl} 
                    alt={featuredStory.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    unoptimized
                  />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center rounded-full bg-[#E18868] text-white px-3 py-1 text-[10px] font-black tracking-wider shadow-sm uppercase">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-wider mb-4">
                    <span className="text-[#E18868]">{featuredStory.category}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> 5 MIN READ</span>
                  </div>
                  <h2 className="text-2xl font-black text-ink mb-4 group-hover:text-[#E18868] transition-colors leading-snug">
                    {featuredStory.title}
                  </h2>
                  <p className="text-sm text-muted line-clamp-3 mb-6">
                    {featuredStory.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-cream overflow-hidden relative">
                      <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="Author" fill className="object-cover" unoptimized />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">ฟาติมา สุไลมาน</p>
                      <p className="text-[10px] text-muted">{featuredStory.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* MAIN CONTENT (Left) */}
          <div className="lg:col-span-8">
            
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 items-center border-b border-ink/5 pb-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <button 
                    key={cat} 
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                      idx === 0 
                        ? 'bg-[#E18868] text-white' 
                        : 'bg-white text-ink border border-ink/10 hover:border-ink/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="w-full bg-white border border-ink/10 rounded-full pl-4 pr-10 py-2.5 text-xs text-ink focus:border-teal outline-none transition-colors"
                />
                <MagnifyingGlass size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" weight="bold" />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allStories.map((story) => (
                <Link href={`/stories/${story.id}`} key={story.id} className="group block">
                  <article className="flex flex-col h-full rounded-[1.5rem] bg-white shadow-sm border border-ink/5 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="relative h-48 w-full overflow-hidden bg-cream">
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col p-6">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-wider mb-3">
                        <span className="text-[#E18868]">{story.category}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> 4 MIN READ</span>
                      </div>
                      
                      <h2 className="text-lg font-black text-ink mb-3 group-hover:text-[#E18868] transition-colors line-clamp-2 leading-snug">
                        {story.title}
                      </h2>
                      <p className="text-xs text-muted line-clamp-2 mb-5 flex-1 leading-relaxed">
                        {story.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-ink/5">
                        <div className="w-6 h-6 rounded-full bg-cream overflow-hidden relative">
                          <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" alt="Author" fill className="object-cover" unoptimized />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-ink">นพดล แซ่ลี้</p>
                          <p className="text-[9px] text-muted">{story.date}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-ink/5 transition-colors">{'<'}</button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E18868] text-white font-bold text-sm shadow-sm">1</button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-ink font-bold text-sm hover:bg-ink/5 transition-colors">2</button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-ink font-bold text-sm hover:bg-ink/5 transition-colors">3</button>
              <span className="text-muted">...</span>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-ink font-bold text-sm hover:bg-ink/5 transition-colors">15</button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-ink font-bold text-sm hover:bg-ink/5 transition-colors">{'>'}</button>
            </div>
          </div>

          {/* SIDEBAR (Right) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Editor's Picks */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-ink/5">
              <div className="flex items-center gap-2 mb-6">
                <Star size={20} weight="fill" className="text-[#E18868]" />
                <h3 className="font-black text-ink text-lg">Editor&apos;s Picks</h3>
              </div>
              
              <div className="space-y-5">
                {editorPicks.map((pick, idx) => (
                  <Link href={`/stories/${pick.id}`} key={idx} className="group flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-cream">
                      <Image src={pick.imageUrl} alt={pick.title} fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#E18868] uppercase tracking-wider mb-1">{pick.category}</p>
                      <h4 className="font-bold text-sm text-ink leading-tight group-hover:text-[#E18868] transition-colors line-clamp-2 mb-1">
                        {pick.title}
                      </h4>
                      <p className="text-[10px] text-muted">{pick.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-[#FAF3EE] rounded-[2rem] p-8 shadow-sm border border-[#E18868]/10 text-center">
              <h3 className="font-black text-ink text-xl mb-2">Never Miss a Story</h3>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                รับเรื่องราวแรงบันดาลใจและเคล็ดลับการเดินทางส่งตรงถึงอีเมลคุณ
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

            {/* Popular Tags */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-ink/5">
              <h3 className="font-black text-ink text-lg mb-6">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["Yala", "Pattani", "Narathiwat", "Betong", "Local Food", "Nature Trail", "Culture", "Photography", "Budget Travel", "Cafe Hopping"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-[11px] font-medium text-ink bg-[#FAF8F5] border border-ink/5 hover:border-ink/20 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="text-[11px] font-bold text-[#E18868] mt-6 hover:underline">
                View all tags →
              </button>
            </div>
            
          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <section className="mb-20">
          <div className="relative w-full h-32 md:h-40 rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-between px-8 md:px-12 shadow-md bg-ink">
            <Image 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop" 
              alt="Share Story Background" 
              fill 
              className="object-cover opacity-30" 
              unoptimized
            />
            <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-xl md:text-2xl font-black text-white mb-1">Share Your Story with the World</h2>
              <p className="text-white/80 text-xs md:text-sm">Have a travel story to share? Join our community of explorers and inspire others.</p>
            </div>
            <div className="relative z-10">
              <button className="bg-[#E18868] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#D07757] transition-all flex items-center gap-2 whitespace-nowrap">
                Become a Contributor <PaperPlaneRight weight="bold" />
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
