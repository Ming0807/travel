export const APP_NAME = "Southern Border Tourism Data & Intelligence Platform";

export const TARGET_PROVINCES = [
  {
    key: "yala",
    label: "Yala",
    labelTh: "ยะลา",
    tone: "emerald"
  },
  {
    key: "pattani",
    label: "Pattani",
    labelTh: "ปัตตานี",
    tone: "coral"
  },
  {
    key: "narathiwat",
    label: "Narathiwat",
    labelTh: "นราธิวาส",
    tone: "gold"
  },
  {
    key: "songkhla",
    label: "Songkhla",
    labelTh: "สงขลา",
    tone: "emerald"
  },
  {
    key: "satun",
    label: "Satun",
    labelTh: "สตูล",
    tone: "gold"
  }
] as const;

export const CORE_DATA_DIMENSIONS = [
  "Tourist",
  "Travel Behavior",
  "Attractions Visited",
  "Expenses",
  "Satisfaction"
] as const;

export const REWARD_FIRST_FLOW = [
  "QR landing",
  "Minimal form",
  "Photo upload",
  "Certificate",
  "Stamp",
  "Optional survey"
] as const;

/** External 360 Vista virtual tour URL — โปรเจกต์ของอีกทีมหนึ่ง */
export const VISTA_360_EXTERNAL_URL = "https://resonant-biscuit-10a328.netlify.app/";
