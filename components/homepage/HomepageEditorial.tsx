import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bed,
  BookOpenText,
  Compass,
  ForkKnife,
  ImageSquare,
  MapTrifold,
  QrCode,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import type { PublicAccommodationCard, PublicRestaurantCard, PublicRouteCard, PublicStoryCard } from "@/lib/repositories/public-content.repository";
import type { AttractionCard } from "@/types/tourism";

const DEFAULT_HERO = "homepage/yala-hero-default.webp";
const DEFAULT_BELONGING = "homepage/yala-belonging-default.webp";
const BLUEPRINT_PATH = "/documents/na-tham-tourism-living-blueprint.pdf";

type MediaSettings = {
  title?: string;
  quote?: string;
  natureImage?: string;
  foodImage?: string;
  cultureImage?: string;
  cafeImage?: string;
  activitiesImage?: string;
  peopleImage?: string;
  routesCover?: string;
  foodCover?: string;
  plannerCover?: string;
};

type HomepageEditorialProps = {
  hero: { title?: string; subtitle?: string; description?: string; images?: readonly string[] };
  media: MediaSettings;
  attractions: AttractionCard[];
  discoveryAttractions: AttractionCard[];
  restaurants: PublicRestaurantCard[];
  accommodations: PublicAccommodationCard[];
  cafeRestaurant: PublicRestaurantCard | null;
  cafeCategorySlug: string | null;
  routes: PublicRouteCard[];
  stories: PublicStoryCard[];
  stats: { label: string; value: string }[];
  routesUnavailable: boolean;
};

function imageUrl(raw: string | null | undefined) {
  if (!raw) return null;
  if (raw.startsWith("/api/") || raw.startsWith("/site-media/")) return raw;
  return siteMediaImageUrl(raw);
}

function Photo({ src, alt, sizes, eager = false }: { src: string | null | undefined; alt: string; sizes: string; eager?: boolean }) {
  const resolved = imageUrl(src);
  return resolved ? <Image src={resolved} alt={alt} fill sizes={sizes} preload={eager} className="ed-photo" /> : <div className="ed-photo-empty" aria-label="ยังไม่มีภาพประกอบ" role="img"><ImageSquare aria-hidden="true" size={26} weight="light" /></div>;
}

function cleanHeroTitle(raw: string | undefined) {
  const title = raw?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return !title || title === "ยะลา" || title.includes("คณะทำงาน") || /ค้นพบความมหัศจรรย์|เที่ยวยะลาให้ลึก/.test(title)
    ? "คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ"
    : title;
}

function EditorialHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description?: string; id: string }) {
  return <div className="ed-heading">
    <p className="ed-eyebrow">{eyebrow}</p>
    <h2 id={id} className="ed-title">{title}</h2>
    {description ? <p className="ed-description">{description}</p> : null}
  </div>;
}

function Hero({ hero }: Pick<HomepageEditorialProps, "hero">) {
  const title = cleanHeroTitle(hero.title);
  const eyebrow = hero.subtitle && !/เมืองเล็ก|วางแผนการเดินทาง|Yala.*Pattani/i.test(hero.subtitle)
    ? hero.subtitle.replace(/<[^>]+>/g, " ").trim()
    : "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์";
  const titleHighlight = title.includes("ตำบลหน้าถ้ำ");
  const titleBefore = titleHighlight ? title.slice(0, title.indexOf("ตำบลหน้าถ้ำ")) : title;
  const description = hero.description && !/วางแผนการเดินทางในจังหวัด|ตามหาช่วงเวลาสุดพิเศษ/.test(hero.description)
    ? hero.description.replace(/<[^>]+>/g, " ").trim()
    : "เช็กอินสถานที่สำคัญ สะสมตราประทับ รับใบประกาศดิจิทัล และร่วมเรียนรู้วิถีชีวิตวัฒนธรรมยะลาไปด้วยกัน";
  return <section className="ed-hero" aria-labelledby="ed-hero-title">
    <Photo src={hero.images?.[0] || DEFAULT_HERO} alt="ภาพประกอบบรรยากาศภูเขาและหมอกยามเช้า" sizes="100vw" eager />
    <div className="ed-hero-mobile-photo" aria-hidden="true"><Photo src={hero.images?.[0] || DEFAULT_HERO} alt="" sizes="100vw" /></div>
    <div className="ed-hero-veil" aria-hidden="true" />
    <div className="ed-hero-inner">
      <div className="ed-hero-copy">
        <p className="ed-eyebrow">{eyebrow}</p>
        <h1 id="ed-hero-title"><span>{titleBefore.trim()}</span>{titleHighlight ? <em>ตำบลหน้าถ้ำ</em> : null}</h1>
        <p className="ed-hero-description">{description}</p>
        <div className="ed-hero-actions">
          <PublicCheckinEntryLink className="ed-pill ed-pill-primary"><QrCode aria-hidden="true" size={18} /> สแกน QR เช็กอิน</PublicCheckinEntryLink>
          <Link className="ed-pill ed-pill-outline" href="/attractions"><Compass aria-hidden="true" size={18} /> ดูสถานที่ทั้งหมด</Link>
          <a className="ed-pill ed-pill-outline" href={BLUEPRINT_PATH} target="_blank" rel="noopener noreferrer"><BookOpenText aria-hidden="true" size={18} /> คณะทำงาน</a>
        </div>
        <div className="ed-hero-partner"><Image src="/partners/yala-rajabhat-university.png" alt="ตรามหาวิทยาลัยราชภัฏยะลา" width={72} height={60} /><span>ร่วมขับเคลื่อนโดย<strong>มหาวิทยาลัยราชภัฏยะลา</strong></span></div>
      </div>
      <Link className="ed-hero-more" href="/360-vista" aria-label="เปิดทัวร์เสมือนจริง 360 องศา"><span aria-hidden="true">↗</span> สำรวจ 360°</Link>
    </div>
  </section>;
}

