import {
  BookOpen,
  Compass,
  ForkKnife,
  Mosque,
  Mountains,
  Users,
} from "@phosphor-icons/react/dist/ssr";

function getTopicTheme(category?: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ธรรมชาติ") || cat.includes("nature")) {
    return { icon: Mountains, bg: "bg-[#17392B]", accent: "text-emerald-200", label: "ธรรมชาติและทัศนียภาพ" };
  }
  if (cat.includes("อาหาร") || cat.includes("food") || cat.includes("กิน")) {
    return { icon: ForkKnife, bg: "bg-[#4A2A14]", accent: "text-amber-200", label: "อาหารและของกินถิ่นใต้" };
  }
  if (cat.includes("วัฒนธรรม") || cat.includes("ประวัติศาสตร์") || cat.includes("culture") || cat.includes("ศรัทธา")) {
    return { icon: Mosque, bg: "bg-[#3B2E43]", accent: "text-orange-100", label: "ประวัติศาสตร์และวัฒนธรรม" };
  }
  if (cat.includes("คู่มือ") || cat.includes("guide") || cat.includes("เดินทาง")) {
    return { icon: Compass, bg: "bg-[#453124]", accent: "text-orange-200", label: "คู่มือการเดินทาง" };
  }
  if (cat.includes("ชุมชน") || cat.includes("community") || cat.includes("วิถีชีวิต")) {
    return { icon: Users, bg: "bg-[#1C4851]", accent: "text-teal-200", label: "วิถีชีวิตและชุมชน" };
  }
  return { icon: BookOpen, bg: "bg-[#3B342C]", accent: "text-amber-200", label: "บันทึกการเดินทางยะลา" };
}

export function StoryEditorialPlaceholder({
  category,
  featured = false,
}: {
  category?: string;
  featured?: boolean;
}) {
  const theme = getTopicTheme(category);
  const Icon = theme.icon;

  return (
    <div className={`flex size-full select-none items-center justify-center p-6 text-white ${theme.bg}`}>
      <div className="flex flex-col items-center justify-center gap-2.5 text-center">
        <div className={`grid ${featured ? "size-16" : "size-12"} place-items-center rounded-xl border border-white/15 bg-white/10 ${theme.accent}`}>
          <Icon size={featured ? 32 : 24} weight="duotone" aria-hidden="true" />
        </div>
        <span className="text-[11px] font-bold text-white/85">{theme.label}</span>
        <span className="text-[10px] text-white/65">ยังไม่มีภาพประกอบ</span>
      </div>
    </div>
  );
}
