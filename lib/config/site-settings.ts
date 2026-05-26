export const SITE_SETTING_DEFAULTS = {
  homepage_hero: {
    title: "ค้นพบ<br/>เสน่ห์ชายแดนใต้",
    subtitle: "Yala • Pattani • Narathiwat",
    description: "สำรวจสถานที่ท่องเที่ยว วัฒนธรรม และเส้นทางท่องเที่ยวในพื้นที่ชายแดนใต้ พร้อมระบบ QR check-in และใบประกาศดิจิทัล",
    images: ["", "", ""],
  },
  homepage_how_it_works: {
    title: "ใช้งานง่ายเหมือนแอป",
    subtitle: "แต่ไม่ต้องโหลดแอป",
    description: "นักท่องเที่ยวสแกน QR กรอกข้อมูลขั้นต่ำ รับใบประกาศและตราประทับ แล้วเลือกตอบแบบสอบถามเพิ่มเติมได้ภายหลัง",
  },
  homepage_highlights: {
    title: "ประสบการณ์จากนักเดินทาง",
    authorName: "Traveler",
    location: "Southern Border",
    quote: "ชายแดนใต้มีเรื่องราวและสถานที่ที่น่าค้นพบมากกว่าที่คิด",
    videoCover: "",
    imageCover: "",
    imageTitle: "",
  },
  homepage_cta: {
    title: "รับแรงบันดาลใจการเดินทาง",
    subtitle: "ส่งตรงถึงคุณ",
    description: "ติดตามข่าวสาร เส้นทางแนะนำ และเรื่องราวใหม่จากพื้นที่ชายแดนใต้",
    bgImage: "",
  },
  homepage_featured_attractions: {
    slugs: [] as string[],
  },
  attractions_page_hero: {
    title: "สำรวจสถานที่ท่องเที่ยวใน 3 จังหวัดชายแดนใต้",
    description: "ค้นหาสถานที่ท่องเที่ยวตามจังหวัด ประเภท และเรื่องราวที่เหมาะกับแผนการเดินทางของคุณ",
  },
  attractions_page_banner: {
    title: "สถานที่แนะนำ",
    subtitle: "เลือกจากข้อมูลที่เผยแพร่แล้วในระบบ",
    linkText: "ดูเพิ่มเติม",
    linkUrl: "/attractions",
    image: "",
  },
  stories_page_hero: {
    title: "เรื่องราวและแรงบันดาลใจ",
    description: "บทความ เส้นทาง วัฒนธรรม และประสบการณ์ท่องเที่ยวจากพื้นที่ชายแดนใต้",
  },
  stories_page_cta: {
    title: "อ่านเรื่องราวเพิ่มเติม",
    subtitle: "ค้นพบมุมมองใหม่ของพื้นที่",
    linkText: "ดูเรื่องราว",
    linkUrl: "/stories",
    image: "",
  },
  routes_page_hero: {
    title: "เส้นทางท่องเที่ยวที่แนะนำ",
    description: "รวมเส้นทางที่เชื่อมสถานที่จริงในระบบ เพื่อช่วยวางแผนทริปและส่งเสริมการกระจายนักท่องเที่ยว",
  },
  restaurants_page_hero: {
    title: "ค้นพบรสชาติท้องถิ่น",
    description: "สำรวจร้านอาหาร คาเฟ่ และอาหารพื้นถิ่นที่ช่วยเติมเต็มประสบการณ์ท่องเที่ยว",
  },
  restaurants_page_feature: {
    title: "Taste the Culture",
    subtitle: "จากอาหารพื้นถิ่นสู่ประสบการณ์ที่น่าจดจำ",
    image: "",
  },
  restaurants_page_cta: {
    title: "เป็นเจ้าของร้านอาหาร?",
    subtitle: "ร่วมเป็นส่วนหนึ่งของแพลตฟอร์ม",
    linkText: "ติดต่อเรา",
    linkUrl: "/contact",
    image: "",
  },
  general_info: {
    email: "",
    phone: "",
    address: "",
  },
  social_media: {
    facebook: "",
    instagram: "",
    line: "",
  },
  footer_info: {
    copyright: "Copyright © 2026 Southern Border Tourism Platform. สงวนลิขสิทธิ์",
    description: "แพลตฟอร์มท่องเที่ยวชายแดนใต้ เพื่อสนับสนุนข้อมูลการท่องเที่ยวและการวางแผนอย่างยั่งยืน",
  },
  seo_settings: {
    metaTitle: "Southern Border Tourism Platform",
    metaDescription: "Tourism data and discovery platform for Yala, Pattani, and Narathiwat.",
    ogImage: "",
    googleAnalyticsId: "",
  },
  feature_toggles: {
    enableStamp: true,
    enableCertificate: true,
    enableSurvey: true,
  },
  maintenance_info: {
    isMaintenanceMode: false,
    maintenanceMessage: "",
  },
} as const;

export type SiteSettingKey = keyof typeof SITE_SETTING_DEFAULTS;

export const SITE_SETTING_KEYS = Object.keys(SITE_SETTING_DEFAULTS) as SiteSettingKey[];

export function isSiteSettingKey(key: string): key is SiteSettingKey {
  return SITE_SETTING_KEYS.includes(key as SiteSettingKey);
}
