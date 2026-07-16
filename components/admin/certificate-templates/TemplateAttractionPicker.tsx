"use client";

import { useState, useTransition } from "react";
import { MagnifyingGlass, Spinner, X } from "@phosphor-icons/react";
import { searchCertificateTemplateAttractions } from "@/app/actions/admin-certificate-templates";

type AttractionOption = {
  attraction_id: number;
  name_th: string;
  name_en: string | null;
  slug: string;
};

export function TemplateAttractionPicker() {
  const [scope, setScope] = useState<"global" | "attraction">("global");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AttractionOption[]>([]);
  const [selected, setSelected] = useState<AttractionOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function switchScope(nextScope: "global" | "attraction") {
    setScope(nextScope);
    setError(null);
    if (nextScope === "global") {
      setSelected(null);
      setResults([]);
      setQuery("");
    }
  }

  function search() {
    startTransition(async () => {
      setError(null);
      const result = await searchCertificateTemplateAttractions(query);
      if (!result.success) {
        setResults([]);
        setError(result.error);
        return;
      }
      setResults(result.data as AttractionOption[]);
      if (result.data.length === 0) setError("ไม่พบสถานที่ตามคำค้นหา");
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-700">ขอบเขตการใช้งาน</legend>
      <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => switchScope("global")}
          aria-pressed={scope === "global"}
          className={`min-h-10 rounded-md px-4 text-sm font-semibold transition-colors ${
            scope === "global" ? "bg-white text-[#0A6B62] shadow-sm" : "text-slate-600"
          }`}
        >
          ใช้ได้ทุกสถานที่
        </button>
        <button
          type="button"
          onClick={() => switchScope("attraction")}
          aria-pressed={scope === "attraction"}
          className={`min-h-10 rounded-md px-4 text-sm font-semibold transition-colors ${
            scope === "attraction" ? "bg-white text-[#0A6B62] shadow-sm" : "text-slate-600"
          }`}
        >
          เฉพาะสถานที่
        </button>
      </div>

      <input type="hidden" name="attraction_id" value={selected?.attraction_id ?? ""} />
      <input type="hidden" name="template_scope" value={scope} />

      {scope === "attraction" ? (
        <div className="space-y-3 border-l-2 border-[#0A6B62] pl-4">
          {selected ? (
            <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{selected.name_th}</p>
                <p className="truncate text-xs text-slate-500">{selected.name_en || selected.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="เปลี่ยนสถานที่"
              >
                <X size={18} weight="bold" />
                <span className="sr-only">เปลี่ยนสถานที่</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      search();
                    }
                  }}
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
                  placeholder="ค้นหาชื่อสถานที่หรือ slug"
                  aria-label="ค้นหาสถานที่สำหรับเทมเพลต"
                />
                <button
                  type="button"
                  onClick={search}
                  disabled={isPending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0A6B62] px-4 text-sm font-semibold text-white hover:bg-[#075049] disabled:opacity-50"
                >
                  {isPending ? <Spinner className="animate-spin" size={18} /> : <MagnifyingGlass size={18} />}
                  ค้นหา
                </button>
              </div>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {results.length > 0 ? (
                <div className="max-h-56 divide-y divide-slate-200 overflow-y-auto border-y border-slate-200">
                  {results.map((item) => (
                    <button
                      key={item.attraction_id}
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setResults([]);
                        setError(null);
                      }}
                      className="flex min-h-12 w-full items-center justify-between gap-3 px-2 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{item.name_th}</span>
                        <span className="block truncate text-xs text-slate-500">{item.name_en || item.slug}</span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-[#0A6B62]">เลือก</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
          {!selected ? (
            <p className="text-xs leading-5 text-slate-500">
              ต้องเลือกสถานที่ก่อนบันทึก เมื่อใช้โหมดเฉพาะสถานที่
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs leading-5 text-slate-500">
          ระบบจะใช้เป็นตัวเลือกสำรองสำหรับสถานที่ที่ไม่มีเทมเพลตเฉพาะ
        </p>
      )}
    </fieldset>
  );
}