function Discovery({ media, discoveryAttractions, restaurants, accommodations, cafeRestaurant, cafeCategorySlug, routes, stories }: Pick<HomepageEditorialProps, "media" | "discoveryAttractions" | "restaurants" | "accommodations" | "cafeRestaurant" | "cafeCategorySlug" | "routes" | "stories">) {
  const matchingAttractions = (pattern: RegExp, imageOverride?: string) => discoveryAttractions.flatMap((item) => {
    if (!imageOverride && !item.imageUrl) return [];
    const typeName = (item.typeNamesEn ?? [item.typeNameEn ?? ""]).find((type) => pattern.test(type));
    return typeName ? [{ item, typeName }] : [];
  });
  const nature = matchingAttractions(/nature|eco|cave|karst|ธรรมชาติ|ถ้ำ/i, media.natureImage)[0];
  const cultureCandidates = matchingAttractions(/culture|heritage|history|relig|community|วัฒน|ศาสนา|ประวัติ|ชุมชน/i, media.cultureImage);
  const culture = cultureCandidates.find((candidate) => candidate.item.slug !== nature?.item.slug) ?? cultureCandidates[0];
  const categories = [
    nature && (media.natureImage || nature.item.imageUrl) ? { title: "ธรรมชาติ", detail: "ป่า ภูเขา สายน้ำ", href: `/attractions?type=${encodeURIComponent(nature.typeName)}`, image: media.natureImage || nature.item.imageUrl } : null,
    restaurants.length && (media.foodImage || restaurants.find((item) => item.imageUrl)?.imageUrl) ? { title: "อาหาร", detail: "รสชาติที่น่าจดจำ", href: "/restaurants", image: media.foodImage || restaurants.find((item) => item.imageUrl)?.imageUrl } : null,
    culture && (media.cultureImage || culture.item.imageUrl) ? { title: "วัฒนธรรม", detail: "ศรัทธาและวิถีชีวิต", href: `/attractions?type=${encodeURIComponent(culture.typeName)}`, image: media.cultureImage || culture.item.imageUrl } : null,
    cafeRestaurant && cafeCategorySlug && (media.cafeImage || cafeRestaurant.imageUrl)
      ? { title: "คาเฟ่", detail: "มุมสงบของวันดี ๆ", href: `/restaurants?category=${encodeURIComponent(cafeCategorySlug)}`, image: media.cafeImage || cafeRestaurant.imageUrl }
      : accommodations[0]?.imageUrl ? { title: "ที่พัก", detail: "พักผ่อนใกล้จุดหมาย", href: "/accommodations", image: accommodations[0].imageUrl } : null,
    routes.length && (media.activitiesImage || routes.find((item) => item.imageUrl)?.imageUrl) ? { title: "เส้นทาง", detail: "ออกเดินทางตามรอย", href: "/routes", image: media.activitiesImage || routes.find((item) => item.imageUrl)?.imageUrl } : null,
    stories.length && (media.peopleImage || stories.find((item) => item.imageUrl)?.imageUrl) ? { title: "ผู้คน", detail: "รอยยิ้มที่ไม่ลืม", href: "/stories", image: media.peopleImage || stories.find((item) => item.imageUrl)?.imageUrl } : null,
  ].filter((item): item is { title: string; detail: string; href: string; image: string } => !!item && !!item.image);
  if (!categories.length) return null;
  return <section id="discover" className="ed-discovery ed-section" aria-labelledby="ed-discovery-title">
    <div className="ed-container">
      <EditorialHeading id="ed-discovery-title" eyebrow="DISCOVER YALA" title="ค้นพบยะลา ในมุมที่มากกว่าเดิม" description="เมืองที่ธรรมชาติยังมีชีวิต วัฒนธรรมยังมีลมหายใจ และผู้คนยังอบอุ่นเสมอ" />
      <div className="ed-category-grid" data-count={categories.length}>{categories.map((category) => <Link key={category.title} href={category.href} className="ed-category">
        <div className="ed-category-image"><Photo src={category.image} alt={`ภาพประกอบหมวด${category.title}`} sizes="(max-width: 640px) 45vw, 18vw" /></div>
        <h3>{category.title}</h3><p>{category.detail}</p>
      </Link>)}</div>
    </div>
  </section>;
}

