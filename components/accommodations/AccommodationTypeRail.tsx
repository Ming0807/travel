import Link from "next/link";

type AccommodationTypeRailProps = {
  query?: string;
  selectedType?: string;
  province?: string;
  types: ReadonlyArray<{ value: string; label: string }>;
};

function typeHref({
  query,
  province,
  type,
}: {
  query?: string;
  province?: string;
  type?: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("accommodationType", type);
  if (province) params.set("province", province);
  const queryString = params.toString();
  return queryString ? `/accommodations?${queryString}` : "/accommodations";
}

export function AccommodationTypeRail({
  query,
  selectedType,
  province,
  types,
}: AccommodationTypeRailProps) {
  const options = [{ value: "", label: "ทั้งหมด" }, ...types];

  return (
    <nav aria-label="เลือกประเภทที่พัก" className="overflow-x-auto border-b border-black/10 bg-white">
      <div className="flex min-w-max gap-1 px-4 py-3 sm:px-5">
        {options.map((option) => {
          const active = (selectedType ?? "") === option.value;
          return (
            <Link
              key={option.value || "all"}
              href={typeHref({ query, province, type: option.value || undefined })}
              aria-current={active ? "page" : undefined}
              className={active
                ? "inline-flex min-h-11 items-center border border-[var(--public-coral)] bg-[var(--public-coral)] px-4 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
                : "inline-flex min-h-11 items-center border border-black/15 bg-white px-4 text-sm font-semibold text-[var(--public-ink)] hover:border-[var(--public-coral)] hover:text-[var(--public-coral-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
