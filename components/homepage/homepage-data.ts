import type { AttractionCard, DashboardMetricCard } from "@/types/tourism";

export const homepageAttractions: AttractionCard[] = [
  {
    slug: "aiyerweng-skywalk",
    name: "จุดชมวิวทะเลหมอกอัยเยอร์เวง",
    province: "ยะลา",
    category: "Mountain view",
    description: "จุดชมวิวทะเลหมอกที่เบตง เหมาะสำหรับถ่ายรูปรับใบประกาศดิจิทัลและสะสมตราประทับ",
    imageUrl:
      "https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Betong Skywalk",
    tags: ["Certificate spot", "Nature", "Yala"],
  },
  {
    slug: "pattani-central-mosque",
    name: "มัสยิดกลางปัตตานี",
    province: "ปัตตานี",
    category: "Culture",
    description: "มัสยิดกลางประจำจังหวัดปัตตานี สถาปัตยกรรมอันโดดเด่นและเรื่องราวทางวัฒนธรรม",
    imageUrl:
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Pattani Mosque",
    tags: ["Heritage", "Stories", "Pattani"],
  },
  {
    slug: "pru-sirinthorn-forest",
    name: "ป่าพรุสิรินธร",
    province: "นราธิวาส",
    category: "Nature",
    description: "ป่าพรุสิรินธร ป่าพรุน้ำจืดที่ใหญ่ที่สุดในประเทศไทย ธรรมชาติที่อุดมสมบูรณ์",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Forest",
    tags: ["Nature", "Eco", "Narathiwat"],
  },
  {
    slug: "southern-local-food",
    name: "อาหารพื้นถิ่นชายแดนใต้",
    province: "ปัตตานี",
    category: "Food",
    description: "สำรวจอาหารพื้นถิ่นและรสชาติที่หลากหลายของชายแดนใต้",
    imageUrl:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Local food",
    tags: ["Food", "Culture", "Pattani"],
  },
  {
    slug: "yala-waterfall",
    name: "น้ำตกและธรรมชาติ",
    province: "ยะลา",
    category: "Waterfall",
    description: "น้ำตกและธรรมชาติที่สวยงามในพื้นที่ยะลา เหมาะกับการท่องเที่ยวเชิงนิเวศ",
    imageUrl:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Waterfall",
    tags: ["Nature", "Waterfall", "Yala"],
  },
  {
    slug: "narathiwat-coast",
    name: "ชายหาดและวิถีประมง",
    province: "นราธิวาส",
    category: "Coastal",
    description: "ชายหาดสวยงามและวิถีชีวิตชาวประมงท้องถิ่นที่นราธิวาส",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Beach",
    tags: ["Sea", "Coastal", "Narathiwat"],
  },
  {
    slug: "betong-city-route",
    name: "เส้นทางเมืองเบตง",
    province: "ยะลา",
    category: "City",
    description: "สำรวจเส้นทางในเมืองเบตง เมืองท่องเที่ยวสำคัญของยะลา",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85",
    imageAlt: "City and mountains",
    tags: ["City", "Route", "Yala"],
  },
  {
    slug: "pattani-community-market",
    name: "ตลาดและวิถีชุมชน",
    province: "ปัตตานี",
    category: "Community",
    description: "ตลาดท้องถิ่นและวิถีชุมชนที่สะท้อนวัฒนธรรมของปัตตานี",
    imageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=700&q=85",
    imageAlt: "Floating market",
    tags: ["Community", "Market", "Pattani"],
  },
  {
    slug: "narathiwat-culture",
    name: "วัฒนธรรมและเรื่องเล่าท้องถิ่น",
    province: "นราธิวาส",
    category: "Culture",
    description: "เรื่องเล่าท้องถิ่น ศิลปะ และวัฒนธรรมของนราธิวาส",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85",
    imageAlt: "People and culture",
    tags: ["Culture", "Stories", "Narathiwat"],
  },
  {
    slug: "yala-360-tour",
    name: "360° Tour จุดชมวิว",
    province: "ยะลา",
    category: "Virtual tour",
    description: "ชมจุดชมวิวแบบ 360 องศา สัมผัสบรรยากาศทะเลหมอกเสมือนจริง",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85",
    imageAlt: "360 tour",
    tags: ["360°", "Virtual", "Yala"],
  },
];

export const dashboardPreviewMetrics: DashboardMetricCard[] = [
  {
    label: "Tourist Profiles",
    value: "5,240",
    note: "ไม่ใช่จำนวนคนยืนยันตัวตนจริง",
  },
  {
    label: "Total Visits",
    value: "8,942",
    note: "นับจาก visit ไม่ใช่ QR scan",
  },
  {
    label: "Certificates",
    value: "7,880",
    note: "ใบประกาศที่สร้างสำเร็จ",
  },
  {
    label: "Satisfaction",
    value: "4.6/5",
    note: "เฉลี่ยจากคนที่ตอบเท่านั้น",
  },
];

export type TravelStory = {
  slug: string;
  title: string;
  category: string;
  province: string;
  imageUrl: string;
  imageAlt: string;
};

export const travelStories: TravelStory[] = [
  {
    slug: "pattani-5-checkin-spots",
    title: "5 จุดเช็กอินปัตตานีที่สายถ่ายรูปไม่ควรพลาด",
    category: "Pattani · Culture",
    province: "Pattani",
    imageUrl:
      "https://images.unsplash.com/photo-1580974511812-4b7196271a93?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Pattani story",
  },
  {
    slug: "digital-passport-guide",
    title: "ทำความรู้จัก Digital Passport สำหรับนักเดินทาง",
    category: "Passport · Guide",
    province: "All",
    imageUrl:
      "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Passport story",
  },
  {
    slug: "narathiwat-eco-tourism",
    title: "ท่องเที่ยวเชิงนิเวศและวิถีชุมชนชายแดนใต้",
    category: "Narathiwat · Eco",
    province: "Narathiwat",
    imageUrl:
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Eco tourism",
  },
];
