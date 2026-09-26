import Link from "next/link";
import {
  Bed,
  Clock,
  CurrencyCircleDollar,
  ForkKnife,
  Globe,
  MapPin,
  NavigationArrow,
  Phone,
} from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { buildHospitalityActions, type HospitalityAction } from "@/lib/hospitality/public-detail";
import "./hospitality-detail.css";

type HospitalityKind = "restaurant" | "accommodation";

export function HospitalityDetailHero({
  name,
  province,
  category,
  imageUrl,
  imageAlt,
}: {
  name: string;
  province: string;
  category: string | null;
  imageUrl: string | null;
  imageAlt: string;
}) {
  return (
    <header className="hospitality-hero mt-5">
      {imageUrl ? (
        <div className="hospitality-hero-media">
          <PublicMediaFrame
            src={imageUrl}
            alt={imageAlt}
            aspect="detail"
            sizes="(max-width: 1023px) calc(100vw - 2rem), 1152px"
            priority
            fallbackLabel="ยังไม่มีรูปภาพ"
          />
        </div>
      ) : null}
      <div className="hospitality-hero-shade" aria-hidden="true" />
      <div className="hospitality-hero-copy">
        {category ? <p className="hospitality-hero-category">{category}</p> : null}
        <h1>{name}</h1>
        <p className="hospitality-hero-place">
          <MapPin size={18} weight="fill" aria-hidden="true" />
          {province}
        </p>
      </div>
    </header>
  );
}

function actionContent(action: HospitalityAction, kind: HospitalityKind) {
  if (action.kind === "phone") {
    return {
      label: kind === "restaurant" ? "โทรหาร้านอาหาร" : "โทรหาที่พัก",
      icon: <Phone size={18} weight="bold" aria-hidden="true" />,
    };
  }
  if (action.kind === "website") {
    return {
      label: "เปิดเว็บไซต์",
      icon: <Globe size={18} weight="bold" aria-hidden="true" />,
    };
  }
  return {
    label: "เปิดแผนที่",
    icon: <NavigationArrow size={18} weight="fill" aria-hidden="true" />,
  };
}

export function HospitalityInfoPanel({
  kind,
  category,
  address,
  openingHours,
  priceRange,
  contactInfo,
  latitude,
  longitude,
}: {
  kind: HospitalityKind;
  category: string | null;
  address: string | null;
  openingHours: string | null;
  priceRange: string | null;
  contactInfo: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const actions = buildHospitalityActions({ contactInfo, latitude, longitude });
  const facts = [
    category ? {
      label: kind === "restaurant" ? "ประเภทอาหาร" : "ประเภทที่พัก",
      value: category,
      icon: kind === "restaurant"
        ? <ForkKnife size={20} aria-hidden="true" />
        : <Bed size={20} aria-hidden="true" />,
    } : null,
    kind === "accommodation" && priceRange ? {
      label: "ช่วงราคา",
      value: priceRange,
      icon: <CurrencyCircleDollar size={20} aria-hidden="true" />,
    } : null,
    address ? {
      label: "ที่อยู่",
      value: address,
      icon: <MapPin size={20} aria-hidden="true" />,
    } : null,
    kind === "restaurant" && openingHours ? {
      label: "เวลาทำการ",
      value: openingHours,
      icon: <Clock size={20} aria-hidden="true" />,
    } : null,
    contactInfo ? {
      label: "ข้อมูลติดต่อ",
      value: contactInfo,
      icon: <Phone size={20} aria-hidden="true" />,
    } : null,
  ].filter((fact): fact is NonNullable<typeof fact> => Boolean(fact));

  return (
    <section aria-labelledby="hospitality-info-heading" className="hospitality-info">
      <h2 id="hospitality-info-heading" className="hospitality-section-title text-xl font-bold">
        {kind === "restaurant" ? "ข้อมูลร้านอาหาร" : "ข้อมูลที่พัก"}
      </h2>

      {facts.length > 0 ? (
        <dl className="mt-5 space-y-4">
          {facts.map((fact) => (
            <div key={fact.label} className="hospitality-fact grid grid-cols-[24px_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 text-[#9b4e38]">{fact.icon}</span>
              <div>
                <dt className="text-xs font-semibold text-[#5f6668]">{fact.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold leading-6 text-[#263036]">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-black/65">ยังไม่มีข้อมูลเพิ่มเติมจากผู้ดูแล</p>
      )}

      {actions.length > 0 ? (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {actions.map((action) => {
            const content = actionContent(action, kind);
            const external = action.kind !== "phone";
            return (
              <a
                key={action.kind}
                href={action.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="hospitality-action inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4e38]"
              >
                {content.icon}
                {content.label}
              </a>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export type HospitalityRelatedAttraction = {
  slug: string;
  name: string;
  distanceText: string | null;
  imageUrl: string | null;
  imageAlt: string;
};

export function HospitalityRelatedAttractions({ items }: { items: HospitalityRelatedAttraction[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="nearby-attractions-heading">
      <div className="hospitality-section-heading">
        <h2 id="nearby-attractions-heading" className="hospitality-section-title text-2xl font-bold">สถานที่ท่องเที่ยวใกล้เคียง</h2>
        <p className="mt-1 text-sm leading-6 text-[#5f6668]">สถานที่ที่เชื่อมโยงกับร้านหรือที่พักแห่งนี้</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/attractions/${item.slug}`}
            className="hospitality-related group grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4e38]"
            aria-label={`ดูสถานที่ ${item.name}`}
          >
            <PublicMediaFrame
              src={item.imageUrl}
              alt={item.imageAlt}
              aspect="square"
              sizes="96px"
              fallbackLabel="ยังไม่มีรูปสถานที่"
            />
            <div className="min-w-0 self-center">
              <h3 className="text-base font-bold leading-6 group-hover:text-[#9b4e38]">{item.name}</h3>
              {item.distanceText ? (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-black/65">
                  <NavigationArrow size={14} weight="fill" aria-hidden="true" />
                  {item.distanceText}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
