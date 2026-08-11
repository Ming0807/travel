"use client";

import { useId, useMemo, useState } from "react";
import { CaretDown, Check, MagnifyingGlass, MapPin } from "@phosphor-icons/react";

export type ProvinceOption = {
  id: number;
  labelTh: string;
  labelEn: string;
};

type SearchableProvinceFieldProps = {
  options: ProvinceOption[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  error?: string;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("th-TH");
}

export function SearchableProvinceField({
  options,
  selectedId,
  onSelect,
  error,
}: SearchableProvinceFieldProps) {
  const inputId = useId();
  const listboxId = useId();
  const selected = options.find((option) => option.id === selectedId) ?? null;
  const [query, setQuery] = useState(selected?.labelTh ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery || selected?.labelTh === query) return options;
    return options.filter((option) =>
      normalize(`${option.labelTh} ${option.labelEn}`).includes(normalizedQuery),
    );
  }, [options, query, selected?.labelTh]);

  const choose = (option: ProvinceOption) => {
    onSelect(option.id);
    setQuery(option.labelTh);
    setIsOpen(false);
    setActiveIndex(0);
  };

  return (
    <div
      className="relative space-y-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <label htmlFor={inputId} className="block text-sm font-bold text-ink">
        จังหวัดที่เดินทางมา <span className="text-coral">*</span>
      </label>
      <div className="relative">
        <MapPin
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal"
          size={19}
          weight="fill"
        />
        <input
          id={inputId}
          role="combobox"
          aria-label="จังหวัดที่เดินทางมา"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && filteredOptions[activeIndex]
              ? `${listboxId}-${filteredOptions[activeIndex].id}`
              : undefined
          }
          aria-invalid={Boolean(error)}
          value={query}
          placeholder="แตะเพื่อเลือก หรือพิมพ์ค้นหาจังหวัด"
          autoComplete="off"
          className="min-h-12 w-full rounded-md border border-ink/15 bg-white py-3 pl-11 pr-11 text-base text-ink outline-none transition-colors placeholder:text-slate-500 focus:border-teal focus:ring-2 focus:ring-teal/15"
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect(null);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, 0));
              return;
            }
            if (event.key === "Enter" && isOpen && filteredOptions[activeIndex]) {
              event.preventDefault();
              choose(filteredOptions[activeIndex]);
            }
          }}
        />
        <button
          type="button"
          aria-label={isOpen ? "ปิดรายชื่อจังหวัด" : "เปิดรายชื่อจังหวัด"}
          className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          onClick={() => setIsOpen((current) => !current)}
        >
          <CaretDown aria-hidden="true" className={isOpen ? "rotate-180" : ""} size={18} />
        </button>
      </div>

      <input type="hidden" name="originProvinceId" value={selectedId ?? ""} />

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="รายชื่อจังหวัด"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-md"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  id={`${listboxId}-${option.id}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex min-h-12 w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                    index === activeIndex ? "bg-teal/8" : "hover:bg-slate-50"
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span>
                    <span className="block text-sm font-bold text-ink">{option.labelTh}</span>
                    <span className="block text-xs text-slate-500">{option.labelEn}</span>
                  </span>
                  {isSelected ? <Check aria-hidden="true" className="text-teal" size={18} weight="bold" /> : null}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <MagnifyingGlass aria-hidden="true" className="mx-auto mb-2 text-slate-400" size={24} />
              <p className="text-sm font-semibold text-slate-700">ไม่พบจังหวัดที่ค้นหา</p>
              <p className="mt-1 text-xs text-slate-500">ลองพิมพ์ชื่อจังหวัดเป็นภาษาไทยหรืออังกฤษ</p>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
