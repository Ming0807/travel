import Link from "next/link";

export type RestaurantCategoryNavItem = {
  value: string;
  label: string;
  href: string;
};

export function RestaurantCategoryNav({
  activeValue,
  items,
}: {
  activeValue?: string;
  items: RestaurantCategoryNavItem[];
}) {
  const selectedValue = activeValue ?? "";

  return (
    <nav aria-label="เลือกหมวดร้านอาหาร" className="border-y border-black/10 bg-white">
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-max items-stretch lg:min-w-0 lg:grid lg:grid-cols-6">
          {items.map((item) => {
            const selected = item.value === selectedValue;
            return (
              <li key={item.value || "all"} className="min-w-36 lg:min-w-0">
                <Link
                  href={item.href}
                  aria-current={selected ? "page" : undefined}
                  className={`relative flex min-h-14 items-center justify-center border-b-2 px-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--public-teal)] ${selected
                    ? "border-[var(--public-teal)] bg-[var(--public-teal)]/[0.05] text-[var(--public-teal)]"
                    : "border-transparent text-[var(--public-ink)] hover:border-black/20 hover:bg-black/[0.025]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
