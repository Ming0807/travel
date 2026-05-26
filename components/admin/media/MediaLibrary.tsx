"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowSquareOut,
  CheckCircle,
  Image as ImageIcon,
  Info,
  MagnifyingGlass,
  ShieldCheck,
  Trash,
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
};

const CATEGORIES = [
  { value: "All", label: "All" },
  { value: "General", label: "General" },
  { value: "Homepage", label: "Homepage" },
  { value: "Attractions", label: "Attractions" },
  { value: "Badges", label: "Badges" },
  { value: "Certificates", label: "Certificates" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type MediaLibraryProps = {
  mode?: "manage" | "pick";
  onSelect?: (url: string) => void;
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

export function MediaLibrary({ mode = "manage", onSelect }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<MediaAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

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
    const largeCount = assets.filter((asset) => asset.size_bytes > 2 * 1024 * 1024).length;
    const unsupportedCount = assets.filter((asset) => !ALLOWED_TYPES.includes(asset.mime_type)).length;
    return { total: assets.length, largeCount, unsupportedCount };
  }, [assets]);

  const fetchMedia = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/media?category=${encodeURIComponent(category)}`);
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

  const handleDelete = async () => {
    if (!deleteCandidate) return;

    try {
      const response = await fetch(`/api/admin/media/${deleteCandidate.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Could not delete this asset. Please try again.");
        return;
      }
      setAssets((current) => current.filter((asset) => asset.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    } catch {
      setError("Delete failed because the connection was interrupted. Please try again.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#0A6B62]/20 bg-[#E6F4EF] px-3 py-2 text-xs font-black text-[#073F37]">
                <ShieldCheck size={16} weight="fill" />
                Official content assets
              </span>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                Tourist uploads and generated certificates are stored separately.
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Use this library to search, upload, and pick reusable official images. To change a public attraction,
              story, route, or homepage card image, start from that content editor so the image keeps its owner,
              role, alt text, and publish readiness.
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
                <p className="text-sm font-black text-slate-800">Upload official image</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG, WebP up to 10MB. Storage path is generated automatically.</p>
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
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} weight="bold" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              placeholder="Search file name, path, category, or type"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
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
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Assets in view</p>
            <p className="mt-1 text-xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Large files</p>
            <p className={`mt-1 text-xl font-black ${stats.largeCount ? "text-amber-700" : "text-slate-900"}`}>{stats.largeCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Unsupported types</p>
            <p className={`mt-1 text-xl font-black ${stats.unsupportedCount ? "text-rose-700" : "text-slate-900"}`}>{stats.unsupportedCount}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-5 mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
          <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0A6B62]" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-5 text-center">
            <ImageIcon size={48} weight="duotone" className="text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-800">No matching media assets</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Try another search, switch category, or upload an official image. Content-specific cover and gallery
              metadata is managed from the content editor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredAssets.map((asset) => {
              const readiness = getAssetReadiness(asset);
              const isPickMode = mode === "pick";

              return (
                <article
                  key={asset.id}
                  onClick={() => isPickMode && onSelect?.(asset.url)}
                  className={`group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition ${
                    isPickMode ? "cursor-pointer hover:border-[#0A6B62] hover:ring-2 hover:ring-[#0A6B62]/15" : "hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.file_name} className="h-full w-full object-cover" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
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
                      {isPickMode ? (
                        <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#0A6B62] px-3 py-2 text-xs font-black text-white">
                          <CheckCircle size={15} weight="fill" />
                          Select
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteCandidate(asset);
                          }}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white"
                        >
                          <Trash size={15} weight="bold" />
                          Delete
                        </button>
                      )}
                    </div>
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
                    <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-2 text-xs leading-5 text-slate-600">
                      <Info className="mt-0.5 shrink-0 text-slate-400" size={15} weight="fill" />
                      Alt text, cover role, and public readiness are set inside the content editor that uses this asset.
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {deleteCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex gap-3">
              <WarningCircle className="mt-0.5 shrink-0 text-amber-600" size={24} weight="fill" />
              <div>
                <h2 className="text-base font-black text-slate-900">Delete asset from global library?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This removes the file from the public `site-media` bucket and the global asset list. If a settings
                  field or content record uses this URL, that surface may show a broken image. Prefer replacing images
                  from the content editor when the asset is already public.
                </p>
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                  {deleteCandidate.storage_path}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="min-h-11 rounded-lg bg-rose-600 px-4 py-2 text-sm font-black text-white transition hover:bg-rose-700"
              >
                Delete asset
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
