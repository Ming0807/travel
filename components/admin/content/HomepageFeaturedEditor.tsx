"use client";

import { useState, useEffect } from "react";
import { searchAttractionsAction, getAttractionsBySlugsAction } from "@/app/actions/admin-content-actions";
import { 
  DotsSixVertical, 
  Trash, 
  Plus, 
  MagnifyingGlass, 
  Spinner,
  WarningCircle
} from "@phosphor-icons/react";

const PROVINCE_FILTERS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "Yala", label: "ยะลา" },
  { value: "Pattani", label: "ปัตตานี" },
  { value: "Narathiwat", label: "นราธิวาส" },
];

type AttractionData = {
  id: number;
  name_th: string;
  name_en: string | null;
  slug: string;
  cover_media_path: string | null;
  is_published: boolean;
  is_active: boolean;
  province: { name_th: string | null; name_en: string | null } | null;
};

export function HomepageFeaturedEditor({
  slugs,
  onChange
}: {
  slugs: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [items, setItems] = useState<AttractionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AttractionData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const slugsKey = slugs.join("|");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const currentSlugs = slugsKey ? slugsKey.split("|") : [];
      const res = await getAttractionsBySlugsAction(currentSlugs);
      if (res.success && res.data) {
        setItems(res.data);
      }
      setLoading(false);
    }
    load();
  }, [slugsKey]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const res = await searchAttractionsAction(q);
    if (res.success && res.data) {
      setSearchResults(res.data);
    }
    setIsSearching(false);
  }

  function handleAdd(item: AttractionData) {
    if (items.find(i => i.slug === item.slug)) return;
    const newItems = [...items, item];
    setItems(newItems);
    onChange(newItems.map(i => i.slug));
    setSearchQuery("");
    setSearchResults([]);
  }

  function handleRemove(index: number) {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    onChange(newItems.map(i => i.slug));
  }

  function handleDragStart(index: number) {
    setDraggedIdx(index);
  }

  function handleDragEnter(index: number) {
    if (draggedIdx === null) return;
    if (draggedIdx === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setItems(newItems);
  }

  function handleDragEnd() {
    setDraggedIdx(null);
    onChange(items.map(i => i.slug));
  }

  function imageUrl(path: string | null) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith("cloudinary:")) return `/api/media/image?path=${encodeURIComponent(path)}`;
    return `/site-media/${path}`;
  }

  const selectedProvince = PROVINCE_FILTERS.find((item) => item.value === provinceFilter);
  const filteredSearchResults = searchResults.filter((result) => {
    if (provinceFilter !== "all" && result.province?.name_en !== provinceFilter && result.province?.name_th !== selectedProvince?.label) return false;
    if (statusFilter === "published" && (!result.is_published || !result.is_active)) return false;
    if (statusFilter === "draft" && result.is_published) return false;
    if (statusFilter === "inactive" && result.is_active) return false;
    return true;
  });
  const selectedWarnings = items.reduce(
    (acc, item) => {
      if (!item.cover_media_path) acc.missingCover += 1;
      if (!item.is_published) acc.draft += 1;
      if (!item.is_active) acc.inactive += 1;
      return acc;
    },
    { missingCover: 0, draft: 0, inactive: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">จำนวนที่เลือก</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{items.length}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">ขาดรูปหน้าปก</p>
          <p className={`mt-1 text-2xl font-black ${selectedWarnings.missingCover ? "text-amber-700" : "text-emerald-700"}`}>{selectedWarnings.missingCover}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">ไม่พร้อมแสดงผล</p>
          <p className={`mt-1 text-2xl font-black ${selectedWarnings.draft + selectedWarnings.inactive ? "text-rose-700" : "text-emerald-700"}`}>{selectedWarnings.draft + selectedWarnings.inactive}</p>
        </div>
      </div>

      {/* Search to add */}
      <div className="relative z-10">
        <label className="block text-sm font-black text-slate-700 mb-2">ค้นหาสถานที่เพื่อเพิ่ม</label>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {PROVINCE_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setProvinceFilter(item.value)}
              className={`min-h-9 rounded-full border px-3 text-xs font-black transition ${
                provinceFilter === item.value
                  ? "border-[#0A6B62] bg-[#E6F4EF] text-[#073F37]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-9 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 outline-none hover:bg-slate-50 focus:border-[#0A6B62] focus:ring-1 focus:ring-[#0A6B62]"
          >
            <option value="all">ทุกสถานะ (All Status)</option>
            <option value="published">เผยแพร่แล้ว (Published)</option>
            <option value="draft">ฉบับร่าง (Draft)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </div>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="พิมพ์ชื่อสถานที่ท่องเที่ยว..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
          />
          {isSearching && (
            <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={18} />
          )}
        </div>

        {searchQuery.trim() && filteredSearchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
            {filteredSearchResults.map((result) => {
              const isAdded = items.some(i => i.slug === result.slug);
              return (
                <div key={result.id} className={`flex items-center gap-3 p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${isAdded ? 'opacity-50 grayscale' : ''}`}>
                  <div className="w-12 h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                    {result.cover_media_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl(result.cover_media_path)} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{result.name_th}</p>
                    <p className="text-xs text-slate-500 truncate">{result.province?.name_th} • {result.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {!result.cover_media_path ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">NO IMAGE</span> : null}
                      {!result.is_published ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">DRAFT</span> : null}
                      {!result.is_active ? <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">INACTIVE</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAdd(result)}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E6F4EF] text-[#0A6B62] flex items-center justify-center hover:bg-[#0A6B62] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus weight="bold" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {searchQuery.trim() && !isSearching && searchResults.length > 0 && filteredSearchResults.length === 0 ? (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-500 shadow-xl">
            ไม่พบสถานที่ที่ตรงกับเงื่อนไขการกรอง
          </div>
        ) : null}
      </div>

      {/* Selected Items List */}
      <div>
        <label className="block text-sm font-black text-slate-700 mb-2">สถานที่ที่แสดงผล (ลากเพื่อจัดลำดับ)</label>
        
        {loading ? (
          <div className="py-8 flex items-center justify-center text-slate-400">
            <Spinner className="animate-spin" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm font-medium">ยังไม่มีสถานที่แนะนำ</p>
            <p className="text-xs mt-1">ค้นหาและเพิ่มสถานที่ด้านบน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 p-3 bg-white border rounded-xl transition-all ${
                  draggedIdx === index ? "border-[#0A6B62] shadow-md opacity-90 scale-[1.02] z-10" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600">
                  <DotsSixVertical size={20} weight="bold" />
                </div>
                <div className="w-16 h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden relative">
                  {item.cover_media_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl(item.cover_media_path)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-rose-50" title="ไม่มีรูปภาพหน้าปก">
                      <WarningCircle size={16} className="text-rose-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{item.name_th}</p>
                  <p className="text-xs text-slate-500 truncate">{item.province?.name_th} • {item.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!item.is_published && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">DRAFT</span>
                  )}
                  {!item.is_active && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">INACTIVE</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="นำออก"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
