import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import {
  PublicFields,
  PublicSearchField,
  PublicSelect,
} from "@/components/public/PublicFields";
import { PublicFilterDisclosure } from "@/components/public/directory/PublicFilterDisclosure";
import { RESTAURANT_FOOD_TYPE_OPTIONS } from "@/lib/hospitality/labels";

export const RESTAURANT_FOOD_TYPES = RESTAURANT_FOOD_TYPE_OPTIONS;

type RestaurantFilterBarProps = {
  query?: string;
  foodType?: string;
  province?: string;
  provinces?: Array<{ value: string; label: string }>;
  foodTypes?: Array<{ value: string; label: string }>;
};

export function RestaurantFilterBar({
  query,
  foodType,
  province,
  provinces = [],
  foodTypes = [...RESTAURANT_FOOD_TYPES],
}: RestaurantFilterBarProps) {
  const hasFilters = Boolean(query || foodType || province);

  return (
    <PublicFilterDisclosure id="restaurant-filter-form" openLabel="เปิดตัวกรองร้านอาหาร" closeLabel="ซ่อนตัวกรองร้านอาหาร">
      <form action="/restaurants" method="GET">
      <PublicFields className={provinces.length > 1
        ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(190px,0.65fr)_minmax(190px,0.65fr)_auto] lg:items-end"
        : "md:grid-cols-[minmax(0,1.5fr)_minmax(210px,0.75fr)_auto] md:items-end"}
      >
        <PublicSearchField
          id="restaurant-search"
          label="ค้นหาร้านอาหาร"
          name="q"
          defaultValue={query ?? ""}
          maxLength={100}
          placeholder="ชื่อร้านหรือเมนูที่สนใจ"
        />
        <PublicSelect
          id="restaurant-food-type"
          label="ประเภทอาหาร"
          name="foodType"
          defaultValue={foodType ?? ""}
          options={[{ value: "", label: "ทุกประเภท" }, ...foodTypes]}
        />
        {provinces.length > 1 ? (
          <PublicSelect
            id="restaurant-province"
            label="จังหวัด"
            name="province"
            defaultValue={province ?? ""}
            options={[{ value: "", label: "ทุกพื้นที่ที่เปิดให้บริการ" }, ...provinces]}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <PublicButton type="submit" className="gap-2">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            ค้นหาร้านอาหาร
          </PublicButton>
          {hasFilters ? (
            <PublicButton href="/restaurants" variant="quiet">
              ล้างตัวกรอง
            </PublicButton>
          ) : null}
        </div>
      </PublicFields>
      </form>
    </PublicFilterDisclosure>
  );
}
