import { Clock, MapPin, Phone, Tag } from "@phosphor-icons/react/dist/ssr";

type AttractionInfoSidebarProps = {
  province: string;
  attractionType: string;
  address: string | null;
  openingHours: string | null;
  contactInfo: string | null;
};

const facts = [
  { key: "type", label: "ประเภท", icon: Tag },
  { key: "location", label: "ที่ตั้ง", icon: MapPin },
  { key: "hours", label: "เวลาทำการ", icon: Clock },
  { key: "contact", label: "ติดต่อ", icon: Phone },
] as const;

export function AttractionInfoSidebar({
  province,
  attractionType,
  address,
  openingHours,
  contactInfo,
}: AttractionInfoSidebarProps) {
  const values = {
    type: attractionType || null,
    location: address || province || null,
    hours: openingHours,
    contact: contactInfo,
  };
  const availableFacts = facts.filter((fact) => values[fact.key]);

  return (
    <section aria-labelledby="attraction-facts-title" className="border border-slate-200 bg-white p-5">
      <h2 id="attraction-facts-title" className="text-lg font-bold text-[var(--public-ink)]">ข้อมูลสถานที่</h2>
      {availableFacts.length > 0 ? (
        <dl className="mt-4 divide-y divide-slate-200">
          {availableFacts.map(({ key, label, icon: Icon }) => (
            <div key={key} className="grid grid-cols-[28px_1fr] gap-3 py-4 first:pt-0 last:pb-0">
              <Icon aria-hidden="true" size={20} className="mt-0.5 text-[var(--public-teal)]" />
              <div>
                <dt className="text-sm font-semibold text-slate-600">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--public-ink)]">{values[key]}</dd>
              </div>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">ยังไม่มีข้อมูลประกอบเพิ่มเติม</p>
      )}
    </section>
  );
}
