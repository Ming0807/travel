"use client";

import { useActionState, useEffect, useState } from "react";
import { updateAttractionRelatedContentAction } from "@/app/actions/admin-attraction-actions";
import { AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { X, Plus, DotsSixVertical } from "@phosphor-icons/react";

type ContentItem = { id: number; name: string; province?: string };

export function RelatedContentForm({
  attractionId,
  type,
  availableItems,
  initialSelectedIds,
  attractionProvince,
  onClose,
  title
}: {
  attractionId: number;
  type: "attractions" | "restaurants" | "accommodations" | "stories";
  availableItems: ContentItem[];
  initialSelectedIds: number[];
  attractionProvince?: string;
  onClose: () => void;
  title: string;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [search, setSearch] = useState("");

  const action = updateAttractionRelatedContentAction.bind(null, attractionId, type, selectedIds);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, { success: false });

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeItem = (id: number) => {
    setSelectedIds(selectedIds.filter(x => x !== id));
  };

  const selectedItems = selectedIds.map(id => availableItems.find(i => i.id === id)).filter(Boolean) as ContentItem[];
  const unselectedItems = availableItems.filter(i => !selectedIds.includes(i.id));
  
  const filteredUnselected = unselectedItems.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.province && i.province.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 20);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 mb-2">เนื้อหาที่เลือกให้แสดง ({selectedIds.length})</h3>
          {selectedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              ยังไม่ได้เลือกเนื้อหา (ระบบจะดึงข้อมูลอัตโนมัติตามจังหวัด)
            </div>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item, index) => {
                const isDifferentProvince = item.province && attractionProvince && item.province !== attractionProvince;
                return (
                  <div key={item.id} className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${isDifferentProvince ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <DotsSixVertical className="text-slate-400 cursor-move" size={16} />
                      <span className="text-xs font-bold text-slate-500 w-4">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        {item.province && (
                          <p className={`text-xs ${isDifferentProvince ? 'text-orange-600 font-semibold' : 'text-slate-500'}`}>
                            {item.province} {isDifferentProvince && '(ข้ามจังหวัด)'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 p-1">
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">เลือกเนื้อหาเพิ่มเติม</h3>
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ จังหวัด..." 
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {filteredUnselected.map(item => {
              const isRecommended = item.province && attractionProvince && item.province === attractionProvince;
              return (
                <div key={item.id} className={`flex items-center justify-between rounded-xl border p-3 ${isRecommended ? 'border-teal/20 bg-teal/5' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                      {isRecommended && <span className="rounded bg-teal/10 px-1.5 py-0.5 text-[10px] font-bold text-teal">แนะนำ</span>}
                    </div>
                    {item.province && <p className="text-xs text-slate-500">{item.province}</p>}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-blue-600 shadow-sm border border-slate-200 hover:bg-slate-50"
                  >
                    <Plus size={12} weight="bold" /> เลือก
                  </button>
                </div>
              );
            })}
            {filteredUnselected.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">ไม่พบเนื้อหา</p>
            )}
          </div>
        </div>
      </div>
      
      {state?.error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
          {state.error}
        </div>
      )}

      <AdminSaveBar cancelHref="#" onCancel={onClose} isPending={isPending} submitLabel="บันทึกข้อมูล" />
    </form>
  );
}
