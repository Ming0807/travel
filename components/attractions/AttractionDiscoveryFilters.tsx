import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import {
  PublicFields,
  PublicSearchField,
  PublicSelect,
  type PublicSelectOption,
} from "@/components/public/PublicFields";

export interface AttractionDiscoveryFiltersProps {
  query?: string;
  selectedType?: string;
  typeOptions: PublicSelectOption[];
}

export function AttractionDiscoveryFilters({
  query,
  selectedType,
  typeOptions,
}: AttractionDiscoveryFiltersProps) {
  const hasFilters = Boolean(query || selectedType);

  return (
    <form
      action="/attractions"
      method="GET"
      className="rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-4 sm:p-5"
    >
      <PublicFields className="md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.75fr)_auto] md:items-end">
        <PublicSearchField
          id="attraction-search"
          label="ค้นหาสถานที่"
          name="q"
          defaultValue={query ?? ""}
          placeholder="ชื่อสถานที่หรือคำที่สนใจ"
        />
        <PublicSelect
          id="attraction-type"
          label="ประเภทสถานที่"
          name="type"
          defaultValue={selectedType ?? ""}
          options={[{ value: "", label: "ทุกประเภท" }, ...typeOptions]}
        />
        <div className="flex flex-wrap gap-2 md:pb-0">
          <PublicButton type="submit" className="gap-2">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            ค้นหาสถานที่
          </PublicButton>
          {hasFilters ? (
            <PublicButton href="/attractions" variant="quiet">
              ล้างตัวกรอง
            </PublicButton>
          ) : null}
        </div>
      </PublicFields>
    </form>
  );
}