function Belonging({ hero, media }: Pick<HomepageEditorialProps, "hero" | "media">) {
  const title = media.title && !/เรื่องราวและประสบการณ์/.test(media.title) ? media.title : "ยะลา... มากกว่าที่คุณคิด";
  return <section className="ed-belonging" aria-labelledby="ed-belonging-title">
    <Photo src={hero.images?.[1] || DEFAULT_BELONGING} alt="ภาพประกอบบรรยากาศหุบเขาหมอกและการเดินทาง" sizes="100vw" />
    <div className="ed-belonging-veil" aria-hidden="true" />
    <div className="ed-container ed-belonging-inner"><div>
      <p className="ed-eyebrow">A PLACE TO BELONG</p>
      <h2 id="ed-belonging-title" className="ed-title">{title}</h2>
      <p>จากภูเขา สู่สายหมอก จากเรื่องเล่า สู่รอยยิ้ม<br />ให้การเดินทางครั้งนี้มีความหมายมากกว่าที่เคย</p>
      <Link className="ed-pill ed-pill-primary" href="/routes">สำรวจเส้นทาง <ArrowRight aria-hidden="true" size={18} /></Link>
    </div><p className="ed-belonging-quote">&ldquo;{media.quote && !/ชายแดนใต้มีเรื่องราว/.test(media.quote) ? media.quote : "ความสุข... อาจซ่อนอยู่ในที่ที่เราไม่เคยไป"}&rdquo;</p></div>
  </section>;
}

function Destinations({ attractions }: Pick<HomepageEditorialProps, "attractions">) {
  const items = attractions.filter((attraction) => attraction.slug).slice(0, 5);
  return <section id="places" className="ed-destinations ed-section" aria-labelledby="ed-destinations-title"><div className="ed-container ed-destinations-layout">
    <div className="ed-destinations-intro"><p className="ed-eyebrow">HIGHLIGHT DESTINATIONS</p><h2 id="ed-destinations-title" className="ed-title">สถานที่แนะนำ</h2><p>สัมผัสเสน่ห์ยะลา ในแบบที่ไม่ควรพลาด</p><Link href="/attractions" className="ed-text-link">ดูสถานที่ทั้งหมด <ArrowRight aria-hidden="true" /></Link></div>
    {items.length ? <div className="ed-destination-grid">{items.map((item, index) => <Link key={item.slug} href={`/attractions/${item.slug}`} className={`ed-destination ${index === 0 ? "ed-destination-lead" : ""}`}>
      <Photo src={item.imageUrl} alt={item.imageAlt || item.name} sizes={index === 0 ? "(max-width: 800px) 100vw, 40vw" : "(max-width: 800px) 50vw, 22vw"} />
      <div className="ed-card-shade" aria-hidden="true" /><div className="ed-destination-copy"><h3>{item.name}</h3><p>{item.category || item.province}</p></div>
    </Link>)}</div> : <div className="ed-empty"><p>สถานที่ที่เผยแพร่แล้วจะแสดงที่นี่</p><Link href="/attractions">ดูสถานที่ทั้งหมด</Link></div>}
  </div></section>;
}

