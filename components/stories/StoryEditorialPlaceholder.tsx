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
    return {
      icon: Mountains,
      bg: "from-[#0F291E] via-[#16382A] to-[#1F4A38]",
      accent: "text-emerald-300",
      glow: "bg-emerald-500/20",
      patternColor: "#34D399",
      label: "ธรรมชาติและทัศนียภาพ",
    };
  }
  if (cat.includes("อาหาร") || cat.includes("food") || cat.includes("กิน")) {
    return {
      icon: ForkKnife,
      bg: "from-[#2A1508] via-[#3D1E0C] to-[#4F2A12]",
      accent: "text-amber-300",
      glow: "bg-amber-500/20",
      patternColor: "#FBBF24",
      label: "อาหารและของกินถิ่นใต้",
    };
  }
  if (cat.includes("วัฒนธรรม") || cat.includes("ประวัติศาสตร์") || cat.includes("culture") || cat.includes("ศรัทธา")) {
    return {
      icon: Mosque,
      bg: "from-[#1E112A] via-[#2D1B3E] to-[#3B2550]",
      accent: "text-purple-300",
      glow: "bg-purple-500/20",
      patternColor: "#C084FC",
      label: "ประวัติศาสตร์และวัฒนธรรม",
    };
  }
  if (cat.includes("คู่มือ") || cat.includes("guide") || cat.includes("เดินทาง")) {
    return {
      icon: Compass,
      bg: "from-[#241A14] via-[#35251C] to-[#453124]",
      accent: "text-orange-300",
      glow: "bg-orange-500/20",
      patternColor: "#FB923C",
      label: "คู่มือการเดินทาง",
    };
  }
  if (cat.includes("ชุมชน") || cat.includes("community") || cat.includes("วิถีชีวิต")) {
    return {
      icon: Users,
      bg: "from-[#0E252A] via-[#14363D] to-[#1C4851]",
      accent: "text-teal-300",
      glow: "bg-teal-500/20",
      patternColor: "#2DD4BF",
      label: "วิถีชีวิตและชุมชน",
    };
  }
  return {
    icon: BookOpen,
    bg: "from-[#1F1C18] via-[#2D2721] to-[#3B342C]",
    accent: "text-amber-300",
    glow: "bg-orange-500/20",
    patternColor: "#F59E0B",
    label: "บันทึกการเดินทางยะลา",
  };
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
    <div
      className={`relative size-full overflow-hidden bg-gradient-to-br ${theme.bg} flex items-center justify-center p-6 text-white select-none`}
    >
      {/* Topographic Wave Graphic in Background */}
      <svg
        className="absolute inset-0 size-full opacity-25"
        viewBox="0 0 400 250"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0,100 C100,160 200,60 300,120 C350,150 400,110 400,110 L400,250 L0,250 Z"
          fill={theme.patternColor}
          opacity="0.3"
        />
        <path
          d="M0,150 C120,200 240,120 360,170 C380,180 400,175 400,175 L400,250 L0,250 Z"
          fill={theme.patternColor}
          opacity="0.2"
        />
        <circle cx="200" cy="80" r="60" stroke={theme.patternColor} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      </svg>

      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute size-40 rounded-full ${theme.glow} blur-3xl`} />

      {/* Central Editorial Icon Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2.5 text-center">
        <div className={`grid ${featured ? "size-16" : "size-12"} place-items-center rounded-2xl bg-white/10 ${theme.accent} backdrop-blur-md border border-white/15 shadow-md`}>
          <Icon size={featured ? 32 : 24} weight="duotone" />
        </div>
        <span className="text-[11px] font-bold tracking-wider text-white/80 uppercase">
          {theme.label}
        </span>
      </div>
    </div>
  );
}
