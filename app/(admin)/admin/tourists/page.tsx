import type { Metadata } from "next";
import { ExportButton } from "@/components/admin/ExportButton";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { SearchInput } from "@/components/admin/SearchInput";
import { TouristListClient } from "@/components/admin/tourists/TouristListClient";
import { requirePermission } from "@/lib/auth/guards";
import {
  getAdminTouristFilterOptions,
  listAdminTourists,
} from "@/lib/repositories/admin-tourist.repository";
import { adminTouristFiltersSchema } from "@/lib/validation/admin-tourist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข้อมูลนักท่องเที่ยว | ระบบผู้ดูแล",
};

const providerOptions = [
  { value: "anonymous_device", label: "ผู้เยี่ยมชมบนอุปกรณ์" },
  { value: "line", label: "เชื่อม LINE" },
  { value: "google", label: "เชื่อม Google" },
  { value: "email", label: "เชื่อมอีเมล" },
];

const sortOptions = [
  { value: "newest", label: "เริ่มใช้งานล่าสุด" },
  { value: "oldest", label: "เริ่มใช้งานเก่าสุด" },
  { value: "name_asc", label: "ชื่อ ก-ฮ" },
  { value: "name_desc", label: "ชื่อ ฮ-ก" },
];

export default async function AdminTouristsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("tourist.read");
  const raw = await searchParams;
  const parsed = adminTouristFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : adminTouristFiltersSchema.parse({});
  const [{ items, total, page, pageSize }, options] = await Promise.all([
    listAdminTourists(filters),
    getAdminTouristFilterOptions(),
  ]);

  const countryOptions = options.countries.map((country) => ({
    value: String(country.country_id),
    label: country.country_name_th || country.country_name_en || `ประเทศ ${country.country_id}`,
  }));
  const provinceOptions = options.provinces.map((province) => ({
    value: String(province.province_id),
    label: province.province_name_th || province.province_name_en || `จังหวัด ${province.province_id}`,
  }));

  return (
    <ListPageShell
      eyebrow="ฐานข้อมูลนักท่องเที่ยว"
      title="ข้อมูลนักท่องเที่ยว"
      description="ค้นหาโปรไฟล์และติดตามการมีส่วนร่วม โดยแสดงเฉพาะข้อมูลที่จำเป็นต่อการดูแลระบบ"
      hideCreateButton
      headerActions={<ExportButton endpoint="/api/admin/export/tourists" label="ส่งออกข้อมูลสรุป" />}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle={filters.search || filters.countryId || filters.provinceId || filters.provider ? "ไม่พบข้อมูลตามตัวกรอง" : "ยังไม่มีข้อมูลนักท่องเที่ยว"}
      emptyDescription={filters.search || filters.countryId || filters.provinceId || filters.provider ? "ลองล้างคำค้นหาหรือเปลี่ยนตัวกรอง แล้วค้นหาอีกครั้ง" : "ข้อมูลจะปรากฏเมื่อนักท่องเที่ยวเริ่มใช้งานผ่าน QR Check-in"}
      filters={
        <FilterBar>
          <div className="min-w-[240px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อ หรือวางรหัสนักท่องเที่ยวเต็มรูปแบบ" />
          </div>
          <FilterSelect label="ประเทศ" paramKey="countryId" options={countryOptions} allLabel="ทุกประเทศ" />
          <FilterSelect label="จังหวัด" paramKey="provinceId" options={provinceOptions} allLabel="ทุกจังหวัด" />
          <FilterSelect label="วิธีเข้าใช้งาน" paramKey="provider" options={providerOptions} allLabel="ทุกวิธี" />
          <FilterSelect label="เรียงตาม" paramKey="sort" options={sortOptions} allLabel="เริ่มใช้งานล่าสุด" />
        </FilterBar>
      }
    >
      <TouristListClient tourists={items} />
    </ListPageShell>
  );
}
