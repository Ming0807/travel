"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowCounterClockwise,
  ArrowSquareOut,
  CheckCircle,
  Eye,
  EyeSlash,
  Image as ImageIcon,
  Info,
  ListMagnifyingGlass,
  MagnifyingGlass,
  ShieldCheck,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";

export type MediaAsset = {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  category: string;
  created_at: string;
  url: string;
  lifecycle_status?: string;
  is_active?: boolean;
};

type MediaReference = {
  entityType: string;
  entityId: number | null;
  name: string;
};

const ENTITY_EDIT_PATHS: Record<string, string> = {
  attraction: "/admin/attractions",
  restaurant: "/admin/restaurants",
  accommodation: "/admin/accommodations",
  story: "/admin/stories",
  route: "/admin/routes",
};

const CATEGORIES = [
  { value: "All", label: "ทั้งหมด" },
  { value: "General", label: "ทั่วไป" },
  { value: "Homepage", label: "หน้าแรก" },
  { value: "Attractions", label: "สถานที่" },
  { value: "Badges", label: "เหรียญตรา" },
  { value: "Certificates", label: "ใบประกาศ" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type MediaLibraryProps = {
  mode?: "manage" | "pick";
  onSelect?: (url: string, asset?: MediaAsset) => void;
  showArchived?: boolean;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAssetReadiness(asset: MediaAsset) {
  if (!ALLOWED_TYPES.includes(asset.mime_type)) {
    return { label: "Unsupported type", tone: "warning" as const };
  }
  if (asset.size_bytes > 2 * 1024 * 1024) {
    return { label: "Large file", tone: "warning" as const };
  }
  return { label: "Web ready", tone: "success" as const };
}

function EntityTypeLabel({ type }: { type: string }) {
  const labelMap: Record<string, { label: string; badge: string }> = {
    attraction: { label: "สถานที่", badge: "bg-blue-50 text-blue-700" },
    restaurant: { label: "ร้านอาหาร", badge: "bg-rose-50 text-rose-700" },
    accommodation: { label: "ที่พัก", badge: "bg-purple-50 text-purple-700" },
    story: { label: "บทความ", badge: "bg-amber-50 text-amber-700" },
    route: { label: "เส้นทาง", badge: "bg-emerald-50 text-emerald-700" },
  };
  const info = labelMap[type] ?? { label: type, badge: "bg-slate-50 text-slate-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${info.badge}`}>{info.label}</span>;
}

// ─── References Dialog ──────────────────────────────────────────────────────

function ReferencesDialog({
  asset,
  references,
  loading,
  error,
  onClose,
}: {
  asset: MediaAsset;
  references: MediaReference[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Where this asset is used"
    >
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <ListMagnifyingGlass className="text-[#0A6B62]" size={22} weight="fill" />
            <div>
              <h2 className="text-base font-black text-slate-900">สื่อนี้ถูกใช้งานที่ไหนบ้าง</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                รายการเนื้อหาทั้งหมดที่อ้างอิงถึงไฟล์นี้
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-6 sm:flex-row">
          {/* Asset preview */}
          <div className="shrink-0 sm:w-48">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.file_name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <p className="mt-2 truncate text-xs font-bold text-slate-700" title={asset.file_name}>
              {asset.file_name}
            </p>
            <p
              className="mt-0.5 truncate font-mono text-xs text-slate-400"
              title={asset.storage_path}
            >
              {asset.storage_path}
            </p>
          </div>

          {/* Reference list */}
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-sm font-black text-slate-800">
              ใช้งานใน <span className="text-[#0A6B62]">{loading ? "..." : references.length}</span>{" "}
              {references.length === 0 ? "รายการ" : references.length === 1 ? "รายการ" : "รายการ"}
            </p>

            {loading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0A6B62]" />
                Loading references...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
                <WarningCircle className="mx-auto mb-2 text-rose-500" size={24} weight="fill" />
                <p className="text-sm font-bold text-rose-700">Could not load references</p>
                <p className="mt-1 text-xs leading-5 text-rose-600">{error}</p>
              </div>
            ) : references.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <p className="text-sm font-bold text-slate-500">ไม่มีเนื้อหาใดใช้สื่อนี้อยู่</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  ไฟล์นี้มีอยู่ในคลังแต่ไม่ได้ถูกเชื่อมโยงกับสถานที่ บทความ เส้นทาง ร้านอาหาร หรือที่พักใด
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {references.map((ref, idx) => {
                  const basePath = ENTITY_EDIT_PATHS[ref.entityType];
                  const editUrl =
                    basePath && ref.entityId !== null
                      ? `${basePath}/${ref.entityId}/edit`
                      : null;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-slate-200 hover:shadow-sm"
                    >
                      <EntityTypeLabel type={ref.entityType} />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
                        {ref.name}
                      </span>
                      {editUrl ? (
                        <Link
                          href={editUrl}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#0A6B62]"
                        >
                          <ArrowSquareOut size={13} weight="bold" />
                          แก้ไข
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Archive guidance when asset has references */}
            {!loading && !error && references.length > 0 ? (
              <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                Archived assets stay in place wherever they&apos;re already used. Replace these
                references before archiving if the image should not appear publicly.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Media Library Component ────────────────────────────────────────────────

export function MediaLibrary({ mode = "manage", onSelect, showArchived: initialShowArchived }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<MediaAsset | null>(null);
  const [archiveReferences, setArchiveReferences] = useState<MediaReference[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [showArchived, setShowArchived] = useState(initialShowArchived ?? false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference viewer state
  const [refViewAsset, setRefViewAsset] = useState<MediaAsset | null>(null);
  const [refViewData, setRefViewData] = useState<MediaReference[]>([]);
  const [refViewLoading, setRefViewLoading] = useState(false);
  const [refViewError, setRefViewError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, showArchived]);

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter((asset) =>
      [asset.file_name, asset.storage_path, asset.category, asset.mime_type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [assets, query]);

  const stats = useMemo(() => {
    const activeAssets = assets.filter((a) => a.lifecycle_status !== "archived");
    const archivedCount = assets.filter((a) => a.lifecycle_status === "archived").length;
    const largeCount = activeAssets.filter((asset) => asset.size_bytes > 2 * 1024 * 1024).length;
    const unsupportedCount = activeAssets.filter((asset) => !ALLOWED_TYPES.includes(asset.mime_type)).length;
    return { total: activeAssets.length, archivedCount, largeCount, unsupportedCount };
  }, [assets]);

  const fetchMedia = async () => {
    setLoading(true);
    setError("");
    try {
      const lifecycleParam = showArchived ? "all" : "active";
      const response = await fetch(`/api/admin/media?category=${encodeURIComponent(category)}&lifecycle_status=${lifecycleParam}`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Could not load media assets. Please try again.");
        return;
      }
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not connect to the media library. Please check the connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Use JPG, PNG, or WebP.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("File is too large. Use an image up to 10MB.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category === "All" ? "General" : category);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Upload failed. Please try again.");
        return;
      }

      if (data?.asset) {
        setAssets((current) => [data.asset, ...current]);
      }
    } catch {
      setError("Upload failed because the connection was interrupted. Please try again.");
    } finally {
      setUploading(false);
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  // Open reference viewer
  const handleViewReferences = async (asset: MediaAsset) => {
    setRefViewAsset(asset);
    setRefViewData([]);
    setRefViewError(null);
    setRefViewLoading(true);

    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: "GET" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setRefViewError(data?.error || `Server returned ${response.status}`);
        return;
      }

      if (data?.references) {
        setRefViewData(data.references);
      } else {
        setRefViewError("Unexpected response format from server.");
      }
    } catch (err) {
      setRefViewError("Network error. Could not load references.");
      console.error("Failed to fetch media references:", err);
    } finally {
      setRefViewLoading(false);
    }
  };

  const handleArchiveClick = async (asset: MediaAsset) => {
    setDeleteCandidate(asset);
    setArchiveReferences([]);
    setIsArchiving(false);
    setLoadingReferences(true);

    // Fetch used-in references BEFORE showing the confirmation dialog
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: "GET" });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.references) {
        setArchiveReferences(data.references);
      }
    } catch {
      // Silently fail — references will just be empty
    } finally {
      setLoadingReferences(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!deleteCandidate) return;

    setIsArchiving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/media/${deleteCandidate.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Could not archive this asset. Please try again.");
        setIsArchiving(false);
        return;
      }
      // Refresh the full list so archived assets get proper styling when showArchived is on
      await fetchMedia();
      setIsArchiving(false);
      setDeleteCandidate(null);
      setArchiveReferences([]);
    } catch {
      setError("Archive failed because the connection was interrupted. Please try again.");
      setIsArchiving(false);
    }
  };

  const handleUnarchive = async (asset: MediaAsset) => {
    setError("");
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unarchive" }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Could not unarchive this asset. Please try again.");
        return;
      }
      // Refresh the list
      await fetchMedia();
    } catch {
      setError("Unarchive failed because the connection was interrupted. Please try again.");
    }
  };

  const isArchived = (asset: MediaAsset) => asset.lifecycle_status === "archived";

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4 overflow-y-auto max-h-[40vh] sm:max-h-none sm:overflow-visible">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#0A6B62]/20 bg-[#E6F4EF] px-3 py-2 text-xs font-black text-[#073F37]">
                <ShieldCheck size={16} weight="fill" />
                คลังสื่อส่วนกลาง (Media Library)
              </span>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                ใช้สำหรับค้นหา นำกลับมาใช้ใหม่ (Reuse) ตรวจสอบรูปที่ไม่ได้ใช้งาน หรือ Archive สื่อเก่า
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              <strong className="text-slate-800">แนะนำให้ Reuse สื่อเดิม:</strong> เมื่อคุณแก้ไข Attraction หรือ Homepage หากเป็นไปได้ควรเลือกภาพจากคลังนี้ก่อน เพื่อประหยัดพื้นที่จัดเก็บ ทั้งนี้ระบบจะทำการตรวจสอบเสมอว่าสื่อแต่ละรูป <strong>ถูกอ้างอิงหรือใช้งานอยู่ที่ไหนบ้าง</strong> เพื่อป้องกันไม่ให้ Archive รูปที่ใช้อยู่ไปโดยไม่ได้ตั้งใจ
            </p>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-4 transition ${
              isDragging ? "border-[#0A6B62] bg-[#E6F4EF]" : "border-slate-300 bg-slate-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">อัปโหลดภาพของระบบ</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">รองรับ JPG, PNG, WebP ไม่เกิน 10MB ระบบสร้าง path ให้อัตโนมัติ</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-black text-white transition hover:bg-[#075049] disabled:opacity-50"
              >
                {uploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <UploadSimple size={18} weight="bold" />
                )}
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} weight="bold" />
            <input
              aria-label="Search media assets"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              placeholder="ค้นหาชื่อไฟล์, path, ประเภท หรือหมวดหมู่"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Category filter">
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={category === item.value}
                onClick={() => setCategory(item.value)}
                className={`min-h-10 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-black transition ${
                  category === item.value
                    ? "bg-[#073F37] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={showArchived}
              onClick={() => setShowArchived(!showArchived)}
              className={`min-h-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-black transition ${
                showArchived
                  ? "bg-amber-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {showArchived ? (
                <>
                  <Eye size={16} weight="bold" />
                  แสดงที่เก็บ
                </>
              ) : (
                <>
                  <EyeSlash size={16} weight="bold" />
                  ซ่อนที่เก็บ
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 hidden sm:grid gap-3 sm:grid-cols-4" role="list" aria-label="Media statistics">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" role="listitem">
            <p className="text-xs font-bold text-slate-500">สื่อที่ใช้งาน</p>
            <p className="mt-1 text-xl font-black text-slate-900" aria-label={`${stats.total} active assets`}>{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" role="listitem">
            <p className="text-xs font-bold text-slate-500">เก็บถาวรแล้ว</p>
            <p className="mt-1 text-xl font-black text-slate-900" aria-label={`${stats.archivedCount} archived`}>{stats.archivedCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" role="listitem">
            <p className="text-xs font-bold text-slate-500">ไฟล์ขนาดใหญ่</p>
            <p className={`mt-1 text-xl font-black ${stats.largeCount ? "text-amber-700" : "text-slate-900"}`} aria-label={`${stats.largeCount} large files`}>{stats.largeCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" role="listitem">
            <p className="text-xs font-bold text-slate-500">ประเภทไม่รองรับ</p>
            <p className={`mt-1 text-xl font-black ${stats.unsupportedCount ? "text-rose-700" : "text-slate-900"}`} aria-label={`${stats.unsupportedCount} unsupported files`}>{stats.unsupportedCount}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-5 mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700" role="alert" aria-live="polite">
          <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
          {error}
        </div>
      ) : null}

      <div className={mode === "pick" ? "flex-1 overflow-y-auto p-5" : "p-5"}>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center" role="status" aria-label="Loading media assets">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0A6B62]" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-5 text-center">
            <ImageIcon size={48} weight="duotone" className="text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-800">ไม่พบสื่อที่ตรงกับคำค้น</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              ลองเปลี่ยนคำค้น เปลี่ยนหมวดหมู่ อัปโหลดภาพใหม่ หรือ{showArchived ? "ซ่อน" : "แสดง"}สื่อที่ archive แล้ว
              การตั้งค่าหน้าปก alt text และความพร้อมแสดงผล จัดการได้จากตัวแก้ไขเนื้อหาที่ใช้สื่อนี้
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredAssets.map((asset) => {
              const readiness = getAssetReadiness(asset);
              const isPickMode = mode === "pick";
              const archived = isArchived(asset);

              return (
                <article
                  key={asset.id}
                  onClick={() => isPickMode && !archived && onSelect?.(asset.url)}
                  onKeyDown={(e) => {
                    if (isPickMode && !archived && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSelect?.(asset.url);
                    }
                  }}
                  tabIndex={isPickMode && !archived ? 0 : -1}
                  role={isPickMode ? "button" : undefined}
                  aria-label={isPickMode ? `Select ${asset.file_name}` : undefined}
                  className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition ${
                    archived
                      ? "border-slate-100 opacity-60 saturate-0"
                      : isPickMode
                        ? "cursor-pointer border-slate-200 hover:border-[#0A6B62] hover:ring-2 hover:ring-[#0A6B62]/15"
                        : "border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.file_name} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {archived ? (
                        <span className="rounded-full bg-slate-700/80 px-2.5 py-1 text-xs font-black text-white">
                          Archived
                        </span>
                      ) : (
                        <>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${
                              readiness.tone === "success"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {readiness.label}
                          </span>
                          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-slate-700">
                            {asset.category}
                          </span>
                        </>
                      )}
                    </div>
                    {!archived ? (
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-black text-slate-800"
                          >
                            <ArrowSquareOut size={15} weight="bold" />
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewReferences(asset);
                            }}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                            title="Where this image is used"
                          >
                            <ListMagnifyingGlass size={14} weight="bold" />
                            Usage
                          </button>
                        </div>
                        {isPickMode ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelect?.(asset.url, asset);
                            }}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#0A6B62] px-3 py-2 text-xs font-black text-white"
                          >
                            <CheckCircle size={15} weight="fill" />
                            Select
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleArchiveClick(asset);
                            }}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white"
                          >
                            <Archive size={15} weight="bold" />
                            Archive
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleUnarchive(asset);
                          }}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                        >
                          <ArrowCounterClockwise size={15} weight="bold" />
                          กู้คืน
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="truncate text-sm font-black text-slate-800" title={asset.file_name}>{asset.file_name}</p>
                      <p className="mt-1 truncate font-mono text-xs text-slate-500" title={asset.storage_path}>{asset.storage_path}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="font-bold text-slate-500">Type</p>
                        <p className="mt-0.5 font-black text-slate-800">{asset.mime_type.replace("image/", "").toUpperCase()}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="font-bold text-slate-500">Size</p>
                        <p className="mt-0.5 font-black text-slate-800">{formatSize(asset.size_bytes)}</p>
                      </div>
                    </div>
                    {archived ? (
                      <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs leading-5 text-amber-800">
                        <Archive className="mt-0.5 shrink-0" size={15} weight="fill" />
                        สื่อนี้ถูก archive แล้ว กด "กู้คืน" เพื่อให้นำกลับมาใช้ใน Media Library และตัวเลือกสื่อได้อีกครั้ง
                      </div>
                    ) : (
                      <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-2 text-xs leading-5 text-slate-600">
                        <Info className="mt-0.5 shrink-0 text-slate-400" size={15} weight="fill" />
                        Alt text, หน้าปก และความพร้อมแสดงผล จัดการได้จากตัวแก้ไขเนื้อหาที่ใช้สื่อนี้
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Archive confirmation dialog ───────────────────────────────── */}
      {deleteCandidate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Archive asset confirmation"
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="flex gap-3">
              <Archive className="mt-0.5 shrink-0 text-amber-600" size={24} weight="fill" />
              <div>
                <h2 className="text-base font-black text-slate-900">Archive this asset?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This will hide the file from the active Media Library and content pickers.
                  ไฟล์และข้อมูลในฐานข้อมูลจะยังคงอยู่เพื่อให้กู้คืนได้ภายหลัง
                </p>
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                  {deleteCandidate.storage_path}
                </p>

                {loadingReferences ? (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#0A6B62]" />
                    กำลังตรวจสอบว่าสื่อนี้ถูกใช้ที่ไหนบ้าง...
                  </div>
                ) : archiveReferences.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-amber-700">สื่อนี้ถูกใช้ในเนื้อหาเหล่านี้:</p>
                    <div className="mt-2 space-y-1.5">
                      {archiveReferences.map((ref, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs">
                          <EntityTypeLabel type={ref.entityType} />
                          <span className="font-bold text-slate-700">{ref.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-amber-800">
                      Archived assets stay in place wherever they&apos;re already used, but will no longer appear in the picker
                      for new selections. Replace these references before archiving if the image should not appear publicly.
                    </p>
                  </div>
                ) : !loadingReferences ? (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    This asset is not referenced by any content records. Archiving it will only affect future media picker searches.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setArchiveReferences([]);
                }}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                {archiveReferences.length > 0 ? "ปิด" : "ยกเลิก"}
              </button>
              {archiveReferences.length === 0 && !loadingReferences ? (
                <button
                  type="button"
                  onClick={handleConfirmArchive}
                  disabled={isArchiving}
                  className="min-h-11 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-black text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {isArchiving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Archive size={16} weight="bold" />
                  )}
                  {isArchiving ? "กำลัง archive..." : "archive สื่อนี้"}
                </button>
              ) : null}
              {archiveReferences.length > 0 ? (
                <button
                  type="button"
                  onClick={handleConfirmArchive}
                  disabled={isArchiving}
                  className="min-h-11 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isArchiving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Archive size={16} weight="bold" />
                  )}
                  {isArchiving ? "กำลัง archive..." : "archive ต่อไป"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Reference viewer dialog ───────────────────────────────────── */}
      {refViewAsset ? (
        <ReferencesDialog
          asset={refViewAsset}
          references={refViewData}
          loading={refViewLoading}
          error={refViewError}
          onClose={() => {
            setRefViewAsset(null);
            setRefViewData([]);
            setRefViewError(null);
          }}
        />
      ) : null}
    </div>
  );
}
