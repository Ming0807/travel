import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import {
  PublicFields,
  PublicSearchField,
  PublicSelect,
} from "@/components/public/PublicFields";
import { PublicFilterDisclosure } from "@/components/public/directory/PublicFilterDisclosure";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/hospitality/labels";

export const ACCOMMODATION_TYPES = ACCOMMODATION_TYPE_OPTIONS;

type AccommodationFilterBarProps = {
  query?: string;
  accommodationType?: string;
  province?: string;
  provinces?: Array<{ value: string; label: string }>;
};

export function AccommodationFilterBar({
  query,
  accommodationType,
  province,
  provinces = [],
}: AccommodationFilterBarProps) {
  const hasFilters = Boolean(query || accommodationType || province);

  return (
    <PublicFilterDisclosure id="accommodation-filter-form" openLabel="เปิดตัวกรองที่พัก" closeLabel="ซ่อนตัวกรองที่พัก">
      <form action="/accommodations" method="GET">
      <PublicFields className={provinces.length > 1
        ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(190px,0.65fr)_minmax(190px,0.65fr)_auto] lg:items-end"
        : "md:grid-cols-[minmax(0,1.5fr)_minmax(210px,0.75fr)_auto] md:items-end"}
      >
        <PublicSearchField
          id="accommodation-search"
          label="ค้นหาที่พัก"
          name="q"
          defaultValue={query ?? ""}
          maxLength={100}
          placeholder="ชื่อที่พักหรือย่านที่สนใจ"
        />
        <PublicSelect
          id="accommodation-type"
          label="ประเภทที่พัก"
          name="accommodationType"
          defaultValue={accommodationType ?? ""}
          options={[{ value: "", label: "ทุกประเภท" }, ...ACCOMMODATION_TYPES]}
        />
        {provinces.length > 1 ? (
          <PublicSelect
            id="accommodation-province"
            label="จังหวัด"
            name="province"
            defaultValue={province ?? ""}
            options={[{ value: "", label: "ทุกพื้นที่ที่เปิดให้บริการ" }, ...provinces]}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <PublicButton type="submit" className="gap-2">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            ค้นหาที่พัก
          </PublicButton>
          {hasFilters ? (
            <PublicButton href="/accommodations" variant="quiet">
              ล้างตัวกรอง
            </PublicButton>
          ) : null}
        </div>
      </PublicFields>
      </form>
    </PublicFilterDisclosure>
  );
}