function Routes({ routes, cover, unavailable }: { routes: PublicRouteCard[]; cover?: string; unavailable: boolean }) {
  return <section id="journeys" className="ed-routes" aria-labelledby="ed-routes-title"><Photo src={cover || DEFAULT_BELONGING} alt="ภาพประกอบบรรยากาศเส้นทางท่องเที่ยว" sizes="100vw" /><div className="ed-routes-veil" aria-hidden="true" /><div className="ed-container ed-routes-layout">
    <div className="ed-routes-intro"><p className="ed-eyebrow">THE JOURNEY MATTERS</p><h2 id="ed-routes-title" className="ed-title">เส้นทางท่องเที่ยว</h2><p>เที่ยวช้า ๆ ใส่ใจรายละเอียด แล้วปล่อยให้ยะลาเล่าเรื่อง</p><Link className="ed-pill ed-pill-light" href="/routes">ดูเส้นทางทั้งหมด <ArrowRight aria-hidden="true" size={18} /></Link></div>
    {routes.length ? <div className="ed-route-cards">{routes.slice(0, 3).map((route) => <Link key={route.slug} href={`/routes/${route.slug}`} className="ed-route-card"><div className="ed-route-image"><Photo src={route.imageUrl} alt={route.imageAlt || route.name} sizes="(max-width: 700px) 75vw, 23vw" /></div><div className="ed-route-content"><h3>{route.name}</h3><p>{route.days} วัน · {route.stopCount} จุดแวะ</p><ArrowRight aria-hidden="true" size={18} /></div></Link>)}</div> : <div className="ed-routes-empty">{unavailable ? "ยังโหลดเส้นทางไม่ได้ในขณะนี้" : "เส้นทางที่เผยแพร่แล้วจะแสดงที่นี่"}</div>}
  </div></section>;
}

function Stories({ stories }: Pick<HomepageEditorialProps, "stories">) {
  const [featured, ...rest] = stories.slice(0, 4);
  return <section id="stories" className="ed-stories ed-section" aria-labelledby="ed-stories-title"><div className="ed-container ed-stories-layout">
    <div className="ed-stories-intro"><p className="ed-eyebrow">PEOPLE &amp; STORIES</p><h2 id="ed-stories-title" className="ed-title">เรื่องราวจากคนในพื้นที่</h2><p>ฟังเรื่องจริง จากผู้คนจริง ที่ทำให้ยะลามีเสน่ห์มากขึ้นทุกวัน</p><Link className="ed-pill ed-pill-primary" href="/stories">อ่านเรื่องราวทั้งหมด <ArrowRight aria-hidden="true" size={18} /></Link></div>
    {featured ? <Link className="ed-story-feature" href={`/stories/${featured.id}`}><Photo src={featured.imageUrl} alt={featured.imageAlt || featured.title} sizes="(max-width: 800px) 100vw, 36vw" /><div className="ed-card-shade" aria-hidden="true" /><h3>{featured.title}</h3></Link> : null}
    <div className="ed-story-small">{rest.map((story) => <Link key={story.id} href={`/stories/${story.id}`} className="ed-story-tile"><div className="ed-story-image"><Photo src={story.imageUrl} alt={story.imageAlt || story.title} sizes="(max-width: 800px) 45vw, 14vw" /></div><h3>{story.title}</h3><p>{story.category}</p></Link>)}
      {!featured ? <p className="ed-empty-note">เรื่องราวที่เผยแพร่แล้วจะแสดงที่นี่</p> : null}
    </div>
  </div></section>;
}

function Food({ restaurants, cover }: { restaurants: PublicRestaurantCard[]; cover?: string }) {
  return <section id="taste" className="ed-food ed-section" aria-labelledby="ed-food-title"><div className="ed-container ed-food-layout">
    <div className="ed-food-visual"><Photo src={cover || restaurants.find((item) => item.imageUrl)?.imageUrl} alt="ภาพประกอบอาหารท้องถิ่นยะลา" sizes="(max-width: 800px) 100vw, 42vw" /></div>
    <div className="ed-food-body"><p className="ed-eyebrow">TASTE OF YALA</p><h2 id="ed-food-title" className="ed-title">อาหารคือเรื่องราว<br />ของผู้คนและวัฒนธรรม</h2><p>สัมผัสรสชาติพื้นถิ่นที่เล่าความหลากหลายของผู้คนในยะลา</p><Link className="ed-pill ed-pill-primary" href="/restaurants">ดูร้านอาหารทั้งหมด <ArrowRight aria-hidden="true" size={18} /></Link>
      {restaurants.length ? <div className="ed-food-cards">{restaurants.slice(0, 4).map((item) => <Link key={item.slug} href={`/restaurants/${item.slug}`}><div className="ed-food-thumb"><Photo src={item.imageUrl} alt={item.imageAlt || item.name} sizes="(max-width: 640px) 40vw, 10vw" /></div><h3>{item.name}</h3></Link>)}</div> : <p className="ed-empty-note">ร้านอาหารที่เผยแพร่แล้วจะแสดงที่นี่</p>}
    </div>
  </div></section>;
}

