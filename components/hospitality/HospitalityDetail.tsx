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
    <header className="mt-7">
      <div className="grid gap-4 border-b border-black/10 pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          {category ? (
            <p className="text-sm font-semibold text-[var(--public-coral-strong)]">{category}</p>
          ) : null}
          <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
            {name}
          </h1>
        </div>
        <p className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--public-teal)]">
          <MapPin size={20} weight="fill" aria-hidden="true" />
          {province}
        </p>
      </div>

      <div className="mt-6">
        <PublicMediaFrame
          src={imageUrl}
          alt={imageAlt}
          aspect="detail"
          sizes="(max-width: 1023px) calc(100vw - 2rem), 1152px"
          priority
          fallbackLabel="ยังไม่มีรูปภาพ"
        />
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
    <section aria-labelledby="hospitality-info-heading" className="border-y border-black/10 py-6 lg:border lg:bg-white lg:p-6">
      <h2 id="hospitality-info-heading" className="text-xl font-bold">
        {kind === "restaurant" ? "ข้อมูลร้านอาหาร" : "ข้อมูลที่พัก"}
      </h2>

      {facts.length > 0 ? (
        <dl className="mt-5 space-y-5">
          {facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 text-[var(--public-coral-strong)]">{fact.icon}</span>
              <div>
                <dt className="text-sm font-semibold text-black/65">{fact.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold leading-6">{fact.value}</dd>
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
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--public-ink)] transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
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
      <div className="border-b border-black/10 pb-4">
        <h2 id="nearby-attractions-heading" className="text-2xl font-bold">สถานที่ท่องเที่ยวใกล้เคียง</h2>
        <p className="mt-1 text-sm leading-6 text-black/65">รายการที่ผู้ดูแลเชื่อมโยงกับสถานที่นี้</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/attractions/${item.slug}`}
            className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 border border-black/10 bg-white p-3 transition-colors hover:border-[var(--public-coral)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
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
              <h3 className="text-base font-bold leading-6 group-hover:text-[var(--public-coral-strong)]">{item.name}</h3>
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