function Planner({ cover }: { cover?: string }) {
  const links = [
    { href: "/attractions", label: "การเดินทาง", icon: Compass },
    { href: "/accommodations", label: "ที่พัก", icon: Bed },
    { href: "/restaurants", label: "สถานที่กินอร่อย", icon: ForkKnife },
    { href: "/routes", label: "แผนที่ท่องเที่ยว", icon: MapTrifold },
    { href: "/stories", label: "เรื่องเล่าระหว่างทาง", icon: BookOpenText },
  ];
  return <section id="plan" className="ed-planner ed-section" aria-labelledby="ed-planner-title"><div className="ed-container ed-planner-layout"><div><p className="ed-eyebrow">PLAN YOUR TRIP</p><h2 id="ed-planner-title" className="ed-title">วางแผนการเดินทาง</h2><p>ทุกการเดินทาง เริ่มต้นได้ที่นี่</p><nav aria-label="วางแผนการเดินทาง" className="ed-plan-links">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon aria-hidden="true" size={22} /><span>{label}</span></Link>)}</nav></div>
    <div className="ed-plan-visual"><Photo src={cover || DEFAULT_HERO} alt="ภาพประกอบการวางแผนท่องเที่ยว" sizes="(max-width: 800px) 100vw, 50vw" /><a href={BLUEPRINT_PATH} target="_blank" rel="noopener noreferrer" className="ed-plan-document">เอกสารคณะทำงาน <ArrowRight aria-hidden="true" size={18} /></a></div>
    <div className="ed-plan-partner"><Image src="/partners/yala-rajabhat-university.png" alt="ตรามหาวิทยาลัยราชภัฏยะลา" width={88} height={62} className="ed-partner-logo" /><span>ร่วมขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ<br /><strong>มหาวิทยาลัยราชภัฏยะลา</strong></span></div>
  </div></section>;
}

function Closing({ hero, stats }: Pick<HomepageEditorialProps, "hero" | "stats">) {
  return <><section className="ed-closing" aria-labelledby="ed-closing-title"><Photo src={hero.images?.[2] || DEFAULT_BELONGING} alt="ภาพประกอบทิวเขาและหมอกยามเช้า" sizes="100vw" /><div className="ed-closing-veil" aria-hidden="true" /><div className="ed-container ed-closing-inner"><p>&ldquo;การเดินทางที่ดีที่สุด<br />คือการได้เห็นโลกกว้าง<br />และเข้าใจตัวเอง&rdquo;</p><div><span>READY FOR YOUR NEXT STORY?</span><h2 id="ed-closing-title">เรื่องต่อไปของคุณ เริ่มที่ยะลา</h2><PublicCheckinEntryLink className="ed-pill ed-pill-light"><QrCode aria-hidden="true" size={18} /> บันทึกการเดินทาง</PublicCheckinEntryLink><Link className="ed-closing-passport" href="/passport"><Stamp aria-hidden="true" size={17} /> เปิด Digital Passport</Link></div></div></section>
    <section className="ed-evidence" aria-label="ข้อมูลสรุปจากระบบ"><div className="ed-container ed-evidence-inner"><p>ข้อมูลจากการเข้าร่วมและบันทึกในระบบ ไม่ใช่ยอดผู้เข้าชมเว็บไซต์</p>{stats.length ? <dl>{stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl> : <span>ข้อมูลสรุปยังไม่พร้อมแสดง</span>}<Link href="/dashboard">ดูภาพรวมข้อมูล <ArrowRight aria-hidden="true" size={16} /></Link></div></section>
  </>;
}

export function HomepageEditorial({ hero, media, attractions, discoveryAttractions, restaurants, accommodations, cafeRestaurant, cafeCategorySlug, routes, stories, stats, routesUnavailable }: HomepageEditorialProps) {
  return <main className="home-editorial">
    <Hero hero={hero} />
    <Discovery media={media} discoveryAttractions={discoveryAttractions} restaurants={restaurants} accommodations={accommodations} cafeRestaurant={cafeRestaurant} cafeCategorySlug={cafeCategorySlug} routes={routes} stories={stories} />
    <Belonging hero={hero} media={media} />
    <Destinations attractions={attractions} />
    <Routes routes={routes} cover={media.routesCover} unavailable={routesUnavailable} />
    <Stories stories={stories} />
    <Food restaurants={restaurants} cover={media.foodCover} />
    <Planner cover={media.plannerCover} />
    <Closing hero={hero} stats={stats} />
  </main>;
}
